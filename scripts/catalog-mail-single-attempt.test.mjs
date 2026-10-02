import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import worker, { buildRawMime } from "../workers/lead-email/src/index.mjs";

const fingerprint = (key, identity, email) => createHash("sha256").update(`${key}:${identity}:${email}`).digest("hex");
const env = {
  LEAD_SERVICE_TOKEN: "synthetic-catalog-service-token",
  SALES_SENDER: "website@example.com",
  SALES_DESTINATION: " Internal@Example.com ",
  EMAIL_RETRY_DELAY_MS: "0",
};
const body = (key = "catalog:internal") => ({
  request_id: "catalog_synthetic_request_20260930",
  delivery_key: key,
  subject: key === "catalog:owner" ? "[HERMES CATALOG] [CUSTOMER INQUIRY]" : "[HERMES INQUIRY] [CATALOG]",
  text: "Synthetic Catalog inquiry for contract testing only. This message contains no customer data and exceeds the minimum worker body length.",
  ...(key === "catalog:owner" ? { recipient_email: " Owner@Example.com ", recipient_identity: "synthetic-owner-id" } : {}),
  expected_recipient_fingerprint: fingerprint(key, key === "catalog:owner" ? "synthetic-owner-id" : "", key === "catalog:owner" ? "owner@example.com" : "internal@example.com"),
});
const run = async (input, overrides = {}, path = input.delivery_key === "catalog:owner" ? "/v1/send-account" : "/v1/send", authorization = env.LEAD_SERVICE_TOKEN) => {
  const response = await worker.fetch(new Request(`https://synthetic.internal${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authorization}` },
    body: JSON.stringify(input),
  }), { ...env, ...overrides });
  return { status: response.status, receipt: await response.json() };
};

for (const key of ["catalog:internal", "catalog:owner"]) {
  for (const failure of [Object.assign(new Error("synthetic timeout"), { name: "TimeoutError" }), Object.assign(new Error("synthetic unavailable"), { status: 503 }), Object.assign(new Error("synthetic network"), { code: "ECONNRESET" }), Object.assign(new Error("unclassified"), { status: 429 })]) {
    let attempts = 0;
    const { status, receipt } = await run(body(key), { EMAIL: { async send() { attempts += 1; throw failure; } } });
    assert.equal(attempts, 1, `${key}: uncertainty must never trigger an automatic retry`);
    assert.equal(status, 503);
    assert.deepEqual(receipt, {
      ok: false, request_id: body(key).request_id, delivery_key: key,
      delivery_status: "uncertain", retryable: false,
      recipient_fingerprint: body(key).expected_recipient_fingerprint,
    });
  }
  let attempts = 0;
  const input = { ...body(key), request_id: "r".repeat(80) };
  const { status, receipt } = await run(input, { EMAIL: { async send(message) {
    attempts += 1;
    assert.equal(message.to, key === "catalog:owner" ? "owner@example.com" : "internal@example.com");
    return { messageId: "synthetic-provider-message-id" };
  } } });
  assert.equal(attempts, 1);
  assert.equal(status, 202);
  assert.deepEqual(receipt, {
    ok: true, request_id: input.request_id, delivery_key: key,
    delivery_status: "accepted", retryable: false,
    recipient_fingerprint: input.expected_recipient_fingerprint,
    provider_message_id: "synthetic-provider-message-id",
  });
  const mime = buildRawMime({ from: env.SALES_SENDER, to: "owner@example.com", subject: input.subject, text: input.text, attachments: [], requestId: input.request_id, deliveryKey: key });
  assert.ok(mime.includes(`Message-ID: <${input.request_id}.${key.replace(":", "-")}@hermeslogisticsus.com>`), "80-character IDs retain a distinct delivery suffix");

  for (const expected of [null, "0".repeat(64)]) {
    attempts = 0;
    const mismatch = await run({ ...body(key), expected_recipient_fingerprint: expected }, { EMAIL: { async send() { attempts += 1; } } });
    assert.equal(attempts, 0);
    assert.equal(mismatch.status, 409);
    assert.equal(mismatch.receipt.delivery_status, "failed");
    assert.equal(mismatch.receipt.retryable, false);
  }
  const missingConfig = await run(body(key), { EMAIL: undefined });
  assert.equal(missingConfig.receipt.delivery_status, "failed");
  assert.equal(missingConfig.receipt.retryable, true);
  const missingSender = await run(body(key), { SALES_SENDER: undefined, EMAIL: { async send() { assert.fail("missing sender must not send"); } } });
  assert.equal(missingSender.receipt.delivery_status, "failed");
  assert.equal(missingSender.receipt.retryable, true);

  attempts = 0;
  const rejected = await run(body(key), { EMAIL: { async send() {
    attempts += 1;
    throw Object.assign(new Error("explicit rejection"), { status: 429, code: "E_PROVIDER_RATE" });
  } } });
  assert.equal(attempts, 1);
  assert.equal(rejected.status, 429);
  assert.equal(rejected.receipt.delivery_status, "failed");
  assert.equal(rejected.receipt.retryable, true);
}

let initialAttempts = 0;
const initialInternal = await run({ ...body(), expected_recipient_fingerprint: undefined }, { EMAIL: { async send() {
  initialAttempts += 1;
  return { messageId: "synthetic-initial-internal-id" };
} } });
assert.equal(initialAttempts, 1);
assert.equal(initialInternal.status, 202);
assert.equal(initialInternal.receipt.delivery_status, "accepted");
assert.equal(initialInternal.receipt.recipient_fingerprint, body().expected_recipient_fingerprint);
assert.equal(initialInternal.receipt.provider_message_id, "synthetic-initial-internal-id");
for (const expected of [undefined, body().expected_recipient_fingerprint]) {
  const missingDestination = await run({ ...body(), expected_recipient_fingerprint: expected }, {
    SALES_DESTINATION: undefined,
    EMAIL: { async send() { assert.fail("missing destination must not send"); } },
  });
  assert.deepEqual(missingDestination, { status: 503, receipt: {
    ok: false, request_id: body().request_id, delivery_key: "catalog:internal",
    delivery_status: "failed", retryable: true, recipient_fingerprint: null,
    error: "service_not_configured",
  } });
}

let attempts = 0;
const transport = { async send() { attempts += 1; return { messageId: "synthetic-id" }; } };
for (const [input, path] of [
  [{ ...body(), delivery_key: "catalog:unsupported" }, "/v1/send"],
  [body(), "/v1/send-account"],
  [body("catalog:owner"), "/v1/send"],
  [{ ...body(), subject: "[HERMES INQUIRY] [GENERAL]" }, "/v1/send"],
  [{ ...body("catalog:owner"), subject: "[HERMES ACCOUNT] [PASSWORD RESET]" }, "/v1/send-account"],
  [body(), "/v1/send-contract"],
  [{ ...body(), request_id: "r".repeat(81) }, "/v1/send"],
]) {
  const result = await run(input, { EMAIL: transport }, path);
  assert.equal(result.status, 400);
}
assert.equal(attempts, 0, "invalid keys, paths, subjects and truncated IDs never reach the provider");
const unauthorized = await run(body(), { EMAIL: transport }, "/v1/send", "wrong-synthetic-token");
assert.equal(unauthorized.status, 401);
assert.equal(attempts, 0);
const internalIdentity = await run({ ...body(), recipient_identity: "ignored-internal-identity" }, { EMAIL: transport });
assert.equal(internalIdentity.receipt.recipient_fingerprint, body().expected_recipient_fingerprint);
const changedOwner = await run({ ...body("catalog:owner"), recipient_identity: "different-owner-id" }, { EMAIL: transport });
assert.equal(changedOwner.receipt.delivery_status, "failed");
assert.equal(attempts, 1);
const changedRecipient = await run(body(), { SALES_DESTINATION: "changed@example.com", EMAIL: transport });
assert.equal(changedRecipient.receipt.delivery_status, "failed");
assert.equal(changedRecipient.receipt.recipient_fingerprint, fingerprint("catalog:internal", "", "changed@example.com"));
assert.equal(attempts, 1);
const missingGmail = await run(body("catalog:owner"), { ACCOUNT_EMAIL_TRANSPORT: "gmail_api", EMAIL: undefined });
assert.equal(missingGmail.receipt.delivery_status, "failed");
assert.equal(missingGmail.receipt.retryable, true);

// Existing password-reset retry semantics and receipt shape remain intact.
attempts = 0;
const { delivery_key, expected_recipient_fingerprint, recipient_identity, ...passwordReset } = body("catalog:owner");
passwordReset.subject = "[HERMES ACCOUNT] [PASSWORD RESET]";
const legacy = await run(passwordReset, { EMAIL: { async send() {
  attempts += 1;
  if (attempts < 3) throw Object.assign(new Error("temporary failure"), { status: 503 });
  return { messageId: "legacy-id" };
} } }, "/v1/send-account");
assert.equal(attempts, 3);
assert.deepEqual(legacy, { status: 202, receipt: { ok: true, recipient_count: 1, attempts: 3 } });
attempts = 0;
const { delivery_key: internalKey, expected_recipient_fingerprint: internalExpected, ...legacyLead } = body();
legacyLead.subject = "[HERMES INQUIRY] [GENERAL]";
const ordinaryLead = await run(legacyLead, { EMAIL: transport });
assert.equal(attempts, 1);
assert.deepEqual(ordinaryLead, { status: 202, receipt: { ok: true, recipient_count: 1, owner_alert: "not_applicable" } });

// Gmail calls are completely synthetic; one token call and one send call only.
const originalFetch = globalThis.fetch;
try {
  for (const providerStatus of [200, 429, 503, "timeout"]) {
    const calls = [];
    globalThis.fetch = async (url, init) => {
      calls.push(url);
      if (url.includes("oauth2")) return Response.json({ access_token: "synthetic-access-token" });
      const mime = Buffer.from(JSON.parse(init.body).raw, "base64url").toString("utf8");
      assert.ok(mime.includes(`Message-ID: <${"r".repeat(80)}.catalog-owner@hermeslogisticsus.com>`));
      if (providerStatus === "timeout") throw new DOMException("synthetic timeout", "AbortError");
      return Response.json(providerStatus === 200 ? { id: "synthetic-gmail-id" } : {}, { status: providerStatus });
    };
    const gmail = await run({ ...body("catalog:owner"), request_id: "r".repeat(80) }, {
      ACCOUNT_EMAIL_TRANSPORT: "gmail_api", EMAIL: undefined,
      GMAIL_OAUTH_CLIENT_ID: "synthetic-client", GMAIL_OAUTH_CLIENT_SECRET: "synthetic-secret", GMAIL_OAUTH_REFRESH_TOKEN: "synthetic-refresh",
    });
    assert.equal(calls.length, 2);
    assert.equal(gmail.receipt.delivery_status, providerStatus === 200 ? "accepted" : providerStatus === 429 ? "failed" : "uncertain");
    assert.equal(gmail.receipt.retryable, providerStatus === 429);
    assert.equal(gmail.receipt.request_id, "r".repeat(80));
    assert.equal(gmail.receipt.delivery_key, "catalog:owner");
    assert.equal(gmail.receipt.recipient_fingerprint, body("catalog:owner").expected_recipient_fingerprint);
    if (providerStatus === 200) assert.equal(gmail.receipt.provider_message_id, "synthetic-gmail-id");
  }
} finally {
  globalThis.fetch = originalFetch;
}
console.log("Catalog single-attempt mail contract passed: correlated receipts, fingerprint guard, preserved 80-character IDs, no retries after uncertainty, and legacy account retries preserved.");
