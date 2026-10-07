// On-device database (IndexedDB) exposing the subset of the Firestore API the app uses,
// so the POS runs with no network. One object store holds every document, keyed by [collection, id].

const DB_NAME = 'kaapfi-local';
const STORE = 'docs';
const MAX = '￿';

let dbPromise = null;
function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 2);
      req.onupgradeneeded = (e) => {
        if (e.oldVersion < 1) req.result.createObjectStore(STORE, { keyPath: ['c', 'id'] }).createIndex('byTs', ['c', 'ts']);
        // byM = last-modified time, so the automatic backup can save just what changed today
        if (e.oldVersion < 2) req.transaction.objectStore(STORE).createIndex('byM', 'm');
      };
      req.onsuccess = () => {
        req.result.onversionchange = () => { req.result.close(); dbPromise = null; };
        resolve(req.result);
      };
      req.onerror = () => { dbPromise = null; reject(req.error); };
    });
  }
  return dbPromise;
}

// Runs `work(store, setResult)` in one transaction; resolves only after the data is committed to disk.
function run(mode, work) {
  return open().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let result;
    tx.oncomplete = () => resolve(result);
    tx.onerror = tx.onabort = () => reject(tx.error || new Error('Local database error'));
    work(tx.objectStore(STORE), v => { result = v; });
  }));
}

const clone = (d) => JSON.parse(JSON.stringify(d));
const record = (c, id, data) => ({ c, id, ts: typeof data.timestamp === 'string' ? data.timestamp : '', m: Date.now(), d: clone(data) });
const newId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

// ── Change notifications (this tab + other tabs on the same device) ──────────
const listeners = new Map(); // collection -> Set<fn(id)>
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('kaapfi-local') : null;
function fire(c, id) { (listeners.get(c) || []).forEach(fn => fn(id)); }
const changeWatchers = new Set();
export function onAnyChange(fn) { changeWatchers.add(fn); return () => changeWatchers.delete(fn); }
function notify(c, id) { fire(c, id); changeWatchers.forEach(fn => fn()); if (channel) channel.postMessage({ c, id }); }
if (channel) channel.onmessage = (e) => fire(e.data.c, e.data.id);

// ── References ───────────────────────────────────────────────────────────────
export function collection(_db, name) { return { kind: 'coll', c: name }; }
export function doc(a, b, c) {
  if (a && a.kind === 'coll') return { kind: 'doc', c: a.c, id: b || newId() };
  return { kind: 'doc', c: b, id: String(c) };
}
export function where(f, op, v) { return { f, op, v }; }
export function query(coll, ...filters) { return { kind: 'query', c: coll.c, filters }; }

const snapMeta = { fromCache: false, hasPendingWrites: false };
function docSnap(c, id, d) {
  return { id, ref: { kind: 'doc', c, id }, exists: () => d !== undefined, data: () => d, metadata: snapMeta };
}
function querySnap(rows) {
  const docs = rows.map(r => docSnap(r.c, r.id, r.d));
  return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn) => docs.forEach(fn), metadata: snapMeta };
}

const OPS = {
  '==': (a, b) => a === b, '>=': (a, b) => a >= b, '>': (a, b) => a > b, '<=': (a, b) => a <= b, '<': (a, b) => a < b,
};

// ── Reads ────────────────────────────────────────────────────────────────────
export async function getDoc(ref) {
  const row = await run('readonly', (s, set) => { s.get([ref.c, ref.id]).onsuccess = (e) => set(e.target.result); });
  return docSnap(ref.c, ref.id, row ? row.d : undefined);
}
export const getDocFromServer = getDoc;

export async function getDocs(target) {
  const filters = target.filters || [];
  const tsFloor = filters.find(f => f.f === 'timestamp' && (f.op === '>=' || f.op === '>'));
  const rows = await run('readonly', (s, set) => {
    const req = tsFloor
      ? s.index('byTs').getAll(IDBKeyRange.bound([target.c, tsFloor.v], [target.c, MAX]))
      : s.getAll(IDBKeyRange.bound([target.c, ''], [target.c, MAX]));
    req.onsuccess = (e) => set(e.target.result);
  });
  return querySnap((rows || []).filter(r => filters.every(f => OPS[f.op](r.d[f.f], f.v))));
}

// ── Writes ───────────────────────────────────────────────────────────────────
export async function setDoc(ref, data) {
  await run('readwrite', (s) => { s.put(record(ref.c, ref.id, data)); });
  notify(ref.c, ref.id);
}
export async function updateDoc(ref, partial) {
  await run('readwrite', (s) => {
    s.get([ref.c, ref.id]).onsuccess = (e) => {
      const current = e.target.result ? e.target.result.d : {};
      s.put(record(ref.c, ref.id, { ...current, ...partial }));
    };
  });
  notify(ref.c, ref.id);
}
export async function addDoc(coll, data) {
  const ref = doc(coll);
  await setDoc(ref, data);
  return ref;
}
export async function deleteDoc(ref) {
  await run('readwrite', (s) => { s.delete([ref.c, ref.id]); });
  notify(ref.c, ref.id);
}

// ── Live listeners ───────────────────────────────────────────────────────────
export function onSnapshot(target, a, b, c) {
  const next = typeof a === 'function' ? a : b;
  const onError = typeof a === 'function' ? b : c;
  let active = true;
  let latest = 0;
  const emit = () => {
    const mine = ++latest;
    (target.kind === 'doc' ? getDoc(target) : getDocs(target)).then(
      (snap) => { if (active && mine === latest) next(snap); },
      (err) => { if (active && onError) onError(err); }
    );
  };
  const onChange = (id) => { if (target.kind !== 'doc' || id === undefined || id === target.id) emit(); };
  if (!listeners.has(target.c)) listeners.set(target.c, new Set());
  listeners.get(target.c).add(onChange);
  emit();
  return () => { active = false; listeners.get(target.c).delete(onChange); };
}

// ── Bulk import / export (first-time setup and backup files) ─────────────────
export async function bulkPut(c, entries, { overwrite = false } = {}) {
  let written = 0;
  await run('readwrite', (s) => {
    entries.forEach(({ id, data }) => {
      if (overwrite) { s.put(record(c, String(id), data)); written++; return; }
      s.get([c, String(id)]).onsuccess = (e) => { if (!e.target.result) { s.put(record(c, String(id), data)); written++; } };
    });
  });
  if (written > 0) notify(c, undefined);
  return written;
}

// Pass `sinceMs` to export only records changed at or after that time.
export async function exportAll(sinceMs) {
  const rows = await run('readonly', (s, set) => {
    const req = sinceMs ? s.index('byM').getAll(IDBKeyRange.lowerBound(sinceMs)) : s.getAll();
    req.onsuccess = (e) => set(e.target.result);
  });
  return { app: 'kaapfi-pos', version: 1, exportedAt: new Date().toISOString(), docs: (rows || []).map(r => ({ c: r.c, id: r.id, d: r.d })) };
}

export async function importAll(dump) {
  if (!dump || dump.app !== 'kaapfi-pos' || !Array.isArray(dump.docs)) throw new Error('Not a Kaapfi backup file');
  await run('readwrite', (s) => { dump.docs.forEach(r => s.put(record(r.c, r.id, r.d))); });
  [...new Set(dump.docs.map(r => r.c))].forEach(c => notify(c, undefined));
  return dump.docs.length;
}

// Ask the browser never to evict this data when the device runs low on space.
export async function requestPersistence() {
  try { return !!(navigator.storage && navigator.storage.persist && await navigator.storage.persist()); } catch (e) { return false; }
}
