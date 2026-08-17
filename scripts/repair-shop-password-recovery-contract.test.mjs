import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import worker from "../workers/lead-email/src/index.mjs";
import {
  PASSWORD_RESET_EMAIL_PATH,
  PASSWORD_RESET_SUBJECT,
  PASSWORD_RESET_TTL_MS,
  canonicalPasswordResetUrl,
  createPasswordResetToken,
  hashPasswordResetToken,
  normalizePasswordResetLocale,
  passwordResetExpiry,
} from "../functions/api/_lib/password-reset.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const forgotEndpoint = read("functions/api/auth/forgot-password.ts");
const resetEndpoint = read("functions/api/auth/reset-password.ts");
const helper = read("functions/api/_lib/password-reset.mjs");
const enhancer = read("src/components/RepairShopActivationEnhancer.astro");
const forgotPage = read("src/pages/services/hermes-connect/repair-shops/forgot-password.astro");
const resetPage = read("src/pages/services/hermes-connect/repair-shops/reset-password.astro");
const workerSource = read("workers/lead-email/src/index.mjs");
const workerProductionConfig = JSON.parse(read("workers/lead-email/wrangler.production.jsonc"));

assert.equal(PASSWORD_RESET_TTL_MS, 45 * 60 * 1000, "reset link TTL must stay 45 minutes");
assert.equal(PASSWORD_RESET_SUBJECT, "[HERMES ACCOUNT] [PASSWORD RESET]");
assert.equal(PASSWORD_RESET_EMAIL_PATH, "https://lead-email.internal/v1/send-account");
assert.equal(normalizePasswordResetLocale("RU"), "ru");
assert.equal(normalizePasswordResetLocale("de"), "en");

const rawToken = createPasswordResetToken();
assert.match(rawToken, /^[a-f0-9]{64}$/);
const tokenHash = await hashPasswordResetToken(rawToken);
assert.match(tokenHash, /^[a-f0-9]{64}$/);
assert.notEqual(tokenHash, rawToken, "raw reset token must never be stored as its own hash");
const expiryDelta = new Date(passwordResetExpiry(new Date("2026-08-17T10:00:00Z"))).getTime() - new Date("2026-08-17T10:00:00Z").getTime();
assert.equal(expiryDelta, PASSWORD_RESET_TTL_MS);
assert.match(canonicalPasswordResetUrl(rawToken, "ru"), /reset-password\/\?token=[a-f0-9]{64}&lang=ru$/);

assert.match(helper, /token_hash TEXT PRIMARY KEY/);
assert.doesNotMatch(helper, /\n\s*token TEXT/);
assert.match(forgotEndpoint, /role !== "Shop Owner"/);
assert.match(forgotEndpoint, /return jsonResponse\(200, acknowledgement\)/);
assert.match(forgotEndpoint, /SELECT COUNT\(\*\) AS count FROM password_reset_tokens WHERE specialist_id = \? AND created_at >= \?/);
assert.match(forgotEndpoint, /if \(Number\(recent\?\.count \?\? 0\) >= 3\)/);
assert.match(forgotEndpoint, /UPDATE password_reset_tokens SET used_at = \? WHERE specialist_id = \? AND used_at IS NULL/);
assert.match(forgotEndpoint, /created_at < \? AND \(expires_at <= \? OR used_at IS NOT NULL\)/);
assert.match(forgotEndpoint, /PASSWORD_RESET_EMAIL_PATH/);
assert.match(resetEndpoint, /DELETE FROM sessions WHERE specialist_id = \?/);
assert.match(resetEndpoint, /UPDATE password_reset_tokens SET used_at/);
assert.match(resetEndpoint, /sessionCookieHeader\("", \{ clear: true \}\)/);

for (const marker of ["Forgot password?", "Забыли пароль?", "Забули пароль?", "¿Olvidaste tu contraseña?", "Password dimenticata?", "Mot de passe oublié ?"]) {
  assert.ok(enhancer.includes(marker), `missing localized auth recovery entry: ${marker}`);
}
for (const page of [forgotPage, resetPage]) {
  for (const locale of ["en", "ru", "uk", "es", "it", "fr"]) assert.ok(page.includes(` ${locale}:`) || page.includes(`${locale}:`), `missing ${locale} recovery copy`);
  assert.match(page, /robots="noindex,nofollow"/);
  assert.match(page, /@media\(max-width:520px\)/);
}

assert.match(workerSource, /"\/v1\/send-account"/);
assert.match(workerSource, /\[HERMES ACCOUNT\] \[PASSWORD RESET\]/);
assert.match(workerSource, /recipient_email/);
assert.match(workerSource, /isAccountSubject/);
const emailBinding = workerProductionConfig.send_email?.find((binding) => binding.name === "EMAIL");
assert.ok(emailBinding, "production Email Worker must keep EMAIL binding");
assert.equal("destination_address" in emailBinding, false, "account recovery requires a recipient-unlocked Email Service binding");
assert.deepEqual(emailBinding.allowed_sender_addresses, ["website@hermeslogisticsus.com"]);

let capturedMessage = null;
const env = {
  LEAD_SERVICE_TOKEN: "unit-secret-token",
  SALES_SENDER: "officeus@hermeslogisticsus.com",
  SALES_DESTINATION: "officeus@hermeslogisticsus.com",
  EMAIL: { send: async (message) => { capturedMessage = message; return { messageId: "unit-message" }; } },
};
const validRequest = new Request("https://lead-email.internal/v1/send-account", {
  method: "POST",
  headers: { Authorization: "Bearer unit-secret-token", "Content-Type": "application/json" },
  body: JSON.stringify({
    request_id: "password_reset_12345678",
    subject: PASSWORD_RESET_SUBJECT,
    text: "A password reset was requested for your Repair Shop owner account. Use the secure reset link below within 45 minutes. https://hermeslogisticsus.com/reset/example",
    recipient_email: "owner@example.com",
  }),
});
const validResponse = await worker.fetch(validRequest, env);
assert.equal(validResponse.status, 202);
assert.equal(capturedMessage?.to, "owner@example.com");
assert.equal(capturedMessage?.subject, PASSWORD_RESET_SUBJECT);

capturedMessage = null;
const genericAccountSubject = await worker.fetch(new Request("https://lead-email.internal/v1/send", {
  method: "POST",
  headers: { Authorization: "Bearer unit-secret-token", "Content-Type": "application/json" },
  body: JSON.stringify({
    request_id: "password_reset_87654321",
    subject: PASSWORD_RESET_SUBJECT,
    text: "A password reset message must not be accepted by the generic lead route because account delivery is intentionally bounded to a dedicated endpoint.",
  }),
}), env);
assert.equal(genericAccountSubject.status, 400, "generic lead route must reject password-reset subject");
assert.equal(capturedMessage, null);

const wrongAccountSubject = await worker.fetch(new Request("https://lead-email.internal/v1/send-account", {
  method: "POST",
  headers: { Authorization: "Bearer unit-secret-token", "Content-Type": "application/json" },
  body: JSON.stringify({
    request_id: "password_reset_abcdefgh",
    subject: "[HERMES INQUIRY] [GENERAL]",
    text: "This message is long enough to pass the text-length check but it must still be rejected by the bounded account delivery endpoint.",
    recipient_email: "owner@example.com",
  }),
}), env);
assert.equal(wrongAccountSubject.status, 400);

console.log("Repair Shop owner password recovery token, UI, session invalidation, request limiting, locale and bounded email contracts passed.");
