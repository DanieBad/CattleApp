import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { SyncManager } from '../services/syncManager';
import { useState, useEffect } from 'react';

export const SyncIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const pendingCount = useLiveQuery(
    () => db.sync_outbox.where('status').equals('pending').count()
  ) || 0;
  
  const syncingCount = useLiveQuery(
    () => db.sync_outbox.where('status').equals('syncing').count()
  ) || 0;
  
  const failedCount = useLiveQuery(
    () => db.sync_outbox.where('status').equals('failed').count()
  ) || 0;

  const totalUnsynced = pendingCount + syncingCount + failedCount;
  const isSyncing = syncingCount > 0;

  if (!isOnline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }} title="Offline - Changes saved locally">
        <CloudOff size={18} />
        <span style={{ fontWeight: 500 }}>Offline ({totalUnsynced} pending)</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.85rem' }}>
        <RefreshCw size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
        <span style={{ fontWeight: 500 }}>Syncing...</span>
      </div>
    );
  }

  if (totalUnsynced > 0) {
    return (
      <button 
        onClick={() => SyncManager.pushPendingChanges()}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FEF9C3', color: '#CA8A04', padding: '4px 10px', borderRadius: '16px', border: '1px solid #FEF08A', fontSize: '0.85rem', cursor: 'pointer' }}
        title="Click to manually trigger sync"
      >
        <Cloud size={18} />
        <span style={{ fontWeight: 600 }}>{totalUnsynced} pending sync</span>
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.85rem' }} title="All changes saved to cloud">
      <Cloud size={18} />
      <span style={{ fontWeight: 500 }}>Synced (FMD)</span>
    </div>
  );
};
