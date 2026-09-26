import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequest } from "../functions/api/logistics-lead.ts";

class MemoryKv {
  values = new Map();

  async get(key) {
    return this.values.get(key)?.value ?? null;
  }

  async put(key, value, options = {}) {
    this.values.set(key, { value, options });
  }
}

const serviceCalls = [];
const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: "contact-dedupe-test-token",
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: {
    async fetch(input, init) {
      const request = input instanceof Request ? input : new Request(input, init);
      serviceCalls.push(await request.json());
      return Response.json({ ok: true });
    },
  },
};

const contactPayload = {
  request_id: "academy_retry_0001",
  submitted_at: "2026-09-20T08:30:35.760Z",
  source_path: "/academy/apply/?program=us-logistics-operations",
  name: "Academy Applicant",
  email: "applicant@example.com",
  interest: "Hermes Business Academy",
  message: "I want to apply for the U.S. logistics operations program this month.",
  consent: true,
  direction_fields: {
    direction: "Hermes Business Academy",
    fields: {
      current_level: "Entry level",
      weekly_learning_availability: "20 hours",
      preferred_language: "English",
      desired_start_period: "This month",
    },
  },
};

const contactRequest = (payload) => new Request("https://hermeslogisticsus.com/api/logistics-lead", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": payload.request_id,
    "Origin": "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.26",
  },
  body: JSON.stringify(payload),
});

const first = await onRequest({ request: contactRequest(contactPayload), env });
assert.equal(first.status, 200);
assert.deepEqual(await first.json(), { success: true, request_id: "academy_retry_0001" });
assert.equal(serviceCalls.length, 1);
const contactFingerprints = [...env.LEAD_LIMITS.values.entries()]
  .filter(([key]) => key.startsWith("lead:contact:"));
assert.equal(contactFingerprints.length, 1);
assert.match(contactFingerprints[0][0], /^lead:contact:[a-f0-9]{64}$/);
assert.doesNotMatch(contactFingerprints[0][0], /applicant|example\.com/i);
assert.equal(contactFingerprints[0][1].options.expirationTtl, 10 * 60);

const semanticRetry = await onRequest({
  request: contactRequest({
    ...contactPayload,
    request_id: "academy_retry_0002",
    submitted_at: "2026-09-20T08:31:13.845Z",
  }),
  env,
});
assert.equal(semanticRetry.status, 200);
assert.deepEqual(await semanticRetry.json(), {
  success: true,
  duplicate: true,
  request_id: "academy_retry_0002",
});
assert.equal(serviceCalls.length, 1, "A fresh request ID must not redeliver identical contact content.");

const correctedRequest = await onRequest({
  request: contactRequest({
    ...contactPayload,
    request_id: "academy_retry_0003",
    submitted_at: "2026-09-20T08:31:45.000Z",
    message: "I want to apply for the U.S. logistics operations program next month.",
  }),
  env,
});
assert.equal(correctedRequest.status, 200);
assert.equal(serviceCalls.length, 2, "A materially changed inquiry must remain deliverable.");

const contactSource = await readFile(new URL("../src/components/ContactCTA.astro", import.meta.url), "utf8");
assert.match(contactSource, /let pendingLiveRequestId = "";/);
assert.match(contactSource, /pendingLiveRequestId = payload\.request_id;/);
assert.match(contactSource, /pendingLiveRequestId \? pendingLiveRequestId : undefined/);
assert.match(contactSource, /if \(!response\.ok\) throw new Error\("delivery_failed"\);\s*pendingLiveRequestId = "";/);

console.log("Contact delivery dedupe contract passed.");
