import assert from "node:assert/strict";
import { onRequest } from "../functions/api/logistics-lead.ts";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const emailMessages = [];
const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL: {
    async send(message) {
      emailMessages.push(message);
      return { messageId: `message-${emailMessages.length}` };
    },
  },
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
assert.equal(emailMessages.length, 1);
assert.equal(emailMessages[0].to, "officeus@hermeslogisticsus.com");
assert.equal(emailMessages[0].subject, "[HERMES SALES] [POSTED LOAD] [DEALER]");
assert.equal(emailMessages[0].replyTo, "dealer@example.com");
assert.match(emailMessages[0].text, /Delivery: securely received by the Hermes Logistics Sales website endpoint\./);
assert.doesNotMatch(emailMessages[0].text, /Delivery: preview only/i);

const duplicate = await onRequest({ request: leadRequest(), env });
assert.equal(duplicate.status, 200);
assert.equal(emailMessages.length, 1);
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
  env: { ALLOWED_ORIGIN: "https://hermeslogisticsus.com" },
});
assert.equal(missingBindings.status, 503);

console.log("Sales lead receiver checks passed.");
