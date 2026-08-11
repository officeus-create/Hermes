import assert from "node:assert/strict";
import { onRequest } from "../functions/api/business-lead.ts";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const serviceCalls = [];
const serviceToken = "test-service-token-with-sufficient-length";
const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: serviceToken,
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: {
    async fetch(input, init) {
      const request = input instanceof Request ? input : new Request(input, init);
      serviceCalls.push({
        authorization: request.headers.get("Authorization"),
        payload: await request.json(),
      });
      return Response.json({ ok: true }, { status: 202 });
    },
  },
};

const validPayload = {
  request_id: "business_lead_test_12345",
  submitted_at: "2026-08-11T12:55:00.000Z",
  source_path: "/paths/marketing/",
  interest: "ProgressoPro",
  name: "Test Business Owner",
  email: "owner@example.com",
  company: "Example Studio",
  city_country: "Warsaw, Poland",
  whatsapp: "+48 555 123 456",
  telegram: "@exampleowner",
  website_or_social: "https://instagram.com/example",
  preferred_language: "Russian",
  preferred_contact_time: "10:00-13:00 Warsaw time",
  services: ["Website development", "SEO", "Google Ads"],
  message: "We want to launch a new site and start getting qualified leads.",
  consent: true,
  attribution: {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "warsaw_ru_site",
    utm_term: "создание сайта варшава",
    gclid: "test-gclid-123",
    referrer: "https://www.google.com/",
  },
};

const makeRequest = (payload = validPayload, headers = {}) => new Request("https://hermeslogisticsus.com/api/business-lead", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": String(payload.request_id ?? ""),
    "Origin": "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.50",
    ...headers,
  },
  body: JSON.stringify(payload),
});

const accepted = await onRequest({ request: makeRequest(), env });
assert.equal(accepted.status, 200);
assert.deepEqual(await accepted.json(), { success: true, request_id: "business_lead_test_12345" });
assert.equal(serviceCalls.length, 1);
assert.equal(serviceCalls[0].authorization, `Bearer ${serviceToken}`);
assert.equal(serviceCalls[0].payload.subject, "[HERMES INQUIRY] [MARKETING]");
assert.equal(serviceCalls[0].payload.reply_to, "owner@example.com");
assert.match(serviceCalls[0].payload.text, /Company \/ project: Example Studio/);
assert.match(serviceCalls[0].payload.text, /WhatsApp: \+48 555 123 456/);
assert.match(serviceCalls[0].payload.text, /Telegram: @exampleowner/);
assert.match(serviceCalls[0].payload.text, /Services: Website development, SEO, Google Ads/);
assert.match(serviceCalls[0].payload.text, /UTM source: google/);
assert.match(serviceCalls[0].payload.text, /UTM term: создание сайта варшава/);
assert.match(serviceCalls[0].payload.text, /GCLID: test-gclid-123/);

const duplicate = await onRequest({ request: makeRequest(), env });
assert.equal(duplicate.status, 200);
assert.equal((await duplicate.json()).duplicate, true);
assert.equal(serviceCalls.length, 1);

const telegramOnlyPayload = {
  ...validPayload,
  request_id: "business_lead_tg_12345",
  whatsapp: "",
  telegram: "@telegramonly",
  interest: "IT Development",
  source_path: "/paths/technology/",
  services: ["CRM & business automation", "AI bots / AI sales assistant"],
};
const telegramOnly = await onRequest({
  request: makeRequest(telegramOnlyPayload, { "CF-Connecting-IP": "192.0.2.51" }),
  env,
});
assert.equal(telegramOnly.status, 200);
assert.equal(serviceCalls.at(-1).payload.subject, "[HERMES INQUIRY] [IT DEVELOPMENT]");
assert.match(serviceCalls.at(-1).payload.text, /Telegram: @telegramonly/);

const noMessenger = await onRequest({
  request: makeRequest({ ...validPayload, request_id: "business_no_msg_12345", whatsapp: "", telegram: "" }, { "CF-Connecting-IP": "192.0.2.52" }),
  env,
});
assert.equal(noMessenger.status, 400);

const noServices = await onRequest({
  request: makeRequest({ ...validPayload, request_id: "business_no_srv_12345", services: [] }, { "CF-Connecting-IP": "192.0.2.53" }),
  env,
});
assert.equal(noServices.status, 400);

const unsupportedService = await onRequest({
  request: makeRequest({ ...validPayload, request_id: "business_bad_srv_12345", services: ["Send money now"] }, { "CF-Connecting-IP": "192.0.2.54" }),
  env,
});
assert.equal(unsupportedService.status, 400);

const noConsent = await onRequest({
  request: makeRequest({ ...validPayload, request_id: "business_consent_12345", consent: false }, { "CF-Connecting-IP": "192.0.2.55" }),
  env,
});
assert.equal(noConsent.status, 400);

const foreignOrigin = await onRequest({
  request: makeRequest({ ...validPayload, request_id: "business_origin_12345" }, { Origin: "https://attacker.example", "CF-Connecting-IP": "192.0.2.56" }),
  env,
});
assert.equal(foreignOrigin.status, 403);

console.log("Business lead receiver checks passed.");
