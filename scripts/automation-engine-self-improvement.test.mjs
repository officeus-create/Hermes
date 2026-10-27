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
assert.equal(pluginRuntimeRegistryEvidenceStatus(`${registryObservedAt}T12:00:00Z`).fresh, true);
const staleRegistryRead = new Date(`${registryObservedAt}T00:00:00Z`);
staleRegistryRead.setUTCHours(staleRegistryRead.getUTCHours() + 49);
assert.equal(pluginRuntimeRegistryEvidenceStatus(staleRegistryRead.toISOString()).fresh, false);

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

console.log("HAE self-improvement PASS: complete evidence only -> repair candidate -> independent QA -> no merge/deploy");
