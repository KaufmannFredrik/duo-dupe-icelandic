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

/**
 * Reads, changes and writes one value of the key-value store in a single transaction, so two
 * updates cannot overwrite each other. fn gets the old value (undefined if none).
 */
export async function update(key, fn) {
  const db = await open();
  if (!db) {
    const value = fn(memory.kv.get(key));
    memory.kv.set(key, value);
    return value;
  }
  return new Promise((resolve, reject) => {
    const t = db.transaction('kv', 'readwrite');
    const s = t.objectStore('kv');
    let value;
    const req = s.get(key);
    req.onsuccess = () => {
      value = fn(req.result);
      s.put(value, key);
    };
    t.oncomplete = () => resolve(value);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

/** Deletes the oldest entries of an auto-increment store, keeping the newest `keep`. */
export async function trim(store, keep) {
  const db = await open();
  if (!db) {
    const keys = [...memory[store].keys()];
    for (const k of keys.slice(0, Math.max(0, keys.length - keep))) memory[store].delete(k);
    return Math.max(0, keys.length - keep);
  }
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, 'readwrite');
    const s = t.objectStore(store);
    let extra = 0;
    let removed = 0;
    s.count().onsuccess = (e) => {
      extra = e.target.result - keep;
      if (extra <= 0) return;
      s.openCursor().onsuccess = (ev) => {
        const cursor = ev.target.result;
        if (!cursor || removed >= extra) return;
        cursor.delete();
        removed++;
        cursor.continue();
      };
    };
    t.oncomplete = () => resolve(removed);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export async function clear(store) {
  const db = await open();
  if (db) return run(db, store, 'readwrite', (s) => s.clear());
  memory[store].clear();
}
