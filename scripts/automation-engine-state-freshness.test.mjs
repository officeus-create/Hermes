import assert from "node:assert/strict";
import { auditHaeState } from "../workers/automation-engine/src/state-freshness.mjs";

const sha = "a".repeat(40);
const completeProof = {
  authenticated_deployment: true,
  private_health: true,
  d1: true,
  queue: true,
  dlq: true,
  cron_heartbeat: true,
  read_only_job_receipt: true,
  idempotency_replay: true,
  dry_run: true,
  publication_disabled: true,
  independent_qa: true,
};

const clean = auditHaeState({
  current_main_sha: sha,
  claimed_state: "LIVE_VERIFIED",
  gate_phase: "PROVIDER_LIVE",
  expected_runtime_sha: sha,
  pr: { behind_by: 0, exact_scope_verified: true },
  plugin: { installed: true, version: "0.1.13" },
  runtime: {
    source_sha: sha,
    publication_enabled: true,
    proof: completeProof,
  },
});
assert.equal(clean.status, "CONSISTENT");
assert.equal(clean.live_proof_complete, true);

const accessGap = auditHaeState({
  current_main_sha: sha,
  claimed_state: "CI_GREEN",
  gate_phase: "READ_ONLY_RELIABILITY",
  pr: { behind_by: 0, exact_scope_verified: true },
  plugin: { installed: true, version: "0.1.13" },
  runtime: {
    source_sha: null,
    publication_enabled: false,
    proof: {},
  },
});
assert.equal(accessGap.status, "UNKNOWN");
assert.ok(accessGap.unknowns.some((item) => item.code === "RUNTIME_SOURCE_SHA_UNKNOWN"));
assert.ok(!accessGap.findings.some((item) => item.code === "PLUGIN_MISTAKEN_FOR_RUNTIME"));
assert.equal(accessGap.live_proof_complete, false);
assert.equal(accessGap.missing_live_proof, null);

const falseLive = auditHaeState({
  current_main_sha: sha,
  claimed_state: "LIVE_VERIFIED",
  gate_phase: "READ_ONLY_RELIABILITY",
  pr: { behind_by: 2, exact_scope_verified: false },
  plugin: { installed: true, version: "0.1.13" },
  runtime: {
    source_sha: "b".repeat(40),
    publication_enabled: true,
    proof: { private_health: true },
    metrics_unknown_as_zero: true,
  },
  expected_runtime_sha: sha,
});
assert.equal(falseLive.status, "BLOCKED");
for (const code of [
  "PR_STALE_TO_CURRENT_MAIN",
  "PR_SCOPE_UNVERIFIED",
  "PUBLICATION_GATE_VIOLATION",
  "RUNTIME_SOURCE_DRIFT",
  "FALSE_LIVE_CLAIM",
  "UNKNOWN_COERCED_TO_ZERO",
]) {
  assert.ok(falseLive.blockers.some((item) => item.code === code), `Missing blocker ${code}`);
}

const evidenceComplete = auditHaeState({
  current_main_sha: sha,
  claimed_state: "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
  gate_phase: "READ_ONLY_RELIABILITY",
  expected_runtime_sha: sha,
  pr: { behind_by: 0, exact_scope_verified: true },
  plugin: { installed: true },
  runtime: {
    source_sha: sha,
    publication_enabled: false,
    proof: completeProof,
  },
});
assert.equal(evidenceComplete.status, "CONSISTENT");
assert.equal(evidenceComplete.live_proof_complete, true);

const evidenceWithoutExpectedSha = auditHaeState({
  current_main_sha: sha,
  claimed_state: "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
  gate_phase: "READ_ONLY_RELIABILITY",
  pr: { behind_by: 0, exact_scope_verified: true },
  runtime: { source_sha: sha, publication_enabled: false, proof: completeProof },
});
assert.equal(evidenceWithoutExpectedSha.status, "BLOCKED");
assert.ok(evidenceWithoutExpectedSha.blockers.some((item) => item.code === "EXPECTED_RUNTIME_SHA_UNKNOWN"));

const evidenceWithWrongSha = auditHaeState({
  current_main_sha: sha,
  claimed_state: "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
  gate_phase: "READ_ONLY_RELIABILITY",
  expected_runtime_sha: sha,
  pr: { behind_by: 0, exact_scope_verified: true },
  runtime: { source_sha: "b".repeat(40), publication_enabled: false, proof: completeProof },
});
assert.equal(evidenceWithWrongSha.status, "BLOCKED");
assert.ok(evidenceWithWrongSha.blockers.some((item) => item.code === "RUNTIME_SOURCE_DRIFT"));

const typoPhase = auditHaeState({
  current_main_sha: sha,
  claimed_state: "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
  gate_phase: "READ_ONLY_RELIABILTY",
  expected_runtime_sha: sha,
  pr: { behind_by: 0, exact_scope_verified: true },
  runtime: { source_sha: sha, publication_enabled: false, proof: completeProof },
});
assert.equal(typoPhase.status, "BLOCKED");
assert.ok(typoPhase.blockers.some((item) => item.code === "GATE_PHASE_UNKNOWN"));

for (const gate_phase of [undefined, null, "", "   "]) {
  const missingPhase = auditHaeState({
    current_main_sha: sha,
    claimed_state: "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
    ...(gate_phase !== undefined ? { gate_phase } : {}),
    expected_runtime_sha: sha,
    pr: { behind_by: 0, exact_scope_verified: true },
    runtime: { source_sha: sha, publication_enabled: false, proof: completeProof },
  });
  assert.equal(missingPhase.status, "BLOCKED");
  assert.ok(missingPhase.blockers.some((item) => item.code === "GATE_PHASE_UNKNOWN"));
  assert.equal(missingPhase.live_proof_complete, false);
}

const evidenceClaimWithoutProof = auditHaeState({
  current_main_sha: sha,
  claimed_state: "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
  gate_phase: "READ_ONLY_RELIABILITY",
  pr: { behind_by: 0, exact_scope_verified: true },
  plugin: { installed: true },
  runtime: { source_sha: sha, publication_enabled: false, proof: { private_health: true } },
});
assert.ok(evidenceClaimWithoutProof.blockers.some((item) => item.code === "RUNTIME_PROOF_INCOMPLETE"));
const incompleteFinding = evidenceClaimWithoutProof.blockers.find((item) => item.code === "RUNTIME_PROOF_INCOMPLETE");
assert.ok(incompleteFinding.missing.includes("independent_qa"));
assert.ok(incompleteFinding.missing.includes("authenticated_deployment"));

const publicationUnknown = auditHaeState({
  current_main_sha: sha,
  claimed_state: "CI_GREEN",
  gate_phase: "READ_ONLY_RELIABILITY",
  pr: { behind_by: 0, exact_scope_verified: true },
  runtime: { source_sha: sha, proof: {} },
});
assert.equal(publicationUnknown.status, "UNKNOWN");
assert.ok(publicationUnknown.unknowns.some((item) => item.code === "PUBLICATION_GATE_UNKNOWN"));
assert.equal(publicationUnknown.live_proof_complete, false);
assert.equal(publicationUnknown.missing_live_proof, null);

const pluginOnly = auditHaeState({
  current_main_sha: sha,
  claimed_state: "LIVE_VERIFIED",
  gate_phase: "PROVIDER_LIVE",
  pr: { behind_by: 0, exact_scope_verified: true },
  plugin: { installed: true },
  runtime: { source_sha: sha, publication_enabled: false },
});
assert.ok(pluginOnly.blockers.some((item) => item.code === "PLUGIN_MISTAKEN_FOR_RUNTIME"));
assert.ok(pluginOnly.blockers.some((item) => item.code === "FALSE_LIVE_CLAIM"));

console.log("HAE state freshness contract PASS");
