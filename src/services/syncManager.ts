import { db } from '../database/db';
import { supabase } from '../supabase';

export class SyncManager {
  private static syncing = false;

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
    // Attempt sync immediately if online
    if (navigator.onLine) {
      this.pushPendingChanges();
    }
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
    if (navigator.onLine) {
      this.pushPendingChanges();
    }
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
