import { pathToFileURL } from "node:url";

/**
 * Fail-closed checker for the HAE owner-work read-only readback evidence.
 *
 * The checker never trusts a claimed verdict: it recomputes the execution
 * verdict from the durable rows that were read back out of the canonical D1
 * and compares the recomputation with what the evidence claims. A mismatch is
 * a blocker, not a warning.
 *
 * This checker validates completeness/consistency of supplied evidence only.
 * It never proves DEPLOYED, LIVE_VERIFIED or BUSINESS_VERIFIED and never
 * authorizes merge/deploy.
 */

const SHA40 = /^[0-9a-f]{40}$/;
const FINGERPRINT = /^sha256:[0-9a-f]{64}$/;
const JOB_STATE = /^[A-Z][A-Z0-9_]*$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/;

export const OWNER_WORK_ITEM_STATUSES = Object.freeze([
  "planned",
  "ready",
  "in_progress",
  "blocked",
  "done",
  "cancelled",
]);

export const OWNER_WORK_ITEM_PRIORITIES = Object.freeze(["p0", "p1", "p2", "p3"]);

export const OWNER_WORK_ACCEPTANCE_STATUSES = Object.freeze([
  "not_required",
  "awaiting",
  "accepted",
]);

export const OWNER_WORK_DISPATCH_STATES = Object.freeze([
  "UNCLAIMED",
  "PLAN_RESERVING",
  "PLAN_QUEUED",
  "RETRY_READY",
  "PLAN_FAILED",
  "EXECUTION_QUEUED",
  "EXECUTION_SUCCEEDED",
  "EXECUTION_FAILED",
  "REVENUE_CYCLE_SUCCEEDED",
  "REVENUE_NEEDS_CAPABILITY",
]);

export const OWNER_WORK_SUCCESS_DISPATCH_STATES = Object.freeze([
  "EXECUTION_SUCCEEDED",
  "REVENUE_CYCLE_SUCCEEDED",
]);

export const OWNER_WORK_PLAN_KEY_PREFIX = "hae:owner-work-plan:";
export const OWNER_WORK_EXEC_KEY_PREFIX = "hae:owner-work-exec:";

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function numberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function isInteger(value) {
  const parsed = numberOrNull(value);
  return parsed !== null && Number.isInteger(parsed);
}

function add(findings, code, message, detail = null) {
  findings.push({ code, severity: "BLOCKER", message, ...(detail ? { detail } : {}) });
}

function warn(findings, code, message, detail = null) {
  findings.push({ code, severity: "WARNING", message, ...(detail ? { detail } : {}) });
}

function requireEvidenceRef(findings, object, code) {
  if (!nonEmpty(object?.evidence_ref)) {
    add(findings, code, "Durable evidence reference is required.");
  }
}

function checkTimestamp(findings, value, code, { required = true } = {}) {
  if (value === null || value === undefined || value === "") {
    if (required) add(findings, code, "A required timestamp is missing.");
    return null;
  }
  if (!nonEmpty(value) || !ISO_TIMESTAMP.test(value)) {
    add(findings, code, "Timestamp must be a UTC ISO-8601 instant.", { value: String(value) });
    return null;
  }
  return Date.parse(value);
}

function checkItem(findings, item, index) {
  const at = `items[${index}]`;
  if (!item || typeof item !== "object") {
    add(findings, "OWNER_WORK_ITEM_INVALID", "Owner-work item row must be an object.", { at });
    return;
  }
  if (!nonEmpty(item.id)) {
    add(findings, "OWNER_WORK_ITEM_ID_MISSING", "Owner-work item id is required.", { at });
  }
  if (!OWNER_WORK_ITEM_STATUSES.includes(item.status)) {
    add(findings, "OWNER_WORK_ITEM_STATUS_UNKNOWN", "Owner-work item status is outside the known vocabulary.", {
      at,
      status: String(item.status),
    });
  }
  if (!OWNER_WORK_ITEM_PRIORITIES.includes(item.priority)) {
    add(findings, "OWNER_WORK_ITEM_PRIORITY_UNKNOWN", "Owner-work item priority is outside the known vocabulary.", {
      at,
      priority: String(item.priority),
    });
  }
  if (!OWNER_WORK_ACCEPTANCE_STATUSES.includes(item.acceptance_status)) {
    add(findings, "OWNER_WORK_ITEM_ACCEPTANCE_UNKNOWN", "Owner-work item acceptance_status is outside the known vocabulary.", {
      at,
      acceptance_status: String(item.acceptance_status),
    });
  }
  if (item.hae_dispatch_state !== null && item.hae_dispatch_state !== undefined) {
    if (!OWNER_WORK_DISPATCH_STATES.includes(item.hae_dispatch_state)) {
      add(findings, "OWNER_WORK_DISPATCH_STATE_UNKNOWN", "Owner-work dispatch state is outside the known vocabulary.", {
        at,
        hae_dispatch_state: String(item.hae_dispatch_state),
      });
    }
  }
  checkTimestamp(findings, item.updated_at, "OWNER_WORK_ITEM_UPDATED_AT_INVALID", { required: false });
}

function checkJob(findings, job, index) {
  const at = `owner_work_jobs[${index}]`;
  if (!job || typeof job !== "object") {
    add(findings, "OWNER_WORK_JOB_INVALID", "Owner-work job row must be an object.", { at });
    return;
  }
  if (!nonEmpty(job.job_id)) {
    add(findings, "OWNER_WORK_JOB_ID_MISSING", "Owner-work job job_id is required.", { at });
  }
  if (!nonEmpty(job.job_type)) {
    add(findings, "OWNER_WORK_JOB_TYPE_MISSING", "Owner-work job job_type is required.", { at });
  }
  if (!nonEmpty(job.idempotency_key) || !job.idempotency_key.startsWith(OWNER_WORK_PLAN_KEY_PREFIX)) {
    if (!nonEmpty(job.idempotency_key) || !job.idempotency_key.startsWith(OWNER_WORK_EXEC_KEY_PREFIX)) {
      add(findings, "OWNER_WORK_JOB_KEY_SCHEME_UNKNOWN", "Owner-work job idempotency_key must use a known owner-work key scheme.", {
        at,
        idempotency_key: String(job.idempotency_key),
      });
    }
  }
  if (!nonEmpty(job.state) || !JOB_STATE.test(job.state)) {
    add(findings, "OWNER_WORK_JOB_STATE_INVALID", "Owner-work job state must be a canonical uppercase token.", {
      at,
      state: String(job.state),
    });
  }
  const createdAt = checkTimestamp(findings, job.created_at, "OWNER_WORK_JOB_CREATED_AT_INVALID");
  const completedAt = checkTimestamp(findings, job.completed_at, "OWNER_WORK_JOB_COMPLETED_AT_INVALID", {
    required: job.state === "SUCCEEDED",
  });
  if (job.state === "SUCCEEDED") {
    if (completedAt === null) {
      add(findings, "OWNER_WORK_JOB_RECEIPT_WITHOUT_COMPLETION", "A SUCCEEDED owner-work job must carry a durable completion timestamp.", {
        at,
        job_id: String(job.job_id),
      });
    }
    if (job.result_present !== 1 && job.result_present !== true) {
      add(findings, "OWNER_WORK_JOB_RECEIPT_MISSING", "A SUCCEEDED owner-work job must carry a durable result payload.", {
        at,
        job_id: String(job.job_id),
      });
    }
  }
  if (createdAt !== null && completedAt !== null && completedAt < createdAt) {
    add(findings, "OWNER_WORK_JOB_TIME_ORDER_INVALID", "Owner-work job completion must not precede its creation.", {
      at,
      job_id: String(job.job_id),
    });
  }
}

function countBy(rows, key) {
  const counts = {};
  for (const row of rows) {
    const value = row?.[key];
    if (typeof value !== "string" || !value) continue;
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function sumCounts(counts) {
  if (!counts || typeof counts !== "object") return null;
  let total = 0;
  for (const value of Object.values(counts)) {
    const parsed = numberOrNull(value);
    if (parsed === null) return null;
    total += parsed;
  }
  return total;
}

export function evaluateHaeOwnerWorkReadback(snapshot) {
  const blockers = [];
  const warnings = [];

  if (!snapshot || typeof snapshot !== "object") {
    add(blockers, "EVIDENCE_INVALID", "Owner-work readback evidence must be a JSON object.");
    return {
      status: "BLOCKED",
      evidence_status: "INVALID",
      execution_status: "NOT_PROVEN",
      code_attribution: "UNPROVEN",
      blockers,
      warnings,
    };
  }

  const targetSha = String(snapshot.target_sha || "");
  if (!SHA40.test(targetSha)) {
    add(blockers, "TARGET_SHA_INVALID", "target_sha must be the exact 40-hex main SHA.");
  }

  const fingerprint = String(snapshot.database_binding_fingerprint || "");
  if (!FINGERPRINT.test(fingerprint)) {
    add(blockers, "DATABASE_FINGERPRINT_INVALID", "database_binding_fingerprint must be a sha256 fingerprint of the canonical D1 binding.");
  }

  const deployment = snapshot.deployment || {};
  requireEvidenceRef(blockers, deployment, "DEPLOYMENT_EVIDENCE_REF_MISSING");
  if (nonEmpty(targetSha) && deployment.source_sha !== targetSha) {
    add(blockers, "DEPLOYMENT_SOURCE_SHA_MISMATCH", "Deployed worker source_sha must equal the reviewed target_sha.", {
      target_sha: targetSha,
      deployment_source_sha: String(deployment.source_sha),
    });
  }
  const deployedSince = checkTimestamp(blockers, deployment.deployed_since, "DEPLOYED_SINCE_INVALID", { required: false });
  if (deployedSince === null) {
    warn(warnings, "DEPLOYED_SINCE_UNKNOWN", "The live worker has not yet reported the reviewed source_sha, so code attribution of an execution cannot be proven.");
  }

  const readback = snapshot.readback || {};
  requireEvidenceRef(blockers, readback, "READBACK_EVIDENCE_REF_MISSING");
  if (readback.mode !== "read_only") {
    add(blockers, "READBACK_MODE_NOT_READ_ONLY", "The owner-work readback must be executed in read-only mode.");
  }
  const items = Array.isArray(readback.items) ? readback.items : null;
  if (!items) {
    add(blockers, "OWNER_WORK_ITEMS_MISSING", "Owner-work items must be an array.");
  }
  const itemsTotal = numberOrNull(readback.items_total);
  if (itemsTotal === null || !Number.isInteger(itemsTotal) || itemsTotal < 0) {
    add(blockers, "OWNER_WORK_ITEMS_TOTAL_INVALID", "items_total must be a known non-negative integer.");
  }
  if (items && isInteger(readback.items_returned) && readback.items_returned !== items.length) {
    add(blockers, "OWNER_WORK_ITEMS_COUNT_MISMATCH", "items_returned must equal the number of returned item rows.", {
      items_returned: readback.items_returned,
      returned_rows: items.length,
    });
  }
  if (typeof readback.items_truncated !== "boolean") {
    add(blockers, "OWNER_WORK_ITEMS_TRUNCATION_FLAG_MISSING", "items_truncated must be reported explicitly; UNKNOWN must never be coerced to false.");
  } else if (readback.items_truncated) {
    if (itemsTotal !== null && itemsTotal <= items.length) {
      add(blockers, "OWNER_WORK_ITEMS_TRUNCATION_INCONSISTENT", "A truncated readback must report more total items than returned rows.");
    }
  }
  if (items) {
    items.forEach((item, index) => checkItem(blockers, item, index));
  }

  const jobs = snapshot.jobs || {};
  requireEvidenceRef(blockers, jobs, "JOBS_EVIDENCE_REF_MISSING");
  if (jobs.mode !== "read_only") {
    add(blockers, "JOBS_MODE_NOT_READ_ONLY", "The owner-work job readback must be executed in read-only mode.");
  }
  const ownerWorkJobs = Array.isArray(jobs.owner_work_jobs) ? jobs.owner_work_jobs : null;
  if (!ownerWorkJobs) {
    add(blockers, "OWNER_WORK_JOBS_MISSING", "owner_work_jobs must be an array.");
  }
  const jobsTotal = numberOrNull(jobs.owner_work_jobs_total);
  if (jobsTotal === null || !Number.isInteger(jobsTotal) || jobsTotal < 0) {
    add(blockers, "OWNER_WORK_JOBS_TOTAL_INVALID", "owner_work_jobs_total must be a known non-negative integer.");
  }
  if (ownerWorkJobs && isInteger(jobs.owner_work_jobs_returned) && jobs.owner_work_jobs_returned !== ownerWorkJobs.length) {
    add(blockers, "OWNER_WORK_JOBS_COUNT_MISMATCH", "owner_work_jobs_returned must equal the number of returned job rows.", {
      owner_work_jobs_returned: jobs.owner_work_jobs_returned,
      returned_rows: ownerWorkJobs.length,
    });
  }
  if (ownerWorkJobs) {
    ownerWorkJobs.forEach((job, index) => checkJob(blockers, job, index));
    const claimedCounts = jobs.state_counts;
    if (claimedCounts && typeof claimedCounts === "object") {
      const claimedTotal = sumCounts(claimedCounts);
      const observedTotal = countBy(ownerWorkJobs, "state");
      const observedSum = Object.values(observedTotal).reduce((sum, value) => sum + value, 0);
      if (claimedTotal !== null && claimedTotal !== observedSum) {
        add(blockers, "OWNER_WORK_JOB_STATE_COUNTS_MISMATCH", "state_counts must describe exactly the returned owner-work job rows.", {
          claimed_total: claimedTotal,
          observed_total: observedSum,
        });
      }
    }
    if (typeof jobs.owner_work_jobs_truncated !== "boolean") {
      add(blockers, "OWNER_WORK_JOBS_TRUNCATION_FLAG_MISSING", "owner_work_jobs_truncated must be reported explicitly; UNKNOWN must never be coerced to false.");
    } else if (jobs.owner_work_jobs_truncated) {
      if (jobsTotal !== null && jobsTotal <= ownerWorkJobs.length) {
        add(blockers, "OWNER_WORK_JOBS_TRUNCATION_INCONSISTENT", "A truncated job readback must report more total jobs than returned rows.");
      }
    }
  }

  const requestedIds = Array.isArray(snapshot.requested_job_ids) ? snapshot.requested_job_ids : [];
  const requestedJobs = Array.isArray(snapshot.requested_jobs) ? snapshot.requested_jobs : [];
  requestedJobs.forEach((job, index) => checkJob(blockers, job, `requested_jobs[${index}]`));
  const notFound = Array.isArray(snapshot.requested_jobs_not_found) ? snapshot.requested_jobs_not_found : [];
  for (const jobId of requestedIds) {
    if (!nonEmpty(jobId)) {
      add(blockers, "REQUESTED_JOB_ID_INVALID", "A requested job id must be a non-empty string.");
      continue;
    }
    const resolved = [...(ownerWorkJobs || []), ...requestedJobs].some((job) => job?.job_id === jobId);
    if (!resolved && !notFound.includes(jobId)) {
      add(blockers, "REQUESTED_JOB_UNRESOLVED", "A requested job id must be either resolved in the readback or explicitly reported as not found.", {
        job_id: jobId,
      });
    }
  }

  // Recompute the execution verdict from the read-back rows.
  const knownJobs = new Map();
  for (const job of [...(ownerWorkJobs || []), ...requestedJobs]) {
    if (nonEmpty(job?.job_id)) knownJobs.set(job.job_id, job);
  }
  const executedItems = [];
  const unresolvedBindings = [];
  for (const item of items || []) {
    const executionJobId = item?.hae_execution_job_id;
    if (!nonEmpty(executionJobId)) continue;
    const job = knownJobs.get(executionJobId);
    if (!job) {
      unresolvedBindings.push({ item_id: item?.id, job_id: executionJobId });
      continue;
    }
    if (job.state === "SUCCEEDED" && nonEmpty(job.completed_at) && (job.result_present === 1 || job.result_present === true)) {
      executedItems.push({ item, job });
    }
  }
  const executedItemCount = executedItems.length;

  if (unresolvedBindings.length) {
    if (jobs.owner_work_jobs_truncated === true) {
      warn(warnings, "OWNER_WORK_BINDING_OUTSIDE_WINDOW", "An owner-work item references an execution job that is outside the read window, so its receipt cannot be resolved from this readback.", {
        unresolved: unresolvedBindings,
      });
    } else {
      warn(warnings, "OWNER_WORK_BINDING_UNRESOLVED", "An owner-work item references an execution job that the readback did not return.", {
        unresolved: unresolvedBindings,
      });
    }
  }

  const claimed = snapshot.autonomous_execution || {};
  const claimedExecuted = numberOrNull(claimed.executed_items);
  if (claimedExecuted === null || claimedExecuted !== executedItemCount) {
    add(blockers, "EXECUTED_ITEMS_CLAIM_MISMATCH", "The claimed executed_items count must equal the count recomputed from the read-back rows.", {
      claimed_executed_items: claimedExecuted,
      recomputed_executed_items: executedItemCount,
    });
  }
  const claimedProven = claimed.proven === true;
  if (claimedProven !== executedItemCount >= 1) {
    add(blockers, "EXECUTION_PROOF_CLAIM_MISMATCH", "The claimed autonomous_execution.proven flag must equal the recomputed execution verdict.", {
      claimed_proven: claimedProven,
      recomputed_executed_items: executedItemCount,
    });
  }

  const codeAttributed =
    deployedSince !== null &&
    executedItems.some((entry) => {
      const completedAt = Date.parse(entry.job.completed_at);
      return Number.isFinite(completedAt) && completedAt >= deployedSince;
    });
  const claimedCodeAttribution = claimed.code_attribution === "proven" ? "proven" : "unproven";
  if (claimedCodeAttribution !== (codeAttributed ? "proven" : "unproven")) {
    add(blockers, "CODE_ATTRIBUTION_CLAIM_MISMATCH", "The claimed code_attribution must equal the recomputed attribution of the execution to the reviewed source_sha.", {
      claimed_code_attribution: claimedCodeAttribution,
      recomputed_code_attribution: codeAttributed ? "proven" : "unproven",
    });
  }

  const readbackAt = checkTimestamp(blockers, snapshot.readback_at, "READBACK_AT_INVALID", { required: false });
  if (readbackAt !== null) {
    for (const job of [...(ownerWorkJobs || []), ...requestedJobs]) {
      const createdAt = checkTimestamp(blockers, job?.created_at, "OWNER_WORK_JOB_CREATED_AT_INVALID", { required: false });
      if (createdAt !== null && createdAt > readbackAt) {
        add(blockers, "OWNER_WORK_JOB_CREATED_IN_FUTURE", "A read-back job row cannot be created after the readback instant.", {
          job_id: String(job?.job_id),
        });
      }
    }
  }

  const qa = snapshot.independent_qa || {};
  requireEvidenceRef(blockers, qa, "INDEPENDENT_QA_EVIDENCE_REF_MISSING");
  if (String(qa.status || "").toUpperCase() !== "PASS") {
    add(blockers, "INDEPENDENT_QA_NOT_PASS", "Independent QA must explicitly PASS the bounded evidence package.");
  }
  if (qa.independent_from_executor !== true) {
    add(blockers, "QA_INDEPENDENCE_NOT_ATTESTED", "QA must be independent from the executor that produced the evidence.");
  }
  if (!nonEmpty(qa.reviewer)) {
    add(blockers, "QA_REVIEWER_MISSING", "Independent QA reviewer identity/reference is required.");
  }

  const evidenceStatus = blockers.length ? "INVALID" : "VALID";
  const executionStatus = executedItemCount >= 1 ? "PROVEN" : "NOT_PROVEN";

  return {
    status: blockers.length ? "BLOCKED" : "OWNER_WORK_READBACK_VALID",
    evidence_status: evidenceStatus,
    execution_status: executionStatus,
    code_attribution: codeAttributed ? "PROVEN" : "UNPROVEN",
    summary: {
      owner_work_items: items ? items.length : 0,
      owner_work_items_total: itemsTotal,
      owner_work_jobs: ownerWorkJobs ? ownerWorkJobs.length : 0,
      owner_work_jobs_total: jobsTotal,
      executed_items: executedItemCount,
      executed_item_ids: executedItems.map((entry) => entry.item.id),
      succeeded_execution_jobs: executedItems.map((entry) => entry.job.job_id),
      deployed_since: deployment.deployed_since ?? null,
    },
    blockers,
    warnings,
    note: "This checker validates completeness/consistency of supplied evidence and recomputes the execution verdict from the read-back rows. It never independently proves DEPLOYED, LIVE_VERIFIED or BUSINESS_VERIFIED, and never authorizes merge/deploy.",
  };
}

async function readSnapshot(path) {
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile(path, "utf8"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: node scripts/hae-owner-work-readback-check.mjs <evidence.json>");
    process.exit(2);
  }
  try {
    const result = evaluateHaeOwnerWorkReadback(await readSnapshot(path));
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.evidence_status === "VALID" ? 0 : 1);
  } catch {
    console.error(JSON.stringify({ status: "BLOCKED", evidence_status: "INVALID", error: "invalid_evidence_input" }));
    process.exit(2);
  }
}
