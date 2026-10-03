import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const CachePolicy = require("http-cache-semantics");

const now = Date.now;
const baseTime = Date.parse("2026-10-03T00:00:00Z");
Date.now = () => baseTime + 60_000;

const request = (cacheControl = "", extraHeaders = {}) => ({
  url: "https://example.test/private",
  method: "GET",
  headers: {
    host: "example.test",
    ...extraHeaders,
    ...(cacheControl ? { "cache-control": cacheControl } : {}),
  },
});
const response = (headers) => ({
  status: 200,
  headers: { date: new Date(baseTime).toUTCString(), ...headers },
});

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

  for (const vary of [" * ", "accept-language, *", "*, accept-language"]) {
    const wildcard = new CachePolicy(
      request("", { "accept-language": "en-US" }),
      response({ "cache-control": "public, max-age=3600", vary }),
      { shared: true },
    );
    assert.equal(
      wildcard.satisfiesWithoutRevalidation(request("", { "accept-language": "en-US" })),
      false,
      `Vary wildcard must never match: ${JSON.stringify(vary)}`,
    );
    assert.equal(
      wildcard.evaluateRequest(request("", { "accept-language": "en-US" })).response,
      undefined,
      `Vary wildcard must not return a cached response: ${JSON.stringify(vary)}`,
    );
  }

  const prototypeVary = new CachePolicy(
    request(),
    response({ "cache-control": "public, max-age=3600", vary: "constructor" }),
    { shared: true },
  );
  assert.equal(
    prototypeVary.satisfiesWithoutRevalidation(request()),
    false,
    "Vary names inherited from Object.prototype must fail closed when not real request headers",
  );
  assert.equal(
    prototypeVary.evaluateRequest(request()).response,
    undefined,
    "Prototype-colliding Vary names must not produce a cache hit from inherited properties",
  );

  const explicitPrototypeHeader = new CachePolicy(
    request("", { constructor: "alpha" }),
    response({ "cache-control": "public, max-age=3600", vary: "constructor" }),
    { shared: true },
  );
  assert.equal(
    explicitPrototypeHeader.satisfiesWithoutRevalidation(request("", { constructor: "alpha" })),
    true,
    "An explicit own header named constructor may match an identical explicit own header",
  );
  assert.equal(
    explicitPrototypeHeader.satisfiesWithoutRevalidation(request("", { constructor: "beta" })),
    false,
    "Explicit own prototype-colliding headers must still compare by value",
  );
} finally {
  Date.now = now;
}

console.log("http-cache-semantics security regressions: passed");
