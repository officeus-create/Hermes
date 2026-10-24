import assert from "node:assert/strict";
import { reconcileExternalReceipt } from "../workers/automation-engine/src/reconciliation-policy.mjs";

assert.deepEqual(
  reconcileExternalReceipt({
    receipt: { provider_id: "p1", permalink: "https://example.test/p1", content_hash: "h1" },
    provider: { read_supported: true, read_ok: true, found: true, provider_id: "p1", permalink: "https://example.test/p1", content_hash: "h1" },
  }),
  { status: "CONSISTENT", action: "NONE", reason: "receipt_matches_provider" }
);

assert.deepEqual(
  reconcileExternalReceipt({
    receipt: {},
    provider: { read_supported: true, read_ok: true, found: true, provider_id: "p1" },
  }),
  { status: "UNKNOWN", action: "REVIEW", reason: "receipt_identity_missing" }
);

for (const sample of [
  { provider: { read_supported: false }, expected: "UNKNOWN" },
  { provider: { read_supported: true, read_ok: false }, expected: "UNKNOWN" },
  { provider: { read_supported: true, read_ok: true, found: false }, expected: "DRIFT" },
  { provider: { read_supported: true, read_ok: true, found: true }, expected: "UNKNOWN" },
  { provider: { read_supported: true, read_ok: true, found: true, provider_id: "p2" }, expected: "DRIFT" },
]) {
  const result = reconcileExternalReceipt({ receipt: { provider_id: "p1" }, provider: sample.provider });
  assert.equal(result.status, sample.expected);
  assert.notEqual(result.action, "REPUBLISH");
  assert.notEqual(result.action, "RESEND");
}

for (const field of ["permalink", "content_hash"]) {
  const receipt = { provider_id: "p1", [field]: "expected" };
  const provider = { read_supported: true, read_ok: true, found: true, provider_id: "p1" };
  assert.equal(reconcileExternalReceipt({ receipt, provider }).status, "UNKNOWN", `Missing ${field} must not be CONSISTENT`);
}

console.log("HAE reconciliation policy contract PASS");
