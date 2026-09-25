import assert from "node:assert/strict";
import { onRequest } from "../functions/api/logistics-lead.ts";
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
assert.equal(emailMessages[1].subject, "[HERMES INQUIRY] [MARKETING]");
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
assert.equal(emailMessages.at(-1).subject, "[HERMES SALES] [POSTED LOAD] [OTHER BUSINESS]");
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
const carrierLimits = new MemoryKv();
const carrierEnv = { ...env, LEAD_LIMITS: carrierLimits, LEAD_EMAIL_SERVICE: serviceBinding(workerEnv) };
const emailsBeforeCarrier = emailMessages.length;
const serviceCallsBeforeCarrier = serviceCalls.length;
const telegramBeforeCarrier = telegramMessages.length;
const NativeDate = globalThis.Date;
const telegramWorkHoursNow = new NativeDate("2026-09-15T15:00:00.000Z");
let realCarrier;
try {
  globalThis.Date = class extends NativeDate {
    constructor(...args) {
      super(...(args.length ? args : [telegramWorkHoursNow]));
    }
    static now() { return telegramWorkHoursNow.valueOf(); }
  };
  realCarrier = await onRequest({
    request: leadRequest(directCarrierPayload, { "CF-Connecting-IP": "203.0.113.129" }),
    env: carrierEnv,
  });
} finally {
  globalThis.Date = NativeDate;
}
assert.equal(realCarrier.status, 200);
assert.deepEqual(await realCarrier.json(), { success: true, request_id: "carrier_real_1296_12345" });
assert.equal(serviceCalls.length, serviceCallsBeforeCarrier + 1);
assert.equal(serviceCalls.at(-1).payload.subject, "[HERMES SALES] [CAR HAULING] [CARRIER]");
const carrierEmails = emailMessages.slice(emailsBeforeCarrier);
assert.deepEqual(
  carrierEmails.map((message) => message.to).sort(),
  ["dispatchtruck107@gmail.com", "officeus@hermeslogisticsus.com", "volkogon.v@gmail.com"].sort(),
);
assert.ok(carrierEmails.every((message) => message.subject === "[HERMES SALES] [CAR HAULING] [CARRIER]"));
assert.equal(telegramMessages.length, telegramBeforeCarrier + 1);
assert.equal(telegramMessages.at(-1).chat_id, "-1001296000000");
assert.match(telegramMessages.at(-1).text, /Real Carrier LLC/);
assert.match(telegramMessages.at(-1).text, /Request ID: carrier_real_1296_12345/);
assert.match(telegramMessages.at(-1).text, /Page: \/logistics\/start-car-hauling-dispatch\//);

const duplicateCarrier = await onRequest({
  request: leadRequest(directCarrierPayload, { "CF-Connecting-IP": "203.0.113.129" }),
  env: carrierEnv,
});
assert.equal(duplicateCarrier.status, 200);
assert.equal((await duplicateCarrier.json()).duplicate, true);
assert.equal(emailMessages.length, emailsBeforeCarrier + 3);
assert.equal(serviceCalls.length, serviceCallsBeforeCarrier + 1);
assert.equal(telegramMessages.length, telegramBeforeCarrier + 1);

const syntheticCarrierPayload = {
  ...directCarrierPayload,
  request_id: "carrier_qa_1296_12345",
  email_body: directCarrierBody
    .replace("Contact: Real Carrier", "Contact: Synthetic Carrier QA")
    .replace("Company: Real Carrier LLC", "Company: Hermes Synthetic Carrier QA")
    .replace("Email: carrier@example.com", "Email: carrier-production-smoke@hermesconnect.app"),
};
const emailsBeforeQa = emailMessages.length;
const telegramBeforeQa = telegramMessages.length;
const syntheticCarrier = await onRequest({
  request: leadRequest(syntheticCarrierPayload, { "CF-Connecting-IP": "203.0.113.130" }),
  env: carrierEnv,
});
assert.equal(syntheticCarrier.status, 200);
assert.equal(serviceCalls.at(-1).payload.subject, "[HERMES TEST] [CAR HAULING] [CARRIER]");
const qaEmails = emailMessages.slice(emailsBeforeQa);
assert.equal(qaEmails.length, 1);
assert.equal(qaEmails[0].to, "officeus@hermeslogisticsus.com");
assert.equal(qaEmails[0].subject, "[HERMES TEST] [CAR HAULING] [CARRIER]");
assert.match(qaEmails[0].text, /exclude from Sales\/CRM KPI/);
assert.equal(telegramMessages.length, telegramBeforeQa);


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

const pendingPrimaryStorage = new MemoryDurableStorage();
const pendingPrimaryEnv = {
  ...workerEnv,
  EMAIL: {
    async send() {
      const error = new Error("temporary provider outage");
      error.status = 503;
      throw error;
    },
  },
};
const pendingPrimaryCoordinator = new CarHaulingDeliveryCoordinatorCore({ storage: pendingPrimaryStorage }, pendingPrimaryEnv);
const pendingPrimaryFirst = await pendingPrimaryCoordinator.fetch(durableRequest({
  ...durablePayload,
  request_id: "carrier_durable_pending_1296",
}));
assert.equal(pendingPrimaryFirst.status, 503);
const pendingPrimaryFirstBody = await pendingPrimaryFirst.json();
assert.equal(pendingPrimaryFirstBody.delivery_ledger.primary, "pending");
assert.equal(pendingPrimaryFirstBody.ok, false);

const pendingPrimaryRetry = await pendingPrimaryCoordinator.fetch(durableRequest({
  ...durablePayload,
  request_id: "carrier_durable_pending_1296",
}));
assert.equal(pendingPrimaryRetry.status, 503, "Immediate duplicate retry must not promote a pending primary delivery to accepted.");
const pendingPrimaryRetryBody = await pendingPrimaryRetry.json();
assert.equal(pendingPrimaryRetryBody.deduplicated, true);
assert.equal(pendingPrimaryRetryBody.accepted, false);
assert.equal(pendingPrimaryRetryBody.delivery_ledger.primary, "pending");

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
  assert.equal(durableEmailMessages.length, 3);
  assert.equal(telegramMessages.length, telegramBeforeDurable);
  assert.ok(durableStorage.alarmTime > new NativeDate("2026-09-15T22:46:00.000Z").valueOf(), "Quiet-hours Telegram delivery must schedule a Durable Object alarm.");

  const durableDuplicate = await durableCoordinator.fetch(durableRequest());
  assert.equal(durableDuplicate.status, 202);
  assert.equal((await durableDuplicate.json()).deduplicated, true);
  assert.equal(durableEmailMessages.length, 3, "A duplicate request ID must not resend delivered email destinations.");

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
assert.equal(durableEmailMessages.length, 3, "Alarm retry must skip already delivered email destinations.");
assert.equal(telegramMessages.length, telegramBeforeDurable + 1, "Alarm retry must deliver the pending Telegram destination.");
const durableRecord = await durableStorage.get("delivery");
assert.ok(durableRecord.completedAt, "The durable delivery must be marked complete after every destination is delivered.");
assert.equal(durableRecord.text, "", "Completed durable state must purge the lead body.");
assert.ok(durableRecord.purgeAt > durableRecord.completedAt, "A completed receipt ledger must have a retention deadline.");

globalThis.fetch = originalFetch;
console.log("Sales lead receiver, four-direction contact intake, Car Hauling QA/commercial routing, and private Email Worker checks passed.");
