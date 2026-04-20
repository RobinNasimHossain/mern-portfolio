// Minimal service worker for PWA installability + offline fallback.
// Network-first for navigations (so app updates are immediate), cache-first
// for hashed build assets, and serve a cached /offline.html when the network
// is unreachable.

const CACHE = 'robin-portfolio-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Never intercept API requests — let them pass straight to the network so
  // auth / mutations behave normally and errors are visible to the app.
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network-first with offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  // Same-origin static assets: cache-first, fall back to network.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((resp) => {
            // Opportunistically cache hashed build assets under /assets/.
            if (url.pathname.startsWith('/assets/') && resp.ok) {
              const copy = resp.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return resp;
          }),
      ),
    );
  }
});
