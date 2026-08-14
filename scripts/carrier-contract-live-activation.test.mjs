import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { onRequest as contractHandler } from "../functions/api/carrier-contract.ts";
import { onRequest as liveConfigMiddleware } from "../functions/api/_middleware.js";
import contractEmailWorker from "../workers/lead-email/src/index.mjs";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const executionPath = "/contracts/Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf";
const executionVersion = "HERMES-CARRIER-EXECUTION-V2026-08-06";
const executionBytes = await readFile(new URL(`../public${executionPath}`, import.meta.url));
const executionSha = createHash("sha256").update(executionBytes).digest("hex");
assert.equal(executionSha, "ac35ae765617010dd7551b4a22537b32715923c49601d9aac1f21bbb5e0904a8");
const reviewPath = "/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf";
const reviewBytes = await readFile(new URL(`../public${reviewPath}`, import.meta.url));

const serviceToken = "synthetic-contract-service-token-long-enough";
const sentMessages = [];
const workerEnv = {
  LEAD_SERVICE_TOKEN: serviceToken,
  SALES_DESTINATION: "officeus@hermeslogisticsus.com",
  SALES_SENDER: "website@hermeslogisticsus.com",
  EMAIL: {
    async send(message) {
      sentMessages.push(message);
      return { messageId: `live-contract-${sentMessages.length}` };
    },
  },
};

const serviceBinding = {
  async fetch(input, init) {
    const request = input instanceof Request ? input : new Request(input, init);
    return contractEmailWorker.fetch(request, workerEnv);
  },
};

const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  ASSETS: {
    async fetch(input) {
      const url = new URL(input instanceof Request ? input.url : String(input));
      if (url.pathname === executionPath) {
        return new Response(executionBytes, { status: 200, headers: { "Content-Type": "application/pdf" } });
      }
      if (url.pathname === reviewPath) {
        return new Response(reviewBytes, { status: 200, headers: { "Content-Type": "application/pdf" } });
      }
      throw new Error(`Unexpected contract asset: ${url.pathname}`);
    },
  },
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: serviceToken,
  LEAD_LIMITS: new MemoryKv(),
  LEAD_EMAIL_SERVICE: serviceBinding,
};

await liveConfigMiddleware({
  request: new Request("https://hermeslogisticsus.com/api/carrier-contract"),
  env,
  next: async () => new Response("configured"),
});
assert.equal(env.CARRIER_CONTRACT_MODE, "live");
assert.equal(env.CARRIER_CONTRACT_APPROVED_VERSION, executionVersion);
assert.equal(env.CARRIER_CONTRACT_APPROVED_PDF_PATH, executionPath);
assert.equal(env.CARRIER_CONTRACT_APPROVED_PDF_SHA256, executionSha);
assert.equal(env.CARRIER_CONTRACT_ALLOWED_PERCENTAGES, "6,8");

const signatureBytes = Buffer.alloc(900, 23);
const payload = {
  request_id: "contract_live_20260814_test",
  selected_plan: "pro",
  service_percentage: "8",
  custom_scope: "",
  legal_company_name: "TEST Live Carrier LLC",
  dba_name: "",
  mc_number: "123456",
  usdot_number: "9876543",
  company_website: "https://carrier.example.com",
  signer_name: "Test Authorized Signer",
  signer_title: "Owner",
  signer_email: "carrier-test@example.com",
  signer_phone: "+1 414 555 0101",
  sales_contact: "TEST",
  offer_code: "",
  typed_signature: "Test Authorized Signer",
  signature_jpeg: `data:image/jpeg;base64,${signatureBytes.toString("base64")}`,
  signature_width: 600,
  signature_height: 180,
  consent_electronic_records: true,
  consent_authority: true,
  consent_document_review: true,
  consent_selected_scope: true,
  submitted_at: "2026-08-14T13:00:00.000Z",
};
const request = new Request("https://hermeslogisticsus.com/api/carrier-contract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": payload.request_id,
    "Origin": "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.88",
    "User-Agent": "Hermes live activation synthetic test",
  },
  body: JSON.stringify(payload),
});

const response = await contractHandler({ request, env });
assert.equal(response.status, 200);
assert.equal(response.headers.get("X-Hermes-Document-Mode"), "live");
assert.equal(response.headers.get("X-Hermes-Delivery"), "delivered");
assert.match(response.headers.get("Content-Disposition") ?? "", /Signed_Appendix_A/);

assert.equal(sentMessages.length, 2);
assert.deepEqual(sentMessages.map((message) => message.to).sort(), [
  "carrier-test@example.com",
  "officeus@hermeslogisticsus.com",
]);
for (const message of sentMessages) {
  assert.equal(message.subject, "[HERMES CONTRACT] [CARRIER ONBOARDING]");
  assert.equal(message.attachments.length, 2);
}
assert.match(sentMessages[0].text, /Document mode: live/);
assert.match(sentMessages[0].text, /Carrier-specific percentage: 8%/);
assert.match(sentMessages[0].text, /execution package/i);

const customEnv = { ...env, LEAD_LIMITS: new MemoryKv() };
const customPayload = {
  ...payload,
  request_id: "contract_custom_20260814_test",
  selected_plan: "custom",
  service_percentage: "7.25",
  custom_scope: "Hermes may research and negotiate; custom commercial terms remain pending written Hermes approval.",
};
const customRequest = new Request("https://hermeslogisticsus.com/api/carrier-contract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": customPayload.request_id,
    "Origin": "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.89",
    "User-Agent": "Hermes custom proposal synthetic test",
  },
  body: JSON.stringify(customPayload),
});
const customResponse = await contractHandler({ request: customRequest, env: customEnv });
assert.equal(customResponse.headers.get("X-Hermes-Document-Mode"), "review");

console.log("Carrier contract live activation passed: immutable execution master, 6/8 live gate, internal main-email delivery, carrier copy, and custom-plan review fallback verified.");
