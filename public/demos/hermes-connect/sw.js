const CACHE_NAME = 'hermes-connect-runtime-v2';
const SCOPE_PATH = new URL(self.registration.scope).pathname;

const STATIC_ASSETS = [
  './workspace.html',
  './workspace.css',
  './workspace.js',
  './workspace-enhancements.css',
  './workspace-enhancements.js',
  './ai-front-door.js',
  './email-load-parser.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './icon-192.svg',
  './icon-512.svg',
  './icon-maskable.svg'
];

function isWithinCanonicalScope(url) {
  return url.pathname.startsWith(SCOPE_PATH);
}

function isDynamicOrPrivateRequest(url) {
  return url.pathname.startsWith('/api/');
}

function responseCanBeCached(response) {
  if (!response || response.status !== 200 || response.type !== 'basic') return false;
  const cacheControl = String(response.headers.get('cache-control') || '').toLowerCase();
  return !cacheControl.includes('no-store') && !cacheControl.includes('private');
}

async function fetchFresh(request) {
  return fetch(new Request(request, { cache: 'no-store' }));
}

async function cacheFreshResponse(request, response) {
  if (!responseCanBeCached(response)) return;
  const responseCopy = response.clone();
  await caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS.map((asset) => new Request(asset, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[Hermes SW] Pre-cache warning:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.map((cache) => cache === CACHE_NAME ? undefined : caches.delete(cache))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Authenticated/dynamic APIs and same-origin resources outside this PWA scope are always
  // network-owned. Never place account, session or product API responses in Cache Storage.
  if (isDynamicOrPrivateRequest(url) || !isWithinCanonicalScope(url)) return;

  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetchFresh(event.request);
        await cacheFreshResponse(event.request, networkResponse);
        return networkResponse;
      } catch {
        return (await caches.match(event.request)) || caches.match('./workspace.html');
      }
    })());
    return;
  }

  // Network-first while online prevents a previously installed worker from pinning old JS/CSS
  // across later releases. Cache Storage remains an offline fallback only.
  event.respondWith((async () => {
    try {
      const networkResponse = await fetchFresh(event.request);
      await cacheFreshResponse(event.request, networkResponse);
      return networkResponse;
    } catch {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;
      throw new Error('offline_asset_unavailable');
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
