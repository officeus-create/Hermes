import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";

const MAX_CHECKS = 30;
const MAX_CHANGED_PATHS = 100;
const BASE_REQUIRED_CI_CHECKS = Object.freeze([
  "Website checks",
  "Open-source web quality audit",
]);
const HAE_CONTRACT_CHECK = "Hermes Automation Engine Contract";
const CLOUDFLARE_OWNERSHIP_CHECK = "Cloudflare deployment ownership contract";
const TRUST_LEVELS = new Set(["LOW_RISK_DRAFT", "CONTRACT", "SCHEMA", "PROVIDER_WRITE"]);
const VERDICTS = new Set(["ACCEPTED", "REPAIR", "BLOCKED"]);

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function integer(value, field) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 1000000) {
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

function bool(value, field) {
  if (typeof value !== "boolean") throw new Error(`hae_release_${field}_required`);
  return value;
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
    if (!name || !["SUCCESS", "FAILURE", "CANCELLED", "SKIPPED", "NEUTRAL"].includes(conclusion)) {
      throw new Error(`hae_release_${field}_item_invalid`);
    }
    if (seen.has(name)) throw new Error(`hae_release_${field}_duplicate_name`);
    seen.add(name);
    return { name, conclusion, head_sha: headSha };
  });
}

function normalizeChangedPaths(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CHANGED_PATHS) {
    throw new Error("hae_release_changed_paths_invalid");
  }
  const seen = new Set();
  return value.map((item) => {
    const path = clean(item, 300);
    if (!path || path.startsWith("/") || path.includes("..") || path.includes("\\")) {
      throw new Error("hae_release_changed_path_invalid");
    }
    if (seen.has(path)) throw new Error("hae_release_changed_path_duplicate");
    seen.add(path);
    return path;
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
  const failingChecks = checks.filter(
    (item) => item.head_sha !== expectedSha || item.conclusion !== "SUCCESS",
  );
  return {
    accepted: missingRequiredChecks.length === 0 && failingChecks.length === 0,
    missing_required_checks: missingRequiredChecks,
    failing_checks: failingChecks,
  };
}

export function normalizeHaeSelfReleaseEvidence(input = {}) {
  const workId = clean(input.work_id, 180);
  if (!/^HAE-SELF:[A-Za-z0-9._:-]+$/.test(workId)) throw new Error("hae_release_work_id_invalid");

  const repairJobId = clean(input.repair_job_id, 180);
  const verificationJobId = clean(input.verification_job_id, 180);
  if (!repairJobId || !verificationJobId || repairJobId === verificationJobId) {
    throw new Error("hae_release_verification_context_not_independent");
  }

  const repairRoleId = clean(input.repair_owner?.role_id, 120);
  const repairPluginVersion = clean(input.repair_owner?.plugin_version, 80);
  if (
    repairRoleId !== "hermes-automatic-engineer"
    || repairPluginVersion !== pluginRuntimeVersion("hermes-automatic-engineer")
  ) {
    throw new Error("hae_release_repair_owner_invalid");
  }

  const verifierRoleId = clean(input.verifier?.role_id, 120);
  const verifierPluginVersion = clean(input.verifier?.plugin_version, 80);
  const verifierVerdict = clean(input.verifier?.verdict, 40).toUpperCase();
  const criteriaSha256 = sha(input.verifier?.criteria_sha256, 64, "verifier_criteria_sha256");
  if (
    verifierRoleId !== "hermes-qa-evidence-auditor"
    || verifierPluginVersion !== pluginRuntimeVersion("hermes-qa-evidence-auditor")
    || verifierRoleId === repairRoleId
    || !VERDICTS.has(verifierVerdict)
  ) {
    throw new Error("hae_release_verifier_invalid");
  }

  const patchSha = sha(input.patch_sha, 40, "patch_sha");
  const diffSha256 = sha(input.diff_sha256, 64, "diff_sha256");
  const ciExactHeadSha = sha(input.ci_exact_head_sha, 40, "ci_exact_head_sha");
  if (patchSha !== ciExactHeadSha) throw new Error("hae_release_ci_head_mismatch");

  const changedPaths = normalizeChangedPaths(input.changed_paths);
  const requiredCheckNames = requiredCiChecksForPaths(changedPaths);
  const checks = normalizeChecks(input.checks, "checks");

  const trustLevel = clean(input.trust_level, 40).toUpperCase();
  if (!TRUST_LEVELS.has(trustLevel)) throw new Error("hae_release_trust_level_invalid");

  const sourceChangePerformed = bool(input.source_change_performed, "source_change_performed");
  if (input.revert_ci_verified != null) throw new Error("hae_release_legacy_revert_ci_verified_forbidden");
  let revertSha = null;
  let revertChecks = [];
  if (sourceChangePerformed) {
    revertSha = sha(input.revert_sha, 40, "revert_sha");
    revertChecks = normalizeChecks(input.revert_checks, "revert_checks");
  } else if (input.revert_sha != null || input.revert_checks != null) {
    throw new Error("hae_release_revert_without_source_change");
  }

  const backlog = {
    p0_open: integer(input.backlog?.p0_open, "backlog_p0"),
    p1_open: integer(input.backlog?.p1_open, "backlog_p1"),
    p2_open: integer(input.backlog?.p2_open, "backlog_p2"),
  };

  return {
    work_id: workId,
    artifact_key: clean(input.artifact_key, 240),
    repair_job_id: repairJobId,
    verification_job_id: verificationJobId,
    repair_owner: { role_id: repairRoleId, plugin_version: repairPluginVersion },
    verifier: {
      role_id: verifierRoleId,
      plugin_version: verifierPluginVersion,
      verdict: verifierVerdict,
      criteria_sha256: criteriaSha256,
    },
    patch_sha: patchSha,
    diff_sha256: diffSha256,
    ci_exact_head_sha: ciExactHeadSha,
    changed_paths: changedPaths,
    required_check_names: requiredCheckNames,
    checks,
    trust_level: trustLevel,
    source_change_performed: sourceChangePerformed,
    revert_sha: revertSha,
    revert_checks: revertChecks,
    backlog,
  };
}

export function evaluateHaeSelfReleaseEvidence(input = {}) {
  const evidence = normalizeHaeSelfReleaseEvidence(input);
  const ci = evaluateCheckSet(evidence.checks, evidence.patch_sha, evidence.required_check_names);
  const rollback = evidence.source_change_performed
    ? evaluateCheckSet(evidence.revert_checks, evidence.revert_sha, evidence.required_check_names)
    : { accepted: true, missing_required_checks: [], failing_checks: [] };
  const ciAccepted = ci.accepted;
  const rollbackAccepted = rollback.accepted;
  const verifierAccepted = evidence.verifier.verdict === "ACCEPTED";

  let release_state = "HOLD_RELEASE";
  let blocker = null;
  if (evidence.verifier.verdict === "BLOCKED") {
    release_state = "BLOCKED";
    blocker = "VERIFIER_BLOCKED";
  } else if (!verifierAccepted) {
    release_state = "REPAIR";
    blocker = "VERIFIER_REPAIR";
  } else if (!ciAccepted) {
    release_state = "REPAIR";
    blocker = "CI_NOT_ACCEPTED";
  } else if (!rollbackAccepted) {
    release_state = "REPAIR";
    blocker = "ROLLBACK_NOT_VERIFIED";
  }

  const blockingSelfWork = evidence.backlog.p0_open + evidence.backlog.p1_open;
  const selfImprovementShouldPause = blockingSelfWork === 0 && release_state === "HOLD_RELEASE";

  return {
    receipt_version: "hae-self-release-v1",
    work_id: evidence.work_id,
    artifact_key: evidence.artifact_key || null,
    patch_sha: evidence.patch_sha,
    diff_sha256: evidence.diff_sha256,
    ci_exact_head_sha: evidence.ci_exact_head_sha,
    changed_paths: evidence.changed_paths,
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
    source_change_performed: evidence.source_change_performed,
    rollback_required: evidence.source_change_performed,
    rollback_verified: rollbackAccepted,
    revert_sha: evidence.revert_sha,
    revert_checks: evidence.revert_checks,
    rollback_missing_required_checks: rollback.missing_required_checks,
    rollback_failing_checks: rollback.failing_checks,
    trust_level: evidence.trust_level,
    release_state,
    blocker,
    automatic_merge_allowed: false,
    automatic_deploy_allowed: false,
    human_hold_release_required: true,
    backlog: evidence.backlog,
    self_improvement_should_pause: selfImprovementShouldPause,
    next_lane: selfImprovementShouldPause ? "BUSINESS_QUEUE" : "SELF_IMPROVEMENT",
    cost_usd: 0,
  };
}

export const HAE_SELF_RELEASE_LIMITS = Object.freeze({
  max_checks: MAX_CHECKS,
  max_changed_paths: MAX_CHANGED_PATHS,
  base_required_ci_checks: BASE_REQUIRED_CI_CHECKS,
  path_sensitive_ci_checks: Object.freeze([HAE_CONTRACT_CHECK, CLOUDFLARE_OWNERSHIP_CHECK]),
  trust_levels: Object.freeze([...TRUST_LEVELS]),
  verifier_role_id: "hermes-qa-evidence-auditor",
  automatic_merge_allowed: false,
  automatic_deploy_allowed: false,
});
