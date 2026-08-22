import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { onRequest as contractHandler } from "../functions/api/carrier-contract.ts";

// Issue #280 is the governing activation boundary. Until qualified Wisconsin
// transportation counsel approval is recorded, every carrier-contract path must
// fail closed to a signed review/onboarding packet and never return execution.

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const reviewPath = "/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf";
const executionPath = "/contracts/Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf";
const reviewBytes = await readFile(new URL(`../public${reviewPath}`, import.meta.url));
assert.equal(sha256(reviewBytes), "9d26436b95b63610179f3af9ac4cddf5df59a1610e402bad2162ef394951d5cb");

const deliveryCalls = [];
const makeEnv = (limits = new MemoryKv()) => ({
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  ASSETS: {
    async fetch(input) {
      const pathname = new URL(input instanceof Request ? input.url : String(input)).pathname;
      assert.equal(pathname, reviewPath, "Containment must never request the execution master.");
      return new Response(reviewBytes, { status: 200, headers: { "Content-Type": "application/pdf" } });
    },
  },
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: "synthetic-review-delivery-token-long-enough",
  LEAD_LIMITS: limits,
  LEAD_EMAIL_SERVICE: {
    async fetch(_input, init) {
      deliveryCalls.push(JSON.parse(String(init?.body ?? "{}")));
      return Response.json({
        ok: true,
        carrier_copy: "delivered",
        delivery_ledger: { required_internal: { status: "delivered" }, carrier: { status: "delivered" } },
      });
    },
  },
  // Hostile or stale production configuration must not bypass Issue #280.
  CARRIER_CONTRACT_MODE: "live",
  CARRIER_CONTRACT_APPROVED_VERSION: "HERMES-CARRIER-EXECUTION-V2026-08-06",
  CARRIER_CONTRACT_APPROVED_PDF_PATH: executionPath,
  CARRIER_CONTRACT_APPROVED_PDF_SHA256: "a".repeat(64),
  CARRIER_CONTRACT_ALLOWED_PERCENTAGES: "6,8",
});

const signature = `data:image/jpeg;base64,${Buffer.alloc(900, 31).toString("base64")}`;
const makePayload = (plan, percentage, requestId) => ({
  request_id: requestId,
  selected_plan: plan,
  service_percentage: percentage,
  custom_scope: plan === "custom" ? "Synthetic review-only scope; carrier retains final booking, safety, and operating decisions." : "",
  legal_company_name: "TEST Review Carrier LLC",
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
  signature_jpeg: signature,
  signature_width: 600,
  signature_height: 180,
  consent_electronic_records: true,
  consent_authority: true,
  consent_document_review: true,
  consent_selected_scope: true,
  submitted_at: "2026-08-22T12:00:00.000Z",
});
const makeRequest = (payload, body = JSON.stringify(payload)) => new Request("https://hermeslogisticsus.com/api/carrier-contract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": payload.request_id,
    Origin: "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.180",
    "User-Agent": "Hermes Issue 280 containment test",
  },
  body,
});

for (const [plan, percentage, requestId] of [
  ["essential", "6", "contract_review_6_percent"],
  ["pro", "8", "contract_review_8_percent"],
  ["custom", "7.25", "contract_review_custom"],
]) {
  const response = await contractHandler({ request: makeRequest(makePayload(plan, percentage, requestId)), env: makeEnv() });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Hermes-Document-Mode"), "review");
  assert.match(response.headers.get("Content-Disposition") ?? "", /Signed_Review_Packet/);
  assert.match(Buffer.from(await response.arrayBuffer()).toString("latin1"), /SIGNED REVIEW PACKET/);
}
assert.equal(deliveryCalls.length, 3);
for (const call of deliveryCalls) {
  assert.match(call.text, /Document mode: review/);
  assert.match(call.text, /signed review packet/i);
  assert.doesNotMatch(call.text, /execution package/i);
}

const quarantinedPayload = makePayload("pro", "8", "contract_existing_live_record");
const quarantinedBody = JSON.stringify(quarantinedPayload);
const quarantineLimits = new MemoryKv();
await quarantineLimits.put(`contract:id:${sha256(quarantinedPayload.request_id)}`, JSON.stringify({
  pdf_base64: Buffer.from("historical-live-record-preserved").toString("base64"),
  filename: "historical.pdf",
  delivery: "delivered",
  internal_delivery: "delivered",
  carrier_copy: "delivered",
  pdf_sha: "b".repeat(64),
  mode: "live",
  request_payload_sha256: sha256(quarantinedBody),
}));
const quarantinedResponse = await contractHandler({
  request: makeRequest(quarantinedPayload, quarantinedBody),
  env: makeEnv(quarantineLimits),
});
assert.equal(quarantinedResponse.status, 409);
assert.deepEqual(await quarantinedResponse.json(), {
  success: false,
  error: "execution_record_quarantined_pending_legal_review",
});

const backend = await readFile(new URL("../functions/api/carrier-contract.ts", import.meta.url), "utf8");
assert.match(backend, /const LEGAL_EXECUTION_APPROVED = false/);
assert.match(backend, /Issue #280 is the governing activation boundary/);
assert.match(backend, /LEGAL_EXECUTION_APPROVED&&requestedMode==="live"/);
assert.match(backend, /execution_record_quarantined_pending_legal_review/);
await assert.rejects(access(new URL("../functions/api/_middleware.js", import.meta.url)));

const publicSources = await Promise.all([
  "../src/pages/carrier/index.astro",
  "../src/pages/sign/index.astro",
  "../src/pages/logistics/carrier-agreement/index.astro",
  "../src/pages/logistics/carrier-onboarding/index.astro",
  "../src/pages/logistics/carrier-offer/index.astro",
  "../src/pages/contracts/carrier-agreement-v3/index.astro",
].map((relative) => readFile(new URL(relative, import.meta.url), "utf8")));
const activePublicCopy = publicSources.join("\n");
for (const prohibited of [
  "Approved production execution master",
  "Approved execution agreement",
  "live execution packet",
  'data-esign-mode="live"',
  executionPath,
]) assert.ok(!activePublicCopy.includes(prohibited), `Public carrier copy still exposes: ${prohibited}`);
assert.match(activePublicCopy, /Review\/onboarding only/);
assert.match(activePublicCopy, /approval gates tracked by #280/);

await assert.rejects(access(new URL(`../public${executionPath}`, import.meta.url)));
const redirects = await readFile(new URL("../public/_redirects", import.meta.url), "utf8");
assert.match(redirects, /Hermes_Carrier_Agreement_EXECUTION_v2026-08-06\.pdf \/contracts\/carrier-agreement-v3\/ 302/);

console.log("Issue #280 containment passed: standard 6%, standard 8%, custom, stale live configuration, cached live records, public copy, and active contract asset all fail closed to review/onboarding.");
