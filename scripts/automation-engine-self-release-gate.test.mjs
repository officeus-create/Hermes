import assert from "node:assert/strict";
import {
  evaluateHaeSelfReleaseEvidence,
  HAE_SELF_RELEASE_LIMITS,
  normalizeHaeSelfReleaseEvidence,
} from "../workers/automation-engine/src/hae-self-release-gate.mjs";

const request = {
  work_id: "HAE-SELF:contract-drift",
  artifact_key: "workers/automation-engine/src/hae-self-release-gate.mjs",
  repair_job_id: "job:repair:1",
};

const normalized = normalizeHaeSelfReleaseEvidence(request);
assert.deepEqual(normalized, request);

const result = evaluateHaeSelfReleaseEvidence(request);
assert.equal(result.release_state, "BLOCKED");
assert.equal(result.blocker, "AUTHENTICATED_RELEASE_EVIDENCE_UNAVAILABLE");
assert.equal(result.hold_release_reachable, false);
assert.equal(result.independent_verifier_identity_ok, false);
assert.equal(result.exact_head_ci_verified, false);
assert.equal(result.rollback_required, true);
assert.equal(result.rollback_verified, false);
assert.equal(result.automatic_merge_allowed, false);
assert.equal(result.automatic_deploy_allowed, false);
assert.equal(result.human_hold_release_required, true);
assert.equal(result.self_improvement_should_pause, false);
assert.equal(result.next_lane, "SELF_IMPROVEMENT");
assert.equal(result.cost_usd, 0);
assert.equal(result.verifier.role_id, "hermes-qa-evidence-auditor");
assert.equal(result.verifier.plugin_version, "0.1.5");
assert.equal(result.repair_owner.role_id, "hermes-automatic-engineer");
assert.equal(result.repair_owner.plugin_version, "0.1.25");
assert.ok(result.future_required_evidence.includes("D1_AUTHENTICATED_QA_VERIFIER_RECEIPT"));
assert.ok(result.future_required_evidence.includes("GITHUB_AUTHENTICATED_ROLLBACK_EQUIVALENCE"));

for (const [field, value] of Object.entries({
  verifier: { verdict: "ACCEPTED" },
  verification_job_id: "job:verify:fake",
  repair_owner: { role_id: "hermes-automatic-engineer" },
  base_sha: "a".repeat(40),
  patch_sha: "b".repeat(40),
  diff_sha256: "c".repeat(64),
  changed_paths: ["safe.txt"],
  checks: [],
  trust_level: "CONTRACT",
  source_change_performed: false,
  revert_sha: "d".repeat(40),
  revert_checks: [],
  backlog: { p0_open: 0, p1_open: 0, p2_open: 0 },
  github_evidence: {},
  repair_receipt: {},
  verifier_receipt: {},
  source_class: "GITHUB_API_AUTHENTICATED",
})) {
  assert.throws(
    () => normalizeHaeSelfReleaseEvidence({ ...request, [field]: value }),
    new RegExp(`payload_field_${field}_forbidden`),
    `${field} must never be accepted outside the three-field allowlist`,
  );
}

for (const extraField of ["verdict", "head_sha", "ci_status", "rollback_verified", "authenticated", "unexpected"]) {
  assert.throws(
    () => normalizeHaeSelfReleaseEvidence({ ...request, [extraField]: "forged" }),
    new RegExp(`payload_field_${extraField}_forbidden`),
    `${extraField} must be rejected even when it was never anticipated by a denylist`,
  );
}

assert.equal(Object.keys(normalized).length, 3);
assert.equal(HAE_SELF_RELEASE_LIMITS.hold_release_reachable, false);
assert.equal(HAE_SELF_RELEASE_LIMITS.automatic_merge_allowed, false);
assert.equal(HAE_SELF_RELEASE_LIMITS.automatic_deploy_allowed, false);
assert.match(HAE_SELF_RELEASE_LIMITS.rollback_binding_requirement, /inverse\/restoration/);
assert.ok(HAE_SELF_RELEASE_LIMITS.activation_dependencies.some((item) => item.includes("#2067")));
assert.ok(HAE_SELF_RELEASE_LIMITS.activation_dependencies.some((item) => item.includes("#2068")));

console.log("HAE self-release gate PASS: HOLD_RELEASE is unreachable until authenticated repair/verifier/GitHub/rollback evidence adapters exist");
