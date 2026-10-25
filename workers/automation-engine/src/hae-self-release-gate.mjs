import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";

const MAX_CHECKS = 30;
const MAX_CHANGED_PATHS = 100;
const EXPECTED_REPOSITORY = "officeus-create/Hermes";
const VERIFIED_CONTEXT = Symbol("hae-self-release-verified-context");
const BASE_REQUIRED_CI_CHECKS = Object.freeze(["Website checks", "Open-source web quality audit"]);
const HAE_CONTRACT_CHECK = "Hermes Automation Engine Contract";
const CLOUDFLARE_OWNERSHIP_CHECK = "Cloudflare deployment ownership contract";
const TRUST_LEVELS = new Set(["LOW_RISK_DRAFT", "CONTRACT", "SCHEMA", "PROVIDER_WRITE"]);
const VERDICTS = new Set(["ACCEPTED", "REPAIR", "BLOCKED"]);
const REPAIR_EXECUTOR_JOB_TYPE = "hae.self.repair.execute";

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function integer(value, field, { positive = false } = {}) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < (positive ? 1 : 0) || value > Number.MAX_SAFE_INTEGER) {
    throw new Error(`hae_release_${field}_invalid`);
  }
  return value;
}

function sha(value, length, field) {
  const normalized = clean(value, length + 8).toLowerCase();
  const re = length === 40 ? /^[0-9a-f]{40}$/ : /^[0-9a-f]{64}$/;
  if (!re.test(normalized)) throw new Error(`hae_release_${field}_invalid`);
  return normalized;
}

function normalizeArtifactKey(value) {
  const artifactKey = clean(value, 240);
  if (!artifactKey || artifactKey.startsWith("/") || artifactKey.includes("..") || artifactKey.includes("\\")) {
    throw new Error("hae_release_artifact_key_invalid");
  }
  return artifactKey;
}

function normalizeChangedPaths(value, field = "changed_paths") {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CHANGED_PATHS) {
    throw new Error(`hae_release_${field}_invalid`);
  }
  const seen = new Set();
  const paths = value.map((item) => {
    const path = clean(item, 300);
    if (!path || path.startsWith("/") || path.includes("..") || path.includes("\\")) {
      throw new Error(`hae_release_${field}_item_invalid`);
    }
    if (seen.has(path)) throw new Error(`hae_release_${field}_duplicate`);
    seen.add(path);
    return path;
  });
  return paths.sort();
}

function samePaths(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function normalizeChecks(value, field) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CHECKS) {
    throw new Error(`hae_release_${field}_invalid`);
  }
  const seen = new Set();
  return value.map((item) => {
    const name = clean(item?.name, 160);
    const conclusion = clean(item?.conclusion, 40).toUpperCase();
    const headSha = sha(item?.head_sha, 40, `${field}_head_sha`);
    const workflowRunId = integer(item?.workflow_run_id, `${field}_workflow_run_id`, { positive: true });
    const jobId = integer(item?.job_id, `${field}_job_id`, { positive: true });
    if (!name || !["SUCCESS", "FAILURE", "CANCELLED", "SKIPPED", "NEUTRAL"].includes(conclusion)) {
      throw new Error(`hae_release_${field}_item_invalid`);
    }
    if (seen.has(name)) throw new Error(`hae_release_${field}_duplicate_name`);
    seen.add(name);
    return { name, conclusion, head_sha: headSha, workflow_run_id: workflowRunId, job_id: jobId };
  });
}

function haeContractTriggeredBy(path) {
  return path.startsWith("workers/automation-engine/")
    || path.startsWith("scripts/automation-engine-")
    || path.startsWith("scripts/hae-")
    || path.startsWith("docs/HERMES_HAE_")
    || path.startsWith("docs/HERMES_AUTOMATION_ENGINE_")
    || path.startsWith(".github/workflows/automation-engine-")
    || path.startsWith(".github/workflows/hae-");
}

function cloudflareOwnershipTriggeredBy(path) {
  return path === "wrangler.jsonc"
    || path === "wrangler.toml"
    || path === "wrangler.jsonc.example"
    || path === "wrangler.toml.example"
    || path === "config/cloudflare-pages-runtime-baseline.json"
    || path.startsWith("workers/lead-email/")
    || path === "scripts/cloudflare-deployment-contract.test.mjs"
    || path === "scripts/check-home-video-production.mjs"
    || path === "scripts/cloudflare-production-hardening-contract.test.mjs"
    || path === "scripts/cloudflare-pages-runtime-baseline.test.mjs"
    || path === "scripts/check-connect-subdomain.mjs"
    || path === "scripts/connect-subdomain-verifier.mjs"
    || path === "scripts/connect-subdomain-verifier.test.mjs"
    || path.startsWith(".github/workflows/")
    || path === "docs/CLOUDFLARE_DEPLOYMENT_OWNERSHIP.md";
}

function requiredCiChecksForPaths(changedPaths) {
  const required = new Set(BASE_REQUIRED_CI_CHECKS);
  if (changedPaths.some(haeContractTriggeredBy)) required.add(HAE_CONTRACT_CHECK);
  if (changedPaths.some(cloudflareOwnershipTriggeredBy)) required.add(CLOUDFLARE_OWNERSHIP_CHECK);
  return [...required];
}

function evaluateCheckSet(checks, expectedSha, requiredCheckNames) {
  const byName = new Map(checks.map((item) => [item.name, item]));
  const missingRequiredChecks = requiredCheckNames.filter((name) => !byName.has(name));
  const failingChecks = checks.filter((item) => item.head_sha !== expectedSha || item.conclusion !== "SUCCESS");
  return {
    accepted: missingRequiredChecks.length === 0 && failingChecks.length === 0,
    missing_required_checks: missingRequiredChecks,
    failing_checks: failingChecks,
  };
}

function normalizeRequest(input = {}) {
  const workId = clean(input.work_id, 180);
  if (!/^HAE-SELF:[A-Za-z0-9._:-]+$/.test(workId)) throw new Error("hae_release_work_id_invalid");
  const artifactKey = normalizeArtifactKey(input.artifact_key);
  const repairJobId = clean(input.repair_job_id, 180);
  if (!repairJobId) throw new Error("hae_release_repair_job_id_required");
  const verifierVerdict = clean(input.verifier?.verdict, 40).toUpperCase();
  if (!VERDICTS.has(verifierVerdict)) throw new Error("hae_release_verifier_verdict_invalid");
  const criteriaSha256 = sha(input.verifier?.criteria_sha256, 64, "verifier_criteria_sha256");

  for (const field of [
    "verification_job_id", "repair_owner", "patch_sha", "base_sha", "diff_sha256", "changed_paths",
    "checks", "source_change_performed", "revert_sha", "revert_checks", "backlog",
  ]) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      throw new Error(`hae_release_self_asserted_${field}_forbidden`);
    }
  }

  return {
    work_id: workId,
    artifact_key: artifactKey,
    repair_job_id: repairJobId,
    verifier: {
      role_id: "hermes-qa-evidence-auditor",
      plugin_version: pluginRuntimeVersion("hermes-qa-evidence-auditor"),
      verdict: verifierVerdict,
      criteria_sha256: criteriaSha256,
    },
  };
}

function normalizeRepairReceipt(value = {}) {
  if (clean(value.source_class, 80) !== "D1_AUTHENTICATED_READBACK") {
    throw new Error("hae_release_repair_receipt_source_unverified");
  }
  const jobId = clean(value.job_id, 180);
  const jobType = clean(value.job_type, 120);
  const state = clean(value.state, 40).toUpperCase();
  const workId = clean(value.work_id, 180);
  const artifactKey = normalizeArtifactKey(value.artifact_key);
  const roleId = clean(value.role_id, 120);
  const pluginVersion = clean(value.plugin_version, 80);
  if (!jobId || jobType !== REPAIR_EXECUTOR_JOB_TYPE || state !== "SUCCEEDED") {
    throw new Error("hae_release_repair_receipt_invalid");
  }
  if (roleId !== "hermes-automatic-engineer" || pluginVersion !== pluginRuntimeVersion("hermes-automatic-engineer")) {
    throw new Error("hae_release_repair_owner_invalid");
  }
  const baseSha = sha(value.base_sha, 40, "repair_base_sha");
  const patchSha = sha(value.patch_sha, 40, "repair_patch_sha");
  if (baseSha === patchSha) throw new Error("hae_release_repair_patch_not_source_change");
  const diffSha256 = sha(value.diff_sha256, 64, "repair_diff_sha256");
  const changedPaths = normalizeChangedPaths(value.changed_paths, "repair_changed_paths");
  if (value.rollback_recipe_present !== true) throw new Error("hae_release_rollback_recipe_required");
  return {
    source_class: "D1_AUTHENTICATED_READBACK",
    job_id: jobId,
    job_type: jobType,
    state,
    work_id: workId,
    artifact_key: artifactKey,
    role_id: roleId,
    plugin_version: pluginVersion,
    base_sha: baseSha,
    patch_sha: patchSha,
    diff_sha256: diffSha256,
    changed_paths: changedPaths,
    rollback_recipe_present: true,
  };
}

function normalizeGithubEvidence(value = {}) {
  const sourceClass = clean(value.source_class, 80);
  const repository = clean(value.repository, 200);
  const evidenceRef = clean(value.evidence_ref, 500);
  if (
    sourceClass !== "GITHUB_API_AUTHENTICATED"
    || repository !== EXPECTED_REPOSITORY
    || !/^github:\/\/officeus-create\/Hermes\//.test(evidenceRef)
  ) {
    throw new Error("hae_release_github_evidence_source_unverified");
  }
  const baseSha = sha(value.base_sha, 40, "github_base_sha");
  const patchSha = sha(value.patch_sha, 40, "github_patch_sha");
  if (baseSha === patchSha) throw new Error("hae_release_github_patch_not_source_change");
  const diffSha256 = sha(value.diff_sha256, 64, "github_diff_sha256");
  const changedPaths = normalizeChangedPaths(value.changed_paths, "github_changed_paths");
  const checks = normalizeChecks(value.checks, "checks");
  const revertSha = sha(value.revert_sha, 40, "revert_sha");
  if (revertSha === patchSha) throw new Error("hae_release_revert_sha_same_as_patch");
  const revertChecks = normalizeChecks(value.revert_checks, "revert_checks");
  return {
    source_class: sourceClass,
    repository,
    evidence_ref: evidenceRef,
    base_sha: baseSha,
    patch_sha: patchSha,
    diff_sha256: diffSha256,
    changed_paths: changedPaths,
    checks,
    revert_sha: revertSha,
    revert_checks: revertChecks,
  };
}

function normalizeBacklogEvidence(value = {}) {
  if (clean(value.source_class, 80) !== "D1_AUTHENTICATED_READBACK") {
    throw new Error("hae_release_backlog_source_unverified");
  }
  return {
    source_class: "D1_AUTHENTICATED_READBACK",
    p0_open: integer(value.p0_open, "backlog_p0"),
    p1_open: integer(value.p1_open, "backlog_p1"),
    p2_open: integer(value.p2_open, "backlog_p2"),
  };
}

export function createVerifiedHaeSelfReleaseContext(input = {}) {
  const verificationJobId = clean(input.verification_job_id, 180);
  if (!verificationJobId) throw new Error("hae_release_verification_job_id_required");
  const repair = normalizeRepairReceipt(input.repair_receipt);
  if (verificationJobId === repair.job_id) throw new Error("hae_release_verification_context_not_independent");
  const github = normalizeGithubEvidence(input.github_evidence);
  if (
    repair.base_sha !== github.base_sha
    || repair.patch_sha !== github.patch_sha
    || repair.diff_sha256 !== github.diff_sha256
    || !samePaths(repair.changed_paths, github.changed_paths)
  ) {
    throw new Error("hae_release_repair_github_evidence_mismatch");
  }
  const backlog = normalizeBacklogEvidence(input.backlog);
  const trustLevel = clean(input.trust_level, 40).toUpperCase();
  if (!TRUST_LEVELS.has(trustLevel)) throw new Error("hae_release_trust_level_invalid");

  return Object.freeze({
    [VERIFIED_CONTEXT]: true,
    verification_job_id: verificationJobId,
    repair_receipt: repair,
    github_evidence: github,
    backlog,
    trust_level: trustLevel,
  });
}

export function normalizeHaeSelfReleaseEvidence(input = {}, verifiedContext = null) {
  const request = normalizeRequest(input);
  if (!verifiedContext?.[VERIFIED_CONTEXT]) return { request, verified_context: false };

  const repair = verifiedContext.repair_receipt;
  const github = verifiedContext.github_evidence;
  if (repair.job_id !== request.repair_job_id || repair.work_id !== request.work_id || repair.artifact_key !== request.artifact_key) {
    throw new Error("hae_release_repair_receipt_request_mismatch");
  }

  return {
    request,
    verified_context: true,
    work_id: request.work_id,
    artifact_key: request.artifact_key,
    repair_job_id: repair.job_id,
    verification_job_id: verifiedContext.verification_job_id,
    repair_owner: { role_id: repair.role_id, plugin_version: repair.plugin_version },
    verifier: request.verifier,
    base_sha: github.base_sha,
    patch_sha: github.patch_sha,
    diff_sha256: github.diff_sha256,
    changed_paths: github.changed_paths,
    required_check_names: requiredCiChecksForPaths(github.changed_paths),
    checks: github.checks,
    trust_level: verifiedContext.trust_level,
    source_change_performed: true,
    revert_sha: github.revert_sha,
    revert_checks: github.revert_checks,
    github_evidence_ref: github.evidence_ref,
    backlog: verifiedContext.backlog,
  };
}

function blockedWithoutVerifiedContext(request) {
  return {
    receipt_version: "hae-self-release-v2",
    work_id: request.work_id,
    artifact_key: request.artifact_key,
    repair_job_id: request.repair_job_id,
    verification_job_id: null,
    release_state: "BLOCKED",
    blocker: "VERIFIED_EVIDENCE_CONTEXT_REQUIRED",
    independent_verifier_identity_ok: false,
    source_change_performed: null,
    automatic_merge_allowed: false,
    automatic_deploy_allowed: false,
    human_hold_release_required: true,
    self_improvement_should_pause: false,
    next_lane: "SELF_IMPROVEMENT",
    cost_usd: 0,
  };
}

export function evaluateHaeSelfReleaseEvidence(input = {}, verifiedContext = null) {
  const evidence = normalizeHaeSelfReleaseEvidence(input, verifiedContext);
  if (!evidence.verified_context) return blockedWithoutVerifiedContext(evidence.request);

  const ci = evaluateCheckSet(evidence.checks, evidence.patch_sha, evidence.required_check_names);
  const rollback = evaluateCheckSet(evidence.revert_checks, evidence.revert_sha, evidence.required_check_names);
  const verifierAccepted = evidence.verifier.verdict === "ACCEPTED";

  let releaseState = "HOLD_RELEASE";
  let blocker = null;
  if (evidence.verifier.verdict === "BLOCKED") {
    releaseState = "BLOCKED";
    blocker = "VERIFIER_BLOCKED";
  } else if (!verifierAccepted) {
    releaseState = "REPAIR";
    blocker = "VERIFIER_REPAIR";
  } else if (!ci.accepted) {
    releaseState = "REPAIR";
    blocker = "CI_NOT_ACCEPTED";
  } else if (!rollback.accepted) {
    releaseState = "REPAIR";
    blocker = "ROLLBACK_NOT_VERIFIED";
  }

  const blockingSelfWork = evidence.backlog.p0_open + evidence.backlog.p1_open;
  const selfImprovementShouldPause = blockingSelfWork === 0 && releaseState === "HOLD_RELEASE";

  return {
    receipt_version: "hae-self-release-v2",
    work_id: evidence.work_id,
    artifact_key: evidence.artifact_key,
    base_sha: evidence.base_sha,
    patch_sha: evidence.patch_sha,
    diff_sha256: evidence.diff_sha256,
    changed_paths: evidence.changed_paths,
    github_evidence_ref: evidence.github_evidence_ref,
    repair_job_id: evidence.repair_job_id,
    verification_job_id: evidence.verification_job_id,
    checks: evidence.checks,
    required_check_names: evidence.required_check_names,
    missing_required_checks: ci.missing_required_checks,
    failing_checks: ci.failing_checks,
    failing_check_count: ci.failing_checks.length,
    verifier: evidence.verifier,
    repair_owner: evidence.repair_owner,
    independent_verifier_identity_ok:
      evidence.repair_job_id !== evidence.verification_job_id
      && evidence.repair_owner.role_id !== evidence.verifier.role_id,
    source_change_performed: true,
    rollback_required: true,
    rollback_verified: rollback.accepted,
    revert_sha: evidence.revert_sha,
    revert_checks: evidence.revert_checks,
    rollback_missing_required_checks: rollback.missing_required_checks,
    rollback_failing_checks: rollback.failing_checks,
    trust_level: evidence.trust_level,
    release_state: releaseState,
    blocker,
    automatic_merge_allowed: false,
    automatic_deploy_allowed: false,
    human_hold_release_required: true,
    backlog: {
      p0_open: evidence.backlog.p0_open,
      p1_open: evidence.backlog.p1_open,
      p2_open: evidence.backlog.p2_open,
    },
    self_improvement_should_pause: selfImprovementShouldPause,
    next_lane: selfImprovementShouldPause ? "BUSINESS_QUEUE" : "SELF_IMPROVEMENT",
    cost_usd: 0,
  };
}

export const HAE_SELF_RELEASE_LIMITS = Object.freeze({
  max_checks: MAX_CHECKS,
  max_changed_paths: MAX_CHANGED_PATHS,
  expected_repository: EXPECTED_REPOSITORY,
  repair_executor_job_type: REPAIR_EXECUTOR_JOB_TYPE,
  base_required_ci_checks: BASE_REQUIRED_CI_CHECKS,
  path_sensitive_ci_checks: Object.freeze([HAE_CONTRACT_CHECK, CLOUDFLARE_OWNERSHIP_CHECK]),
  trust_levels: Object.freeze([...TRUST_LEVELS]),
  verifier_role_id: "hermes-qa-evidence-auditor",
  unverified_payload_release_state: "BLOCKED",
  automatic_merge_allowed: false,
  automatic_deploy_allowed: false,
});
