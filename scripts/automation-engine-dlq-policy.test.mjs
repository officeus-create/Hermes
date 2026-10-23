import assert from "node:assert/strict";
import { classifyDlqDisposition } from "../workers/automation-engine/src/dlq-policy.mjs";

assert.deepEqual(
  classifyDlqDisposition({ message_type: "job.execute", d1_state: "QUEUED", idempotency_key: "k1", external_effect: false }),
  { disposition: "SAFE_REDRIVE", reason: "read_only_retryable" }
);

assert.equal(
  classifyDlqDisposition({
    message_type: "publication.write",
    d1_state: "publishing",
    idempotency_key: "k2",
    external_effect: true,
    provider_outcome: "UNKNOWN",
  }).disposition,
  "READBACK_ONLY"
);

assert.equal(
  classifyDlqDisposition({
    message_type: "publication.write",
    d1_state: "reserved",
    idempotency_key: "k3",
    external_effect: true,
    provider_outcome: "NONE",
  }).disposition,
  "SAFE_REDRIVE"
);

assert.equal(
  classifyDlqDisposition({
    message_type: "publication.write",
    d1_state: "published_verified",
    idempotency_key: "k4",
    external_effect: true,
    provider_outcome: "VERIFIED",
  }).disposition,
  "QUARANTINE"
);

assert.equal(
  classifyDlqDisposition({ message_type: "job.execute", d1_state: "QUEUED", external_effect: false }).disposition,
  "QUARANTINE"
);

console.log("HAE DLQ policy contract PASS");
