// Persistence in IndexedDB: SRS cards, mistakes, an attempt log and key-value progress.
// When IndexedDB is unavailable (private browsing, blocked storage) everything falls back to
// memory for the session, so the app keeps working.

const DB_NAME = 'tolva';
const VERSION = 1;
const STORES = {
  cards: { keyPath: 'key' },
  mistakes: { keyPath: 'key' },
  attempts: { keyPath: 'id', autoIncrement: true },
  kv: {},
};

let dbPromise;
function open() {
  dbPromise ??= new Promise((resolve) => {
    let req;
    try {
      req = indexedDB.open(DB_NAME, VERSION);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [name, opts] of Object.entries(STORES)) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, opts);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
  return dbPromise;
}

const memory = Object.fromEntries(Object.keys(STORES).map((s) => [s, new Map()]));
let memoryId = 0;

function run(db, store, mode, action) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = action(t.objectStore(store));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const usingMemory = async () => !(await open());

export async function get(store, key) {
  const db = await open();
  return db ? run(db, store, 'readonly', (s) => s.get(key)) : memory[store].get(key);
}

export async function getAll(store) {
  const db = await open();
  return db ? run(db, store, 'readonly', (s) => s.getAll()) : [...memory[store].values()];
}

/** put(store, value) for stores with a key path; put('kv', value, key) for the key-value store. */
export async function put(store, value, key) {
  const db = await open();
  if (db) return run(db, store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key)));
  const keyPath = STORES[store].keyPath;
  if (STORES[store].autoIncrement && value[keyPath] === undefined) value = { ...value, [keyPath]: ++memoryId };
  memory[store].set(key ?? value[keyPath], value);
  return key ?? value[keyPath];
}

/** Many values in one transaction (stores with a key path). */
export async function putMany(store, values) {
  if (!values.length) return;
  const db = await open();
  if (db) return run(db, store, 'readwrite', (s) => values.forEach((v) => s.put(v)));
  for (const v of values) await put(store, v);
}

export async function del(store, key) {
  const db = await open();
  if (db) return run(db, store, 'readwrite', (s) => s.delete(key));
  memory[store].delete(key);
}

export async function clear(store) {
  const db = await open();
  if (db) return run(db, store, 'readwrite', (s) => s.clear());
  memory[store].clear();
}
