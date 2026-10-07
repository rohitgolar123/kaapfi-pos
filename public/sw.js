// Lets the app open with no internet: keeps a copy of the app's own files on the device.
// It never caches data — billing data lives in the on-device database.
const CACHE = 'kaapfi-app-v1';

async function appFiles() {
  const manifest = await (await fetch('/asset-manifest.json', { cache: 'no-store' })).json();
  return Object.values(manifest.files || {}).filter(f => !f.endsWith('.map'));
}

async function precache() {
  const cache = await caches.open(CACHE);
  const files = await appFiles();
  await cache.addAll(['/index.html', '/manifest.json', '/icon-192.png', ...files.filter(f => f !== '/index.html')]);
  // Drop files from older versions of the app
  const keep = new Set(files);
  for (const req of await cache.keys()) {
    const path = new URL(req.url).pathname;
    if (path.startsWith('/static/') && !keep.has(path)) await cache.delete(req);
  }
}

self.addEventListener('install', (e) => { e.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function networkFirstPage(request) {
  const cached = () => caches.match('/index.html');
  const fresh = fetch(request).then(res => {
    if (res.ok) { precache().catch(() => {}); }
    return res.ok ? res : cached();
  });
  // On a weak connection, don't make staff wait: fall back to the saved copy after 4 seconds
  const timeout = new Promise(resolve => setTimeout(() => cached().then(c => c && resolve(c)), 4000));
  return Promise.race([fresh, timeout]).catch(cached);
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/asset-manifest.json' || url.pathname === '/sw.js') return;

  if (e.request.mode === 'navigate') { e.respondWith(networkFirstPage(e.request)); return; }

  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  })));
});
