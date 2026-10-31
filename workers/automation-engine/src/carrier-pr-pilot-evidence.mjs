// HAE #2033 carrier-acquisition pilot: a read-only PR evidence adapter.
// It does not create an HAE WORK_ID, enqueue Queue jobs, acquire a D1 writer lease,
// attest GitHub authentication, or authorize release. The caller must separately
// re-read GitHub and obtain runtime evidence before promoting anything.
import {reconcileWorkPortfolioSnapshot} from "./work-portfolio.mjs";
import {evaluateHaeSelfImprovementSnapshot} from "./hae-self-improvement.mjs";

const REPO = "officeus-create/Hermes";
const PR_URL = "https://github.com/" + REPO + "/pull/1908";
const SHA = /^[a-f0-9]{40}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const STATES = new Set(["open", "closed"]);
const CI_STATES = new Set(["success", "failure", "cancelled", "skipped", "timed_out", "neutral", "action_required", "pending"]);
const MAX_CHECKS = 40;
const WORK_KEY = "HERMES-CARRIER-INTAKE-PR-1908";

function blocked(code) {
  const error = new Error("hae_carrier_pr_pilot_" + code);
  error.code = "hae_carrier_pr_pilot_" + code;
  throw error;
}
function exactTime(value) {
  if (typeof value !== "string" || !ISO.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString() !== new Date(Date.parse(value)).toISOString()) blocked("time_invalid");
  return new Date(value).toISOString();
}
function nonnegative(value) {
  return Number.isSafeInteger(value) && value >= 0;
}
function safeCheck(check, sha) {
  if (!check || typeof check !== "object" || Array.isArray(check) ||
      typeof check.name !== "string" || !/^[a-zA-Z0-9_. /-]{2,100}$/.test(check.name) ||
      check.head_sha !== sha || !CI_STATES.has(check.conclusion)) blocked("check_invalid");
  return {name: check.name, conclusion: check.conclusion};
}

/**
 * Consume *minimized* independently fetched GitHub PR/compare/check metadata.
 * This is an evidence classifier, not a replacement for authenticated producer
 * intake or an Agent Coordinator/D1 receipt. Raw PR bodies and logs are ignored.
 */
export function buildCarrierPrPilotEvidence(input = {}) {
  const {pr, compare, checks, main_sha, observed_at} = input;
  const observedAt = exactTime(observed_at);
  if (!pr || typeof pr !== "object" || Array.isArray(pr) ||
      pr.number !== 1908 || pr.url !== PR_URL ||
      !STATES.has(pr.state) || typeof pr.draft !== "boolean" ||
      typeof pr.merged !== "boolean" ||
      !SHA.test(pr.head_sha || "") || !SHA.test(pr.base_sha || "") ||
      (pr.merged && pr.state !== "closed")) blocked("pr_identity_invalid");
  if (!SHA.test(main_sha || "") || !compare || typeof compare !== "object" ||
      compare.base !== "main" || compare.head !== pr.head_sha ||
      !nonnegative(compare.ahead_by) || !nonnegative(compare.behind_by) ||
      !["ahead", "behind", "diverged", "identical"].includes(compare.status) ||
      (compare.status === "diverged" && !(compare.ahead_by > 0 && compare.behind_by > 0)) ||
      (compare.status === "ahead" && compare.behind_by !== 0) ||
      (compare.status === "behind" && compare.ahead_by !== 0) ||
      (compare.status === "identical" && (compare.ahead_by !== 0 || compare.behind_by !== 0))) {
    blocked("comparison_invalid");
  }
  if (!Array.isArray(checks) || checks.length === 0 || checks.length > MAX_CHECKS) blocked("checks_incomplete");
  const normalizedChecks = checks.map(c => safeCheck(c, pr.head_sha));
  if (new Set(normalizedChecks.map(c => c.name)).size !== checks.length) blocked("duplicate_check");
  normalizedChecks.sort((a, b) => a.name.localeCompare(b.name));
  const stale = compare.behind_by > 0;
  const failed = normalizedChecks.filter(c => ["failure", "timed_out"].includes(c.conclusion)).length;
  const incomplete = normalizedChecks.filter(c => !["success", "failure", "timed_out"].includes(c.conclusion)).length;
  const reason = pr.merged ? "MERGED_SOURCE_NOT_RUNTIME_PROOF"
    : pr.state === "closed" ? "CLOSED_UNMERGED_NOT_EXECUTABLE"
    : stale ? "STALE_BRANCH_REQUIRES_MINIMAL_RECONCILIATION"
    : failed ? "EXACT_HEAD_CI_FAILURE"
    : incomplete ? "EXACT_HEAD_CI_INCOMPLETE"
    : "OWNER_RELEASE_APPROVALS_UNVERIFIED";
  // Deliberately BLOCKED even if checks later pass: no owner D1/privacy policy,
  // writer lease, authenticated HAE admission or live carrier evidence here.
  const portfolio = {
    source_kind: "GITHUB", snapshot_id: "github:carrier-pr:1908:" + pr.head_sha,
    observed_at: observedAt, coverage_complete: false,
    tasks: [{
      work_id: WORK_KEY,
      source_ref: "github://" + REPO + "/pull/1908",
      status: "BLOCKED", priority: 90,
      updated_at: observedAt, permission_class: "READ_ONLY",
      writer_key: "github:pr:1908", dependencies: []
    }]
  };
  const finding = {
    observed_at: observedAt,
    coverage_complete: false, // Current GitHub/PR provenance is not a D1 authority/lease.
    findings: [{
      finding_id: "carrier-pr-1908-" + pr.head_sha.slice(0, 12),
      source_ref: "github://" + REPO + "/pull/1908",
      category: stale ? "STALE_BRANCH" : "EVIDENCE_OVERCLAIM",
      severity: "P1", status: "BLOCKED", artifact_key: "github-pr:1908",
      verified: false, writer_active: false, writer_state_verified: false,
      observed_at: observedAt
    }]
  };
  const routed = reconcileWorkPortfolioSnapshot(portfolio, []);
  const assessed = evaluateHaeSelfImprovementSnapshot(finding);
  if (routed.routing_candidate_count !== 0 || assessed.next_work_id !== null) blocked("unexpected_routing");
  return Object.freeze({
    schema_version: 1,
    pilot_key: WORK_KEY,
    github_pr_url: PR_URL,
    observed_at: observedAt,
    source_head_sha: pr.head_sha,
    observed_main_sha: main_sha,
    pr_state: pr.state,
    merged: pr.merged,
    draft: pr.draft,
    behind_main: compare.behind_by,
    ahead_main: compare.ahead_by,
    exact_head_ci: normalizedChecks,
    failed_checks: failed,
    incomplete_checks: incomplete,
    finding_id: finding.findings[0].finding_id,
    status: "BLOCKED",
    blocker: reason,
    next_action: "SINGLE_WRITER_MINIMAL_DELTA_THEN_AUTHENTICATED_HAE_READBACK",
    agent_coordinator_owner: "hermes-agent-coordinator",
    proposed_executor: "hermes-automatic-engineer",
    independent_qa_owner: "hermes-qa-evidence-auditor",
    lesson_owner: "hermes-knowledge-curator",
    portfolio_blocked_work_ids: routed.blocked_work_ids,
    lesson_status: "PROPOSED_ONLY_UNTIL_INDEPENDENT_QA",
    lesson_rule: "PR CI or source analysis is never a live HAE job; require authenticated D1 admission, writer lease and independent QA before claiming execution",
    genuine_carrier_received: "UNKNOWN",
    hae_work_id: null,
    d1_job_id: null,
    independent_qa_receipt: null,
    one_brain_promotion_allowed: false,
    automatic_job_submission_allowed: false,
    automatic_source_edit_allowed: false,
    automatic_merge_allowed: false,
    production_deploy_allowed: false,
    outbound_messages_allowed: false,
    paid_model_cost_usd: 0
  });
}