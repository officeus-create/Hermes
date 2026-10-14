import assert from "node:assert/strict";
import fs from "node:fs";
import { onRequestPost as emailStart, onRequestGet as emailStatus } from "../functions/api/auth/email/start.ts";
import { onRequestPost as emailVerify } from "../functions/api/auth/email/verify.ts";
import { onRequestPost as legacyRegister } from "../functions/api/auth/register.ts";
import { magicLink, normalizeEmail, validateEmailRequest } from "../functions/api/_lib/email-identity.mjs";

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const source = read("functions/api/_lib/email-identity.mjs");
const start = read("functions/api/auth/email/start.ts");
const verify = read("functions/api/auth/email/verify.ts");
const confirm = read("src/pages/services/hermes-connect/confirm-email/index.astro");
const requestPage = read("src/pages/services/hermes-connect/email-access/index.astro");

assert.match(source, /EMAIL_CONFIRM_TTL_MS = 15 \* 60_000/);
assert.match(source, /HERMES_EMAIL_MAGIC_ENABLED === "true"/);
assert.match(source, /HERMES_AUTH_TRANSACTIONAL_EMAIL_APPROVED === "true"/);
assert.match(source, /HERMES_AUTH_EMAIL_DELIVERY_READY === "true"/);
assert.match(source, /hermes_verified_emails/);
assert.match(source, /token_hash TEXT PRIMARY KEY/);
assert.match(start, /same_origin_required/);
assert.match(start, /recentEmail\?\.c/);
assert.match(start, /recentIp\?\.c/);
assert.match(start, /10 \* 60_000/);
assert.match(start, /emailMagicEnabled\(env\)/);
assert.match(start, /await env\.LEAD_EMAIL_SERVICE!\.fetch/);
assert.match(start, /email_delivery_unavailable/);
assert.doesNotMatch(start, /console\.log\(token\)/);
assert.match(verify, /consumed\?\.meta\?\.changes/);
assert.match(verify, /existing_account_signin_required/);
assert.match(verify, /hermes_verified_emails/);
assert.match(verify, /sessionCookieHeader\(sessionToken\)/);
assert.match(confirm, /button\?\.addEventListener\("click"/);
assert.match(confirm, /history\.replaceState/);
const fakeToken = "a".repeat(64);
const generated = new URL(magicLink(fakeToken));
assert.equal(generated.search, "", "email credential must never enter request query");
assert.equal(new URLSearchParams(generated.hash.slice(1)).get("token"), fakeToken);
assert.match(confirm, /new URLSearchParams\(url\.hash\.slice\(1\)\)/);
assert.match(confirm, /url\.hash = ""/);

assert.match(requestPage, /payload\.enabled === true/);
assert.match(requestPage, /form\.hidden = false/);

// Permission test: no owner scope or email transport => no email, no session, no DB write.
let sent = 0;
const env = {
  DB: { prepare: () => { throw new Error("DB unexpectedly touched"); } },
  LEAD_EMAIL_SERVICE: { fetch: async () => { sent++; throw new Error("send denied"); } },
  LEAD_SERVICE_TOKEN: "fake-for-test-only",
};
const request = new Request("https://hermeslogisticsus.com/api/auth/email/start", {
  method: "POST",
  headers: { Origin: "https://hermeslogisticsus.com", "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@example.com" }),
});
const response = await emailStart({ request, env });
assert.equal(response.status, 503);
assert.equal((await response.json()).error, "email_verification_not_available");
assert.equal(sent, 0);
const status = await emailStatus({ env });
assert.equal((await status.json()).enabled, false);
const confirmRequest = new Request("https://hermeslogisticsus.com/api/auth/email/verify", {
  method: "POST",
  headers: { Origin: "https://hermeslogisticsus.com", "Content-Type": "application/json" },
  body: JSON.stringify({ token: "a".repeat(64) }),
});
const denied = await emailVerify({ request: confirmRequest, env });
assert.equal(denied.status, 503);
assert.equal(sent, 0);
// An owner can opt into "verified signup required" without accidentally
// issuing legacy password sessions; an unconfigured sender blocks safely.
let registerDbQueries = 0;
const registerEnv = {
  DB: { prepare: () => { registerDbQueries++; throw new Error("legacy signup wrote to DB"); } },
  HERMES_NEW_SIGNUP_EMAIL_VERIFICATION_REQUIRED: "true",
};
const registerRequest = () => new Request("https://hermeslogisticsus.com/api/auth/register", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: "https://hermeslogisticsus.com" },
  body: JSON.stringify({
    email: "shop-owner@example.com", password: "Password-Strong-123",
    name: "Shop Owner", role: "Shop Owner", location: "Arkansas, US",
    bio: "Real business owner registration.",
  }),
});
const paused = await legacyRegister({ request: registerRequest(), env: registerEnv });
assert.equal(paused.status, 503);
assert.equal((await paused.json()).error, "verified_signup_unavailable");
assert.equal(registerDbQueries, 0, "unready verified signup must never write account/session");

Object.assign(registerEnv, {
  HERMES_EMAIL_MAGIC_ENABLED: "true",
  HERMES_AUTH_TRANSACTIONAL_EMAIL_APPROVED: "true",
  HERMES_AUTH_EMAIL_DELIVERY_READY: "true",
  HERMES_EMAIL_RATE_SALT: "test-only-long-rate-salt",
  LEAD_EMAIL_SERVICE: { fetch: async () => { throw new Error("no sends"); } },
  LEAD_SERVICE_TOKEN: "synthetic-test-token",
});
const redirected = await legacyRegister({ request: registerRequest(), env: registerEnv });
assert.equal(redirected.status, 409);
const redirectedJson = await redirected.json();
assert.equal(redirectedJson.error, "email_verification_required");
assert.equal(redirectedJson.next_url, "/services/hermes-connect/email-access/");
assert.equal(registerDbQueries, 0);


const longEmail = "a".repeat(151) + "@example.com";
assert.ok(longEmail.length > 160);
assert.equal(normalizeEmail(longEmail), longEmail, "overlong emails must not truncate to a second identity");
assert.equal(validateEmailRequest(normalizeEmail(longEmail)), false);

let invalidDbReads = 0;
let accidentalSends = 0;
const enabledButNoIOEnv = {
  DB: { prepare: () => { invalidDbReads++; throw new Error("invalid body touched DB"); } },
  HERMES_EMAIL_MAGIC_ENABLED: "true",
  HERMES_AUTH_TRANSACTIONAL_EMAIL_APPROVED: "true",
  HERMES_AUTH_EMAIL_DELIVERY_READY: "true",
  HERMES_EMAIL_RATE_SALT: "synthetic-rate-salt-for-tests-only",
  LEAD_EMAIL_SERVICE: { fetch: async () => { accidentalSends++; throw new Error("invalid body sent email"); } },
  LEAD_SERVICE_TOKEN: "synthetic-no-send-test-token",
};
for (const endpoint of [
  { path: "/api/auth/email/start", handle: emailStart },
  { path: "/api/auth/email/verify", handle: emailVerify },
]) {
  for (const invalid of ["null", "[]", "12", '"text"']) {
    const request = new Request("https://hermeslogisticsus.com" + endpoint.path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://hermeslogisticsus.com" },
      body: invalid,
    });
    const result = await endpoint.handle({ request, env: enabledButNoIOEnv });
    assert.equal(result.status, 400, `${endpoint.path} must reject JSON ${invalid}`);
    assert.equal((await result.json()).error, "invalid_request");
  }
}
const tooLong = await emailStart({
  env: enabledButNoIOEnv,
  request: new Request("https://hermeslogisticsus.com/api/auth/email/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://hermeslogisticsus.com" },
    body: JSON.stringify({ email: longEmail }),
  }),
});
assert.equal(tooLong.status, 400);
assert.equal((await tooLong.json()).error, "invalid_email");
assert.equal(invalidDbReads, 0, "oversized and malformed payloads must not write/read DB");
assert.equal(accidentalSends, 0, "invalid payloads must never trigger email transport");

console.log("hermes-email-magic-contract: no-send-by-default, no-session-before-verified-email, rate limits, token consumption, safe UI PASS");
