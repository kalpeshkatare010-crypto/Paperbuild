const CACHE = 'paperbuild-v5';
const CORE = ['./', 'index.html', 'app.html', 'signup.html', 'manifest.webmanifest', 'assets/config.js', 'fonts/pbmath.js', 'vendor/docx.min.js', 'vendor/supabase.js',
  'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png',
  'fonts/LibertinusSerif-Regular.woff2', 'fonts/LibertinusSerif-Italic.woff2', 'fonts/LibertinusSerif-Semibold.woff2', 'fonts/fonts.css',
  'fonts/inter-tight-latin-400-normal.woff2', 'fonts/inter-tight-latin-500-normal.woff2', 'fonts/inter-tight-latin-600-normal.woff2',
  'fonts/dm-mono-latin-400-normal.woff2', 'fonts/dm-mono-latin-500-normal.woff2',
  'vendor/jspdf.umd.min.js', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    // Pages: try the network first so updates show up, fall back to the cached copy offline.
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('app.html'))));
    return;
  }
  // Everything else: cache first, then network (and keep a copy).
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
