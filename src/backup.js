// Automatic backup to a normal folder on the computer, outside the app's own storage.
// Uninstalling the app (even with "also clear data") cannot touch these files.
//
// Files written, per install (so one install never overwrites another's backup):
//   kaapfi-full-<install>.json            everything, rewritten once a day
//   kaapfi-day-<install>-<YYYY-MM-DD>.json  only what changed that day, rewritten within a minute of each change
import * as local from './localdb';
import { getInstallId } from './sync';

export const backupSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

const DAY_FILES_KEPT = 30;
const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// The folder handle cannot be stored as JSON, so it lives in its own tiny database.
function handleStore(mode, work) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('kaapfi-handles', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('h');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const tx = req.result.transaction('h', mode);
      let out;
      tx.oncomplete = () => { req.result.close(); resolve(out); };
      tx.onerror = () => reject(tx.error);
      work(tx.objectStore('h'), v => { out = v; });
    };
  });
}
const getHandle = () => handleStore('readonly', (s, set) => { s.get('dir').onsuccess = (e) => set(e.target.result || null); }).catch(() => null);
const saveHandle = (h) => handleStore('readwrite', (s) => { s.put(h, 'dir'); });

async function writeJson(dir, name, obj) {
  const file = await dir.getFileHandle(name, { create: true });
  const w = await file.createWritable(); // writes to a temp file and swaps it in on close, so a crash never leaves half a file
  await w.write(JSON.stringify(obj));
  await w.close();
}
async function readJson(dir, name) { return JSON.parse(await (await (await dir.getFileHandle(name)).getFile()).text()); }
async function fileNames(dir) { const names = []; for await (const name of dir.keys()) names.push(name); return names; }

// 'unsupported' | 'none' (no folder chosen) | 'needs-permission' | 'ok'
export async function backupState() {
  if (!backupSupported) return 'unsupported';
  const dir = await getHandle();
  if (!dir) return 'none';
  return (await dir.queryPermission({ mode: 'readwrite' })) === 'granted' ? 'ok' : 'needs-permission';
}

export function lastBackupAt() { return localStorage.getItem('kaapfi_lastFolderBackup'); }

export async function writeBackup({ forceFull = false } = {}) {
  if ((await backupState()) !== 'ok') return false;
  const dir = await getHandle();
  const id = await getInstallId();
  const today = localDate();

  if (forceFull || localStorage.getItem('kaapfi_lastFullBackup') !== today) {
    await writeJson(dir, `kaapfi-full-${id}.json`, await local.exportAll());
    localStorage.setItem('kaapfi_lastFullBackup', today);
    const cutoff = localDate(new Date(Date.now() - DAY_FILES_KEPT * 86400000));
    for (const name of await fileNames(dir)) {
      const m = name.match(new RegExp(`^kaapfi-day-${id}-(\\d{4}-\\d{2}-\\d{2})\\.json$`));
      if (m && m[1] < cutoff) await dir.removeEntry(name).catch(() => {});
    }
  }
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  await writeJson(dir, `kaapfi-day-${id}-${today}.json`, await local.exportAll(dayStart.getTime()));
  localStorage.setItem('kaapfi_lastFolderBackup', new Date().toISOString());
  return true;
}

// Must be called from a click (the browser requires it to show the folder picker / permission prompt).
export async function chooseBackupFolder() {
  const dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'kaapfi-backup', startIn: 'documents' });
  await saveHandle(dir);
  await writeBackup({ forceFull: true });
  return dir.name;
}
export async function regrantBackupPermission() {
  const dir = await getHandle();
  if (!dir || (await dir.requestPermission({ mode: 'readwrite' })) !== 'granted') return false;
  await writeBackup();
  return true;
}

// Saves within a minute of any change. Returns a stop function.
export function startAutoBackup(onResult) {
  let dirty = true;
  const stopWatching = local.onAnyChange(() => { dirty = true; });
  const tick = async () => {
    if (!dirty) return;
    try { if (await writeBackup()) { dirty = false; onResult(true); } else onResult(false); }
    catch (e) { onResult(false); }
  };
  tick();
  const t = setInterval(tick, 60000);
  return () => { clearInterval(t); stopWatching(); };
}

// Loads the newest backup found in a folder the user picks: the latest full copy, then every later day's changes.
export async function restoreFromFolder() {
  const dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'kaapfi-backup', startIn: 'documents' });
  const names = await fileNames(dir);
  const fulls = [];
  for (const name of names.filter(n => /^kaapfi-full-\w+\.json$/.test(n))) {
    try { const dump = await readJson(dir, name); fulls.push({ id: name.match(/^kaapfi-full-(\w+)\.json$/)[1], dump }); } catch (e) {}
  }
  if (fulls.length === 0) throw new Error('No Kaapfi backup was found in that folder.');
  fulls.sort((a, b) => (a.dump.exportedAt < b.dump.exportedAt ? 1 : -1));
  const { id, dump } = fulls[0];
  let count = await local.importAll(dump);

  const fullDay = localDate(new Date(dump.exportedAt));
  const days = names.map(n => n.match(new RegExp(`^kaapfi-day-${id}-(\\d{4}-\\d{2}-\\d{2})\\.json$`))).filter(m => m && m[1] >= fullDay).sort((a, b) => (a[1] < b[1] ? -1 : 1));
  let latest = dump.exportedAt;
  for (const m of days) {
    try { const day = await readJson(dir, m[0]); count += await local.importAll(day); if (day.exportedAt > latest) latest = day.exportedAt; } catch (e) {}
  }
  await saveHandle(dir);
  return { count, latest };
}
