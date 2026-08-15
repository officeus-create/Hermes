const CACHE_NAME = 'hermes-connect-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './ai-front-door.js',
  './email-load-parser.js',
  './mobile.html',
  './review.html',
  './sales-roleplay.html',
  './workspace-launch-v2.css',
  './workspace-launch-v2.js',
  './workspace-v2-injected.css',
  './workspace-v2.html',
  './workspace-v2.js',
  './workspace.css',
  './workspace.html',
  './workspace.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.svg',
  './icon-512.svg',
  './icon-maskable.svg'
];

// Install Event - Pre-cache offline core shell & assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[Hermes SW] Pre-cache warning:', err))
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate & Network Fallback Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Handle same-origin assets
  if (url.origin === self.location.origin) {
    // Navigation requests: Network first with Cache fallback
    if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
            }
            return networkResponse;
          })
          .catch(async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;
            return caches.match('./index.html');
          })
      );
      return;
    }

    // Static resources: Stale-While-Revalidate
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            /* Offline - returning cached response if available */
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// Message Event - Skip Waiting on update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
