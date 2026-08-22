import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { onRequest as contractHandler } from "../functions/api/carrier-contract.ts";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
}

const reviewPath = "/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf";
const reviewBytes = await readFile(new URL(`../public${reviewPath}`, import.meta.url));
const reviewSha = createHash("sha256").update(reviewBytes).digest("hex");
assert.equal(reviewSha, "9d26436b95b63610179f3af9ac4cddf5df59a1610e402bad2162ef394951d5cb");
const limits = new MemoryKv();
let serviceCalls = 0;
const env = {
  ALLOWED_ORIGIN: "https://hermeslogisticsus.com",
  ASSETS: {
    async fetch() {
      return new Response(reviewBytes, { status: 200, headers: { "Content-Type": "application/pdf" } });
    },
  },
  LEAD_DELIVERY_MODE: "live",
  LEAD_SERVICE_TOKEN: "synthetic-reliability-token-long-enough",
  LEAD_LIMITS: limits,
  LEAD_EMAIL_SERVICE: {
    async fetch() {
      serviceCalls += 1;
      if (serviceCalls === 1) {
        return Response.json({ ok: false, error: "provider_unavailable" }, { status: 503 });
      }
      return Response.json({
        ok: true,
        carrier_copy: "download_only",
        delivery_ledger: {
          required_internal: { status: "delivered", count: 1, attempts: 1 },
          carrier: { status: "download_only", attempts: 1, error: "provider_configuration" },
          attempted_at: "2026-08-14T15:00:00.000Z",
        },
      }, { status: 202 });
    },
  },
  CARRIER_CONTRACT_MODE: "review",
};

const payload = {
  request_id: "contract_reliability_20260814",
  selected_plan: "essential",
  service_percentage: "6",
  custom_scope: "",
  legal_company_name: "TEST Reliability Carrier LLC",
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
  signature_jpeg: `data:image/jpeg;base64,${Buffer.alloc(900, 29).toString("base64")}`,
  signature_width: 600,
  signature_height: 180,
  consent_electronic_records: true,
  consent_authority: true,
  consent_document_review: true,
  consent_selected_scope: true,
  submitted_at: "2026-08-14T15:00:00.000Z",
};
const body = JSON.stringify(payload);
const request = (requestBody = body) => new Request("https://hermeslogisticsus.com/api/carrier-contract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": payload.request_id,
    Origin: "https://hermeslogisticsus.com",
    "CF-Connecting-IP": "192.0.2.91",
    "User-Agent": "Hermes reliability test",
  },
  body: requestBody,
});

const first = await contractHandler({ request: request(), env });
assert.equal(first.status, 202);
assert.equal(first.headers.get("X-Hermes-Delivery"), "pending");
assert.equal(first.headers.get("X-Hermes-Internal-Delivery"), "pending");
assert.equal(first.headers.get("X-Hermes-Carrier-Copy"), "pending");
assert.equal(first.headers.get("X-Hermes-Document-Mode"), "review");
assert.equal(serviceCalls, 1);

const retry = await contractHandler({ request: request(), env });
assert.equal(retry.status, 200);
assert.equal(retry.headers.get("X-Hermes-Delivery"), "delivered");
assert.equal(retry.headers.get("X-Hermes-Internal-Delivery"), "delivered");
assert.equal(retry.headers.get("X-Hermes-Carrier-Copy"), "download_only");
assert.equal(retry.headers.get("X-Hermes-Document-Mode"), "review");
assert.equal(serviceCalls, 2);

const duplicate = await contractHandler({ request: request(), env });
assert.equal(duplicate.status, 200);
assert.equal(duplicate.headers.get("X-Hermes-Carrier-Copy"), "download_only");
assert.equal(serviceCalls, 2, "A completed internal delivery must not send duplicate contract emails.");

const changedBody = JSON.stringify({ ...payload, signer_phone: "+1 414 555 0199" });
const mismatched = await contractHandler({ request: request(changedBody), env });
assert.equal(mismatched.status, 409);
assert.deepEqual(await mismatched.json(), { success: false, error: "idempotency_key_payload_mismatch" });
assert.equal(serviceCalls, 2);

const storedRecord = [...limits.values.values()].map((value) => {
  try { return JSON.parse(value); } catch { return null; }
}).find((value) => value?.pdf_base64);
assert.equal(storedRecord.internal_delivery, "delivered");
assert.equal(storedRecord.carrier_copy, "download_only");
assert.equal(storedRecord.delivery_attempts, 2);
assert.match(storedRecord.request_payload_sha256, /^[a-f0-9]{64}$/);
assert.ok(storedRecord.last_delivery_attempt_at);

console.log("Carrier review-packet reliability passed: pending deliveries retry, completed deliveries dedupe, carrier-copy status stays explicit, and idempotency payload reuse is rejected.");
