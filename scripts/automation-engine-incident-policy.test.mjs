import assert from "node:assert/strict";
import { evaluateHaeIncidents } from "../workers/automation-engine/src/incident-policy.mjs";

const now = "2026-10-23T16:00:00.000Z";
const sha = "a".repeat(40);

const ok = evaluateHaeIncidents({
  source_sha: sha,
  publication_enabled: false,
  unknown_outcomes: 0,
  unverified_readbacks: 0,
  automation_mode: "dry_run",
  last_cron_wake: { observed_at: "2026-10-23T15:17:00.000Z", source_sha: sha, automation_mode: "dry_run", publication_enabled: false },
  queue: { backlog_count: 0, oldest_message_at: null },
  dlq: { backlog_count: 0 },
}, { now, expected_source_sha: sha, schedule_interval_minutes: 60, recovery_window_minutes: 120 });
assert.equal(ok.status, "OK");

const bad = evaluateHaeIncidents({
  source_sha: "b".repeat(40),
  publication_enabled: true,
  unknown_outcomes: 1,
  unverified_readbacks: 2,
  automation_mode: "dry_run",
  last_cron_wake: { observed_at: "2026-10-23T12:00:00.000Z", source_sha: "c".repeat(40), automation_mode: "live", publication_enabled: true },
  queue: { backlog_count: 4, oldest_message_at: "2026-10-23T12:30:00.000Z" },
  dlq: { backlog_count: 1 },
}, { now, expected_source_sha: sha, schedule_interval_minutes: 60, recovery_window_minutes: 120, gate_phase: "READ_ONLY_RELIABILITY" });
assert.equal(bad.status, "INCIDENT");
for (const code of [
  "CRON_STALE",
  "QUEUE_RECOVERY_WINDOW_EXCEEDED",
  "UNKNOWN_PROVIDER_OUTCOME",
  "UNVERIFIED_READBACK",
  "PUBLICATION_ENABLED_DURING_READ_ONLY_GATE",
  "SOURCE_SHA_DRIFT",
  "HEARTBEAT_SOURCE_SHA_DRIFT",
  "HEARTBEAT_MODE_DRIFT",
  "HEARTBEAT_PUBLICATION_ENABLED_DURING_READ_ONLY_GATE",
]) {
  assert.ok(bad.incidents.some((item) => item.code === code), `Missing incident ${code}`);
}
assert.ok(bad.warnings.some((item) => item.code === "DLQ_NONZERO"));

const continuityDrift = evaluateHaeIncidents({
  source_sha: sha,
  automation_mode: "dry_run",
  publication_enabled: false,
  unknown_outcomes: 0,
  unverified_readbacks: 0,
  last_cron_wake: {
    observed_at: "2026-10-23T15:17:00.000Z",
    source_sha: sha,
    automation_mode: "dry_run",
    publication_enabled: true,
  },
  queue: { backlog_count: 0, oldest_message_at: null },
  dlq: { backlog_count: 0 },
}, { now, expected_source_sha: sha, gate_phase: "PROVIDER_LIVE" });
assert.ok(continuityDrift.incidents.some((item) => item.code === "HEARTBEAT_PUBLICATION_GATE_DRIFT"));

const unknown = evaluateHaeIncidents({}, { now });
assert.equal(unknown.status, "UNKNOWN");
assert.ok(unknown.unknowns.length > 0);

const queueUnknown = evaluateHaeIncidents({
  source_sha: sha,
  publication_enabled: false,
  unknown_outcomes: 0,
  unverified_readbacks: 0,
  automation_mode: "dry_run",
  last_cron_wake: { observed_at: "2026-10-23T15:17:00.000Z", source_sha: sha, automation_mode: "dry_run", publication_enabled: false },
  queue: { backlog_count: "UNKNOWN", oldest_message_at: null },
  dlq: { backlog_count: 0 },
}, { now, expected_source_sha: sha });
assert.equal(queueUnknown.status, "UNKNOWN");
assert.ok(queueUnknown.unknowns.some((item) => item.code === "QUEUE_BACKLOG_UNKNOWN"));

const gateUnknown = evaluateHaeIncidents({
  source_sha: sha,
  unknown_outcomes: 0,
  unverified_readbacks: 0,
  last_cron_wake: { observed_at: "2026-10-23T15:17:00.000Z", source_sha: sha },
  queue: { backlog_count: 0 },
  dlq: { backlog_count: 0 },
}, { now, expected_source_sha: sha });
assert.equal(gateUnknown.status, "UNKNOWN");
for (const code of ["AUTOMATION_MODE_UNKNOWN", "HEARTBEAT_MODE_UNKNOWN", "PUBLICATION_GATE_UNKNOWN", "HEARTBEAT_PUBLICATION_GATE_UNKNOWN"]) {
  assert.ok(gateUnknown.unknowns.some((item) => item.code === code), `Missing unknown ${code}`);
}

const wrongReadOnlyMode = evaluateHaeIncidents({
  source_sha: sha,
  automation_mode: "live",
  publication_enabled: false,
  unknown_outcomes: 0,
  unverified_readbacks: 0,
  last_cron_wake: {
    observed_at: "2026-10-23T15:17:00.000Z",
    source_sha: sha,
    automation_mode: "live",
    publication_enabled: false,
  },
  queue: { backlog_count: 0 },
  dlq: { backlog_count: 0 },
}, { now, expected_source_sha: sha });
assert.equal(wrongReadOnlyMode.status, "INCIDENT");
assert.ok(wrongReadOnlyMode.incidents.some((item) => item.code === "AUTOMATION_MODE_NOT_DRY_RUN"));
assert.ok(wrongReadOnlyMode.incidents.some((item) => item.code === "HEARTBEAT_MODE_NOT_DRY_RUN"));

const typoPhase = evaluateHaeIncidents({
  source_sha: sha,
  automation_mode: "live",
  publication_enabled: true,
  unknown_outcomes: 0,
  unverified_readbacks: 0,
  last_cron_wake: { observed_at: "2026-10-23T15:17:00.000Z", source_sha: sha, automation_mode: "live", publication_enabled: true },
  queue: { backlog_count: 0 },
  dlq: { backlog_count: 0 },
}, { now, expected_source_sha: sha, gate_phase: "READ_ONLY_RELIABILTY" });
assert.equal(typoPhase.status, "UNKNOWN");
assert.ok(typoPhase.unknowns.some((item) => item.code === "GATE_PHASE_UNKNOWN"));

for (const [field, container] of [
  ["queue.backlog_count", { queue: { backlog_count: -1 } }],
  ["dlq.backlog_count", { dlq: { backlog_count: -1 } }],
  ["unknown_outcomes", { unknown_outcomes: -1 }],
  ["unverified_readbacks", { unverified_readbacks: -1 }],
]) {
  const negative = evaluateHaeIncidents({
    source_sha: sha,
    automation_mode: "dry_run",
    publication_enabled: false,
    unknown_outcomes: 0,
    unverified_readbacks: 0,
    last_cron_wake: { observed_at: "2026-10-23T15:17:00.000Z", source_sha: sha, automation_mode: "dry_run", publication_enabled: false },
    queue: { backlog_count: 0 },
    dlq: { backlog_count: 0 },
    ...container,
  }, { now, expected_source_sha: sha, gate_phase: "READ_ONLY_RELIABILITY" });
  assert.equal(negative.status, "UNKNOWN", field);
  assert.ok(negative.unknowns.length > 0, field);
}

console.log("HAE incident policy contract PASS");
