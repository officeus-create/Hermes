function numberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function timestampMs(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function evaluateHaeIncidents(health = {}, options = {}) {
  const nowMs = timestampMs(options.now) ?? Date.now();
  const intervalMinutes = Math.max(1, numberOrNull(options.schedule_interval_minutes) ?? 60);
  const recoveryWindowMinutes = Math.max(intervalMinutes, numberOrNull(options.recovery_window_minutes) ?? intervalMinutes * 2);
  const phase = String(options.gate_phase || "READ_ONLY_RELIABILITY").toUpperCase();
  const expectedSha = String(options.expected_source_sha || "").trim();

  const incidents = [];
  const warnings = [];
  const unknowns = [];

  const heartbeat = health?.last_cron_wake || {};
  const heartbeatMs = timestampMs(heartbeat?.observed_at || heartbeat?.scheduled_at);
  if (heartbeatMs === null) {
    unknowns.push({ code: "CRON_FRESHNESS_UNKNOWN" });
  } else if (nowMs - heartbeatMs > intervalMinutes * 2 * 60_000) {
    incidents.push({ code: "CRON_STALE", age_minutes: Math.floor((nowMs - heartbeatMs) / 60_000) });
  }

  const heartbeatSha = String(heartbeat?.source_sha || "").trim();
  if (heartbeatMs !== null) {
    if (!heartbeatSha) {
      unknowns.push({ code: "HEARTBEAT_SOURCE_SHA_UNKNOWN" });
    } else if (expectedSha && heartbeatSha !== expectedSha) {
      incidents.push({ code: "HEARTBEAT_SOURCE_SHA_DRIFT", expected: expectedSha, actual: heartbeatSha });
    }
  }

  const runtimeMode = String(health?.automation_mode || "").trim();
  const heartbeatMode = String(heartbeat?.automation_mode || "").trim();
  if (runtimeMode && heartbeatMode && runtimeMode !== heartbeatMode) {
    incidents.push({ code: "HEARTBEAT_MODE_DRIFT", expected: runtimeMode, actual: heartbeatMode });
  }

  if (typeof health?.publication_enabled === "boolean" && typeof heartbeat?.publication_enabled === "boolean"
      && health.publication_enabled !== heartbeat.publication_enabled) {
    incidents.push({
      code: "HEARTBEAT_PUBLICATION_GATE_DRIFT",
      expected: health.publication_enabled,
      actual: heartbeat.publication_enabled,
    });
  }

  const dlqBacklog = numberOrNull(health?.dlq?.backlog_count);
  if (dlqBacklog === null) unknowns.push({ code: "DLQ_BACKLOG_UNKNOWN" });
  else if (dlqBacklog > 0) warnings.push({ code: "DLQ_NONZERO", count: dlqBacklog });

  const oldest = timestampMs(health?.queue?.oldest_message_at);
  if (health?.queue?.backlog_count != null && numberOrNull(health.queue.backlog_count) > 0) {
    if (oldest === null) unknowns.push({ code: "QUEUE_OLDEST_AGE_UNKNOWN" });
    else if (nowMs - oldest > recoveryWindowMinutes * 60_000) {
      incidents.push({ code: "QUEUE_RECOVERY_WINDOW_EXCEEDED", age_minutes: Math.floor((nowMs - oldest) / 60_000) });
    }
  }

  for (const [field, code] of [
    ["unknown_outcomes", "UNKNOWN_PROVIDER_OUTCOME"],
    ["unverified_readbacks", "UNVERIFIED_READBACK"],
  ]) {
    const value = numberOrNull(health?.[field]);
    if (value === null) unknowns.push({ code: `${code}_COUNT_UNKNOWN` });
    else if (value > 0) incidents.push({ code, count: value });
  }

  if (phase === "READ_ONLY_RELIABILITY" && health?.publication_enabled === true) {
    incidents.push({ code: "PUBLICATION_ENABLED_DURING_READ_ONLY_GATE" });
  }
  if (phase === "READ_ONLY_RELIABILITY" && heartbeat?.publication_enabled === true) {
    incidents.push({ code: "HEARTBEAT_PUBLICATION_ENABLED_DURING_READ_ONLY_GATE" });
  }

  const sourceSha = String(health?.source_sha || "").trim();
  if (!sourceSha) unknowns.push({ code: "SOURCE_SHA_UNKNOWN" });
  else if (expectedSha && sourceSha !== expectedSha) {
    incidents.push({ code: "SOURCE_SHA_DRIFT", expected: expectedSha, actual: sourceSha });
  }

  return {
    status: incidents.length ? "INCIDENT" : warnings.length ? "WARN" : unknowns.length ? "UNKNOWN" : "OK",
    incidents,
    warnings,
    unknowns,
  };
}
