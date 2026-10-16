import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { onRequest } from "../functions/api/logistics-lead.ts";
import { onRequestGet as readOwnerCarrierIntake, onRequestDelete as purgeExpiredCarrierIntake, onRequestPatch as reviewOwnerCarrierIntake } from "../functions/api/internal/carrier-intake.ts";
import leadEmailWorker, { CarHaulingDeliveryCoordinatorCore, isCarHaulingTelegramWorkHours, sendCarHaulingSalesTelegram } from "../workers/lead-email/src/index.mjs";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

class MemoryDurableStorage {
  values = new Map();
  alarmTime = null;

  async get(key) {
    const value = this.values.get(key);
    return value === undefined ? undefined : structuredClone(value);
  }

  async put(key, value) {
    this.values.set(key, structuredClone(value));
  }

  async delete(key) {
    return this.values.delete(key);
  }

  async setAlarm(timestamp) {
    this.alarmTime = Number(timestamp);
  }

  async transaction(callback) {
    return callback(this);
  }
}

const serviceToken = "test-service-token-with-sufficient-length";
const emailMessages = [];
const serviceCalls = [];
const telegramMessages = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (url.startsWith("https://api.telegram.org/bot")) {
    telegramMessages.push(JSON.parse(String(init?.body || "{}")));
    return Response.json({ ok: true, result: { message_id: 1296 } }, { status: 200 });
  }
  return originalFetch(input, init);
};

const workerEnv = {
  LEAD_SERVICE_TOKEN: serviceToken,
  SALES_DESTINATION: "officeus@hermeslogisticsus.com",
  SALES_SENDER: "website@hermeslogisticsus.com",
  CAR_HAULING_TELEGRAM_BOT_TOKEN: "test-sales-bot-token",
  CAR_HAULING_TELEGRAM_SALES_CHAT_ID: "-1001296000000",
  CAR_HAULING_INTERNAL_RECIPIENTS: "dispatchtruck107@gmail.com,dispatchtruck998@gmail.com,volkogon.v@gmail.com",
  EMAIL: {
    async send(message) {
      emailMessages.push(message);
      return { messageId: `message-${emailMessages.length}` };
    },
  },
};

assert.equal(isCarHaulingTelegramWorkHours(new Date("2026-09-15T14:00:00.000Z")), true, "Weekday 09:00 CT must allow Sales-group delivery.");
assert.equal(isCarHaulingTelegramWorkHours(new Date("2026-09-15T22:45:00.000Z")), true, "Weekday 17:45 CT must allow Sales-group delivery.");
assert.equal(isCarHaulingTelegramWorkHours(new Date("2026-09-15T22:46:00.000Z")), false, "Weekday 17:46 CT must block Sales-group delivery.");
assert.equal(isCarHaulingTelegramWorkHours(new Date("2026-09-20T16:00:00.000Z")), false, "Weekend delivery must remain blocked.");

const quietHoursTelegramCount = telegramMessages.length;
const quietHoursResult = await sendCarHaulingSalesTelegram(
  workerEnv,
  "Page: /logistics/start-car-hauling-dispatch/\nReal carrier review payload with enough safe test content for routing.",
  "carrier_quiet_1296_12345",
  new Date("2026-09-15T22:46:00.000Z"),
);
assert.deepEqual(quietHoursResult, { ok: false, status: "outside_working_hours" });
assert.equal(telegramMessages.length, quietHoursTelegramCount, "Quiet-hours guard must run immediately before sendMessage.");

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

const catalogEmailCountBefore = emailMessages.length;
const catalogWorkerResponse = await leadEmailWorker.fetch(new Request("https://lead-email.internal/v1/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    request_id: "catalog_mail_1296_12345",
    subject: "[HERMES INQUIRY] [CATALOG]",
    text: "Hermes Catalog inquiry transport regression check. This bounded synthetic message verifies the approved Catalog subject reaches the existing internal destination without widening recipient control.",
    reply_to: "visitor@example.com",
  }),
}), workerEnv);
assert.equal(catalogWorkerResponse.status, 202);
assert.equal(emailMessages.length, catalogEmailCountBefore + 1);
assert.equal(emailMessages.at(-1).subject, "!!! LEAD !!! [HERMES INQUIRY] [CATALOG] [ID:catalog_mail_1296_12345]");
assert.equal(emailMessages.at(-1).to, "officeus@hermeslogisticsus.com");
emailMessages.length = catalogEmailCountBefore;

const ownerCatalogEmailCountBefore = emailMessages.length;
const ownerCatalogWorkerResponse = await leadEmailWorker.fetch(new Request("https://lead-email.internal/v1/send-account", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    request_id: "catalog_owner_1296_12345",
    subject: "[HERMES CATALOG] [CUSTOMER INQUIRY]",
    recipient_email: "verified-shop-owner@example.com",
    text: "A verified, opted-in Hermes Connect shop owner receives this bounded Catalog inquiry notification from the authenticated internal account-mail path only.",
  }),
}), workerEnv);
assert.equal(ownerCatalogWorkerResponse.status, 202);
assert.equal(emailMessages.length, ownerCatalogEmailCountBefore + 1);
assert.equal(emailMessages.at(-1).to, "verified-shop-owner@example.com");
assert.equal(emailMessages.at(-1).subject, "[HERMES CATALOG] [CUSTOMER INQUIRY]");
emailMessages.length = ownerCatalogEmailCountBefore;

const ownerAlertBaseline = emailMessages.length;
const ownerAlertEnv = {
  ...workerEnv,
  OWNER_LEAD_ALERT_RECIPIENT: "volkogon.v@gmail.com",
};
const ownerLeadRequestId = "owner_lead_alert_20261001";
const ownerLeadResponse = await leadEmailWorker.fetch(new Request("https://lead-email.internal/v1/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    request_id: ownerLeadRequestId,
    subject: "[HERMES INQUIRY] [IT DEVELOPMENT]",
    text: [
      "Hermes Contact Request",
      "----------------------",
      "Direction: IT Development",
      "Name: Saad Saleem",
      "Email: saad@example.com",
      "Message:",
      "We need an AI-powered CRM and automation system for our business.",
      "",
      "Submitted from: /paths/technology/",
      "Server delivery record",
      `Request ID: ${ownerLeadRequestId}`,
    ].join("\n"),
    reply_to: "saad@example.com",
  }),
}), ownerAlertEnv);
assert.equal(ownerLeadResponse.status, 202);
assert.deepEqual(await ownerLeadResponse.json(), {
  ok: true,
  recipient_count: 2,
  owner_alert: "delivered",
  calendar_reminder: "attached",
});
assert.equal(emailMessages.length, ownerAlertBaseline + 2);
const ownerLeadPrimary = emailMessages.at(-2);
const ownerLeadPersonal = emailMessages.at(-1);
assert.equal(ownerLeadPrimary.to, "officeus@hermeslogisticsus.com");
assert.equal(ownerLeadPrimary.subject, `!!! LEAD !!! [HERMES INQUIRY] [IT DEVELOPMENT] [ID:${ownerLeadRequestId}]`);
assert.equal(ownerLeadPersonal.to, "volkogon.v@gmail.com");
assert.equal(ownerLeadPersonal.replyTo, "saad@example.com");
assert.equal(ownerLeadPersonal.subject, `!!! LEAD !!! IT Development - Saad Saleem [ID:${ownerLeadRequestId}]`);
assert.match(ownerLeadPersonal.text, /\n\s*LEAD\n/);
assert.equal(ownerLeadPersonal.attachments.length, 1);
assert.equal(ownerLeadPersonal.attachments[0].filename, `lead-${ownerLeadRequestId}.ics`);
assert.match(ownerLeadPersonal.attachments[0].type, /^text\/calendar/);
const ownerLeadCalendar = Buffer.from(ownerLeadPersonal.attachments[0].content, "base64").toString("utf8");
assert.doesNotMatch(ownerLeadCalendar, /(?:^|\r?\n)METHOD:/);
assert.match(ownerLeadCalendar, /SUMMARY:LEAD REMINDER - HERMES/);
assert.match(ownerLeadCalendar, /CLASS:PRIVATE/);
assert.match(ownerLeadCalendar, /TRANSP:TRANSPARENT/);
assert.doesNotMatch(ownerLeadCalendar, /METHOD:REQUEST|ATTENDEE|ORGANIZER|RSVP|TRANSP:OPAQUE|STATUS:CONFIRMED/);
assert.doesNotMatch(ownerLeadCalendar, /Saad Saleem|saad@example\.com/);
assert.doesNotMatch(ownerLeadPersonal.attachments[0].type, /(?:^|;)\s*method=/i);
assert.match(ownerLeadCalendar, /TRIGGER:-PT5M/);

const qaLeadCountBefore = emailMessages.length;
const qaLeadResponse = await leadEmailWorker.fetch(new Request("https://lead-email.internal/v1/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    request_id: "owner_qa_alert_20261001",
    subject: "[HERMES INQUIRY] [IT DEVELOPMENT]",
    text: [
      "Hermes Contact Request",
      "Direction: IT Development",
      "Name: Hermes Paid Plan Production Smoke",
      "Email: officeus@hermeslogisticsus.com",
      "SYNTHETIC QA — NOT A CUSTOMER / NOT A PAYMENT / DO NOT PROCESS",
    ].join("\n"),
    reply_to: "officeus@hermeslogisticsus.com",
  }),
}), ownerAlertEnv);
assert.equal(qaLeadResponse.status, 202);
assert.equal((await qaLeadResponse.json()).owner_alert, "not_applicable");
assert.equal(emailMessages.length, qaLeadCountBefore + 1);
assert.equal(emailMessages.at(-1).subject, "[HERMES INQUIRY] [IT DEVELOPMENT] [ID:owner_qa_alert_20261001]");

const academyAlertCountBefore = emailMessages.length;
const academyAlertResponse = await leadEmailWorker.fetch(new Request("https://lead-email.internal/v1/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    request_id: "academy_alert_test_20261001",
    subject: "[HERMES INQUIRY] [ACADEMY]",
    text: "Hermes Contact Request\nDirection: Hermes Business Academy\nName: Academy Candidate\nEmail: candidate@example.com\nI want to study logistics and build my career through the Academy program.",
    reply_to: "candidate@example.com",
  }),
}), ownerAlertEnv);
assert.equal(academyAlertResponse.status, 202);
assert.equal((await academyAlertResponse.json()).owner_alert, "not_applicable");
assert.equal(emailMessages.length, academyAlertCountBefore + 1);
assert.equal(emailMessages.at(-1).subject, "[HERMES INQUIRY] [ACADEMY] [ID:academy_alert_test_20261001]");
emailMessages.length = ownerAlertBaseline;

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
assert.equal(emailMessages[0].subject, "!!! LEAD !!! [HERMES SALES] [POSTED LOAD] [DEALER]");
assert.equal(emailMessages[0].replyTo, "dealer@example.com");
assert.match(emailMessages[0].text, /Delivery: securely received by the Hermes website endpoint\./);
assert.doesNotMatch(emailMessages[0].text, /Delivery: preview only/i);

const duplicate = await onRequest({ request: leadRequest(), env });
assert.equal(duplicate.status, 200);
assert.equal(emailMessages.length, 1);
assert.equal(serviceCalls.length, 1);
assert.equal((await duplicate.json()).duplicate, true);

const generalContactPayload = {
  request_id: "contact_test_12345",
  submitted_at: "2026-08-04T08:30:00.000Z",
  source_path: "/contacts/",
  name: "Test Website Lead",
  email: "lead@example.com",
  interest: "ProgressoPro",
  message: "We need an SEO and website conversion plan for qualified inquiries.",
  consent: true,
  direction_fields: {
    direction: "ProgressoPro",
    fields: {
      platforms: ["SEO / Google Search", "LinkedIn"],
      planning_horizon: "6 months",
      primary_goal: "Qualified inquiries",
      target_audience: "Independent auto dealers",
      monthly_budget_range: "$1,000-$2,000",
      unsupported_key: "must not be forwarded",
    },
  },
};

const generalAccepted = await onRequest({
  request: leadRequest(generalContactPayload, { "CF-Connecting-IP": "192.0.2.11" }),
  env,
});
assert.equal(generalAccepted.status, 200);
assert.deepEqual(await generalAccepted.json(), { success: true, request_id: "contact_test_12345" });
assert.equal(serviceCalls.length, 2);
assert.equal(serviceCalls[1].payload.subject, "[HERMES INQUIRY] [MARKETING]");
assert.equal(serviceCalls[1].payload.reply_to, "lead@example.com");
assert.equal(emailMessages.length, 2);
assert.equal(emailMessages[1].subject, "!!! LEAD !!! [HERMES INQUIRY] [MARKETING] [ID:contact_test_12345]");
assert.equal(emailMessages[1].replyTo, "lead@example.com");
assert.match(emailMessages[1].text, /Name: Test Website Lead/);
assert.match(emailMessages[1].text, /Platforms: SEO \/ Google Search, LinkedIn/);
assert.match(emailMessages[1].text, /Primary goal: Qualified inquiries/);
assert.doesNotMatch(emailMessages[1].text, /unsupported_key|must not be forwarded/);
assert.doesNotMatch(emailMessages[1].text, /Phone:/);

const longTechnologyMessage = `Technology project brief\n${"x".repeat(2_400)}\nEND OF TECHNOLOGY BRIEF`;
const technologyBriefResponse = await onRequest({
  request: leadRequest({
    ...generalContactPayload,
    request_id: "technology_brief_test_12345",
    source_path: "/paths/technology/",
    interest: "IT Development",
    message: longTechnologyMessage,
    direction_fields: {
      direction: "IT Development",
      fields: {
        primary_goal: "Connect website inquiry to one operating workflow",
        system_or_workflow_needed: "CRM and automation",
        current_tools: "Google Workspace and CRM",
        timeline: "6 months",
        budget_range: "Needs definition",
      },
    },
  }, { "CF-Connecting-IP": "192.0.2.12" }),
  env,
});
assert.equal(technologyBriefResponse.status, 200);
assert.equal(serviceCalls.at(-1).payload.subject, "[HERMES INQUIRY] [IT DEVELOPMENT]");
assert.equal(emailMessages.at(-1).subject, "!!! LEAD !!! [HERMES INQUIRY] [IT DEVELOPMENT] [ID:technology_brief_test_12345]");
assert.match(emailMessages.at(-1).text, /END OF TECHNOLOGY BRIEF/);
assert.match(emailMessages.at(-1).text, /System\/workflow needed: CRM and automation/);

const generalDuplicate = await onRequest({
  request: leadRequest(generalContactPayload, { "CF-Connecting-IP": "192.0.2.11" }),
  env,
});
assert.equal(generalDuplicate.status, 200);
assert.equal((await generalDuplicate.json()).duplicate, true);
assert.equal(emailMessages.length, 3);
assert.equal(serviceCalls.length, 3);

const contactDirections = [
  ["Hermes Logistics", "[HERMES INQUIRY] [LOGISTICS]"],
  ["Hermes Business Academy", "[HERMES INQUIRY] [ACADEMY]"],
  ["IT Development", "[HERMES INQUIRY] [IT DEVELOPMENT]"],
  ["I am not sure yet", "[HERMES INQUIRY] [GENERAL]"],
];
for (const [index, [interest, expectedSubject]] of contactDirections.entries()) {
  const requestId = `direction_test_${index}_12345`;
  const response = await onRequest({
    request: leadRequest({
      ...generalContactPayload,
      request_id: requestId,
      interest,
      direction_fields: undefined,
    }, { "CF-Connecting-IP": `198.51.100.${index + 1}` }),
    env,
  });
  assert.equal(response.status, 200);
  assert.equal(serviceCalls.at(-1).payload.subject, expectedSubject);
}

const legacyServiceCalls = [];
const legacyServiceBinding = {
  async fetch(input, init) {
    const request = input instanceof Request ? input : new Request(input, init);
    const inspection = request.clone();
    const payload = await inspection.json();
    legacyServiceCalls.push(payload);
    if (String(payload.subject).startsWith("[HERMES INQUIRY]")) {
      return Response.json({ ok: false, error: "invalid_message" }, { status: 400 });
    }
    return leadEmailWorker.fetch(request, workerEnv);
  },
};
const legacyEnv = {
  ...env,
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: legacyServiceBinding,
};
const legacyPayload = {
  ...generalContactPayload,
  request_id: "legacy_worker_test_12345",
  interest: "IT Development",
  message: "We need a secure CRM integration and workflow automation review.",
  direction_fields: undefined,
};
const emailCountBeforeLegacy = emailMessages.length;
const legacyAccepted = await onRequest({
  request: leadRequest(legacyPayload, { "CF-Connecting-IP": "198.51.100.40" }),
  env: legacyEnv,
});
assert.equal(legacyAccepted.status, 200);
assert.deepEqual(await legacyAccepted.json(), { success: true, request_id: "legacy_worker_test_12345" });
assert.equal(legacyServiceCalls.length, 2);
assert.equal(legacyServiceCalls[0].subject, "[HERMES INQUIRY] [IT DEVELOPMENT]");
assert.equal(legacyServiceCalls[1].subject, "[HERMES SALES] [POSTED LOAD] [OTHER BUSINESS]");
assert.equal(emailMessages.length, emailCountBeforeLegacy + 1);
assert.equal(emailMessages.at(-1).subject, "!!! LEAD !!! [HERMES SALES] [POSTED LOAD] [OTHER BUSINESS]");
assert.match(emailMessages.at(-1).text, /Direction: IT Development/);
assert.match(emailMessages.at(-1).text, /secure CRM integration/);

let ambiguousServiceCalls = 0;
const ambiguousEnv = {
  ...env,
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: {
    async fetch() {
      ambiguousServiceCalls += 1;
      return Response.json({ ok: false, error: "provider_unavailable" }, { status: 503 });
    },
  },
};
const ambiguous = await onRequest({
  request: leadRequest({ ...generalContactPayload, request_id: "ambiguous_test_12345" }, { "CF-Connecting-IP": "198.51.100.41" }),
  env: ambiguousEnv,
});
assert.equal(ambiguous.status, 503);
assert.equal(ambiguousServiceCalls, 1, "Ambiguous provider failures must never trigger a second send attempt.");

const forgedContactDirection = await onRequest({
  request: leadRequest({ ...generalContactPayload, request_id: "contact_forged_12345", interest: "Send to any recipient" }),
  env,
});
assert.equal(forgedContactDirection.status, 400);

const contactWithoutConsent = await onRequest({
  request: leadRequest({ ...generalContactPayload, request_id: "contact_consent_12345", consent: false }),
  env,
});
assert.equal(contactWithoutConsent.status, 400);

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
  request: leadRequest(throttledPayload, { "CF-Connecting-IP": "203.0.113.20" }),
  env: throttledEnv,
});
assert.equal(throttled.status, 503);
const throttledBody = JSON.stringify(await throttled.json());
assert.equal(throttledBody, JSON.stringify({ success: false, error: "delivery_temporarily_unavailable" }));
assert.doesNotMatch(throttledBody, /dealer@example\.com|312|quota|provider_throttled|203\.0\.113\.20/i);

for (const key of limits.values.keys()) {
  assert.doesNotMatch(key, /192\.0\.2\.10|release_test_12345|lead@example\.com|contact_test_12345/);
}

const directCarrierBody = [
  "Hermes Car Hauling Dispatch — Qualified Carrier Sales Lead Preview",
  "Commercial source: DIRECT CAR HAULING DISPATCH INTAKE",
  "Decision: dispatcher_review",
  "Vehicle state: submitted_for_review",
  "Role: Owner-operator",
  "Contact: Real Carrier",
  "Company: Real Carrier LLC",
  "Authority number: MC123456",
  "Authority status: Active",
  "Insurance status: Active policy",
  "Fleet size: 2–3 units",
  "Current dispatch status: Needs dispatch service",
  "Email: carrier@example.com",
  "Phone: +1 (414) 555-0140",
  "Equipment: Car Hauler / Auto Transport",
  "Capacity / unit count: 3",
  "Available from: 2026-09-15",
  "Origin: Milwaukee, WI (250 mi radius)",
  "Destination: Anywhere",
  "Internal review routing: Carrier onboarding dry-run queue | Dispatcher vehicle review dry-run queue",
  "Requested follow-up: Logistics Sales review of authority, insurance, equipment, dispatch needs, and access.",
].join("\n");
const directCarrierPayload = {
  request_id: "carrier_real_1296_12345",
  lead_type: "load_board_access",
  sales_tag: "LOAD BOARD ACCESS / CARRIER",
  email_body: directCarrierBody,
  page_path: "/logistics/start-car-hauling-dispatch/",
  submitted_at: "2026-09-15T01:30:00.000Z",
};
// CEO transport hold: a direct carrier submission may not fall back to email
// when D1 capture is OFF, even with a configured generic Worker or stale Sales
// recipient settings. Keep the old Worker available to unrelated owner flows.
const NativeDate = globalThis.Date;
const carrierLimits = new MemoryKv();
const carrierEnv = { ...env, LEAD_LIMITS: carrierLimits };
const emailsBeforeCarrier = emailMessages.length;
const serviceCallsBeforeCarrier = serviceCalls.length;
const telegramBeforeCarrier = telegramMessages.length;
const directWithoutCapture = await onRequest({
  request: leadRequest(directCarrierPayload, { "CF-Connecting-IP": "203.0.113.129" }),
  env: carrierEnv,
});
assert.equal(directWithoutCapture.status, 503);
assert.equal((await directWithoutCapture.json()).error, "carrier_capture_not_enabled");
const duplicateCarrier = await onRequest({
  request: leadRequest(directCarrierPayload, { "CF-Connecting-IP": "203.0.113.129" }),
  env: carrierEnv,
});
assert.equal(duplicateCarrier.status, 503);
assert.equal((await duplicateCarrier.json()).error, "carrier_capture_not_enabled");
const syntheticCarrierPayload = {
  ...directCarrierPayload,
  request_id: "carrier_qa_1296_12345",
  email_body: directCarrierBody
    .replace("Contact: Real Carrier", "Contact: Synthetic Carrier QA")
    .replace("Company: Real Carrier LLC", "Company: Hermes Synthetic Carrier QA")
    .replace("Email: carrier@example.com", "Email: carrier-production-smoke@hermesconnect.app"),
};
const syntheticCarrier = await onRequest({
  request: leadRequest(syntheticCarrierPayload, { "CF-Connecting-IP": "203.0.113.130" }),
  env: carrierEnv,
});
assert.equal(syntheticCarrier.status, 503);
assert.equal((await syntheticCarrier.json()).error, "carrier_capture_not_enabled");
assert.deepEqual(
  [emailMessages.length, serviceCalls.length, telegramMessages.length],
  [emailsBeforeCarrier, serviceCallsBeforeCarrier, telegramBeforeCarrier],
  "No generic Sales email, owner alert or Telegram may fire for direct Car Hauling while capture is disabled.",
);


const durableEmailMessages = [];
const durableStorage = new MemoryDurableStorage();
const durableEnv = {
  ...workerEnv,
  EMAIL: {
    async send(message) {
      durableEmailMessages.push(message);
      return { messageId: `durable-message-${durableEmailMessages.length}` };
    },
  },
};
const durableCoordinator = new CarHaulingDeliveryCoordinatorCore({ storage: durableStorage }, durableEnv);
const durablePayload = {
  request_id: "carrier_durable_1296_12345",
  subject: "[HERMES SALES] [CAR HAULING] [CARRIER]",
  text: directCarrierBody,
  reply_to: "carrier@example.com",
};
const durableRequest = (payload = durablePayload) => new Request(
  "https://car-hauling-delivery.internal/internal/car-hauling-delivery",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  },
);
const setFrozenDate = (iso) => {
  const frozen = new NativeDate(iso);
  globalThis.Date = class extends NativeDate {
    constructor(...args) {
      super(...(args.length ? args : [frozen]));
    }
    static now() { return frozen.valueOf(); }
  };
};

const telegramBeforeDurable = telegramMessages.length;
try {
  setFrozenDate("2026-09-15T22:46:00.000Z");
  const durableAccepted = await durableCoordinator.fetch(durableRequest());
  assert.equal(durableAccepted.status, 202);
  const durableAcceptedBody = await durableAccepted.json();
  assert.equal(durableAcceptedBody.durable, true);
  assert.equal(durableAcceptedBody.complete, false);
  assert.equal(durableAcceptedBody.delivery_ledger.primary, "delivered");
  assert.equal(
    durableAcceptedBody.delivery_ledger.destinations.find((destination) => destination.channel === "telegram").error,
    "outside_working_hours",
  );
  assert.equal(durableEmailMessages.length, 2);
  assert.equal(telegramMessages.length, telegramBeforeDurable);
  assert.ok(durableStorage.alarmTime > new NativeDate("2026-09-15T22:46:00.000Z").valueOf(), "Quiet-hours Telegram delivery must schedule a Durable Object alarm.");

  const durableDuplicate = await durableCoordinator.fetch(durableRequest());
  assert.equal(durableDuplicate.status, 202);
  assert.equal((await durableDuplicate.json()).deduplicated, true);
  assert.equal(durableEmailMessages.length, 2, "A duplicate request ID must not resend delivered email destinations.");

  const durableConflict = await durableCoordinator.fetch(durableRequest({
    ...durablePayload,
    text: `${durablePayload.text}\nConflicting payload.`,
  }));
  assert.equal(durableConflict.status, 409);
  assert.deepEqual(await durableConflict.json(), { ok: false, error: "request_id_payload_conflict" });

  setFrozenDate(new NativeDate(durableStorage.alarmTime + 60_000).toISOString());
  await durableCoordinator.alarm();
} finally {
  globalThis.Date = NativeDate;
}
assert.equal(durableEmailMessages.length, 2, "Alarm retry must skip already delivered email destinations.");
assert.equal(telegramMessages.length, telegramBeforeDurable + 1, "Alarm retry must deliver the pending Telegram destination.");
const durableRecord = await durableStorage.get("delivery");
assert.ok(durableRecord.completedAt, "The durable delivery must be marked complete after every destination is delivered.");
assert.equal(durableRecord.text, "", "Completed durable state must purge the lead body.");
assert.ok(durableRecord.purgeAt > durableRecord.completedAt, "A completed receipt ledger must have a retention deadline.");

// A permanently unavailable optional destination must not retain lead PII or retry forever.
const expiryStorage = new MemoryDurableStorage();
const expiryEmails = [];
const expiryEnv = {
  ...workerEnv,
  CAR_HAULING_TELEGRAM_BOT_TOKEN: "",
  CAR_HAULING_TELEGRAM_SALES_CHAT_ID: "",
  EMAIL: {
    async send(message) {
      expiryEmails.push(message);
      return { messageId: `expiry-message-${expiryEmails.length}` };
    },
  },
};
const expiryCoordinator = new CarHaulingDeliveryCoordinatorCore({ storage: expiryStorage }, expiryEnv);
try {
  setFrozenDate("2026-09-15T14:00:00.000Z");
  const first = await expiryCoordinator.fetch(durableRequest({
    ...durablePayload,
    request_id: "carrier_expiry_1296_12345",
  }));
  assert.equal(first.status, 202);
  assert.equal(expiryEmails.length, 2);
  let pendingRecord = await expiryStorage.get("delivery");
  assert.equal(
    pendingRecord.destinations.find((destination) => destination.channel === "telegram").status,
    "pending",
  );
  assert.ok(pendingRecord.expiresAt > new NativeDate("2026-09-15T14:00:00.000Z").valueOf());

  setFrozenDate(new NativeDate(pendingRecord.expiresAt + 1_000).toISOString());
  await expiryCoordinator.alarm();
  const expiredRecord = await expiryStorage.get("delivery");
  assert.ok(expiredRecord.completedAt, "Expired durable state must become terminal.");
  assert.equal(expiredRecord.text, "", "Expired durable state must purge the lead body.");
  assert.equal(expiredRecord.replyTo, "", "Expired durable state must purge reply-to PII.");
  assert.equal(
    expiredRecord.destinations.find((destination) => destination.channel === "telegram").status,
    "expired",
  );
  assert.equal(
    expiredRecord.destinations.find((destination) => destination.channel === "telegram").lastError,
    "not_configured",
    "Expired receipt must preserve the final provider/root-cause error while status records terminal expiry.",
  );
  assert.ok(expiredRecord.purgeAt > expiredRecord.completedAt);

  const duplicateAfterExpiry = await expiryCoordinator.fetch(durableRequest({
    ...durablePayload,
    request_id: "carrier_expiry_1296_12345",
  }));
  assert.equal(duplicateAfterExpiry.status, 202);
  const duplicateAfterExpiryBody = await duplicateAfterExpiry.json();
  assert.equal(duplicateAfterExpiryBody.deduplicated, true);
  assert.equal(duplicateAfterExpiryBody.terminal, true);
  assert.equal(expiryEmails.length, 2, "Expired tombstone must prevent replayed email sends.");
} finally {
  globalThis.Date = NativeDate;
}

globalThis.fetch = originalFetch;

/* CEO 2026-10-13: carrier intake must be durably captured without AI/Worker email.
 * Synthetic D1 fixture only; zero provider/dispatcher or live network writes. */
class CaptureOnlyD1 {
  rows = new Map();
  prepare(sql) {
    assert.doesNotMatch(sql.trimStart(), /^CREATE (TABLE|INDEX)/i, "D1 schema DDL must not run on live lead requests.");
    const db = this;
    return {
      values: [],
      bind(...values) { this.values = values; return this; },
      async run() {
        if (sql.trimStart().startsWith("INSERT OR IGNORE INTO hermes_carrier_intake")) {
          const [request_id, payload_hash, classification, source_path, contact_email, email_body, created_at, retention_until] = this.values;
          if (db.rows.has(request_id)) return { meta: { changes: 0 } };
          db.rows.set(request_id, { request_id, payload_hash, classification, source_path, contact_email, email_body, created_at, retention_until, delivery_state: "not_sent" });
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      },
      async first() { return db.rows.get(this.values[0]) ?? null; },
    };
  }
}

const captureDb = new CaptureOnlyD1();
const captureLimits = new MemoryKv();
const captureEnv = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  LEAD_DELIVERY_MODE: "preview",
  CARRIER_INTAKE_CAPTURE_MODE: "capture_only",
  LEAD_LIMITS: captureLimits,
  DB: captureDb,
  // Explicitly no LEAD_EMAIL_SERVICE, LEAD_SERVICE_TOKEN or outbound provider.
};
const capturedCarrier = {
  ...directCarrierPayload,
  request_id: "carrier_capture_20261015_12345",
  email_body: directCarrierBody.replace("carrier@example.com", "carrier@example.invalid"),
  consent: true,
};
const captureBeforeProvider = [serviceCalls.length, emailMessages.length, telegramMessages.length];
const captureReq = (input, ip = "203.0.113.225") =>
  leadRequest(input, { "CF-Connecting-IP": ip });
const captured = await onRequest({ request: captureReq(capturedCarrier), env: captureEnv });
assert.equal(captured.status, 200);
assert.deepEqual(await captured.json(), {
  success: true,
  request_id: capturedCarrier.request_id,
  capture_state: "persisted",
  delivery_state: "not_sent",
  human_receipt_state: "unconfirmed",
});
assert.equal(captureDb.rows.size, 1);
assert.equal(captureDb.rows.get(capturedCarrier.request_id).classification, "commercial");
assert.equal(captureDb.rows.get(capturedCarrier.request_id).delivery_state, "not_sent");
assert.equal(captureDb.rows.get(capturedCarrier.request_id).contact_email, "carrier@example.invalid");
assert.ok(Date.parse(captureDb.rows.get(capturedCarrier.request_id).retention_until) > Date.now());
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider, "D1 capture must never contact a provider.");

const repeatedCapture = await onRequest({ request: captureReq(capturedCarrier), env: captureEnv });
assert.equal(repeatedCapture.status, 200);
assert.equal((await repeatedCapture.json()).duplicate, true);
assert.equal(captureDb.rows.size, 1);
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider);

// A failure updating the anti-abuse KV quota must happen BEFORE any durable
// carrier capture, so a previously saved D1 record can never be misreported as
// "capture_temporarily_unavailable". No Worker or email fallback is allowed.
const kvWriteRejectedRequestId = "carrier_kv_write_rejected_20261016";
let kvRejectedWriteCount = 0;
const kvRejectEnv = {
  ...captureEnv,
  LEAD_LIMITS: {
    async get() { return null; },
    async put() { kvRejectedWriteCount += 1; throw new Error("kv_quota_write_unavailable"); },
  },
};
const captureRowsBeforeKvReject = captureDb.rows.size;
const kvRejectedAdmission = await onRequest({
  request: captureReq({ ...capturedCarrier, request_id: kvWriteRejectedRequestId }, "203.0.113.229"),
  env: kvRejectEnv,
});
assert.equal(kvRejectedAdmission.status, 503, "KV write failure must fail closed before D1 capture.");
assert.equal((await kvRejectedAdmission.json()).error, "capture_temporarily_unavailable");
assert.equal(kvRejectedWriteCount, 1);
assert.equal(captureDb.rows.size, captureRowsBeforeKvReject, "Failed KV admission must not durably store an unconfirmed lead.");
assert.equal(captureDb.rows.has(kvWriteRejectedRequestId), false);
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider,
  "KV admission failure may not invoke outbound Workers, email or Telegram.");

const changedCapture = await onRequest({
  request: captureReq({ ...capturedCarrier, email_body: capturedCarrier.email_body.replace("Real Carrier LLC", "Changed Carrier LLC") }),
  env: captureEnv,
});
assert.equal(changedCapture.status, 409);
assert.equal((await changedCapture.json()).error, "idempotency_conflict");

const noConsentCapture = await onRequest({
  request: captureReq({ ...capturedCarrier, request_id: "carrier_no_consent_12345", consent: false }),
  env: captureEnv,
});
assert.equal(noConsentCapture.status, 400);
assert.equal((await noConsentCapture.json()).error, "consent_required");

const noDbCapture = await onRequest({
  request: captureReq({ ...capturedCarrier, request_id: "carrier_no_db_20261015" }),
  env: { ...captureEnv, DB: undefined },
});
assert.equal(noDbCapture.status, 503);
assert.equal((await noDbCapture.json()).error, "capture_not_configured");

const oneTimeMigration = readFileSync(new URL("../migrations/20261015_carrier_intake_d1.sql", import.meta.url), "utf8");
assert.match(oneTimeMigration, /CREATE TABLE IF NOT EXISTS hermes_carrier_intake/);
assert.match(oneTimeMigration, /CREATE INDEX IF NOT EXISTS idx_hermes_carrier_intake_retention/);
assert.match(oneTimeMigration, /delivery_state TEXT NOT NULL DEFAULT 'not_sent'/);
const unmigratedCapture = await onRequest({
  request: captureReq({ ...capturedCarrier, request_id: "carrier_missing_table_20261015" }, "203.0.113.227"),
  env: {
    ...captureEnv,
    DB: { prepare() { throw new Error("no such table: hermes_carrier_intake"); } },
  },
});
assert.equal(unmigratedCapture.status, 503);
assert.equal((await unmigratedCapture.json()).error, "capture_temporarily_unavailable");
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider);

const unrelatedEmailGate = await onRequest({
  request: captureReq({ ...capturedCarrier, request_id: "carrier_unrelated_20261015", page_path: "/load-board/" }),
  env: captureEnv,
});
assert.equal(unrelatedEmailGate.status, 503);
assert.equal((await unrelatedEmailGate.json()).error, "outbound_disabled_during_carrier_capture");

// Even a mistakenly present legacy Worker binding/global live flag must not
// permit unrelated email traffic whenever capture-only is explicitly active.
let forbiddenWorkerCalls = 0;
const unrelatedWithBoundWorker = await onRequest({
  request: captureReq({ ...capturedCarrier, request_id: "carrier_worker_hold_20261016", page_path: "/load-board/" }),
  env: {
    ...captureEnv,
    LEAD_DELIVERY_MODE: "live",
    LEAD_EMAIL_SERVICE: { fetch() { forbiddenWorkerCalls++; throw new Error("forbidden_outbound"); } },
    LEAD_SERVICE_TOKEN: "unused-test-token",
  },
});
assert.equal(unrelatedWithBoundWorker.status, 503);
assert.equal((await unrelatedWithBoundWorker.json()).error, "outbound_disabled_during_carrier_capture");
assert.equal(forbiddenWorkerCalls, 0, "Capture-only must block unrelated Worker dispatch before touching transport.");

const syntheticStored = await onRequest({
  request: captureReq({
    ...capturedCarrier, request_id: "carrier_qa_capture_20261015",
    email_body: capturedCarrier.email_body.replace("Real Carrier", "Synthetic Carrier QA"),
  }, "203.0.113.226"),
  env: captureEnv,
});
assert.equal(syntheticStored.status, 200);
assert.equal(captureDb.rows.get("carrier_qa_capture_20261015").classification, "qa", "Synthetic records are not commercial KPI.");
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider);


/* Private intake evidence read: real session + ACTIVE owner capability only.
 * Existing Hermes Connect auth must reject unauthenticated or ordinary users. */
class CarrierOwnerDb {
  constructor(isOwner = true) { this.isOwner = isOwner; this.rows = captureDb.rows; this.queries = []; }
  prepare(sql) {
    this.queries.push(sql);
    const db = this;
    return {
      vals: [],
      bind(...args) { this.vals = args; return this; },
      async first() {
        if (/FROM sessions WHERE token/.test(sql)) return this.vals[0] === "synthetic-owner-session"
          ? { specialist_id: "synthetic-owner", expires_at: "2099-01-01T00:00:00.000Z" } : null;
        if (/FROM specialists WHERE id/.test(sql)) return { id: "synthetic-owner", email: "owner@example.invalid", name: "Synthetic Owner", role: "Admin" };
        if (/FROM hermes_internal_owner_access WHERE specialist_id/.test(sql)) return db.isOwner
          ? { specialist_id: "synthetic-owner", capability: "HERMES_INTERNAL_OWNER" } : null;
        if (/FROM hermes_carrier_intake/.test(sql)) {
          const row = db.rows.get(this.vals[0]);
          if (!row || row.retention_until <= this.vals[1]) return null;
          return { ...row, status: row.status || "new" };
        }
        return null;
      },
      async all() {
        if (/PRAGMA table_info/.test(sql)) return { results: [] };
        if (/FROM hermes_carrier_intake/.test(sql)) return {
          results: [...db.rows.values()]
            .filter(x => x.classification === this.vals[0] && (x.status || "new") === this.vals[1] && x.retention_until > this.vals[2])
            .filter(x => this.vals.length < 6 ||
              x.created_at < this.vals[3] || (x.created_at === this.vals[3] && x.request_id < this.vals[5]))
            .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.request_id.localeCompare(a.request_id))
            .slice(0, 21)
            .map(({ email_body, payload_hash, ...summary }) => ({ ...summary, status: summary.status || "new" }))
        };
        return { results: [] };
      },
      async run() {
        if (/UPDATE hermes_carrier_intake SET/.test(sql)) {
          const [nextStatus, updatedAt, updatedBy, reviewCode, id, fromStatus, now] = this.vals;
          const row = db.rows.get(id);
          if (!row || (row.status || "new") !== fromStatus ||
              row.classification !== "commercial" || row.retention_until <= now)
            return { success: true, meta: { changes: 0 } };
          db.rows.set(id, { ...row, status: nextStatus, status_updated_at: updatedAt,
            status_updated_by: updatedBy, status_review_code: reviewCode });
          return { success: true, meta: { changes: 1 } };
        }
        if (/DELETE FROM hermes_carrier_intake/.test(sql)) {
          const expired = [...db.rows.values()]
            .filter(row => row.retention_until <= this.vals[0])
            .sort((a, b) => a.retention_until.localeCompare(b.retention_until) ||
              a.request_id.localeCompare(b.request_id))
            .slice(0, 100);
          for (const row of expired) db.rows.delete(row.request_id);
          return { success: true, meta: { changes: expired.length } };
        }
        return { success: true, meta: { changes: 0 } };
      }
    };
  }
}
const ownerReadReq = (search = "", authenticated = true) => new Request(
  "https://hermeslogisticsus.com/api/internal/carrier-intake" + search,
  { headers: authenticated ? { Cookie: "hermes_session=synthetic-owner-session" } : {} },
);
const ownerDb = new CarrierOwnerDb();
const ownerList = await readOwnerCarrierIntake({ request: ownerReadReq(), env: { DB: ownerDb } });
assert.equal(ownerList.status, 200);
assert.equal(ownerList.headers.get("Cache-Control"), "private, no-store");
assert.equal(ownerList.headers.get("X-Robots-Tag"), "noindex, nofollow");
const ownerRows = await ownerList.json();
assert.equal(ownerRows.requests.length, 1);
assert.equal(ownerRows.requests[0].request_id, capturedCarrier.request_id);
assert.ok(!("email_body" in ownerRows.requests[0]), "Owner list must not expose unbounded lead body.");
assert.equal(ownerRows.all_are_real_leads, false);
const ownerQa = await readOwnerCarrierIntake({ request: ownerReadReq("?classification=qa"), env: { DB: ownerDb } });
assert.equal(ownerQa.status, 200);
assert.equal((await ownerQa.json()).requests[0].classification, "qa");
const ownerDetail = await readOwnerCarrierIntake({
  request: ownerReadReq("?request_id=" + capturedCarrier.request_id), env: { DB: ownerDb },
});
assert.equal(ownerDetail.status, 200);
const detail = await ownerDetail.json();
assert.match(detail.request.email_body, /Real Carrier LLC/);
assert.equal(detail.delivery_state, "not_sent");
assert.equal(detail.human_receipt_state, "unconfirmed");
const anonymousOwner = await readOwnerCarrierIntake({
  request: ownerReadReq("", false), env: { DB: new CarrierOwnerDb() },
});
assert.equal(anonymousOwner.status, 401);
const forbiddenOwner = await readOwnerCarrierIntake({
  request: ownerReadReq(), env: { DB: new CarrierOwnerDb(false) },
});
assert.equal(forbiddenOwner.status, 403);
for (const bad of ["?classification=other", "?status=deleted", "?request_id='or1=1"]) {
  const denied = await readOwnerCarrierIntake({ request: ownerReadReq(bad), env: { DB: ownerDb } });
  assert.equal(denied.status, 400);
}
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider,
  "An owner-read API must not trigger providers or dispatcher notifications.");

// Owner-only human review is distinct from verified carrier qualification.
const ownerPatch = (payload, opt = {}) => new Request("https://hermeslogisticsus.com/api/internal/carrier-intake", {
  method: "PATCH", headers: {
    ...(opt.anonymous ? {} : { Cookie: "hermes_session=synthetic-owner-session" }),
    Origin: opt.origin || "https://hermeslogisticsus.com",
    "Content-Type": "application/json",
    ...(opt.noAction ? {} : { "X-Hermes-Owner-Action": "REVIEW_CARRIER_INTAKE" }),
  },
  body: JSON.stringify(payload),
});
const intendedReview = { request_id: capturedCarrier.request_id, from_status: "new",
  to_status: "reviewed", review_code: "initial_owner_review" };
for (const bad of [
  ownerPatch(intendedReview, { anonymous: true }),
  ownerPatch(intendedReview, { origin: "https://example.invalid" }),
  ownerPatch(intendedReview, { noAction: true }),
  ownerPatch({ ...intendedReview, to_status: "qualified" }),
  ownerPatch({ ...intendedReview, request_id: "carrier_qa_capture_20261015" }),
]) {
  const denied = await reviewOwnerCarrierIntake({ request: bad, env: { DB: ownerDb } });
  assert.notEqual(denied.status, 200);
}
const reviewed = await reviewOwnerCarrierIntake({
  request: ownerPatch(intendedReview), env: { DB: ownerDb },
});
assert.equal(reviewed.status, 200);
assert.equal((await reviewed.json()).qualified_carrier_state, "not_verified");
assert.equal(captureDb.rows.get(capturedCarrier.request_id).status, "reviewed");
assert.equal(captureDb.rows.get(capturedCarrier.request_id).status_updated_by, "synthetic-owner");
assert.equal((await reviewOwnerCarrierIntake({
  request: ownerPatch(intendedReview), env: { DB: ownerDb },
})).status, 409);
const closed = await reviewOwnerCarrierIntake({
  request: ownerPatch({ request_id: capturedCarrier.request_id, from_status: "reviewed",
    to_status: "closed", review_code: "manual_followup_closed" }), env: { DB: ownerDb },
});
assert.equal(closed.status, 200);
assert.equal(captureDb.rows.get(capturedCarrier.request_id).status, "closed");
assert.equal((await (await readOwnerCarrierIntake({
  request: ownerReadReq("?request_id=" + capturedCarrier.request_id), env: { DB: ownerDb },
})).json()).human_receipt_state, "owner_reviewed");

// Qualification is a separate explicit human decision. It is impossible without
// the complete bounded verification checklist and never triggers outbound.
const qualificationId = "carrier_qualified_20261017";
const qualificationSource = captureDb.rows.get(capturedCarrier.request_id);
ownerDb.rows.set(qualificationId, {
  ...qualificationSource,
  request_id: qualificationId,
  payload_hash: "synthetic-qualification-payload-hash",
  contact_email: "qualification@example.invalid",
  email_body: "SYNTHETIC QUALIFICATION CANDIDATE — NOT A REAL LEAD",
  status: "reviewed",
  status_updated_at: "2026-10-17T00:00:00.000Z",
  status_updated_by: "synthetic-owner",
  status_review_code: "initial_owner_review",
  created_at: "2026-10-17T00:00:00.000Z",
  retention_until: "2099-01-01T00:00:00.000Z",
});
const qualificationBase = {
  request_id: qualificationId,
  from_status: "reviewed",
  to_status: "qualified",
  review_code: "manual_carrier_qualification",
};
for (const body of [
  qualificationBase,
  { ...qualificationBase, verification_checks: { authority_verified: true } },
  { ...qualificationBase, verification_checks: {
    authority_verified: true, insurance_verified: true,
    equipment_capacity_verified: true, operating_fit_verified: false,
  } },
]) {
  const denied = await reviewOwnerCarrierIntake({ request: ownerPatch(body), env: { DB: ownerDb } });
  assert.equal(denied.status, 400);
}
const qualified = await reviewOwnerCarrierIntake({
  request: ownerPatch({ ...qualificationBase, verification_checks: {
    authority_verified: true,
    insurance_verified: true,
    equipment_capacity_verified: true,
    operating_fit_verified: true,
  } }),
  env: { DB: ownerDb },
});
assert.equal(qualified.status, 200);
const qualifiedBody = await qualified.json();
assert.equal(qualifiedBody.qualified_carrier_state, "owner_qualified");
assert.equal(ownerDb.rows.get(qualificationId).status, "qualified");
assert.equal(ownerDb.rows.get(qualificationId).status_review_code, "manual_carrier_qualification");
assert.equal((await (await readOwnerCarrierIntake({
  request: ownerReadReq("?request_id=" + qualificationId), env: { DB: ownerDb },
})).json()).qualified_carrier_state, "owner_qualified");

assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider,
  "Owner status or qualification must never invoke email, Telegram or dispatcher notification.");

/* Owner-only cursor pagination must not hide a 21st+ NEW request or leak
 * batches to anonymous/ordinary Sales identities. These are synthetic rows. */
const pagedDb = new CarrierOwnerDb();
pagedDb.rows = new Map();
for (let index = 0; index < 45; index += 1) {
  const id = `synthetic_carrier_${String(index).padStart(5, "0")}`;
  pagedDb.rows.set(id, {
    request_id: id, classification: "commercial", status: "new",
    source_path: "/logistics/start-car-hauling-dispatch/",
    contact_email: "synthetic@example.invalid", email_body: "SYNTHETIC — NOT A REAL LEAD",
    payload_hash: `fakehash${index}`, delivery_state: "not_sent",
    created_at: new Date(Date.UTC(2026, 9, 15, 8, index % 60)).toISOString(),
    retention_until: "2099-01-01T00:00:00.000Z",
  });
}
const seenIds = [];
let nextCursor = null;
for (let pageNumber = 0; pageNumber < 4; pageNumber += 1) {
  const search = nextCursor === null ? "" : "?cursor=" + encodeURIComponent(nextCursor);
  const response = await readOwnerCarrierIntake({
    request: ownerReadReq(search), env: { DB: pagedDb },
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.requests.length, pageNumber < 2 ? 20 : 5);
  assert.equal(payload.partial, pageNumber < 2);
  assert.equal(Boolean(payload.next_cursor), pageNumber < 2);
  assert.ok(pagedDb.queries.some(sql => /ORDER BY created_at DESC, request_id DESC LIMIT 21/.test(sql)));
  seenIds.push(...payload.requests.map(row => row.request_id));
  nextCursor = payload.next_cursor;
  if (!nextCursor) break;
}
assert.equal(seenIds.length, 45, "All synthetic requests must be retrievable, even past page 20.");
assert.equal(new Set(seenIds).size, 45, "Keyset pages must not duplicate records.");
assert.deepEqual(seenIds.slice(0, 2), ["synthetic_carrier_00044", "synthetic_carrier_00043"]);
for (const invalidCursor of ["", "fake", "%%%%", "eyJ2IjoyfQ", "a".repeat(513)]) {
  const response = await readOwnerCarrierIntake({
    request: ownerReadReq("?cursor=" + encodeURIComponent(invalidCursor)), env: { DB: pagedDb },
  });
  assert.equal(response.status, 400, "Malformed or excessively long cursor must fail closed.");
}
const validFirst = await readOwnerCarrierIntake({ request: ownerReadReq(), env: { DB: pagedDb } });
const validToken = (await validFirst.json()).next_cursor;
const mismatchedScope = await readOwnerCarrierIntake({
  request: ownerReadReq("?classification=qa&cursor=" + encodeURIComponent(validToken)), env: { DB: pagedDb },
});
assert.equal(mismatchedScope.status, 400, "Cursor cannot cross classification scope.");
const hiddenPage = await readOwnerCarrierIntake({
  request: ownerReadReq("?cursor=" + encodeURIComponent(validToken), false), env: { DB: pagedDb },
});
assert.equal(hiddenPage.status, 401, "Cursor never bypasses authentication.");
const deniedPage = await readOwnerCarrierIntake({
  request: ownerReadReq("?cursor=" + encodeURIComponent(validToken)), env: { DB: new CarrierOwnerDb(false) },
});
assert.equal(deniedPage.status, 403, "Cursor never expands owner capability.");
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider,
  "Pagination must not trigger any outbound channel.");

/* Owner-confirmed expired-only physical purge. No automatic purger, production
 * requests, mail or dispatcher side effects; pure synthetic D1 fixture. */
const expiredPurgeDb = new CarrierOwnerDb();
expiredPurgeDb.rows = new Map();
for (let index = 0; index < 107; index += 1) {
  const id = `expired_carrier_${String(index).padStart(5, "0")}`;
  expiredPurgeDb.rows.set(id, {
    request_id: id, classification: "commercial", status: "new",
    created_at: "2025-01-01T00:00:00.000Z",
    retention_until: "2026-01-01T00:00:00.000Z",
  });
}
expiredPurgeDb.rows.set("active_carrier_12345", {
  request_id: "active_carrier_12345", classification: "commercial",
  status: "new", created_at: "2026-10-15T08:00:00.000Z",
  retention_until: "2099-01-01T00:00:00.000Z",
});
const purgeRequest = (authenticated = true, confirm = true, origin = "https://hermeslogisticsus.com") =>
  new Request("https://hermeslogisticsus.com/api/internal/carrier-intake", {
    method: "DELETE",
    headers: {
      ...(authenticated ? { Cookie: "hermes_session=synthetic-owner-session" } : {}),
      Origin: origin,
      ...(confirm ? { "X-Hermes-Confirm-Expired-Purge": "PURGE_EXPIRED_CARRIER_INTAKE" } : {}),
    },
  });
for (const badRequest of [
  purgeRequest(false), purgeRequest(true, false), purgeRequest(true, true, "https://example.invalid"),
]) {
  const response = await purgeExpiredCarrierIntake({ request: badRequest, env: { DB: expiredPurgeDb } });
  assert.ok(response.status === 401 || response.status === 403);
  assert.equal(expiredPurgeDb.rows.size, 108, "Unauthorized purge must not delete rows.");
}
const purgeDenied = await purgeExpiredCarrierIntake({
  request: purgeRequest(), env: { DB: new CarrierOwnerDb(false) },
});
assert.equal(purgeDenied.status, 403);
const purgeFirst = await purgeExpiredCarrierIntake({
  request: purgeRequest(), env: { DB: expiredPurgeDb },
});
assert.equal(purgeFirst.status, 200);
assert.deepEqual(
  { count: (await purgeFirst.json()).purged_expired_rows, size: expiredPurgeDb.rows.size },
  { count: 100, size: 8 },
);
const purgeSecond = await purgeExpiredCarrierIntake({
  request: purgeRequest(), env: { DB: expiredPurgeDb },
});
assert.equal((await purgeSecond.json()).purged_expired_rows, 7);
assert.equal(expiredPurgeDb.rows.size, 1, "Active carrier must survive expiry purge.");
assert.ok(expiredPurgeDb.rows.has("active_carrier_12345"));
const purgeAgain = await purgeExpiredCarrierIntake({ request: purgeRequest(), env: { DB: expiredPurgeDb } });
assert.equal((await purgeAgain.json()).purged_expired_rows, 0, "Repeated purge is idempotent.");
assert.deepEqual([serviceCalls.length, emailMessages.length, telegramMessages.length], captureBeforeProvider,
  "Private retention purge must never send mail or Telegram.");



console.log("Sales lead receiver, four-direction contact intake, Car Hauling QA/commercial routing, and private Email Worker checks passed.");
