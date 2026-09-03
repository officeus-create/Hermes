import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [helper, api, register, profile, page] = await Promise.all([
  readFile(new URL("functions/api/_lib/registration-ops.mjs", root), "utf8"),
  readFile(new URL("functions/api/internal/registrations.ts", root), "utf8"),
  readFile(new URL("functions/api/auth/register.ts", root), "utf8"),
  readFile(new URL("functions/api/repair-shop/profile.ts", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/internal/registrations/index.astro", root), "utf8"),
]);

assert.match(helper, /CREATE TABLE IF NOT EXISTS hermes_registration_flags/);
assert.match(helper, /CREATE TABLE IF NOT EXISTS hermes_registration_alerts/);
assert.match(helper, /INSERT OR IGNORE INTO hermes_registration_alerts/);
assert.match(helper, /HERMES_CONNECT_TELEGRAM_BOT_TOKEN/);
assert.match(helper, /HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID/);
assert.match(helper, /HERMES_SYNTHETIC_ACCOUNT_EMAILS/);
assert.match(helper, /synthetic_excluded/);
assert.match(helper, /api\.telegram\.org\/bot\$\{botToken\}\/sendMessage/);
assert.doesNotMatch(helper, /\b\d{8,12}:[A-Za-z0-9_-]{20,}\b/, "Telegram token must never be hard-coded");
assert.doesNotMatch(helper, /officeus\+hc-owner-qa/i, "QA identity must stay out of public source");

assert.match(api, /requireInternalOwner/);
assert.match(api, /csrf_origin_mismatch/);
assert.match(api, /total_real/);
assert.match(api, /last_7d/);
assert.match(api, /last_30d/);
assert.match(api, /retry_registration_alert/);
assert.match(api, /set_synthetic/);
assert.match(api, /ensureRepairShopAccessSchema/);
assert.match(api, /rsa\.access_state/);
assert.match(api, /AS last_session_at/);
assert.match(api, /AS profile_complete/);
assert.doesNotMatch(api, /password_hash|password_salt/i, "Owner ledger must not expose password material");
assert.doesNotMatch(api, /SELECT\s+(?:se\.)?token\b/i, "Owner ledger may use session timestamps but must never select session tokens");

const specialistInsert = register.indexOf("INSERT INTO specialists");
const alertEnqueue = register.indexOf("enqueueRegistrationAlert");
assert.ok(specialistInsert >= 0 && alertEnqueue >= 0, "registration persistence and alert pipeline must both exist");
assert.ok(specialistInsert < register.lastIndexOf("processRegistrationOperations"), "registration alert must occur after account persistence");
assert.match(register, /registration_ops_failed/);
assert.doesNotMatch(register, /console\.error\([^\n]*(?:email|phone|name)/i, "registration failure logs must not expose PII");

assert.match(profile, /kind:\s*"profile"/);
assert.match(profile, /phoneBecameAvailable/);
assert.match(profile, /Boolean\(phone\)\s*&&\s*\(!existing\s*\|\|\s*!clean\(existing\.phone,\s*32\)\)/, "profile alert must wait until canonical phone first becomes available");
assert.match(page, /robots="noindex,nofollow"/);
assert.match(page, /\/api\/internal\/registrations/);
assert.match(page, /Users \/ Registrations/);
assert.match(page, /data-stat="total_real"/);
assert.match(page, /data-stat="unreviewed"/);
assert.match(page, /Profile \/ access/);
assert.match(page, /Last session/);
assert.match(page, /No phone yet/);

console.log("Hermes Connect registration operations contract: PASS");
