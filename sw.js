// Простой cache-first сервис-воркер для офлайна
const CACHE = 'rota-v3'; // было rota-v1
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(r => {
      // кэшируем навигацию и статику
      const copy = r.clone();
      if (req.method === 'GET' && (req.mode === 'navigate' || req.url.endsWith('.html') || req.url.endsWith('.json') )) {
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(()=>{});
      }
      return r;
    }).catch(() => caches.match('./index.html')))
  );
});
