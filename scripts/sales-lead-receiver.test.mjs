import assert from "node:assert/strict";
import { onRequest } from "../functions/api/logistics-lead.ts";
import leadEmailWorker from "../workers/lead-email/src/index.mjs";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const serviceToken = "test-service-token-with-sufficient-length";
const emailMessages = [];
const serviceCalls = [];
const workerEnv = {
  LEAD_SERVICE_TOKEN: serviceToken,
  SALES_DESTINATION: "officeus@hermeslogisticsus.com",
  SALES_SENDER: "website@hermeslogisticsus.com",
  EMAIL: {
    async send(message) {
      emailMessages.push(message);
      return { messageId: `message-${emailMessages.length}` };
    },
  },
};

const serviceBinding = (emailEnv = workerEnv) => ({
  async fetch(input, init) {
    const request = input instanceof Request ? input : new Request(input, init);
    const inspection = request.clone();
    serviceCalls.push({
      authorization: inspection.headers.get("Authorization"),
      payload: await inspection.json(),
    });
    return leadEmailWorker.fetch(request, emailEnv);
  },
});

const limits = new MemoryKv();
const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: serviceToken,
  LEAD_LIMITS: limits,
  LEAD_EMAIL_SERVICE: serviceBinding(),
};

const validPayload = {
  request_id: "release_test_12345",
  lead_type: "posted_load",
  sales_tag: "POSTED LOAD / DEALER",
  email_subject: "Ignored visitor-provided subject",
  email_body: [
    "Hermes Load Board — Posted Load Sales Lead Preview",
    "Sales tag: POSTED LOAD / DEALER",
    "Contact: Test Dealer",
    "Email: dealer@example.com",
    "Phone: +1 (312) 555-0182",
    "Route: Madison, WI -> Chicago, IL",
    "Delivery: preview only — no automatic email was sent.",
  ].join("\n"),
  page_path: "/load-board/",
  submitted_at: "2026-07-28T22:00:00.000Z",
};

const leadRequest = (payload = validPayload, headers = {}) => new Request("https://hermeslogisticsus.com/api/logistics-lead", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": String(payload.request_id ?? ""),
    "Origin": "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.10",
    ...headers,
  },
  body: JSON.stringify(payload),
});

const accepted = await onRequest({ request: leadRequest(), env });
assert.equal(accepted.status, 200);
assert.deepEqual(await accepted.json(), { success: true, request_id: "release_test_12345" });
assert.equal(serviceCalls.length, 1);
assert.equal(serviceCalls[0].authorization, `Bearer ${serviceToken}`);
assert.equal(serviceCalls[0].payload.subject, "[HERMES SALES] [POSTED LOAD] [DEALER]");
assert.equal(serviceCalls[0].payload.reply_to, "dealer@example.com");
assert.equal(emailMessages.length, 1);
assert.equal(emailMessages[0].to, "officeus@hermeslogisticsus.com");
assert.equal(emailMessages[0].from, "website@hermeslogisticsus.com");
assert.equal(emailMessages[0].subject, "[HERMES SALES] [POSTED LOAD] [DEALER]");
assert.equal(emailMessages[0].replyTo, "dealer@example.com");
assert.match(emailMessages[0].text, /Delivery: securely received by the Hermes Logistics Sales website endpoint\./);
assert.doesNotMatch(emailMessages[0].text, /Delivery: preview only/i);

const duplicate = await onRequest({ request: leadRequest(), env });
assert.equal(duplicate.status, 200);
assert.equal(emailMessages.length, 1);
assert.equal(serviceCalls.length, 1);
assert.equal((await duplicate.json()).duplicate, true);

const foreignOrigin = await onRequest({
  request: leadRequest({ ...validPayload, request_id: "foreign_test_12345" }, { Origin: "https://attacker.example" }),
  env,
});
assert.equal(foreignOrigin.status, 403);

const forgedTag = await onRequest({
  request: leadRequest({ ...validPayload, request_id: "forged_test_12345", sales_tag: "SEND ANYTHING" }),
  env,
});
assert.equal(forgedTag.status, 400);

const missingBindings = await onRequest({
  request: leadRequest({ ...validPayload, request_id: "binding_test_12345" }),
  env: { ALLOWED_ORIGIN: "https://hermeslogisticsus.com", LEAD_DELIVERY_MODE: "live" },
});
assert.equal(missingBindings.status, 503);
assert.deepEqual(await missingBindings.json(), { success: false, error: "delivery_not_configured" });

const deliveryDisabled = await onRequest({
  request: leadRequest({ ...validPayload, request_id: "disabled_test_12345" }),
  env: { ...env, LEAD_DELIVERY_MODE: "preview" },
});
assert.equal(deliveryDisabled.status, 503);
assert.deepEqual(await deliveryDisabled.json(), { success: false, error: "delivery_not_configured" });

const unauthorizedWorker = await leadEmailWorker.fetch(
  new Request("https://lead-email.internal/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer wrong-token" },
    body: JSON.stringify(serviceCalls[0].payload),
  }),
  workerEnv,
);
assert.equal(unauthorizedWorker.status, 401);
assert.deepEqual(await unauthorizedWorker.json(), { ok: false, error: "unauthorized" });

const throttledWorkerEnv = {
  ...workerEnv,
  EMAIL: {
    async send() {
      const error = new Error("Provider daily quota exceeded for submitted address dealer@example.com");
      error.status = 429;
      throw error;
    },
  },
};
const throttledEnv = {
  ...env,
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: serviceBinding(throttledWorkerEnv),
};
const throttledPayload = { ...validPayload, request_id: "throttle_test_12345" };
const throttled = await onRequest({
  request: leadRequest(throttledPayload, { "CF-Connecting-IP": "198.51.100.20" }),
  env: throttledEnv,
});
assert.equal(throttled.status, 503);
const throttledBody = JSON.stringify(await throttled.json());
assert.equal(throttledBody, JSON.stringify({ success: false, error: "delivery_temporarily_unavailable" }));
assert.doesNotMatch(throttledBody, /dealer@example\.com|312|quota|provider_throttled|198\.51\.100\.20/i);

for (const key of limits.values.keys()) {
  assert.doesNotMatch(key, /192\.0\.2\.10|release_test_12345/);
}

console.log("Sales lead receiver and private Email Worker checks passed.");
