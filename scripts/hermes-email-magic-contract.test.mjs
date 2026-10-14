import assert from "node:assert/strict";
import fs from "node:fs";
import { onRequestPost as emailStart, onRequestGet as emailStatus } from "../functions/api/auth/email/start.ts";
import { onRequestPost as emailVerify } from "../functions/api/auth/email/verify.ts";

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
console.log("hermes-email-magic-contract: no-send-by-default, no-session-before-verified-email, rate limits, token consumption, safe UI PASS");
