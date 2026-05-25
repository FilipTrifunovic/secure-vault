import { Injectable } from '@angular/core';

const DB_NAME = 'SecureShareDB';
const DB_VERSION = 1;
const KEYS_STORE = 'keys';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private db: IDBDatabase | null = null;

  private async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(KEYS_STORE)) {
          db.createObjectStore(KEYS_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async saveItem(key: string, data: unknown): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(KEYS_STORE, 'readwrite');
      const store = tx.objectStore(KEYS_STORE);
      const request = store.put({ id: key, data });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItem<T>(key: string): Promise<T | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(KEYS_STORE, 'readonly');
      const store = tx.objectStore(KEYS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        if (!request.result) {
          resolve(null);
          return;
        }
        resolve(request.result.data as T);
      };

      request.onerror = () => reject(request.error);
    });
  }
}
