export const PERSISTED_ASSET_TYPES = ['audio', 'cover', 'background', 'srt', 'singerSrt'] as const;

export type PersistedAssetType = typeof PERSISTED_ASSET_TYPES[number];

interface PersistedAssetRecord {
  id: PersistedAssetType;
  blob: Blob;
  name: string;
  mimeType: string;
  lastModified: number;
}

const DB_NAME = 'stardust-audio-player-assets';
const STORE_NAME = 'assets';
const DB_VERSION = 1;

const openAssetDatabase = async (): Promise<IDBDatabase | null> => {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return null;

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open persisted asset database.'));
  });
};

const runStoreRequest = async <T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> => {
  const db = await openAssetDatabase();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = handler(store);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error('Persisted asset request failed.'));
    transaction.oncomplete = () => db.close();
    transaction.onabort = () => reject(transaction.error ?? new Error('Persisted asset transaction aborted.'));
    transaction.onerror = () => reject(transaction.error ?? new Error('Persisted asset transaction failed.'));
  });
};

export const savePersistedAsset = async (type: PersistedAssetType, file: File) => {
  const record: PersistedAssetRecord = {
    id: type,
    blob: file,
    name: file.name,
    mimeType: file.type,
    lastModified: file.lastModified,
  };

  await runStoreRequest('readwrite', (store) => store.put(record));
};

export const loadPersistedAsset = async (type: PersistedAssetType): Promise<File | null> => {
  const record = await runStoreRequest<PersistedAssetRecord>('readonly', (store) => store.get(type));
  if (!record) return null;

  if (!(record.blob instanceof Blob) || !record.name) {
    await removePersistedAsset(type);
    return null;
  }

  return new File(
    [record.blob],
    record.name,
    {
      type: record.mimeType || record.blob.type,
      lastModified: record.lastModified || Date.now(),
    }
  );
};

export const removePersistedAsset = async (type: PersistedAssetType) => {
  await runStoreRequest('readwrite', (store) => store.delete(type));
};
