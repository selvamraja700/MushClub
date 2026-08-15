const CACHE_NAME = 'mushclub-cache-v36';
const OFFLINE_URL = 'offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/form.js',
  'https://ik.imagekit.io/Selvamraj700/mushroomKit.png',
  'https://ik.imagekit.io/Selvamraj700/logo_opaque_3000px%20(1).png'
];

// Install event: Pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first for HTML, Cache-first for others
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Network First for HTML (Navigation)
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Cache First for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // Optionally cache the new asset here (dynamic caching)
        // Ensure we only cache valid GET requests
        if (request.method === 'GET' && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If an image fails and it's not in cache, we could return a fallback image, but for now just fail silently
      });
    })
  );
});
