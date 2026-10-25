import assert from "node:assert/strict";
import {
  createVerifiedHaeSelfReleaseContext,
  evaluateHaeSelfReleaseEvidence,
  normalizeHaeSelfReleaseEvidence,
} from "../workers/automation-engine/src/hae-self-release-gate.mjs";

const base = "f".repeat(40);
const patch = "a".repeat(40);
const revert = "d".repeat(40);
const diff = "b".repeat(64);
const criteria = "c".repeat(64);
const changedPaths = [
  ".github/workflows/automation-engine-contract.yml",
  "workers/automation-engine/src/hae-self-release-gate.mjs",
];
const requiredNames = [
  "Website checks",
  "Open-source web quality audit",
  "Hermes Automation Engine Contract",
  "Cloudflare deployment ownership contract",
];

function checks(headSha, { failing = null, omit = null, start = 100 } = {}) {
  return requiredNames
    .filter((name) => name !== omit)
    .map((name, index) => ({
      name,
      conclusion: name === failing ? "FAILURE" : "SUCCESS",
      head_sha: headSha,
      workflow_run_id: start + index,
      job_id: start * 10 + index,
    }));
}

const request = {
  work_id: "HAE-SELF:contract-drift",
  artifact_key: "workers/automation-engine/src/hae-self-release-gate.mjs",
  repair_job_id: "job:repair:1",
  verifier: {
    verdict: "ACCEPTED",
    criteria_sha256: criteria,
  },
};

const contextInput = {
  verification_job_id: "job:verify:1",
  repair_receipt: {
    source_class: "D1_AUTHENTICATED_READBACK",
    job_id: "job:repair:1",
    job_type: "hae.self.repair.execute",
    state: "SUCCEEDED",
    work_id: request.work_id,
    artifact_key: request.artifact_key,
    role_id: "hermes-automatic-engineer",
    plugin_version: "0.1.25",
    base_sha: base,
    patch_sha: patch,
    diff_sha256: diff,
    changed_paths: changedPaths,
    rollback_recipe_present: true,
  },
  github_evidence: {
    source_class: "GITHUB_API_AUTHENTICATED",
    repository: "officeus-create/Hermes",
    evidence_ref: "github://officeus-create/Hermes/pull/999/head",
    base_sha: base,
    patch_sha: patch,
    diff_sha256: diff,
    changed_paths: changedPaths,
    checks: checks(patch),
    revert_sha: revert,
    revert_checks: checks(revert, { start: 200 }),
  },
  backlog: {
    source_class: "D1_AUTHENTICATED_READBACK",
    p0_open: 0,
    p1_open: 0,
    p2_open: 4,
  },
  trust_level: "CONTRACT",
};

const unverified = normalizeHaeSelfReleaseEvidence(request);
assert.equal(unverified.verified_context, false);

const blocked = evaluateHaeSelfReleaseEvidence(request);
assert.equal(blocked.release_state, "BLOCKED");
assert.equal(blocked.blocker, "VERIFIED_EVIDENCE_CONTEXT_REQUIRED");
assert.equal(blocked.independent_verifier_identity_ok, false);
assert.equal(blocked.automatic_merge_allowed, false);
assert.equal(blocked.automatic_deploy_allowed, false);
assert.equal(blocked.cost_usd, 0);

const verifiedContext = createVerifiedHaeSelfReleaseContext(contextInput);
const normalized = normalizeHaeSelfReleaseEvidence(request, verifiedContext);
assert.equal(normalized.verified_context, true);
assert.equal(normalized.patch_sha, patch);
assert.equal(normalized.base_sha, base);
assert.notEqual(normalized.repair_job_id, normalized.verification_job_id);

const result = evaluateHaeSelfReleaseEvidence(request, verifiedContext);
assert.equal(result.release_state, "HOLD_RELEASE");
assert.equal(result.independent_verifier_identity_ok, true);
assert.deepEqual(result.required_check_names, requiredNames);
assert.equal(result.source_change_performed, true);
assert.equal(result.rollback_required, true);
assert.equal(result.rollback_verified, true);
assert.equal(result.human_hold_release_required, true);
assert.equal(result.automatic_merge_allowed, false);
assert.equal(result.automatic_deploy_allowed, false);
assert.equal(result.self_improvement_should_pause, true);
assert.equal(result.next_lane, "BUSINESS_QUEUE");
assert.equal(result.cost_usd, 0);
assert.ok(result.checks.every((item) => Number.isInteger(item.workflow_run_id) && Number.isInteger(item.job_id)));

const stillBlockingContext = createVerifiedHaeSelfReleaseContext({
  ...contextInput,
  backlog: {
    source_class: "D1_AUTHENTICATED_READBACK",
    p0_open: 0,
    p1_open: 1,
    p2_open: 3,
  },
});
const stillBlocking = evaluateHaeSelfReleaseEvidence(request, stillBlockingContext);
assert.equal(stillBlocking.self_improvement_should_pause, false);
assert.equal(stillBlocking.next_lane, "SELF_IMPROVEMENT");

const ciRepairContext = createVerifiedHaeSelfReleaseContext({
  ...contextInput,
  github_evidence: {
    ...contextInput.github_evidence,
    checks: checks(patch, { failing: "Website checks" }),
  },
});
const ciRepair = evaluateHaeSelfReleaseEvidence(request, ciRepairContext);
assert.equal(ciRepair.release_state, "REPAIR");
assert.equal(ciRepair.blocker, "CI_NOT_ACCEPTED");

const incompleteCiContext = createVerifiedHaeSelfReleaseContext({
  ...contextInput,
  github_evidence: {
    ...contextInput.github_evidence,
    checks: checks(patch, { omit: "Cloudflare deployment ownership contract" }),
  },
});
const incompleteCi = evaluateHaeSelfReleaseEvidence(request, incompleteCiContext);
assert.equal(incompleteCi.release_state, "REPAIR");
assert.deepEqual(incompleteCi.missing_required_checks, ["Cloudflare deployment ownership contract"]);

const rollbackRepairContext = createVerifiedHaeSelfReleaseContext({
  ...contextInput,
  github_evidence: {
    ...contextInput.github_evidence,
    revert_checks: checks(revert, { failing: "Website checks", start: 200 }),
  },
});
const rollbackRepair = evaluateHaeSelfReleaseEvidence(request, rollbackRepairContext);
assert.equal(rollbackRepair.release_state, "REPAIR");
assert.equal(rollbackRepair.blocker, "ROLLBACK_NOT_VERIFIED");

const verifierRepair = evaluateHaeSelfReleaseEvidence(
  { ...request, verifier: { ...request.verifier, verdict: "REPAIR" } },
  verifiedContext,
);
assert.equal(verifierRepair.release_state, "REPAIR");
assert.equal(verifierRepair.blocker, "VERIFIER_REPAIR");

assert.throws(
  () => normalizeHaeSelfReleaseEvidence({ ...request, verification_job_id: "job:fake" }),
  /self_asserted_verification_job_id_forbidden/,
);
assert.throws(
  () => normalizeHaeSelfReleaseEvidence({ ...request, changed_paths: ["safe.txt"] }),
  /self_asserted_changed_paths_forbidden/,
);
assert.throws(
  () => normalizeHaeSelfReleaseEvidence({ ...request, source_change_performed: false }),
  /self_asserted_source_change_performed_forbidden/,
);
assert.throws(
  () => createVerifiedHaeSelfReleaseContext({
    ...contextInput,
    verification_job_id: request.repair_job_id,
  }),
  /verification_context_not_independent/,
);
assert.throws(
  () => createVerifiedHaeSelfReleaseContext({
    ...contextInput,
    repair_receipt: {
      ...contextInput.repair_receipt,
      source_class: "PAYLOAD_ASSERTED",
    },
  }),
  /repair_receipt_source_unverified/,
);
assert.throws(
  () => createVerifiedHaeSelfReleaseContext({
    ...contextInput,
    github_evidence: {
      ...contextInput.github_evidence,
      changed_paths: ["workers/automation-engine/src/hae-self-release-gate.mjs"],
    },
  }),
  /repair_github_evidence_mismatch/,
);
assert.throws(
  () => createVerifiedHaeSelfReleaseContext({
    ...contextInput,
    github_evidence: {
      ...contextInput.github_evidence,
      diff_sha256: "e".repeat(64),
    },
  }),
  /repair_github_evidence_mismatch/,
);
assert.throws(
  () => createVerifiedHaeSelfReleaseContext({
    ...contextInput,
    github_evidence: {
      ...contextInput.github_evidence,
      checks: contextInput.github_evidence.checks.map(({ workflow_run_id, ...item }) => item),
    },
  }),
  /checks_workflow_run_id_invalid/,
);
assert.throws(
  () => createVerifiedHaeSelfReleaseContext({
    ...contextInput,
    github_evidence: {
      ...contextInput.github_evidence,
      revert_sha: patch,
    },
  }),
  /revert_sha_same_as_patch/,
);

console.log("HAE self-release gate PASS: payload cannot self-assert independence, GitHub paths/checks, or rollback -> sealed evidence required");
