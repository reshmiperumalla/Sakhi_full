/**
 * IndexedDB offline persistence storage for transactions, goals, scam scenarios, and games.
 */
const DB_NAME = 'mitra_offline_db';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'client_id' });
      }
      if (!db.objectStoreNames.contains('game_results')) {
        db.createObjectStore('game_results', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('scam_attempts')) {
        db.createObjectStore('scam_attempts', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const localDb = {
  // Save an offline transaction
  async saveTransaction(transaction) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const item = {
        ...transaction,
        client_id: transaction.client_id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        synced: false
      };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  },

  // Get all pending unsynced transactions
  async getUnsyncedTransactions() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const req = store.getAll();
      req.onsuccess = () => {
        const unsynced = (req.result || []).filter(item => !item.synced);
        resolve(unsynced);
      };
      req.onerror = () => reject(req.error);
    });
  },

  // Mark transactions as synced
  async markTransactionsSynced(clientIds) {
    const db = await openDb();
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    for (const id of clientIds) {
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result) {
          req.result.synced = true;
          store.put(req.result);
        }
      };
    }
  },

  // Cache bootstrap offline content
  async setCache(key, data) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readwrite');
      const store = tx.objectStore('cache');
      const req = store.put({ key, data, timestamp: Date.now() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  // Retrieve cached content
  async getCache(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readonly');
      const store = tx.objectStore('cache');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  }
};
