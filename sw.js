/* Daveedus service worker — offline-first app shell */
const CACHE = 'daveedus-v1.6.6';
const ASSETS = [
  './', './index.html', './css/style.css', './js/app.js', './js/exercises.js',
  './manifest.webmanifest',
  './icons/favicon.png', './icons/pwa-icon.png', './icons/splash-icon.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* navigations: network-first so a fresh index.html (and thus fresh sw.js
   check) is picked up on every open when online; cache fallback offline */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() =>
        caches.match(e.request).then(r => r || caches.match('./index.html'))
      )
    );
    return;
  }
  /* other assets: stale-while-revalidate — serve cache instantly, refresh in background */
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(resp => {
        if (resp && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
