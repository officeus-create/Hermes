import assert from "node:assert/strict";
import { handleRouteEstimate } from "../functions/api/route-estimate.ts";

class MemoryKv {
  values = new Map();
  writes = [];
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value, options) {
    this.values.set(key, value);
    this.writes.push({ key, value, options });
  }
}

class LimitedKv {
  async get() { return "10"; }
  async put() { throw new Error("rate-limited requests must not write"); }
}

const allowedOrigin = "https://hermeslogisticsus.com";
const secret = "server-secret-never-returned";
const configuredEnv = (limits = new MemoryKv()) => ({
  ALLOWED_ORIGIN: allowedOrigin,
  ROUTE_ESTIMATE_ENABLED: "true",
  GOOGLE_MAPS_API_KEY: secret,
  ROUTE_LIMITS: limits,
});

const routeRequest = (payload, headers = {}, method = "POST") => new Request(`${allowedOrigin}/api/route-estimate`, {
  method,
  headers: {
    "Content-Type": "application/json",
    "Origin": allowedOrigin,
    "CF-Connecting-IP": "192.0.2.44",
    ...headers,
  },
  ...(method === "POST" ? { body: typeof payload === "string" ? payload : JSON.stringify(payload) } : {}),
});

const addressPayload = {
  origin: { address: "Chicago, IL" },
  destination: { address: "Milwaukee, WI" },
};

const captured = [];
const limits = new MemoryKv();
const success = await handleRouteEstimate(
  { request: routeRequest(addressPayload), env: configuredEnv(limits) },
  async (input, init) => {
    captured.push({ input: String(input), init });
    return new Response(JSON.stringify({ routes: [{ distanceMeters: 160934.4, duration: "7200s" }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
);
assert.equal(success.status, 200);
assert.equal(success.headers.get("Cache-Control"), "no-store");
assert.equal(success.headers.get("X-Robots-Tag"), "noindex, nofollow");
const successBody = await success.json();
assert.equal(successBody.success, true);
assert.equal(successBody.estimate_type, "general_driving_route");
assert.equal(successBody.distance_meters, 160934);
assert.equal(successBody.distance_miles, 100);
assert.equal(successBody.duration_seconds, 7200);
assert.equal(successBody.duration_minutes, 120);
assert.match(successBody.disclaimer, /not truck-specific/i);
assert.equal(JSON.stringify(successBody).includes(secret), false);
assert.equal(JSON.stringify(successBody).includes("Chicago"), false);
assert.equal(JSON.stringify(successBody).includes("Milwaukee"), false);
assert.equal(captured.length, 1);
assert.equal(captured[0].input, "https://routes.googleapis.com/directions/v2:computeRoutes");
assert.equal(captured[0].init.headers["X-Goog-Api-Key"], secret);
assert.equal(captured[0].init.headers["X-Goog-FieldMask"], "routes.distanceMeters,routes.duration");
assert.ok(captured[0].init.signal instanceof AbortSignal);
const providerBody = JSON.parse(captured[0].init.body);
assert.deepEqual(providerBody.origin, { address: "Chicago, IL" });
assert.deepEqual(providerBody.destination, { address: "Milwaukee, WI" });
assert.equal(providerBody.travelMode, "DRIVE");
assert.equal(providerBody.routingPreference, "TRAFFIC_UNAWARE");
assert.equal(providerBody.computeAlternativeRoutes, false);
assert.equal(limits.writes.length, 1);
assert.equal(limits.writes[0].options.expirationTtl, 3600);
assert.match(limits.writes[0].key, /^route-estimate:rate:[a-f0-9]{64}$/);
assert.equal(limits.writes[0].key.includes("192.0.2.44"), false);

const placeCaptured = [];
const placeSuccess = await handleRouteEstimate(
  {
    request: routeRequest({
      origin: { place_id: "ChIJ7cv00DwsDogRAMDACa2m4K8" },
      destination: { place_id: "ChIJ50eLV9cCBYgRhHtBtSIZX0Q" },
    }),
    env: configuredEnv(),
  },
  async (_input, init) => {
    placeCaptured.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ routes: [{ distanceMeters: 150000, duration: "7000.4s" }] }), { status: 200 });
  },
);
assert.equal(placeSuccess.status, 200);
assert.deepEqual(placeCaptured[0].origin, { placeId: "ChIJ7cv00DwsDogRAMDACa2m4K8" });
assert.deepEqual(placeCaptured[0].destination, { placeId: "ChIJ50eLV9cCBYgRhHtBtSIZX0Q" });

let unexpectedFetches = 0;
const noFetch = async () => {
  unexpectedFetches += 1;
  throw new Error("provider fetch must not run");
};

const disabled = await handleRouteEstimate({
  request: routeRequest(addressPayload),
  env: { ALLOWED_ORIGIN: allowedOrigin },
}, noFetch);
assert.equal(disabled.status, 503);
assert.equal((await disabled.json()).error, "route_estimate_not_configured");

const foreign = await handleRouteEstimate({
  request: routeRequest(addressPayload, { Origin: "https://attacker.example" }),
  env: configuredEnv(),
}, noFetch);
assert.equal(foreign.status, 403);

const invalidJson = await handleRouteEstimate({
  request: routeRequest("{bad-json"),
  env: configuredEnv(),
}, noFetch);
assert.equal(invalidJson.status, 400);
assert.equal((await invalidJson.json()).error, "invalid_json");

const invalidLocation = await handleRouteEstimate({
  request: routeRequest({ origin: { address: "Paris" }, destination: { address: "London" } }),
  env: configuredEnv(),
}, noFetch);
assert.equal(invalidLocation.status, 400);
assert.equal((await invalidLocation.json()).error, "invalid_location");

const territoryLocation = await handleRouteEstimate({
  request: routeRequest({ origin: { address: "San Juan, PR" }, destination: { address: "Ponce, PR" } }),
  env: configuredEnv(),
}, async () => new Response(JSON.stringify({ routes: [{ distanceMeters: 118000, duration: "5400s" }] }), { status: 200 }));
assert.equal(territoryLocation.status, 200);

const conflictingLocation = await handleRouteEstimate({
  request: routeRequest({
    origin: { address: "Chicago, IL", place_id: "ChIJ7cv00DwsDogRAMDACa2m4K8" },
    destination: { address: "Milwaukee, WI" },
  }),
  env: configuredEnv(),
}, noFetch);
assert.equal(conflictingLocation.status, 400);

const sameLocation = await handleRouteEstimate({
  request: routeRequest({ origin: { address: "Chicago, IL" }, destination: { address: "chicago, il" } }),
  env: configuredEnv(),
}, noFetch);
assert.equal(sameLocation.status, 400);
assert.equal((await sameLocation.json()).error, "origin_destination_must_differ");

const rateLimited = await handleRouteEstimate({
  request: routeRequest(addressPayload),
  env: configuredEnv(new LimitedKv()),
}, noFetch);
assert.equal(rateLimited.status, 429);
assert.equal((await rateLimited.json()).error, "rate_limit_exceeded");

const upstreamLimited = await handleRouteEstimate({
  request: routeRequest(addressPayload),
  env: configuredEnv(),
}, async () => new Response("quota", { status: 429 }));
assert.equal(upstreamLimited.status, 503);
assert.equal((await upstreamLimited.json()).error, "estimate_temporarily_unavailable");

const providerBadLocation = await handleRouteEstimate({
  request: routeRequest(addressPayload),
  env: configuredEnv(),
}, async () => new Response("bad waypoint", { status: 400 }));
assert.equal(providerBadLocation.status, 422);
assert.equal((await providerBadLocation.json()).error, "route_not_found");

const noRoute = await handleRouteEstimate({
  request: routeRequest(addressPayload),
  env: configuredEnv(),
}, async () => new Response(JSON.stringify({ routes: [] }), { status: 200 }));
assert.equal(noRoute.status, 422);
assert.equal((await noRoute.json()).error, "route_not_found");

const invalidProviderJson = await handleRouteEstimate({
  request: routeRequest(addressPayload),
  env: configuredEnv(),
}, async () => new Response("not-json", { status: 200 }));
assert.equal(invalidProviderJson.status, 502);
assert.equal((await invalidProviderJson.json()).error, "invalid_provider_response");

const options = await handleRouteEstimate({
  request: routeRequest(null, {}, "OPTIONS"),
  env: configuredEnv(),
}, noFetch);
assert.equal(options.status, 204);
assert.equal(options.headers.get("Access-Control-Allow-Origin"), allowedOrigin);

const getRequest = new Request(`${allowedOrigin}/api/route-estimate`, {
  method: "GET",
  headers: { Origin: allowedOrigin },
});
const methodRejected = await handleRouteEstimate({ request: getRequest, env: configuredEnv() }, noFetch);
assert.equal(methodRejected.status, 405);
assert.equal(unexpectedFetches, 0);

console.log("Route estimate endpoint checks passed: default-off gate, same-origin, US/place validation, hashed KV quota, minimal Google fields, provider timeout signal, safe response and zero secret/location leakage.");
