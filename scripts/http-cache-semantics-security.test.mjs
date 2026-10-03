import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const CachePolicy = require("http-cache-semantics");

const now = Date.now;
const baseTime = Date.parse("2026-10-03T00:00:00Z");
Date.now = () => baseTime + 60_000;

const request = (cacheControl = "") => ({
  url: "https://example.test/private",
  method: "GET",
  headers: {
    host: "example.test",
    ...(cacheControl ? { "cache-control": cacheControl } : {}),
  },
});
const response = (headers) => ({ status: 200, headers: { date: new Date(baseTime).toUTCString(), ...headers } });

try {
  const privateCookie = new CachePolicy(
    request(),
    response({ "cache-control": "max-age=3600", "set-cookie": "session=private" }),
    { shared: true },
  );
  assert.equal(privateCookie.satisfiesWithoutRevalidation(request("max-stale=86400")), false);
  assert.equal(privateCookie.evaluateRequest(request("max-stale=86400")).response, undefined);

  const proxyRevalidate = new CachePolicy(
    request(),
    response({ "cache-control": "max-age=1, proxy-revalidate" }),
    { shared: true },
  );
  assert.equal(proxyRevalidate.satisfiesWithoutRevalidation(request("max-stale=86400")), false);
  assert.equal(proxyRevalidate.evaluateRequest(request("max-stale=86400")).response, undefined);

  const noCache = new CachePolicy(
    request(),
    response({ "cache-control": "no-cache" }),
    { shared: true },
  );
  assert.equal(noCache.satisfiesWithoutRevalidation(request("max-stale=86400")), false);

  const publicStale = new CachePolicy(
    request(),
    response({ "cache-control": "public, max-age=1" }),
    { shared: true },
  );
  assert.equal(publicStale.satisfiesWithoutRevalidation(request("max-stale=86400")), true);
} finally {
  Date.now = now;
}

console.log("http-cache-semantics max-stale security regression: passed");
