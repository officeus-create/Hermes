import assert from "node:assert/strict";
import { auditHaeState } from "../workers/automation-engine/src/state-freshness.mjs";

const sha = "a".repeat(40);

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
    proof: {
      private_health: true,
      d1: true,
      queue: true,
      dlq: true,
      cron_heartbeat: true,
      read_only_job_receipt: true,
      idempotency_replay: true,
    },
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
