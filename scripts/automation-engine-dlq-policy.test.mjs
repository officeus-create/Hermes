import assert from "node:assert/strict";
import { classifyDlqDisposition } from "../workers/automation-engine/src/dlq-policy.mjs";

assert.deepEqual(
  classifyDlqDisposition({ message_type: "job.execute", d1_state: "QUEUED", idempotency_key: "k1", external_effect: false }),
  { disposition: "SAFE_REDRIVE", reason: "read_only_retryable" }
);

assert.deepEqual(
  classifyDlqDisposition({ message_type: "job.execute", d1_state: "SUCCEEDED", idempotency_key: "k-success", external_effect: false }),
  { disposition: "QUARANTINE", reason: "terminal_state_no_replay" }
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

for (const providerOutcome of [undefined, null, ""]) {
  assert.equal(
    classifyDlqDisposition({
      message_type: "publication.write",
      d1_state: "reserved",
      idempotency_key: `k-missing-provider-${String(providerOutcome)}`,
      external_effect: true,
      ...(providerOutcome !== undefined ? { provider_outcome: providerOutcome } : {}),
    }).disposition,
    "OWNER_ACTION"
  );
}

assert.equal(
  classifyDlqDisposition({
    message_type: "publication.write",
    d1_state: "reserved",
    idempotency_key: "k-explicit-none",
    external_effect: true,
    provider_outcome: "NONE",
  }).disposition,
  "SAFE_REDRIVE"
);

assert.equal(
  classifyDlqDisposition({
    message_type: "publication.write",
    d1_state: "publishing",
    idempotency_key: "k2b",
    external_effect: true,
    provider_outcome: "NONE",
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

assert.deepEqual(
  classifyDlqDisposition({ message_type: "job.execute", d1_state: "QUEUED", idempotency_key: "k-unknown-effect" }),
  { disposition: "OWNER_ACTION", reason: "external_effect_unknown" }
);

assert.deepEqual(
  classifyDlqDisposition({ message_type: "unknown.job", d1_state: "QUEUED", idempotency_key: "k-unknown-type", external_effect: false }),
  { disposition: "OWNER_ACTION", reason: "message_type_untrusted" }
);

assert.deepEqual(
  classifyDlqDisposition({ message_type: "publication.write", d1_state: "QUEUED", idempotency_key: "k-write-unknown", external_effect: false }),
  { disposition: "OWNER_ACTION", reason: "external_write_classification_ambiguous" }
);

assert.deepEqual(
  classifyDlqDisposition({ message_type: "job.execute", d1_state: "QUEUED", idempotency_key: "k-read-only", external_effect: false }),
  { disposition: "SAFE_REDRIVE", reason: "read_only_retryable" }
);

for (const state of ["provider_accepted_readback_pending", "unknown_outcome_readback_pending"]) {
  assert.deepEqual(
    classifyDlqDisposition({
      message_type: "publication.readback",
      d1_state: state,
      idempotency_key: `readback-${state}`,
      external_effect: false,
    }),
    { disposition: "SAFE_REDRIVE", reason: "readback_retryable" },
  );
}

assert.deepEqual(
  classifyDlqDisposition({ message_type: "publication.write", d1_state: "reserved", idempotency_key: "k-write-proven", external_effect: true, provider_outcome: "NONE" }),
  { disposition: "OWNER_ACTION", reason: "external_write_redrive_handler_unavailable" }
);

assert.deepEqual(
  classifyDlqDisposition({ message_type: "job.execute", idempotency_key: "k-missing-state", external_effect: false }),
  { disposition: "OWNER_ACTION", reason: "d1_state_missing" }
);

console.log("HAE DLQ policy contract PASS");
