import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateTurnstileToken } from "../functions/api/_lib/turnstile.mjs";

let observed = null;
const successFetch = async (url, options) => {
  observed = { url, options };
  return {
    ok: true,
    async json() {
      return {
        success: true,
        hostname: "hermeslogisticsus.com",
        action: "repair_booking",
        challenge_ts: "2026-09-18T00:00:00.000Z",
      };
    },
  };
};

const success = await validateTurnstileToken({
  token: "valid-token",
  secret: "server-secret",
  remoteIp: "192.0.2.80",
  expectedHostname: "hermeslogisticsus.com",
  expectedAction: "repair_booking",
  fetchImpl: successFetch,
});
assert.equal(success.ok, true);
assert.equal(observed.url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
const payload = JSON.parse(observed.options.body);
assert.equal(payload.secret, "server-secret");
assert.equal(payload.response, "valid-token");
assert.equal(payload.remoteip, "192.0.2.80");
assert.match(payload.idempotency_key, /^[0-9a-f-]{36}$/i);

assert.deepEqual(await validateTurnstileToken({ token: "x", secret: "" }), { ok: false, reason: "not_configured" });

let invalidFetches = 0;
assert.deepEqual(
  await validateTurnstileToken({
    token: "",
    secret: "server-secret",
    fetchImpl: async () => {
      invalidFetches += 1;
      throw new Error("must not fetch");
    },
  }),
  { ok: false, reason: "invalid_token" },
);
assert.equal(invalidFetches, 0);

const mismatchAction = await validateTurnstileToken({
  token: "x",
  secret: "server-secret",
  expectedAction: "other_action",
  fetchImpl: successFetch,
});
assert.equal(mismatchAction.reason, "action_mismatch");

const mismatchHost = await validateTurnstileToken({
  token: "x",
  secret: "server-secret",
  expectedHostname: "www.hermeslogisticsus.com",
  fetchImpl: successFetch,
});
assert.equal(mismatchHost.reason, "hostname_mismatch");

const rejected = await validateTurnstileToken({
  token: "x",
  secret: "server-secret",
  fetchImpl: async () => ({ ok: true, json: async () => ({ success: false }) }),
});
assert.equal(rejected.reason, "failed");

const unavailable = await validateTurnstileToken({
  token: "x",
  secret: "server-secret",
  fetchImpl: async () => {
    throw new Error("network down");
  },
});
assert.equal(unavailable.reason, "unavailable");

const [endpoint, configEndpoint, bookingPage, headers] = await Promise.all([
  readFile(new URL("../functions/api/public/repair-booking.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/public/turnstile-config.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/booking.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/_headers", import.meta.url), "utf8"),
]);

assert.match(endpoint, /TURNSTILE_REPAIR_BOOKING_MODE/);
assert.match(endpoint, /TURNSTILE_REPAIR_BOOKING_SECRET/);
assert.match(endpoint, /expectedAction:\s*"repair_booking"/);
assert.match(endpoint, /CF-Connecting-IP/);
assert.ok(endpoint.indexOf("validateTurnstileToken") < endpoint.indexOf("getPublicShop(env.DB"), "Turnstile must run before booking D1 work.");

assert.match(configEndpoint, /TURNSTILE_REPAIR_BOOKING_SITE_KEY/);
assert.match(configEndpoint, /TURNSTILE_REPAIR_BOOKING_SECRET/);
assert.doesNotMatch(configEndpoint, /sitekey:\s*env\.TURNSTILE_REPAIR_BOOKING_SECRET/);

assert.match(bookingPage, /\/api\/public\/turnstile-config/);
assert.match(bookingPage, /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/);
assert.match(bookingPage, /action:\s*"repair_booking"/);
assert.match(bookingPage, /appearance:\s*"interaction-only"/);
assert.match(bookingPage, /size:\s*"flexible"/);
assert.match(bookingPage, /turnstile_token/);

assert.match(headers, /script-src[^\n]*https:\/\/challenges\.cloudflare\.com/);
assert.match(headers, /frame-src[^\n]*https:\/\/challenges\.cloudflare\.com/);
assert.match(headers, /connect-src[^\n]*https:\/\/challenges\.cloudflare\.com/);

console.log("Turnstile Repair Booking pilot contract passed.");
