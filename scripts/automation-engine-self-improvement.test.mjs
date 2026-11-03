import assert from "node:assert/strict";
import {
  evaluateHaeSelfImprovementSnapshot,
  haeSelfRepairPacketReplayMatches,
  normalizeHaeSelfImprovementSnapshot,
} from "../workers/automation-engine/src/hae-self-improvement.mjs";
import {
  pluginRuntimeRegistryEvidenceStatus,
  pluginRuntimeRegistrySnapshot,
  pluginRuntimeVersion,
} from "../workers/automation-engine/src/plugin-runtime-registry.mjs";
import { scheduledReceiptFreshnessFindings } from "../workers/automation-engine/src/scheduled-receipt-guard.mjs";

const findings = [
  {
    finding_id: "plugin-version-drift",
    source_ref: "github://officeus-create/Hermes/branch/codex/hae-task-source-intake",
    category: "PLUGIN_VERSION_DRIFT",
    severity: "P0",
    status: "OPEN",
    artifact_key: "workers/automation-engine/src/zero-token-plugin-tasks.mjs",
    verified: true,
    writer_active: false,
    writer_state_verified: true,
    observed_at: "2026-10-25T00:20:00Z",
  },
  {
    finding_id: "partial-coverage-routing",
    source_ref: "github://officeus-create/Hermes/branch/codex/hae-task-source-intake",
    category: "CONTRACT_DRIFT",
    severity: "P1",
    status: "OPEN",
    artifact_key: "workers/automation-engine/src/work-portfolio.mjs",
    verified: true,
    writer_active: false,
    writer_state_verified: true,
    observed_at: "2026-10-25T00:10:00Z",
  },
  {
    finding_id: "unverified-rumor",
    source_ref: "github://officeus-create/Hermes/issues/2062",
    category: "TEST_GAP",
    severity: "P0",
    status: "OPEN",
    artifact_key: "scripts/example.test.mjs",
    verified: false,
    writer_active: false,
    writer_state_verified: true,
    observed_at: "2026-10-25T00:00:00Z",
  },
];

const partial = evaluateHaeSelfImprovementSnapshot({
  observed_at: "2026-10-25T00:30:00Z",
  coverage_complete: false,
  findings,
});
assert.equal(partial.coverage_status, "PARTIAL");
assert.equal(partial.repair_candidate_count, 0);
assert.equal(partial.next_action, "NO_ACTION");
assert.equal(partial.routing_blocked_reason, "PARTIAL_COVERAGE");

const complete = evaluateHaeSelfImprovementSnapshot({
  observed_at: "2026-10-25T00:30:00Z",
  coverage_complete: true,
  findings,
});
assert.equal(complete.coverage_status, "COMPLETE");
assert.equal(complete.repair_candidate_count, 2);
assert.equal(complete.next_finding_id, "plugin-version-drift");
assert.equal(complete.next_work_id, "HAE-SELF:plugin-version-drift");
assert.equal(complete.next_action, "HOLD_REPAIR");
assert.equal(complete.automatic_source_change_performed, false);
assert.equal(complete.automatic_merge_performed, false);
assert.equal(complete.automatic_deploy_performed, false);
assert.equal(complete.cost_usd, 0);
assert.equal(complete.repair_owner.role_id, "hermes-automatic-engineer");
assert.equal(complete.repair_owner.plugin_version, pluginRuntimeVersion("hermes-automatic-engineer"));
assert.equal(complete.independent_review_owner.plugin_version, pluginRuntimeVersion("hermes-qa-evidence-auditor"));

const writerUnknown = evaluateHaeSelfImprovementSnapshot({
  observed_at: "2026-10-25T00:30:00Z",
  coverage_complete: true,
  findings: [{ ...findings[0], writer_state_verified: false }],
});
assert.equal(writerUnknown.repair_candidate_count, 0);
assert.equal(writerUnknown.next_action, "NO_ACTION");
assert.equal(writerUnknown.routing_blocked_reason, "WRITER_STATE_UNVERIFIED");
assert.equal(writerUnknown.writer_state_unverified_count, 1);

assert.equal(
  haeSelfRepairPacketReplayMatches(
    {
      work_id: "HAE-SELF:plugin-version-drift",
      finding_id: "plugin-version-drift",
      artifact_key: "workers/automation-engine/src/zero-token-plugin-tasks.mjs",
      _role_contract: { contract_version: "old" },
    },
    {
      next_work_id: "HAE-SELF:plugin-version-drift",
      next_finding_id: "plugin-version-drift",
      next_artifact_key: "workers/automation-engine/src/zero-token-plugin-tasks.mjs",
    },
  ),
  true,
);
assert.equal(
  haeSelfRepairPacketReplayMatches(
    {
      work_id: "HAE-SELF:plugin-version-drift",
      finding_id: "plugin-version-drift",
      artifact_key: "workers/automation-engine/src/other.mjs",
    },
    {
      next_work_id: "HAE-SELF:plugin-version-drift",
      next_finding_id: "plugin-version-drift",
      next_artifact_key: "workers/automation-engine/src/zero-token-plugin-tasks.mjs",
    },
  ),
  false,
);
const registryObservedAt = pluginRuntimeRegistrySnapshot().observed_at;
assert.match(registryObservedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "A source readback needs an exact UTC instant");
const registryObservedMs = Date.parse(registryObservedAt);
assert.equal(pluginRuntimeRegistryEvidenceStatus(registryObservedAt).fresh, true);
assert.equal(pluginRuntimeRegistryEvidenceStatus(new Date(registryObservedMs + 12 * 3600000).toISOString()).fresh, true);
assert.equal(pluginRuntimeRegistryEvidenceStatus(new Date(registryObservedMs + 24 * 3600000).toISOString()).fresh, true);
assert.equal(pluginRuntimeRegistryEvidenceStatus(new Date(registryObservedMs + 24 * 3600000 + 1).toISOString()).fresh, false);
assert.equal(pluginRuntimeRegistryEvidenceStatus(new Date(registryObservedMs - 1).toISOString()).fresh, false, "Future-dated source evidence must fail closed");
assert.equal(pluginRuntimeRegistryEvidenceStatus("invalid-now").reason, "INVALID_EVIDENCE_TIME");

assert.match(pluginRuntimeVersion("hermes-agent-coordinator"), /^\d+\.\d+\.\d+/);
assert.match(pluginRuntimeVersion("hermes-academy"), /^\d+\.\d+\.\d+/);
assert.equal(pluginRuntimeRegistrySnapshot().source_class, "PRIVATE_PLUGIN_CREATOR_READBACK");
assert.throws(() => pluginRuntimeVersion("hermes-unknown-role"), /plugin_runtime_version_unverified/);
assert.throws(
  () => normalizeHaeSelfImprovementSnapshot({
    observed_at: "2026-10-25T00:30:00Z",
    coverage_complete: true,
    findings: [{ ...findings[0], source_ref: "drive://private/raw" }],
  }),
  /hae_self_source_ref_invalid/,
);

const scheduleSha = "a".repeat(40);
const scheduleContracts = [
  { job_type: "website.route.audit", cadence_hours: 6, owner_managed: false },
  { job_type: "ai.gateway.readiness.audit", cadence_hours: 24, owner_managed: false },
  { job_type: "academy.english.practice.build", cadence_hours: 24, owner_managed: true },
];
assert.deepEqual(scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-03T10:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: {},
}), [], "new deployment gets a two-cadence grace period");
const staleSchedule = scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-03T13:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: {},
});
assert.equal(staleSchedule.length, 1);
assert.equal(staleSchedule[0].finding_id, "scheduled-receipt-stale:website.route.audit");
assert.equal(staleSchedule[0].category, "TEST_GAP");
assert.equal(staleSchedule[0].status, "BLOCKED");
assert.equal(staleSchedule[0].writer_state_verified, false);
assert.deepEqual(scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-03T13:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: { "website.route.audit": "2026-11-03T12:00:00Z" },
}), [], "fresh scheduled receipt clears the SLA alert");
assert.deepEqual(scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-06T00:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: "not-a-sha",
  contracts: scheduleContracts,
  latest_receipts: {},
}), [], "receipt monitoring fails closed until an exact deployed SHA exists");
const dailyStale = scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-05T01:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: { "website.route.audit": "2026-11-05T00:00:00Z" },
});
assert.equal(dailyStale.length, 1);
assert.equal(dailyStale[0].finding_id, "scheduled-receipt-stale:ai.gateway.readiness.audit");
assert.ok(!dailyStale.some((item) => item.finding_id.includes("academy.english.practice.build")), "owner-managed schedules are not double-monitored");

console.log("HAE self-improvement PASS: complete evidence only -> repair candidate -> independent QA -> no merge/deploy");
