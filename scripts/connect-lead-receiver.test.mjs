import assert from "node:assert/strict";
import { onRequest } from "../functions/api/connect-lead.ts";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const calls = [];
const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: "connect-test-token-with-sufficient-length",
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: {
    async fetch(input, init) {
      const request = input instanceof Request ? input : new Request(input, init);
      calls.push({
        authorization: request.headers.get("Authorization"),
        payload: await request.json(),
      });
      return Response.json({ ok: true, message_id: "connect-test-message" });
    },
  },
};

const payload = {
  request_id: "connect_web_access_12345",
  submitted_at: "2026-08-05T00:30:00.000Z",
  source_path: "/hermes-connect/web-access/",
  name: "Test Connect Applicant",
  email: "connect-applicant@example.com",
  interest: "IT Development",
  message: [
    "Hermes Connect web-access request",
    "Category: Beauty & wellness",
    "Requested product: Hermes Connect Web App",
    "Role: Owner",
    "Must-have workflow: clients choose a service and request an available time",
  ].join("\n"),
  consent: true,
  direction_fields: {
    direction: "IT Development",
    fields: {
      system_or_workflow_needed: "Hermes Connect Web App · Beauty & wellness",
      current_tools: "Instagram / social messages",
      number_of_users: "2–5 people",
      integrations_needed: "Web app; service and availability request",
      timeline: "Controlled web access",
    },
  },
  public_dimensions: {
    category_id: "beauty-wellness",
    platform_id: "web",
  },
};

const request = (origin, method = "POST") => new Request("https://hermeslogisticsus.com/api/connect-lead", {
  method,
  headers: {
    Origin: origin,
    ...(method === "POST" ? {
      "Content-Type": "application/json",
      "Idempotency-Key": payload.request_id,
      "CF-Connecting-IP": "192.0.2.77",
    } : {}),
  },
  ...(method === "POST" ? { body: JSON.stringify(payload) } : {}),
});

const preflight = await onRequest({ request: request("https://connect.hermeslogisticsus.com", "OPTIONS"), env });
assert.equal(preflight.status, 204);
assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), "https://connect.hermeslogisticsus.com");

const accepted = await onRequest({ request: request("https://connect.hermeslogisticsus.com"), env });
assert.equal(accepted.status, 200);
assert.deepEqual(await accepted.json(), { success: true, request_id: payload.request_id });
assert.equal(accepted.headers.get("Access-Control-Allow-Origin"), "https://connect.hermeslogisticsus.com");
assert.equal(calls.length, 1);
assert.equal(calls[0].authorization, "Bearer connect-test-token-with-sufficient-length");
assert.equal(calls[0].payload.subject, "[HERMES INQUIRY] [IT DEVELOPMENT]");
assert.match(calls[0].payload.text, /Hermes Connect web-access request/);
assert.match(calls[0].payload.text, /System\/workflow needed: Hermes Connect Web App · Beauty & wellness/);
assert.doesNotMatch(calls[0].payload.text, /iPhone|Android|Download waitlist/);

const foreign = await onRequest({ request: request("https://attacker.example"), env });
assert.equal(foreign.status, 403);
assert.deepEqual(await foreign.json(), { success: false, error: "origin_not_allowed" });
assert.equal(calls.length, 1, "Rejected origins must never reach the private delivery service.");

console.log("Hermes Connect exact-origin Web App receiver checks passed.");
