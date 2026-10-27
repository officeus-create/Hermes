// Pure planning only. Never creates HAE jobs or claims that a source is independently verified.
// The existing D1/Queue admission layer must enforce replay, permissions and durable writer locks.
import { normalizeHaeSelfImprovementSnapshot } from "./hae-self-improvement.mjs";

const MAX_PROPOSALS = 10;
const MAX_PARALLEL_WRITERS = 2;
const MAX_DEPENDENCIES = 8;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/;
const SOURCE_FIELDS = new Set([
  "finding_id", "source_ref", "category", "severity", "status", "artifact_key",
  "verified", "writer_active", "writer_state_verified", "observed_at", "depends_on",
]);
const SCORE = { P0: 4, P1: 3, P2: 2, P3: 1 };

function dependenciesOf(item) {
  const list = item.depends_on === undefined ? [] : item.depends_on;
  if (!Array.isArray(list) || list.length > MAX_DEPENDENCIES) {
    throw new Error("hae_backlog_dependencies_invalid");
  }
  if (list.some((id) => typeof id !== "string" || !ID.test(id))) {
    throw new Error("hae_backlog_dependency_id_invalid");
  }
  if (new Set(list).size !== list.length || list.includes(item.finding_id)) {
    throw new Error("hae_backlog_dependency_duplicate_or_self");
  }
  return [...list].sort();
}

function compareFindings(a, b) {
  return SCORE[b.severity] - SCORE[a.severity]
    || Date.parse(a.observed_at) - Date.parse(b.observed_at)
    || a.finding_id.localeCompare(b.finding_id);
}

export function planHaeSelfBacklog(input = {}) {
  const snapshot = normalizeHaeSelfImprovementSnapshot(input);
  const raw = input.findings;
  for (const item of raw) {
    if (Object.keys(item).some((key) => !SOURCE_FIELDS.has(key))) {
      throw new Error("hae_backlog_unclassified_field");
    }
  }
  const enriched = snapshot.findings.map((item, i) => {
    if (!ID.test(item.finding_id)) throw new Error("hae_backlog_finding_id_invalid");
    return { ...item, depends_on: dependenciesOf(raw[i]) };
  });
  const byId = new Map();
  const conflictedIds = new Set();
  for (const item of enriched) {
    const prior = byId.get(item.finding_id);
    if (!prior) byId.set(item.finding_id, item);
    else if (JSON.stringify(prior) !== JSON.stringify(item)) conflictedIds.add(item.finding_id);
  }

  const blocked = [];
  if (!snapshot.coverage_complete) {
    return {
      observed_at: snapshot.observed_at, coverage_status: "PARTIAL",
      proposed_count: 0, proposals: [], ready_work_ids: [], blocked_count: 0,
      blocked: [], duplicate_conflict_count: conflictedIds.size,
      next_action: "HOLD_PARTIAL_COVERAGE", automatic_job_submission_allowed: false,
      automatic_source_change_performed: false, automatic_merge_performed: false,
      automatic_deploy_performed: false, paid_ai_cost_usd: 0,
    };
  }

  const unique = [...byId.values()];
  const writerStateConflict = [...conflictedIds].some((findingId) => {
    const variants = enriched.filter((item) => item.finding_id === findingId);
    const writerStates = new Set(variants.map((item) =>
      [item.writer_active, item.writer_state_verified, item.artifact_key].join("|")));
    return writerStates.size > 1;
  });
  const activeWriters = unique.filter((item) => item.status === "OPEN" && item.writer_active);
  const activeArtifacts = new Set(activeWriters.map((item) => item.artifact_key));
  const candidates = unique
    .filter((item) => item.verified && item.status === "OPEN")
    .sort(compareFindings);
  const unresolvedHighPriority = candidates.some((item) => ["P0", "P1"].includes(item.severity));
  const reservedArtifacts = new Set();
  const proposals = [];

  for (const item of candidates) {
    let reason = null;
    if (conflictedIds.has(item.finding_id)) reason = "CONFLICTING_DUPLICATE";
    else if (!item.writer_state_verified) reason = "WRITER_STATE_UNVERIFIED";
    else if (item.writer_active || activeArtifacts.has(item.artifact_key)) reason = "ARTIFACT_WRITER_ACTIVE";
    else if (item.depends_on.some((dep) => {
      const evidence = byId.get(dep);
      return !evidence || conflictedIds.has(dep) || !evidence.verified || evidence.status !== "FIXED";
    })) reason = "DEPENDENCY_UNSATISFIED";
    else if (item.severity === "P3" || (item.severity === "P2" && unresolvedHighPriority)) {
      reason = "LOW_PRIORITY_HELD";
    } else if (reservedArtifacts.has(item.artifact_key)) reason = "ARTIFACT_RESERVED_IN_PLAN";
    else if (proposals.length >= MAX_PROPOSALS) reason = "BATCH_CAPACITY";

    if (reason) {
      blocked.push({ finding_id: item.finding_id, artifact_key: item.artifact_key, reason });
      continue;
    }
    reservedArtifacts.add(item.artifact_key);
    proposals.push({
      work_id: "HAE-SELF:" + item.finding_id,
      finding_id: item.finding_id,
      artifact_key: item.artifact_key,
      source_ref: item.source_ref,
      severity: item.severity,
      depends_on: item.depends_on,
      job_type: "hae.self.repair.packet",
      repair_owner: "hermes-automatic-engineer",
      independent_review_owner: "hermes-qa-evidence-auditor",
      proposal_status: "DRAFT_ONLY",
      permission_class: "READ_ONLY",
      payload: {
        work_id: "HAE-SELF:" + item.finding_id,
        finding_id: item.finding_id,
        artifact_key: item.artifact_key,
      },
    });
  }
  const freeWriterSlots = writerStateConflict
    ? 0
    : Math.max(0, MAX_PARALLEL_WRITERS - activeWriters.length);
  return {
    observed_at: snapshot.observed_at,
    coverage_status: "COMPLETE",
    proposed_count: proposals.length,
    proposals,
    ready_work_ids: proposals.slice(0, freeWriterSlots).map((item) => item.work_id),
    blocked_count: blocked.length,
    blocked,
    duplicate_conflict_count: conflictedIds.size,
    writer_state_conflict_hold: writerStateConflict,
    next_action: writerStateConflict ? "HOLD_CONFLICTING_WRITER_STATE"
      : proposals.length ? "HOLD_AUTHENTICATED_D1_ADMISSION" : "NO_ELIGIBLE_TASK",
    automatic_job_submission_allowed: false,
    automatic_source_change_performed: false,
    automatic_merge_performed: false,
    automatic_deploy_performed: false,
    paid_ai_cost_usd: 0,
  };
}

export const HAE_SELF_BACKLOG_PLAN_LIMITS = Object.freeze({
  max_proposals: MAX_PROPOSALS, max_parallel_writers: MAX_PARALLEL_WRITERS,
  max_dependencies: MAX_DEPENDENCIES,
});
