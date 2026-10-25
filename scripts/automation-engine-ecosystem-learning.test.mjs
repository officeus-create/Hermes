import { normalizeHistoricalSource } from "../workers/automation-engine/src/historical-learning.mjs";
import assert from "node:assert/strict";
import {
  ECOSYSTEM_SOURCE_FAMILIES,
  normalizeEcosystemLearningSource,
  evaluateEcosystemLearningCoverage,
  proposeHistoricalLearningSourceJobs,
} from "../workers/automation-engine/src/ecosystem-learning-preflight.mjs";

const clean = {
  source_family: "github_ci",
  source_id: "github:hermes:main",
  access_state: "READ_ONLY_READY",
  scan_state: "VERIFIED_SCAN",
  expected_count: 2,
  seen_count: 2,
  classified_count: 2,
  gap_count: 0,
  coverage_complete: true,
  redaction_verified: true,
  source_verified: true,
  scanned_at: "2026-10-26T00:00:00Z",
  evidence_hash: "sha256:" + "a".repeat(64),
};
assert.equal(normalizeEcosystemLearningSource(clean).status, "COMPLETE");
assert.equal(evaluateEcosystemLearningCoverage([clean]).status, "PARTIAL_COVERAGE");
assert.ok(evaluateEcosystemLearningCoverage([clean]).missing_families.includes("authorized_gmail"));
assert.equal(evaluateEcosystemLearningCoverage([clean]).automatic_knowledge_promotion_allowed, false);
assert.equal(evaluateEcosystemLearningCoverage([clean]).automatic_plugin_update_allowed, false);
assert.equal(evaluateEcosystemLearningCoverage([clean]).paid_ai_cost_usd, 0);
assert.equal(ECOSYSTEM_SOURCE_FAMILIES.length, 9);
for (const field of ["raw_text", "email", "message_body", "access_token", "url", "content"]) {
  assert.throws(() => normalizeEcosystemLearningSource({ ...clean, [field]: "private" }), /ecosystem_unexpected_field/);
}
assert.throws(() => normalizeEcosystemLearningSource({ ...clean, source_id: "staff@example.com" }), /ecosystem_source_id_invalid/);
assert.throws(() => normalizeEcosystemLearningSource({ ...clean, source_id: "https://example.com" }), /ecosystem_source_id_invalid/);
assert.throws(() => normalizeEcosystemLearningSource({ ...clean, seen_count: 1, classified_count: 2 }), /ecosystem_classification_overflow/);
assert.throws(() => normalizeEcosystemLearningSource({ ...clean, expected_count: 1 }), /ecosystem_observed_overflow/);
assert.throws(() => normalizeEcosystemLearningSource({ ...clean, evidence_hash: "sha256:bad" }), /ecosystem_evidence_hash_invalid/);
assert.equal(normalizeEcosystemLearningSource({ ...clean, expected_count: null }).status, "PARTIAL");
assert.equal(normalizeEcosystemLearningSource({ ...clean, classified_count: null }).status, "PARTIAL");
assert.equal(normalizeEcosystemLearningSource({ ...clean, gap_count: null }).status, "PARTIAL");
assert.equal(normalizeEcosystemLearningSource({ ...clean, source_verified: false }).status, "PARTIAL");
assert.equal(normalizeEcosystemLearningSource({ ...clean, scan_state: "PARTIAL_SCAN" }).status, "PARTIAL");
assert.equal(normalizeEcosystemLearningSource({ ...clean, access_state: "BLOCKED_AUTH" }).status, "BLOCKED");
assert.throws(() => evaluateEcosystemLearningCoverage([clean, clean]), /ecosystem_duplicate_source_id/);
assert.throws(() => evaluateEcosystemLearningCoverage(new Array(101).fill(clean)), /ecosystem_sources_invalid/);
assert.equal(evaluateEcosystemLearningCoverage([]).known_source_count, 0);

const proposals = proposeHistoricalLearningSourceJobs([clean]);
assert.equal(proposals.source_candidates_found, 1);
assert.equal(proposals.proposals.length, 1);
assert.equal(proposals.coverage_status, "PARTIAL_COVERAGE");
assert.equal(proposals.automatic_submit_allowed, false);
assert.equal(proposals.automatic_promotion_allowed, false);
assert.equal(proposals.proposals[0].job_type, "history.source.normalize");
assert.equal(proposals.proposals[0].next_action, "HOLD_AUTHENTICATED_SOURCE_ADAPTER");
assert.equal(proposals.proposals[0].payload.current_status, "UNKNOWN");
assert.equal(proposals.proposals[0].payload.source_uri_or_ref, null);
assert.equal(proposals.proposals[0].payload.trust_tier, "SOURCE_METADATA_NOT_INDEPENDENTLY_ADMITTED");
assert.equal(proposals.proposals[0].payload.content_hash, clean.evidence_hash);
assert.equal(normalizeHistoricalSource(proposals.proposals[0].payload).current_status, "UNKNOWN");
assert.equal(proposeHistoricalLearningSourceJobs([{...clean, source_verified: false}]).proposals.length, 0);
assert.equal(proposeHistoricalLearningSourceJobs([{...clean, scan_state: "PARTIAL_SCAN"}]).proposals.length, 0);
assert.equal(proposeHistoricalLearningSourceJobs([{...clean, redaction_verified: false}]).proposals.length, 0);
assert.throws(() => proposeHistoricalLearningSourceJobs([{...clean, message_body: "private"}]), /ecosystem_unexpected_field/);
const tenPlus = Array.from({length:12},(_,i)=>({...clean, source_id:`github:hermes:job-${i}`}));
const boundedProposals = proposeHistoricalLearningSourceJobs(tenPlus);
assert.equal(boundedProposals.proposals.length, 10);
assert.equal(boundedProposals.unmaterialized_count, 2);
assert.ok(boundedProposals.proposals.every(p=>p.automatic_submit_allowed === false));

console.log("ecosystem learning preflight: PASS");
