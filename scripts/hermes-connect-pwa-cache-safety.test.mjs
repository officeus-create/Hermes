import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const swSource = fs.readFileSync('public/demos/hermes-connect/sw.js', 'utf8');
const handlers = new Map();
const cachePuts = [];
const deletedCaches = [];
const cachedResponses = new Map();
const fetchCalls = [];
let fetchBehavior = async (request) => new Response(`fresh:${new URL(request.url).pathname}`, {
  status: 200,
  headers: { 'content-type': 'application/javascript' },
});

const cache = {
  async addAll() {},
  async put(request, response) {
    const key = typeof request === 'string' ? request : request.url;
    cachePuts.push(key);
    cachedResponses.set(key, response.clone());
  },
};

const cachesMock = {
  async open() { return cache; },
  async keys() { return ['hermes-connect-canonical-2026-08-15', 'hermes-connect-runtime-v2']; },
  async delete(name) { deletedCaches.push(name); return true; },
  async match(request) {
    const key = typeof request === 'string' ? request : request.url;
    return cachedResponses.get(key)?.clone() || null;
  },
};

const selfMock = {
  registration: { scope: 'https://example.test/demos/hermes-connect/' },
  location: { origin: 'https://example.test' },
  clients: { async claim() {} },
  async skipWaiting() {},
  addEventListener(type, handler) { handlers.set(type, handler); },
};

const context = vm.createContext({
  self: selfMock,
  caches: cachesMock,
  Request,
  Response,
  URL,
  console,
  fetch: async (request) => {
    fetchCalls.push(request.url);
    return fetchBehavior(request);
  },
  Error,
  String,
  Promise,
});
vm.runInContext(swSource, context, { filename: 'sw.js' });

const fetchHandler = handlers.get('fetch');
const activateHandler = handlers.get('activate');
assert.equal(typeof fetchHandler, 'function', 'service worker must register fetch handler');
assert.equal(typeof activateHandler, 'function', 'service worker must register activate handler');

function dispatchFetch(url, init = {}) {
  let responsePromise = null;
  const request = new Request(url, { method: 'GET', ...init });
  fetchHandler({
    request,
    respondWith(value) { responsePromise = Promise.resolve(value); },
  });
  return { request, responsePromise };
}

// Private API traffic is network-owned by the browser and never handed to Cache Storage.
cachePuts.length = 0;
fetchCalls.length = 0;
const apiEvent = dispatchFetch('https://example.test/api/hermes-connect/account');
assert.equal(apiEvent.responsePromise, null, 'service worker must not intercept /api traffic');
assert.equal(cachePuts.length, 0, 'service worker must not cache /api responses');

// Same-origin resources outside the canonical PWA scope are also not intercepted.
const outsideEvent = dispatchFetch('https://example.test/services/hermes-connect/repair-shops/');
assert.equal(outsideEvent.responsePromise, null, 'service worker must not intercept same-origin resources outside its canonical scope');

// Online static assets are network-first even if an older cached response exists.
const assetUrl = 'https://example.test/demos/hermes-connect/workspace.js';
cachedResponses.set(assetUrl, new Response('old-shell', { status: 200 }));
cachePuts.length = 0;
fetchCalls.length = 0;
fetchBehavior = async () => new Response('fresh-shell', { status: 200, headers: { 'content-type': 'application/javascript' } });
const onlineAsset = dispatchFetch(assetUrl);
assert.ok(onlineAsset.responsePromise, 'scoped static asset must be handled by the service worker');
assert.equal(await (await onlineAsset.responsePromise).text(), 'fresh-shell', 'online asset must prefer network over stale cache');
assert.equal(fetchCalls.length, 1, 'online asset must issue a network request before fallback');
assert.equal(cachePuts.length, 1, 'fresh cacheable asset must refresh Cache Storage');

// Offline static assets fall back to the last cached response.
fetchBehavior = async () => { throw new Error('offline'); };
cachedResponses.set(assetUrl, new Response('offline-shell', { status: 200 }));
const offlineAsset = dispatchFetch(assetUrl);
assert.equal(await (await offlineAsset.responsePromise).text(), 'offline-shell', 'offline asset must use cached fallback');

// Cache-Control private/no-store responses are never persisted even inside the static scope.
for (const directive of ['no-store', 'private, max-age=0']) {
  cachePuts.length = 0;
  fetchBehavior = async () => new Response('sensitive', {
    status: 200,
    headers: { 'cache-control': directive, 'content-type': 'application/javascript' },
  });
  const sensitiveAsset = dispatchFetch(`https://example.test/demos/hermes-connect/sensitive-${directive.startsWith('private') ? 'private' : 'no-store'}.js`);
  assert.equal(await (await sensitiveAsset.responsePromise).text(), 'sensitive');
  assert.equal(cachePuts.length, 0, `${directive} response must not be written to Cache Storage`);
}

// Activation removes the historical dated cache while preserving the current runtime cache.
let activation = null;
activateHandler({ waitUntil(value) { activation = Promise.resolve(value); } });
assert.ok(activation, 'activate handler must register lifecycle work');
await activation;
assert.ok(deletedCaches.includes('hermes-connect-canonical-2026-08-15'), 'old dated cache must be removed during activation');
assert.ok(!deletedCaches.includes('hermes-connect-runtime-v2'), 'current runtime cache must be preserved');

// Static source guards keep the intended policy explicit and reviewable.
assert.match(swSource, /isDynamicOrPrivateRequest/);
assert.match(swSource, /url\.pathname\.startsWith\('\/api\/'\)/);
assert.match(swSource, /isWithinCanonicalScope/);
assert.match(swSource, /cache:\s*'no-store'/);
assert.match(swSource, /cacheControl\.includes\('no-store'\)/);
assert.match(swSource, /cacheControl\.includes\('private'\)/);
assert.doesNotMatch(swSource, /cachedResponse\s*\|\|\s*fetchPromise/, 'cache-first static strategy must not return');

console.log('Hermes Connect PWA cache safety: PASS — network-first shell, offline fallback, private/API cache exclusion and old-cache retirement verified.');
