import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { onRequest, normalizeInput } from "../functions/api/carrier-contract.ts";
import contractEmailWorker from "../workers/lead-email/src/index.mjs";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const approvedMaster = Buffer.from(
  `%PDF-1.4\n${"% Synthetic approved master document padding for attachment validation.\n".repeat(8)}1 0 obj << /Type /Catalog >> endobj\n%%EOF\n`,
  "utf8",
);
const approvedMasterSha = sha256(approvedMaster);
const signatureBytes = Buffer.alloc(900, 17);
const signatureData = `data:image/jpeg;base64,${signatureBytes.toString("base64")}`;
const serviceToken = "test-contract-service-token-with-sufficient-length";
const retiredRecipient = "freight_301@hermeslogisticsus.com";
const sentMessages = [];
const workerEnv = {
  LEAD_SERVICE_TOKEN: serviceToken,
  SALES_DESTINATION: "officeus@hermeslogisticsus.com",
  SALES_SENDER: "website@hermeslogisticsus.com",
  CARRIER_CONTRACT_INTERNAL_RECIPIENTS: `officeus@hermeslogisticsus.com,${retiredRecipient},dispatch-test@hermeslogisticsus.com`,
  EMAIL: {
    async send(message) {
      sentMessages.push(message);
      return { messageId: `contract-message-${sentMessages.length}` };
    },
  },
};

const serviceCalls = [];
const serviceBinding = {
  async fetch(input, init) {
    const request = input instanceof Request ? input : new Request(input, init);
    const inspection = request.clone();
    serviceCalls.push({
      path: new URL(inspection.url).pathname,
      authorization: inspection.headers.get("Authorization"),
      payload: await inspection.json(),
    });
    return contractEmailWorker.fetch(request, workerEnv);
  },
};

const limits = new MemoryKv();
const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  ASSETS: {
    async fetch(input) {
      const url = new URL(input instanceof Request ? input.url : String(input));
      assert.equal(url.pathname, "/contracts/test-approved-master.pdf");
      return new Response(approvedMaster, { status: 200, headers: { "Content-Type": "application/pdf" } });
    },
  },
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: serviceToken,
  LEAD_LIMITS: limits,
  LEAD_EMAIL_SERVICE: serviceBinding,
  CARRIER_CONTRACT_MODE: "live",
  CARRIER_CONTRACT_APPROVED_VERSION: "APPROVED-TEST-2026-08-06",
  CARRIER_CONTRACT_APPROVED_PDF_PATH: "/contracts/test-approved-master.pdf",
  CARRIER_CONTRACT_APPROVED_PDF_SHA256: approvedMasterSha,
};

const validPayload = {
  request_id: "contract_test_12345678",
  selected_plan: "pro",
  custom_percentage: "",
  custom_scope: "",
  legal_company_name: "TEST Hermes Carrier LLC",
  dba_name: "TEST Carrier",
  mc_number: "123456",
  usdot_number: "9876543",
  business_address: "100 Test Avenue",
  city: "Milwaukee",
  state: "WI",
  zip: "53202",
  signer_name: "Test Authorized Signer",
  signer_title: "Owner",
  signer_email: "carrier-test@example.com",
  signer_phone: "+1 414 555 0101",
  fleet_size: "2",
  equipment_types: ["Car hauler", "Hotshot"],
  other_equipment: "",
  home_base: "Milwaukee, WI",
  preferred_lanes: "Wisconsin to Illinois and return toward Milwaukee",
  avoided_lanes: "No Northeast during adaptation",
  max_deadhead: "100 miles",
  availability_notes: "Monday through Friday; confirm every load before booking.",
  load_boards: ["Central Dispatch", "DAT"],
  other_load_board: "",
  access_handoff_method: "Separate secure handoff to assigned load planner",
  sales_contact: "TEST Assistant 34",
  typed_signature: "Test Authorized Signer",
  signature_jpeg: signatureData,
  signature_width: 600,
  signature_height: 180,
  consent_electronic_records: true,
  consent_authority: true,
  consent_document_review: true,
  consent_selected_scope: true,
  submitted_at: "2026-08-06T06:00:00.000Z",
};

const contractRequest = (payload = validPayload, headers = {}) => new Request("https://hermeslogisticsus.com/api/carrier-contract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": String(payload.request_id ?? ""),
    "Origin": "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.55",
    "User-Agent": "Hermes synthetic contract test",
    ...headers,
  },
  body: JSON.stringify(payload),
});

const normalized = normalizeInput(validPayload);
assert.ok(normalized, "Valid carrier contract input must normalize.");
assert.equal(normalized.planLabel, "Hermes Pro");
assert.equal(normalized.percentage, "8%");
assert.deepEqual(normalized.loadBoards, ["Central Dispatch", "DAT"]);

const accepted = await onRequest({ request: contractRequest(), env });
assert.equal(accepted.status, 200);
assert.equal(accepted.headers.get("Content-Type"), "application/pdf");
assert.equal(accepted.headers.get("X-Hermes-Delivery"), "delivered");
assert.equal(accepted.headers.get("X-Hermes-Document-Mode"), "live");
assert.match(accepted.headers.get("Content-Disposition") ?? "", /Hermes_TEST_Hermes_Carrier_LLC_Signed_Appendix_A\.pdf/);
const generatedPdf = Buffer.from(await accepted.arrayBuffer());
assert.ok(generatedPdf.length > 5_000, "Generated carrier PDF must contain the packet and signature image.");
assert.equal(generatedPdf.subarray(0, 8).toString("utf8"), "%PDF-1.4");
assert.equal(accepted.headers.get("X-Hermes-Pdf-Sha256"), sha256(generatedPdf));
assert.match(generatedPdf.toString("latin1"), /Hermes Carrier Service Selection - Appendix A/);
assert.match(generatedPdf.toString("latin1"), /Test Authorized Signer/);
assert.doesNotMatch(generatedPdf.toString("latin1"), /192\.0\.2\.55/);

assert.equal(serviceCalls.length, 1);
assert.equal(serviceCalls[0].path, "/v1/send-contract");
assert.equal(serviceCalls[0].authorization, `Bearer ${serviceToken}`);
assert.equal(serviceCalls[0].payload.subject, "[HERMES CONTRACT] [CARRIER ONBOARDING]");
assert.equal(serviceCalls[0].payload.carrier_email, "carrier-test@example.com");
assert.equal(serviceCalls[0].payload.attachments.length, 2);
assert.equal(serviceCalls[0].payload.attachments[0].content_type, "application/pdf");
assert.equal(serviceCalls[0].payload.attachments[1].content_type, "application/pdf");
const serializedServicePayload = JSON.stringify(serviceCalls[0].payload);
assert.doesNotMatch(serializedServicePayload, /"(?:password|passcode|pin|api[_-]?key|bank_account|routing_number)"\s*:/i);
assert.doesNotMatch(serializedServicePayload, /must-never-be-accepted|192\.0\.2\.55/i);

assert.equal(sentMessages.length, 3, "The worker must send separately to two active internal recipients and the carrier.");
assert.deepEqual(sentMessages.map((message) => message.to).sort(), [
  "carrier-test@example.com",
  "dispatch-test@hermeslogisticsus.com",
  "officeus@hermeslogisticsus.com",
]);
assert.ok(!sentMessages.some((message) => message.to === retiredRecipient), "Retired internal recipients must never receive contract email.");
for (const message of sentMessages) {
  assert.equal(message.from, "website@hermeslogisticsus.com");
  assert.equal(message.subject, "[HERMES CONTRACT] [CARRIER ONBOARDING]");
  assert.equal(message.replyTo, "carrier-test@example.com");
  assert.equal(message.attachments.length, 2);
  assert.equal(message.attachments[0].contentType, "application/pdf");
}

const fallbackRecipients = (await import("../workers/lead-email/src/index.mjs")).parseInternalRecipients({
  CARRIER_CONTRACT_INTERNAL_RECIPIENTS: retiredRecipient,
  SALES_DESTINATION: "officeus@hermeslogisticsus.com",
});
assert.deepEqual(fallbackRecipients, ["officeus@hermeslogisticsus.com"], "A retired-only recipient list must fall back to the active sales destination.");

const duplicate = await onRequest({ request: contractRequest(), env });
assert.equal(duplicate.status, 200);
assert.equal(duplicate.headers.get("X-Hermes-Delivery"), "delivered");
assert.equal(sentMessages.length, 3, "Idempotent duplicate must not send another email.");
assert.equal(serviceCalls.length, 1, "Idempotent duplicate must not call the email service again.");

const forbiddenPayload = {
  ...validPayload,
  request_id: "contract_forbidden_12345",
  password: "must-never-be-accepted",
};
const forbidden = await onRequest({
  request: contractRequest(forbiddenPayload, { "CF-Connecting-IP": "192.0.2.56" }),
  env: { ...env, LEAD_LIMITS: new MemoryKv() },
});
assert.equal(forbidden.status, 400);
assert.deepEqual(await forbidden.json(), { success: false, error: "invalid_contract_packet" });

const customPayload = {
  ...validPayload,
  request_id: "contract_custom_123456",
  selected_plan: "custom",
  custom_percentage: "7.25",
  custom_scope: "Hermes researches and negotiates loads; carrier handles final booking and all safety decisions.",
};
const customNormalized = normalizeInput(customPayload);
assert.ok(customNormalized);
assert.equal(customNormalized.percentage, "7.25% proposed - not approved");

const wrongTypedSignature = normalizeInput({ ...validPayload, typed_signature: "Someone Else" });
assert.equal(wrongTypedSignature, null);

const missingAuthority = normalizeInput({ ...validPayload, mc_number: "", usdot_number: "" });
assert.equal(missingAuthority, null);

const source = await (await import("node:fs/promises")).readFile(new URL("../functions/api/carrier-contract.ts", import.meta.url), "utf8");
assert.match(source, /contract\.plan !== "custom"/, "Custom proposals must never automatically enter live execution mode.");
assert.match(source, /master_document_hash_mismatch/, "The contract endpoint must verify the immutable master PDF hash.");
assert.doesNotMatch(source, /CARRIER_CONTRACT_INTERNAL_RECIPIENTS/, "The browser-facing contract endpoint must not receive or select internal recipients.");

for (const key of limits.values.keys()) {
  assert.doesNotMatch(key, /192\.0\.2\.55|contract_test_12345678|carrier-test@example\.com/);
}

console.log("Carrier contract PDF generation, retired-recipient filtering, controlled delivery, idempotency, and privacy tests passed.");
