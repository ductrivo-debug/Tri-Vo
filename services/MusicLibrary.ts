import type { Track } from '../types';
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('silverback-music', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('tracks', { keyPath: ['owner', 'id'] });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Hãy đóng các tab cũ và thử lại.'));
  });
}
export async function musicLibrary(owner: string, action: 'list' | 'put' | 'delete', tracks: Track[] = []): Promise<Track[]> {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', action === 'list' ? 'readonly' : 'readwrite');
      const store = tx.objectStore('tracks');
      let result: Track[] = [];
      if (action === 'list') {
        const req = store.getAll(IDBKeyRange.bound([owner, ''], [owner, '\uffff']));
        req.onsuccess = () => { result = req.result.map(({ owner: _owner, ...track }) => track); };
      } else for (const track of tracks) {
        if (action === 'put') store.put({ ...track, owner }); else store.delete([owner, track.id]);
      }
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Không lưu được nhạc.'));
    });
  } finally { db.close(); }
}
