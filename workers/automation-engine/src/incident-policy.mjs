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

  const heartbeatMs = timestampMs(health?.last_cron_wake?.observed_at || health?.last_cron_wake?.scheduled_at);
  if (heartbeatMs === null) {
    unknowns.push({ code: "CRON_FRESHNESS_UNKNOWN" });
  } else if (nowMs - heartbeatMs > intervalMinutes * 2 * 60_000) {
    incidents.push({ code: "CRON_STALE", age_minutes: Math.floor((nowMs - heartbeatMs) / 60_000) });
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
