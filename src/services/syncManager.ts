import { db } from '../database/db';
import { supabase } from '../supabase';

export class SyncManager {
  private static syncing = false;
  private static pushTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Schedules a debounced push. Calling this multiple times in quick succession
   * (e.g. when AddAnimal queues 3 outbox records back-to-back) will coalesce
   * into a single pushPendingChanges() call 300 ms after the last queue operation.
   * This prevents the mutex race condition that caused the "stuck pending" bug.
   */
  private static schedulePush() {
    if (!navigator.onLine) return;
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      this.pushTimer = null;
      this.pushPendingChanges();
    }, 300);
  }

  /**
   * On app startup, reset any records stuck in 'syncing' status back to 'pending'
   * so they will be retried. This handles the edge case where the app was closed
   * while a sync was in progress, leaving orphaned 'syncing' records.
   */
  static async resetStuckSyncingRecords() {
    try {
      const stuckRecords = await db.sync_outbox
        .where('status')
        .equals('syncing')
        .toArray();

      for (const record of stuckRecords) {
        if (record.id !== undefined) {
          await db.sync_outbox.update(record.id, { status: 'pending' });
        }
      }

      const stuckAudio = await db.offline_audio_queue
        .where('status')
        .equals('syncing')
        .toArray();

      for (const audio of stuckAudio) {
        if (audio.id) {
          await db.offline_audio_queue.update(audio.id, { status: 'pending' });
        }
      }

      if (stuckRecords.length + stuckAudio.length > 0) {
        console.log(`[SyncManager] Reset ${stuckRecords.length} data and ${stuckAudio.length} audio records from 'syncing' to 'pending'.`);
      }
    } catch (err) {
      console.error('[SyncManager] Error resetting stuck syncing records:', err);
    }
  }

  /**
   * Pushes all pending operations from local Dexie outbox to Supabase.
   */
  static async pushPendingChanges() {
    if (this.syncing || !navigator.onLine) return;
    this.syncing = true;

    try {
      const pendingRecords = await db.sync_outbox
        .where('status')
        .equals('pending')
        .toArray();

      const pendingAudio = await db.offline_audio_queue
        .where('status')
        .equals('pending')
        .toArray();

      if (pendingRecords.length === 0 && pendingAudio.length === 0) {
        this.syncing = false;
        return;
      }
      
      // 1. Process Audio Uploads first so files exist before potentially linked records sync
      for (const audio of pendingAudio) {
        if (!audio.id) continue;
        await db.offline_audio_queue.update(audio.id, { status: 'syncing' });
        try {
          const { error } = await supabase.storage.from('audio_notes').upload(audio.fileName, audio.blob, { upsert: true });
          if (error) throw error;
          await db.offline_audio_queue.delete(audio.id);
        } catch (err: any) {
          console.error(`Sync error on audio ${audio.id}:`, err);
          await db.offline_audio_queue.update(audio.id, { status: 'failed', error: err.message || 'Unknown upload error' });
        }
      }

      // 2. Process Data Records
      for (const record of pendingRecords) {
        if (!record.id) continue;
        
        // Mark as syncing
        await db.sync_outbox.update(record.id, { status: 'syncing' });

        try {
          if (record.operation === 'INSERT') {
            const { error } = await supabase.from(record.tableName).insert([record.payload]);
            if (error) throw error;
          } else if (record.operation === 'UPDATE') {
            const { error } = await supabase.from(record.tableName)
              .update(record.payload)
              .eq('id', record.recordId);
            if (error) throw error;
          } else if (record.operation === 'DELETE') {
            const { error } = await supabase.from(record.tableName)
              .delete()
              .eq('id', record.recordId);
            if (error) throw error;
          }

          // Success: Remove from outbox
          await db.sync_outbox.delete(record.id);
        } catch (err: any) {
          console.error(`Sync error on record ${record.id}:`, err);
          // Mark as failed to retry later
          await db.sync_outbox.update(record.id, { 
            status: 'failed', 
            error: err.message || 'Unknown sync error' 
          });
        }
      }
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Helper to queue an insert operation for background syncing.
   */
  static async queueInsert(tableName: string, recordId: string, payload: any) {
    await db.sync_outbox.add({
      tableName,
      operation: 'INSERT',
      recordId,
      payload,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    // Debounced — safe to call many times in quick succession
    this.schedulePush();
  }

  /**
   * Helper to queue an update operation for background syncing.
   */
  static async queueUpdate(tableName: string, recordId: string, payload: any) {
    await db.sync_outbox.add({
      tableName,
      operation: 'UPDATE',
      recordId,
      payload,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    this.schedulePush();
  }

  /**
   * Helper to queue a delete operation for background syncing.
   */
  static async queueDelete(tableName: string, recordId: string) {
    await db.sync_outbox.add({
      tableName,
      operation: 'DELETE',
      recordId,
      payload: {},
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    this.schedulePush();
  }

  /**
   * Helper to queue a generic upload (e.g. Permits PDF)
   */
  static async uploadPermitFile(file: File, path: string): Promise<string | null> {
    if (!navigator.onLine) {
      // In a full implementation, you would store the blob in Dexie and queue it.
      // For this step, we alert the user they must be online to upload PDFs.
      alert('You are currently offline. Permit file uploads require an internet connection, but the rest of the transaction will be saved locally.');
      return null;
    }

    try {
      const { error } = await supabase.storage.from('fmd-permits').upload(path, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('fmd-permits').getPublicUrl(path);
      return publicUrl;
    } catch (e) {
      console.error('File upload failed', e);
      return null;
    }
  }
}

// Global listener for regaining connectivity
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    SyncManager.pushPendingChanges();
  });
}
