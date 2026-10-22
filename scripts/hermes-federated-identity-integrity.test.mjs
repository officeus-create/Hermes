import assert from "node:assert/strict";
import { completeFederatedLogin } from "../functions/api/_lib/federated-login.mjs";

// Synthetic identities only. A malformed provider claim must fail BEFORE
// touching real specialist/identity/session DB or creating any account.
let dbCalls = 0;
const db = {
  prepare() {
    dbCalls++;
    throw new Error("Invalid provider claims must not touch D1");
  },
};
const request = new Request("https://hermeslogisticsus.com/api/auth/apple/callback");
const base = {
  db, request, provider: "apple",
  subject: "opaque-apple-subject-1",
  email: "example.user@company.test",
};
const invalidClaims = [
  ["truncated subject collides with existing identity", { subject: "A".repeat(181) }],
  ["empty subject", { subject: "" }],
  ["subject with hidden tab", { subject: "actor\tident" }],
  ["subject with newline", { subject: "actor\nident" }],
  ["subject with whitespace", { subject: "actor ident" }],
  ["subject with control", { subject: "actor\u0001ident" }],
  ["subject with angle bracket", { subject: "actor<ident" }],
  ["verified email would truncate into existing account", { email: "a".repeat(155) + "@company.test" }],
  ["verified email is not silently trimmed", { email: " example.user@company.test " }],
  ["verified email contains control", { email: "example.user\u0001@company.test" }],
  ["verified email contains angle bracket", { email: "example<bad>@company.test" }],
  ["unverified empty email", { email: "" }],
  ["non-string subject", { subject: 123 }],
  ["non-string email", { email: { address: "example.user@company.test" } }],
  ["provider disallowed", { provider: "custom" }],
];
for (const [name, override] of invalidClaims) {
  const result = await completeFederatedLogin({ ...base, ...override });
  assert.deepEqual(result, { success: false, error: "provider_identity_invalid", status: 401 }, name);
}
assert.equal(dbCalls, 0, "invalid stable subjects and emails cannot query or mutate D1");
console.log("HERMES_FEDERATED_IDENTITY_INTEGRITY=PASS: no provider subject/email truncation, whitespace alias, or DB side effects");
