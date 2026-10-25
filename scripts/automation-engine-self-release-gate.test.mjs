import assert from "node:assert/strict";
import {
  evaluateHaeSelfReleaseEvidence,
  normalizeHaeSelfReleaseEvidence,
} from "../workers/automation-engine/src/hae-self-release-gate.mjs";

const patch = "a".repeat(40);
const diff = "b".repeat(64);
const criteria = "c".repeat(64);

const accepted = {
  work_id: "HAE-SELF:contract-drift",
  artifact_key: "workers/automation-engine/src/role-contracts.mjs",
  repair_job_id: "job:repair:1",
  verification_job_id: "job:verify:1",
  repair_owner: {
    role_id: "hermes-automatic-engineer",
    plugin_version: "0.1.25",
  },
  verifier: {
    role_id: "hermes-qa-evidence-auditor",
    plugin_version: "0.1.5",
    verdict: "ACCEPTED",
    criteria_sha256: criteria,
  },
  patch_sha: patch,
  diff_sha256: diff,
  ci_exact_head_sha: patch,
  changed_paths: ["workers/automation-engine/src/hae-self-release-gate.mjs"],
  checks: [
    { name: "Hermes Automation Engine Contract", conclusion: "SUCCESS", head_sha: patch },
    { name: "Website checks", conclusion: "SUCCESS", head_sha: patch },
    { name: "Open-source web quality audit", conclusion: "SUCCESS", head_sha: patch },
  ],
  trust_level: "CONTRACT",
  source_change_performed: false,
  backlog: { p0_open: 0, p1_open: 0, p2_open: 4 },
};

const normalized = normalizeHaeSelfReleaseEvidence(accepted);
assert.equal(normalized.patch_sha, patch);
assert.notEqual(normalized.repair_job_id, normalized.verification_job_id);

const result = evaluateHaeSelfReleaseEvidence(accepted);
assert.equal(result.release_state, "HOLD_RELEASE");
assert.equal(result.independent_verifier_identity_ok, true);
assert.equal(result.repair_job_id, accepted.repair_job_id);
assert.equal(result.verification_job_id, accepted.verification_job_id);
assert.deepEqual(result.required_check_names, [
  "Website checks",
  "Open-source web quality audit",
  "Hermes Automation Engine Contract",
]);
assert.equal(result.human_hold_release_required, true);
assert.equal(result.automatic_merge_allowed, false);
assert.equal(result.automatic_deploy_allowed, false);
assert.equal(result.self_improvement_should_pause, true);
assert.equal(result.next_lane, "BUSINESS_QUEUE");
assert.equal(result.cost_usd, 0);

const stillBlocking = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  backlog: { p0_open: 0, p1_open: 1, p2_open: 3 },
});
assert.equal(stillBlocking.self_improvement_should_pause, false);
assert.equal(stillBlocking.next_lane, "SELF_IMPROVEMENT");

const ciRepair = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  checks: [
    { name: "Hermes Automation Engine Contract", conclusion: "SUCCESS", head_sha: patch },
    { name: "Website checks", conclusion: "FAILURE", head_sha: patch },
    { name: "Open-source web quality audit", conclusion: "SUCCESS", head_sha: patch },
  ],
});
assert.equal(ciRepair.release_state, "REPAIR");
assert.equal(ciRepair.blocker, "CI_NOT_ACCEPTED");

const incompleteCi = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  checks: [{ name: "Hermes Automation Engine Contract", conclusion: "SUCCESS", head_sha: patch }],
});
assert.equal(incompleteCi.release_state, "REPAIR");
assert.equal(incompleteCi.blocker, "CI_NOT_ACCEPTED");
assert.deepEqual(
  incompleteCi.missing_required_checks,
  ["Website checks", "Open-source web quality audit"],
);

const workflowTouch = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  changed_paths: [".github/workflows/automation-engine-contract.yml"],
  checks: accepted.checks,
});
assert.equal(workflowTouch.release_state, "REPAIR");
assert.deepEqual(
  workflowTouch.missing_required_checks,
  ["Cloudflare deployment ownership contract"],
);

const workflowTouchAccepted = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  changed_paths: [".github/workflows/automation-engine-contract.yml"],
  checks: [
    ...accepted.checks,
    { name: "Cloudflare deployment ownership contract", conclusion: "SUCCESS", head_sha: patch },
  ],
});
assert.equal(workflowTouchAccepted.release_state, "HOLD_RELEASE");

const verifierRepair = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  verifier: { ...accepted.verifier, verdict: "REPAIR" },
});
assert.equal(verifierRepair.release_state, "REPAIR");
assert.equal(verifierRepair.blocker, "VERIFIER_REPAIR");

const revert = "d".repeat(40);
const rollbackRepair = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  source_change_performed: true,
  revert_sha: revert,
  revert_checks: accepted.checks.map((item) => ({
    ...item,
    head_sha: revert,
    conclusion: item.name === "Website checks" ? "FAILURE" : "SUCCESS",
  })),
});
assert.equal(rollbackRepair.release_state, "REPAIR");
assert.equal(rollbackRepair.blocker, "ROLLBACK_NOT_VERIFIED");

const rollbackAccepted = evaluateHaeSelfReleaseEvidence({
  ...accepted,
  source_change_performed: true,
  revert_sha: revert,
  revert_checks: accepted.checks.map((item) => ({ ...item, head_sha: revert })),
});
assert.equal(rollbackAccepted.release_state, "HOLD_RELEASE");
assert.equal(rollbackAccepted.rollback_verified, true);

assert.throws(
  () => normalizeHaeSelfReleaseEvidence({
    ...accepted,
    verification_job_id: accepted.repair_job_id,
  }),
  /verification_context_not_independent/,
);
assert.throws(
  () => normalizeHaeSelfReleaseEvidence({
    ...accepted,
    verifier: { ...accepted.verifier, role_id: "hermes-automatic-engineer" },
  }),
  /hae_release_verifier_invalid/,
);
assert.throws(
  () => normalizeHaeSelfReleaseEvidence({
    ...accepted,
    ci_exact_head_sha: "e".repeat(40),
  }),
  /hae_release_ci_head_mismatch/,
);
assert.throws(
  () => normalizeHaeSelfReleaseEvidence({
    ...accepted,
    source_change_performed: true,
    revert_sha: null,
    revert_checks: accepted.checks.map((item) => ({ ...item, head_sha: revert })),
  }),
  /hae_release_revert_sha_invalid/,
);
assert.throws(
  () => normalizeHaeSelfReleaseEvidence({
    ...accepted,
    source_change_performed: true,
    revert_sha: revert,
    revert_ci_verified: true,
    revert_checks: accepted.checks.map((item) => ({ ...item, head_sha: revert })),
  }),
  /legacy_revert_ci_verified_forbidden/,
);

console.log("HAE self-release gate PASS: independent verifier + exact-head CI + rollback + stopping condition -> HOLD_RELEASE");
