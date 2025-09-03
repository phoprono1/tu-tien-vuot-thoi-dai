const CACHE_NAME = 'tu-tien-game-v1';
const urlsToCache = [
  '/',
  '/combat',
  '/pvp',
  '/manifest.json',
  // Add other important routes
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
