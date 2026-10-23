import { pathToFileURL } from "node:url";

const SHA40 = /^[0-9a-f]{40}$/;

export const HAE_ACCEPTANCE_READ_ONLY_JOB_TYPES = Object.freeze([
  "system.health.snapshot",
  "history.coverage.audit",
  "history.source.normalize",
  "history.coverage.evaluate",
  "history.social.normalize",
  "history.experiment.evaluate",
]);
const READ_ONLY_JOB_TYPES = new Set(HAE_ACCEPTANCE_READ_ONLY_JOB_TYPES);

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function numberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function add(findings, code, message, detail = null) {
  findings.push({ code, severity: "BLOCKER", message, ...(detail ? { detail } : {}) });
}

function requireEvidenceRef(findings, object, code) {
  if (!nonEmpty(object?.evidence_ref)) {
    add(findings, code, "Durable evidence reference is required.");
  }
}

function checkQueueTransport(findings, value) {
  requireEvidenceRef(findings, value, "QUEUE_EVIDENCE_REF_MISSING");
  if (value?.exists !== true) {
    add(findings, "QUEUE_NOT_PROVEN", "queue must be proven to exist by the authorized Cloudflare readback.");
  }
  const backlog = numberOrNull(value?.backlog_count);
  if (backlog === null) {
    add(findings, "QUEUE_BACKLOG_UNKNOWN", "queue backlog_count must be known; UNKNOWN must never be coerced to zero.");
  } else if (backlog < 0) {
    add(findings, "QUEUE_BACKLOG_INVALID", "queue backlog_count cannot be negative.");
  }
}

function checkDlqTransport(findings, value) {
  requireEvidenceRef(findings, value, "DLQ_EVIDENCE_REF_MISSING");
  if (value?.exists !== true) {
    add(findings, "DLQ_NOT_PROVEN", "dlq must be proven to exist by the authorized Cloudflare readback.");
  }

  const backlog = numberOrNull(value?.backlog_count);
  if (backlog === null) {
    add(findings, "DLQ_BACKLOG_UNKNOWN", "dlq backlog_count must be known; UNKNOWN must never be coerced to zero.");
    return;
  }
  if (backlog < 0) {
    add(findings, "DLQ_BACKLOG_INVALID", "dlq backlog_count cannot be negative.");
    return;
  }
  if (backlog === 0) return;

  if (!nonEmpty(value?.classification_evidence_ref)) {
    add(findings, "DLQ_CLASSIFICATION_EVIDENCE_MISSING", "A non-empty DLQ requires a durable classification evidence reference.");
  }

  const classified = numberOrNull(value?.classified_count);
  const unclassified = numberOrNull(value?.unclassified_count);
  const currentCanary = numberOrNull(value?.current_canary_count);
  const blocking = numberOrNull(value?.blocking_count);

  if (classified === null || classified !== backlog) {
    add(findings, "DLQ_NOT_FULLY_CLASSIFIED", "Every current DLQ item must be classified before this gate can pass.", { backlog_count: backlog, classified_count: classified });
  }
  if (unclassified === null || unclassified !== 0) {
    add(findings, "DLQ_UNCLASSIFIED_ITEMS", "DLQ unclassified_count must be exactly 0.", { unclassified_count: unclassified });
  }
  if (currentCanary === null || currentCanary !== 0) {
    add(findings, "CANARY_PRESENT_IN_DLQ", "The current reliability canary must not be present in the DLQ.", { current_canary_count: currentCanary });
  }
  if (blocking === null || blocking !== 0) {
    add(findings, "DLQ_BLOCKING_ITEMS", "DLQ blocking_count must be exactly 0; classified unrelated historical quarantine may remain.", { blocking_count: blocking });
  }
}

export function evaluateHaeRuntimeEvidence(snapshot = {}) {
  const findings = [];
  const warnings = [];

  const targetSha = String(snapshot.target_sha || "").trim();
  if (!SHA40.test(targetSha)) {
    add(findings, "TARGET_SHA_INVALID", "target_sha must be an exact 40-character Git SHA.");
  }

  const deployment = snapshot.deployment || {};
  requireEvidenceRef(findings, deployment, "DEPLOYMENT_EVIDENCE_REF_MISSING");
  const deployedSha = String(deployment.source_sha || "").trim();
  if (!SHA40.test(deployedSha)) {
    add(findings, "DEPLOYED_SHA_INVALID", "deployment.source_sha must be an exact 40-character Git SHA.");
  }
  if (SHA40.test(targetSha) && SHA40.test(deployedSha) && targetSha !== deployedSha) {
    add(findings, "DEPLOYED_SHA_MISMATCH", "Deployed SHA must equal the owner-verified target SHA.", { target_sha: targetSha, deployed_sha: deployedSha });
  }

  const runtime = snapshot.runtime || {};
  if (runtime.publication_enabled !== false) {
    add(findings, "PUBLICATION_NOT_DISABLED", "Provider publication must remain explicitly disabled during the read-only reliability gate.");
  }
  if (String(runtime.automation_mode || "").trim().toLowerCase() !== "dry_run") {
    add(findings, "AUTOMATION_MODE_NOT_DRY_RUN", "The bounded reliability gate must run in dry_run mode.");
  }

  const health = snapshot.health || {};
  requireEvidenceRef(findings, health, "HEALTH_EVIDENCE_REF_MISSING");
  if (health.database !== "ok") {
    add(findings, "DATABASE_HEALTH_NOT_OK", "Private health must report database=ok.");
  }
  if (SHA40.test(targetSha) && String(health.source_sha || "").trim() !== targetSha) {
    add(findings, "HEALTH_SOURCE_SHA_MISMATCH", "Private health source_sha must match the owner-verified target SHA.");
  }
  if (String(health.automation_mode || "").trim().toLowerCase() !== "dry_run") {
    add(findings, "HEALTH_MODE_NOT_DRY_RUN", "Private health must read back automation_mode=dry_run.");
  }
  if (health.publication_enabled !== false) {
    add(findings, "HEALTH_PUBLICATION_NOT_DISABLED", "Private health must read back publication_enabled=false.");
  }

  const transport = snapshot.transport || {};
  checkQueueTransport(findings, transport.queue || {});
  checkDlqTransport(findings, transport.dlq || {});

  const heartbeat = health.last_cron_wake || {};
  if (!nonEmpty(heartbeat.scheduled_at) || !Number.isFinite(Date.parse(heartbeat.scheduled_at))) {
    add(findings, "CRON_HEARTBEAT_MISSING", "A durable cron heartbeat with scheduled_at is required.");
  }
  if (heartbeat.publication_enabled !== false) {
    add(findings, "HEARTBEAT_PUBLICATION_GATE_MISMATCH", "The observed heartbeat must prove publication remained disabled.");
  }
  if (String(heartbeat.automation_mode || "").trim().toLowerCase() !== "dry_run") {
    add(findings, "HEARTBEAT_MODE_NOT_DRY_RUN", "The observed heartbeat must prove automation_mode=dry_run.");
  }
  if (SHA40.test(targetSha) && heartbeat.source_sha !== targetSha) {
    add(findings, "HEARTBEAT_SOURCE_SHA_MISMATCH", "Heartbeat source_sha must match the owner-verified target SHA.");
  }

  const job = snapshot.read_only_job || {};
  requireEvidenceRef(findings, job, "READ_ONLY_JOB_EVIDENCE_REF_MISSING");
  if (!nonEmpty(job.job_id)) {
    add(findings, "READ_ONLY_JOB_ID_MISSING", "Read-only canary must have a durable job_id.");
  }
  if (!nonEmpty(job.idempotency_key)) {
    add(findings, "IDEMPOTENCY_KEY_MISSING", "Read-only canary must have an explicit idempotency_key.");
  }
  const jobType = String(job.job_type || "").trim();
  if (!jobType) {
    add(findings, "READ_ONLY_JOB_TYPE_MISSING", "Read-only canary receipt must include job_type.");
  } else if (!READ_ONLY_JOB_TYPES.has(jobType)) {
    add(findings, "READ_ONLY_JOB_TYPE_NOT_ALLOWLISTED", "Canary job_type must match the current HAE read-only generic allowlist.", { job_type: jobType });
  }
  if (String(job.permission_class || "").toUpperCase() !== "READ_ONLY") {
    add(findings, "CANARY_NOT_READ_ONLY", "Acceptance canary must be classified READ_ONLY.");
  }
  if (String(job.state || "").toUpperCase() !== "SUCCEEDED") {
    add(findings, "READ_ONLY_JOB_NOT_SUCCEEDED", "Read-only canary must have the canonical terminal SUCCEEDED receipt.");
  }
  const jobAttemptCount = numberOrNull(job.attempt_count);
  if (jobAttemptCount !== 1) {
    add(findings, "READ_ONLY_JOB_ATTEMPT_COUNT_INVALID", "Read-only canary must execute exactly once.", { attempt_count: jobAttemptCount });
  }
  if (job.external_write !== false) {
    add(findings, "READ_ONLY_JOB_EXTERNAL_WRITE_UNPROVEN", "Read-only canary must explicitly prove external_write=false.");
  }

  const replay = snapshot.replay || {};
  requireEvidenceRef(findings, replay, "REPLAY_EVIDENCE_REF_MISSING");
  if (!nonEmpty(replay.idempotency_key)) {
    add(findings, "REPLAY_IDEMPOTENCY_KEY_MISSING", "Replay evidence must include the exact idempotency key.");
  }
  if (replay.same_idempotency_key !== true) {
    add(findings, "REPLAY_KEY_CHANGED", "Replay must use the exact same idempotency key.");
  }
  if (replay.reused_existing_job !== true) {
    add(findings, "REPLAY_DID_NOT_REUSE_JOB", "Replay must resolve to the existing logical job rather than create a second execution.");
  }
  const duplicateExecutions = numberOrNull(replay.duplicate_execution_count);
  if (duplicateExecutions !== 0) {
    add(findings, "DUPLICATE_EXECUTION_DETECTED", "Replay must prove duplicate_execution_count=0.", { duplicate_execution_count: duplicateExecutions });
  }
  const duplicateSuppressedReceipts = numberOrNull(replay.duplicate_suppressed_receipt_count);
  if (duplicateSuppressedReceipts === null || duplicateSuppressedReceipts < 1) {
    add(findings, "DUPLICATE_SUPPRESSION_RECEIPT_MISSING", "Replay must leave at least one durable job.duplicate_suppressed receipt.", { duplicate_suppressed_receipt_count: duplicateSuppressedReceipts });
  }
  if (replay.second_external_side_effect !== false) {
    add(findings, "SECOND_EXTERNAL_SIDE_EFFECT_UNPROVEN", "Replay must explicitly prove second_external_side_effect=false.");
  }
  if (nonEmpty(job.idempotency_key) && nonEmpty(replay.idempotency_key) && replay.idempotency_key !== job.idempotency_key) {
    add(findings, "REPLAY_JOB_KEY_MISMATCH", "Replay evidence key must equal the original read-only job idempotency key.");
  }

  const qa = snapshot.independent_qa || {};
  requireEvidenceRef(findings, qa, "INDEPENDENT_QA_EVIDENCE_REF_MISSING");
  if (String(qa.status || "").toUpperCase() !== "PASS") {
    add(findings, "INDEPENDENT_QA_NOT_PASS", "Independent QA must explicitly PASS the bounded evidence package.");
  }
  if (qa.independent_from_executor !== true) {
    add(findings, "QA_INDEPENDENCE_NOT_ATTESTED", "QA must be independent from the executor that produced the evidence.");
  }
  if (!nonEmpty(qa.reviewer)) {
    add(findings, "QA_REVIEWER_MISSING", "Independent QA reviewer identity/reference is required.");
  }

  if (snapshot.claimed_state && String(snapshot.claimed_state).toUpperCase() === "BUSINESS_VERIFIED") {
    warnings.push({
      code: "BUSINESS_VERIFIED_OUT_OF_SCOPE",
      message: "This gate validates runtime reliability evidence only; it cannot establish business outcome verification."
    });
  }

  return {
    status: findings.length ? "BLOCKED" : "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
    blockers: findings,
    warnings,
    note: "This checker validates completeness/consistency of supplied evidence. It never independently proves DEPLOYED, LIVE_VERIFIED, BUSINESS_VERIFIED, or authorizes merge/deploy.",
  };
}

async function readSnapshot(path) {
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile(path, "utf8"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: node scripts/hae-runtime-evidence-check.mjs <evidence.json>");
    process.exit(2);
  }
  try {
    const result = evaluateHaeRuntimeEvidence(await readSnapshot(path));
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW" ? 0 : 1);
  } catch {
    console.error(JSON.stringify({ status: "BLOCKED", error: "invalid_evidence_input" }));
    process.exit(2);
  }
}
