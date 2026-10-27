import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";

const MAX_FINDINGS = 100;
const CATEGORIES = new Set([
  "CI_FAILURE",
  "CONTRACT_DRIFT",
  "PLUGIN_VERSION_DRIFT",
  "STALE_BRANCH",
  "EVIDENCE_OVERCLAIM",
  "TEST_GAP",
]);
const SEVERITIES = new Set(["P0", "P1", "P2", "P3"]);
const STATUSES = new Set(["OPEN", "BLOCKED", "FIXED", "UNKNOWN"]);

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function iso(value, field) {
  const raw = clean(value, 80);
  const parsed = Date.parse(raw);
  if (!raw || !Number.isFinite(parsed)) throw new Error(`hae_self_${field}_invalid`);
  return new Date(parsed).toISOString();
}

function severityScore(value) {
  return { P0: 400, P1: 300, P2: 200, P3: 100 }[value] || 0;
}

export function normalizeHaeSelfImprovementSnapshot(input = {}) {
  if (typeof input.coverage_complete !== "boolean") throw new Error("hae_self_coverage_complete_required");
  if (!Array.isArray(input.findings)) throw new Error("hae_self_findings_array_required");
  if (input.findings.length > MAX_FINDINGS) throw new Error("hae_self_findings_too_large");

  const observedAt = iso(input.observed_at, "observed_at");
  const findings = input.findings.map((finding) => {
    if (!finding || typeof finding !== "object" || Array.isArray(finding)) {
      throw new Error("hae_self_finding_invalid");
    }
    const findingId = clean(finding.finding_id, 160);
    const sourceRef = clean(finding.source_ref, 500);
    const category = clean(finding.category, 80).toUpperCase();
    const severity = clean(finding.severity, 20).toUpperCase();
    const status = clean(finding.status, 40).toUpperCase();
    const artifactKey = clean(finding.artifact_key, 200);
    if (!findingId) throw new Error("hae_self_finding_id_required");
    if (!/^github:\/\//.test(sourceRef)) throw new Error("hae_self_source_ref_invalid");
    if (!CATEGORIES.has(category)) throw new Error("hae_self_category_invalid");
    if (!SEVERITIES.has(severity)) throw new Error("hae_self_severity_invalid");
    if (!STATUSES.has(status)) throw new Error("hae_self_status_invalid");
    if (!artifactKey) throw new Error("hae_self_artifact_key_required");
    if (typeof finding.verified !== "boolean") throw new Error("hae_self_verified_required");
    if (typeof finding.writer_active !== "boolean") throw new Error("hae_self_writer_active_required");
    if (typeof finding.writer_state_verified !== "boolean") throw new Error("hae_self_writer_state_verified_required");
    return {
      finding_id: findingId,
      source_ref: sourceRef,
      category,
      severity,
      status,
      artifact_key: artifactKey,
      verified: finding.verified,
      writer_active: finding.writer_active,
      writer_state_verified: finding.writer_state_verified,
      observed_at: iso(finding.observed_at, "finding_observed_at"),
    };
  });

  return {
    observed_at: observedAt,
    coverage_complete: input.coverage_complete,
    findings,
  };
}

export function evaluateHaeSelfImprovementSnapshot(input = {}) {
  const snapshot = normalizeHaeSelfImprovementSnapshot(input);
  const repairOwner = {
    role_id: "hermes-automatic-engineer",
    plugin_version: pluginRuntimeVersion("hermes-automatic-engineer"),
  };
  const reviewOwner = {
    role_id: "hermes-qa-evidence-auditor",
    plugin_version: pluginRuntimeVersion("hermes-qa-evidence-auditor"),
  };

  const writerStateUnverifiedCount = snapshot.findings.filter((finding) =>
    snapshot.coverage_complete
    && finding.verified
    && finding.status === "OPEN"
    && !finding.writer_active
    && !finding.writer_state_verified
  ).length;

  const blockedFindingCount = snapshot.findings.filter((finding) =>
    snapshot.coverage_complete
    && finding.verified
    && finding.status === "BLOCKED"
  ).length;

  const candidates = snapshot.findings
    .filter((finding) =>
      snapshot.coverage_complete
      && finding.verified
      && finding.status === "OPEN"
      && finding.writer_state_verified
      && !finding.writer_active
    )
    .sort((left, right) => {
      const score = severityScore(right.severity) - severityScore(left.severity);
      if (score !== 0) return score;
      return Date.parse(left.observed_at) - Date.parse(right.observed_at);
    });

  const next = candidates[0] || null;
  return {
    observed_at: snapshot.observed_at,
    coverage_status: snapshot.coverage_complete ? "COMPLETE" : "PARTIAL",
    evaluated_count: snapshot.findings.length,
    repair_candidate_count: candidates.length,
    repair_candidate_ids: candidates.slice(0, 50).map((item) => item.finding_id),
    next_work_id: next ? `HAE-SELF:${next.finding_id}` : null,
    next_finding_id: next?.finding_id || null,
    next_artifact_key: next?.artifact_key || null,
    next_action: next ? "HOLD_REPAIR" : "NO_ACTION",
    routing_blocked_reason: !snapshot.coverage_complete
      ? "PARTIAL_COVERAGE"
      : (!next && writerStateUnverifiedCount > 0
        ? "WRITER_STATE_UNVERIFIED"
        : (!next && blockedFindingCount > 0 ? "FINDING_BLOCKED" : null)),
    writer_state_unverified_count: writerStateUnverifiedCount,
    blocked_finding_count: blockedFindingCount,
    repair_owner: repairOwner,
    independent_review_owner: reviewOwner,
    automatic_source_change_performed: false,
    automatic_merge_performed: false,
    automatic_deploy_performed: false,
    cost_usd: 0,
  };
}

export function haeSelfRepairPacketReplayMatches(existingPayload = {}, audit = {}) {
  return clean(existingPayload.work_id, 180) === clean(audit.next_work_id, 180)
    && clean(existingPayload.finding_id, 160) === clean(audit.next_finding_id, 160)
    && clean(existingPayload.artifact_key, 240) === clean(audit.next_artifact_key, 240);
}

export const HAE_SELF_IMPROVEMENT_LIMITS = Object.freeze({
  max_findings: MAX_FINDINGS,
  categories: Object.freeze([...CATEGORIES]),
});
