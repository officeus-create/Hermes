// Deterministic fail-closed visibility for declared HAE schedules that are not
// actually source-backed yet. This module performs no network calls or writes.
const SOURCE_ADAPTER_REQUIRED = "SOURCE_ADAPTER_REQUIRED";

function clean(value, max = 160) {
  return typeof value === "string"
    ? value.replace(/[^a-zA-Z0-9_.:-]/g, "-").slice(0, max)
    : "";
}

export function scheduleMigrationGapFindings(snapshot, observedAt) {
  if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot.migrations)) {
    throw new Error("schedule_migration_snapshot_invalid");
  }
  if (typeof observedAt !== "string" || !Number.isFinite(Date.parse(observedAt))) {
    throw new Error("schedule_migration_observed_at_invalid");
  }

  const findings = [];
  for (const migration of snapshot.migrations) {
    if (!migration || typeof migration !== "object") continue;
    const taskKey = clean(migration.task_key);
    if (!taskKey) continue;

    if (migration.activation_state === SOURCE_ADAPTER_REQUIRED) {
      findings.push({
        finding_id: `schedule-source-adapter-gap:${taskKey}`,
        source_ref: `github://officeus-create/Hermes/runtime/schedule-migration/${taskKey}`,
        category: "AUTOMATION_COVERAGE_GAP",
        severity: taskKey === "ecosystem-watch" ? "P0" : "P1",
        status: "OPEN",
        artifact_key: "workers/automation-engine/src/schedule-migrations.mjs",
        verified: true,
        writer_active: false,
        writer_state_verified: false,
        observed_at: observedAt,
      });
    }
  }

  for (const capability of Array.isArray(snapshot.unsupported_capabilities)
    ? snapshot.unsupported_capabilities
    : []) {
    const key = clean(capability, 220);
    if (!key) continue;
    findings.push({
      finding_id: `schedule-unsupported-capability:${key}`,
      source_ref: "github://officeus-create/Hermes/runtime/schedule-migrations",
      category: "CONTRACT_DRIFT",
      severity: "P0",
      status: "OPEN",
      artifact_key: "workers/automation-engine/src/schedule-migrations.mjs",
      verified: true,
      writer_active: false,
      writer_state_verified: false,
      observed_at: observedAt,
    });
  }

  return Object.freeze(findings);
}
