import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";

const MAX_CHECKS = 30;
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

  if (!Array.isArray(input.checks) || input.checks.length === 0 || input.checks.length > MAX_CHECKS) {
    throw new Error("hae_release_checks_invalid");
  }
  const checks = input.checks.map((item) => {
    const name = clean(item?.name, 160);
    const conclusion = clean(item?.conclusion, 40).toUpperCase();
    const headSha = sha(item?.head_sha, 40, "check_head_sha");
    if (!name || !["SUCCESS", "FAILURE", "CANCELLED", "SKIPPED", "NEUTRAL"].includes(conclusion)) {
      throw new Error("hae_release_check_invalid");
    }
    return { name, conclusion, head_sha: headSha };
  });

  const trustLevel = clean(input.trust_level, 40).toUpperCase();
  if (!TRUST_LEVELS.has(trustLevel)) throw new Error("hae_release_trust_level_invalid");

  const sourceChangePerformed = bool(input.source_change_performed, "source_change_performed");
  let revertSha = null;
  let revertCiVerified = false;
  if (sourceChangePerformed) {
    revertSha = sha(input.revert_sha, 40, "revert_sha");
    revertCiVerified = bool(input.revert_ci_verified, "revert_ci_verified");
  } else if (input.revert_sha != null || input.revert_ci_verified != null) {
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
    checks,
    trust_level: trustLevel,
    source_change_performed: sourceChangePerformed,
    revert_sha: revertSha,
    revert_ci_verified: revertCiVerified,
    backlog,
  };
}

export function evaluateHaeSelfReleaseEvidence(input = {}) {
  const evidence = normalizeHaeSelfReleaseEvidence(input);
  const failingChecks = evidence.checks.filter(
    (item) => item.head_sha !== evidence.patch_sha || item.conclusion !== "SUCCESS",
  );
  const ciAccepted = failingChecks.length === 0;
  const rollbackAccepted = !evidence.source_change_performed || evidence.revert_ci_verified;
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
    checks: evidence.checks,
    failing_check_count: failingChecks.length,
    verifier: evidence.verifier,
    repair_owner: evidence.repair_owner,
    independent_verifier_identity_ok:
      evidence.repair_job_id !== evidence.verification_job_id
      && evidence.repair_owner.role_id !== evidence.verifier.role_id,
    source_change_performed: evidence.source_change_performed,
    rollback_required: evidence.source_change_performed,
    rollback_verified: rollbackAccepted,
    revert_sha: evidence.revert_sha,
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
  trust_levels: Object.freeze([...TRUST_LEVELS]),
  verifier_role_id: "hermes-qa-evidence-auditor",
  automatic_merge_allowed: false,
  automatic_deploy_allowed: false,
});
