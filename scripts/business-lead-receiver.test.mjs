import assert from "node:assert/strict";
import { MemoryD1 } from "./helpers/catalog-memory-d1.mjs";
import {recipientFingerprint} from "../functions/api/_lib/catalog-inquiry-receipts.mjs";
import { onRequest } from "../functions/api/business-lead.ts";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const serviceCalls = [];
const db = new MemoryD1();
const serviceToken = "test-service-token-with-sufficient-length";
const env = {
  DB: db,
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: serviceToken,
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: {
    async fetch(input, init) {
      const request = input instanceof Request ? input : new Request(input, init);
      serviceCalls.push({
        url: request.url,
        authorization: request.headers.get("Authorization"),
        payload: await request.json(),
      });
      const payload=serviceCalls.at(-1).payload;
      if(payload.delivery_key)return Response.json({ok:true,request_id:payload.request_id,delivery_key:payload.delivery_key,delivery_status:"accepted",recipient_fingerprint:await recipientFingerprint(payload.delivery_key,payload.recipient_identity||"",payload.recipient_email||"internal@example.com"),provider_message_id:"mock-message"},{status:202});
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
  planning_budget: "$3,000–$10,000",
  planning_horizon: "6 months",
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
assert.match(serviceCalls[0].payload.text, /Planning budget: \$3,000–\$10,000/);
assert.match(serviceCalls[0].payload.text, /Roadmap horizon: 6 months/);
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

const backwardCompatiblePayload = {
  ...validPayload,
  request_id: "business_old_client_12345",
};
delete backwardCompatiblePayload.planning_budget;
delete backwardCompatiblePayload.planning_horizon;
const backwardCompatible = await onRequest({
  request: makeRequest(backwardCompatiblePayload, { "CF-Connecting-IP": "192.0.2.57" }),
  env,
});
assert.equal(backwardCompatible.status, 200);
assert.match(serviceCalls.at(-1).payload.text, /Planning budget: not provided/);
assert.match(serviceCalls.at(-1).payload.text, /Roadmap horizon: not provided/);

const invalidBudget = await onRequest({
  request: makeRequest({ ...validPayload, request_id: "business_bad_budget_12345", planning_budget: "Spend everything" }, { "CF-Connecting-IP": "192.0.2.58" }),
  env,
});
assert.equal(invalidBudget.status, 400);

const invalidHorizon = await onRequest({
  request: makeRequest({ ...validPayload, request_id: "business_bad_horizon_12345", planning_horizon: "tomorrow" }, { "CF-Connecting-IP": "192.0.2.59" }),
  env,
});
assert.equal(invalidHorizon.status, 400);

const catalogRequestPayload = {
  ...validPayload,
  request_id: "catalog_business_req_12345",
  interest: "Hermes Catalog",
  company: "Chayka Store",
  city_country: "Chaiky, Kyiv region, Ukraine",
  phone: "+380 67 555 0101",
  whatsapp: "",
  telegram: "",
  services: ["Catalog business request"],
  catalog_business_id: "catalog-ua-chayka-store",
  catalog_profile: "/businesses/ukraine/chaiky/chayka-store/",
  catalog_source_ref: "CLIENT-SUPPLIED-CHAYKA-STORE-20260924",
  attribution: {
    utm_source: "hermes_catalog",
    utm_medium: "organic",
    utm_campaign: "catalog-business-request",
    utm_content: "website-concept",
    referrer: "https://www.google.com/",
  },
};
const catalogRequest = await onRequest({
  request: makeRequest(catalogRequestPayload, { "CF-Connecting-IP": "192.0.2.60" }),
  env,
});
assert.equal(catalogRequest.status, 200);
assert.equal(serviceCalls.at(-1).payload.subject, "[HERMES INQUIRY] [CATALOG]");
assert.match(serviceCalls.at(-1).payload.text, /Catalog business ID: catalog-ua-chayka-store/);
assert.match(serviceCalls.at(-1).payload.text, /Catalog profile: \/businesses\/ukraine\/chaiky\/chayka-store\//);
assert.match(serviceCalls.at(-1).payload.text, /Catalog source ref: CLIENT-SUPPLIED-CHAYKA-STORE-20260924/);
assert.match(serviceCalls.at(-1).payload.text, /UTM content: website-concept/);
const catalogRequestBody = await catalogRequest.clone().json().catch(() => null);
void catalogRequestBody;
const genericInquiry = await db.prepare(
  "SELECT owner_specialist_id, internal_delivery_status, contact_phone FROM catalog_business_inquiries WHERE request_id = ?"
).bind("catalog_business_req_12345").first();
assert.equal(genericInquiry.owner_specialist_id, null);
assert.equal(genericInquiry.internal_delivery_status, "delivered");
assert.equal(genericInquiry.contact_phone, "+380 67 555 0101");

await db.prepare(`
  INSERT INTO repair_shops
    (id, owner_specialist_id, name, slug, phone, city, state, timezone, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).bind(
  "shop-smart-bubble",
  "owner-smart-bubble",
  "Smart Bubble Mobile Auto/Body Repair Shop",
  "smart-bubble-mobile-auto-body-repair",
  "(833) 501-7771",
  "Little Rock",
  "AR",
  "America/Chicago",
  "2026-09-28T00:00:00.000Z",
  "2026-09-28T00:00:00.000Z",
).run();

const matchedCatalogPayload = {
  ...catalogRequestPayload,
  request_id: "catalog_smart_bubble_12345",
  company: "Smart Bubble Mobile Auto/Body Repair Shop",
  city_country: "Little Rock, AR, US",
  phone: "+1 833 501 7771",
  catalog_business_id: "repair-shop:arkansas/little-rock/smart-bubble-mobile-auto-body-repair",
  catalog_profile: "/businesses/arkansas/little-rock/smart-bubble-mobile-auto-body-repair/",
  catalog_source_ref: "PUBLIC-WEB-SMART-BUBBLE-LITTLE-ROCK-20260928",
  message: "I need an estimate and would like the repair shop to contact me about service.",
};
const serviceCallsBeforeMatched = serviceCalls.length;
const matchedCatalog = await onRequest({
  request: makeRequest(matchedCatalogPayload, { "CF-Connecting-IP": "192.0.2.62" }),
  env,
});
assert.equal(matchedCatalog.status, 200);
const matchedBody = await matchedCatalog.json();
assert.equal(matchedBody.crm_saved, true);
assert.equal(matchedBody.crm_linked, true);
assert.equal(serviceCalls.length, serviceCallsBeforeMatched + 1);
const matchedInquiry = await db.prepare(`
  SELECT shop_id, owner_specialist_id, business_name, contact_phone, internal_delivery_status, owner_delivery_status
  FROM catalog_business_inquiries
  WHERE request_id = ?
`).bind("catalog_smart_bubble_12345").first();
assert.equal(matchedInquiry.shop_id, "shop-smart-bubble");
assert.equal(matchedInquiry.owner_specialist_id, "owner-smart-bubble");
assert.equal(matchedInquiry.business_name, "Smart Bubble Mobile Auto/Body Repair Shop");
assert.equal(matchedInquiry.contact_phone, "+1 833 501 7771");
assert.equal(matchedInquiry.internal_delivery_status, "delivered");
assert.equal(matchedInquiry.owner_delivery_status, "skipped", "Manager-prepared/unconfirmed accounts must not receive automatic Catalog mail.");

await db.prepare("CREATE TABLE specialists (id TEXT PRIMARY KEY, email TEXT NOT NULL, role TEXT NOT NULL)").run();
await db.prepare("INSERT INTO specialists (id,email,role) VALUES (?,?,?)")
  .bind("owner-smart-bubble", "verified-owner@example.com", "Shop Owner").run();
await db.prepare("UPDATE repair_shops SET catalog_email_notifications_opt_in=1, catalog_email_notifications_opt_in_at=? WHERE id=?")
  .bind("2026-09-29T00:00:00.000Z", "shop-smart-bubble").run();

const optedInPayload = { ...matchedCatalogPayload, request_id: "catalog_smart_owner_mail_12345" };
const callsBeforeOptedIn = serviceCalls.length;
const optedInResponse = await onRequest({
  request: makeRequest(optedInPayload, { "CF-Connecting-IP": "192.0.2.64" }),
  env,
});
assert.equal(optedInResponse.status, 200);
assert.equal(serviceCalls.length, callsBeforeOptedIn + 2, "Opted-in linked shops receive one internal Hermes delivery and one bounded owner copy.");
assert.equal(serviceCalls.at(-2).payload.subject, "[HERMES INQUIRY] [CATALOG]");
assert.equal(serviceCalls.at(-1).url, "https://lead-email.internal/v1/send-account");
assert.equal(serviceCalls.at(-1).payload.subject, "[HERMES CATALOG] [CUSTOMER INQUIRY]");
assert.equal(serviceCalls.at(-1).payload.recipient_email, "verified-owner@example.com");
assert.equal(serviceCalls.at(-1).payload.reply_to, undefined);
const optedInInquiry = await db.prepare(
  "SELECT internal_delivery_status, owner_delivery_status, owner_delivery_at FROM catalog_business_inquiries WHERE request_id=?"
).bind("catalog_smart_owner_mail_12345").first();
assert.equal(optedInInquiry.internal_delivery_status, "delivered");
assert.equal(optedInInquiry.owner_delivery_status, "delivered");
assert.ok(optedInInquiry.owner_delivery_at);
const callsAfterOptedIn = serviceCalls.length;

const matchedDuplicate = await onRequest({
  request: makeRequest(matchedCatalogPayload, { "CF-Connecting-IP": "192.0.2.62" }),
  env,
});
assert.equal(matchedDuplicate.status, 200);
assert.equal((await matchedDuplicate.json()).duplicate, true);
assert.equal(serviceCalls.length, callsAfterOptedIn);

const matchedConflict = await onRequest({
  request: makeRequest({ ...matchedCatalogPayload, message: "Changed payload under the same request id must be rejected." }, { "CF-Connecting-IP": "192.0.2.63" }),
  env,
});
assert.equal(matchedConflict.status, 409);
assert.equal(serviceCalls.length, callsAfterOptedIn);

const catalogRequestMissingTarget = await onRequest({
  request: makeRequest({
    ...catalogRequestPayload,
    request_id: "catalog_business_bad_12345",
    catalog_business_id: "",
  }, { "CF-Connecting-IP": "192.0.2.61" }),
  env,
});
assert.equal(catalogRequestMissingTarget.status, 400);

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
