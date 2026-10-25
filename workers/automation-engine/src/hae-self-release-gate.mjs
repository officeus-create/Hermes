import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";

const MAX_WORK_ID = 180;
const MAX_ARTIFACT_KEY = 240;
const MAX_JOB_ID = 180;
const ALLOWED_INPUT_FIELDS = Object.freeze([
  "work_id",
  "artifact_key",
  "repair_job_id",
]);
const ALLOWED_INPUT_FIELD_SET = new Set(ALLOWED_INPUT_FIELDS);

const FUTURE_REQUIRED_EVIDENCE = Object.freeze([
  "D1_AUTHENTICATED_REPAIR_EXECUTOR_RECEIPT",
  "D1_AUTHENTICATED_QA_VERIFIER_RECEIPT",
  "GITHUB_AUTHENTICATED_BASE_HEAD_DIFF_AND_CHANGED_PATHS",
  "GITHUB_AUTHENTICATED_REQUIRED_CHECK_RUNS",
  "GITHUB_AUTHENTICATED_ROLLBACK_EQUIVALENCE",
  "D1_AUTHENTICATED_SELF_BACKLOG",
]);

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function normalizeArtifactKey(value) {
  const artifactKey = clean(value, MAX_ARTIFACT_KEY);
  if (
    !artifactKey
    || artifactKey.startsWith("/")
    || artifactKey.includes("..")
    || artifactKey.includes("\\")
  ) {
    throw new Error("hae_release_artifact_key_invalid");
  }
  return artifactKey;
}

export function normalizeHaeSelfReleaseEvidence(input = {}) {
  const workId = clean(input.work_id, MAX_WORK_ID);
  if (!/^HAE-SELF:[A-Za-z0-9._:-]+$/.test(workId)) {
    throw new Error("hae_release_work_id_invalid");
  }

  const artifactKey = normalizeArtifactKey(input.artifact_key);
  const repairJobId = clean(input.repair_job_id, MAX_JOB_ID);
  if (!repairJobId) throw new Error("hae_release_repair_job_id_required");

  for (const field of Object.keys(input)) {
    if (!ALLOWED_INPUT_FIELD_SET.has(field)) {
      throw new Error(`hae_release_payload_field_${clean(field, 80) || "unknown"}_forbidden`);
    }
  }

  return {
    work_id: workId,
    artifact_key: artifactKey,
    repair_job_id: repairJobId,
  };
}

export function evaluateHaeSelfReleaseEvidence(input = {}) {
  const request = normalizeHaeSelfReleaseEvidence(input);

  return {
    receipt_version: "hae-self-release-v3",
    work_id: request.work_id,
    artifact_key: request.artifact_key,
    repair_job_id: request.repair_job_id,
    verification_job_id: null,
    release_state: "BLOCKED",
    blocker: "AUTHENTICATED_RELEASE_EVIDENCE_UNAVAILABLE",
    hold_release_reachable: false,
    verifier: {
      role_id: "hermes-qa-evidence-auditor",
      plugin_version: pluginRuntimeVersion("hermes-qa-evidence-auditor"),
      verdict: null,
    },
    repair_owner: {
      role_id: "hermes-automatic-engineer",
      plugin_version: pluginRuntimeVersion("hermes-automatic-engineer"),
    },
    independent_verifier_identity_ok: false,
    exact_head_ci_verified: false,
    rollback_required: true,
    rollback_verified: false,
    future_required_evidence: [...FUTURE_REQUIRED_EVIDENCE],
    automatic_merge_allowed: false,
    automatic_deploy_allowed: false,
    human_hold_release_required: true,
    self_improvement_should_pause: false,
    next_lane: "SELF_IMPROVEMENT",
    cost_usd: 0,
  };
}

export const HAE_SELF_RELEASE_LIMITS = Object.freeze({
  hold_release_reachable: false,
  activation_dependencies: Object.freeze([
    "#2067 authenticated GitHub/CI event sensor",
    "#2068 DRAFT_ONLY repair executor with D1 repair receipt",
    "D1-backed independent QA verifier receipt",
  ]),
  future_required_evidence: FUTURE_REQUIRED_EVIDENCE,
  rollback_binding_requirement: "revert must be proven as inverse/restoration of the exact repaired change, not merely a distinct green SHA",
  verifier_role_id: "hermes-qa-evidence-auditor",
  repair_role_id: "hermes-automatic-engineer",
  automatic_merge_allowed: false,
  automatic_deploy_allowed: false,
});
