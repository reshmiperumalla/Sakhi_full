import React, { createContext, useContext, useState, useEffect } from 'react';
import { localDb } from '../services/indexedDb';
import { api } from '../services/api';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const refreshPendingCount = async () => {
    try {
      const unsynced = await localDb.getUnsyncedTransactions();
      setPendingCount(unsynced.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncNow = async () => {
    if (!navigator.onLine || syncing) return;
    setSyncing(true);
    try {
      const unsynced = await localDb.getUnsyncedTransactions();
      if (unsynced.length > 0) {
        const payload = {
          transactions: unsynced.map(t => ({
            type: t.type,
            amount: t.amount,
            category: t.category,
            source_or_item: t.source_or_item,
            date: t.date,
            is_irregular: t.is_irregular,
            notes: t.notes,
            client_id: t.client_id
          })),
          game_results: [],
          scam_attempts: []
        };

        const res = await api.syncOfflineData(payload);
        if (res.success) {
          await localDb.markTransactionsSynced(unsynced.map(t => t.client_id));
          setLastSyncTime(new Date());
          await refreshPendingCount();
        }
      }
    } catch (err) {
      console.warn('Sync failed:', err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingCount, syncing, lastSyncTime, syncNow, refreshPendingCount }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
