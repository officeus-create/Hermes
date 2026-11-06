// Engine liveness and launch-readiness projection for the Command Center owner
// read model.
//
// Read-only by contract: this module never mutates canonical owner work state,
// never enqueues a job and never publishes. It answers two owner questions:
//
//   1. Is the HAE automation engine alive, on which source SHA, and in which
//      automation/publication mode is it running?
//   2. Which owner work item is the next launch candidate right now?
//
// The launch predicate below mirrors the worker intake predicate in
// workers/automation-engine/src/owner-work-runtime.mjs (reserveNextItem).
// Both sides must stay identical: a drifted predicate would show the owner a
// task the scheduler will never pick, or hide a task it will.

export const ENGINE_SOURCE_CONNECTED = "CONNECTED_CANONICAL_HAE_D1";
export const ENGINE_SOURCE_UNAVAILABLE = "UNAVAILABLE_OR_NOT_MIGRATED";

// The intake cron runs every 5 minutes, so three missed slots mean the engine
// is no longer running unattended.
export const ENGINE_CRON_STALE_MS = 15 * 60 * 1000;

// An active revenue work item gets a cooldown before it can be re-dispatched.
export const ENGINE_REVENUE_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export const LAUNCHABLE_WORK_ITEMS_SQL = `SELECT id,status,title,priority,workstream,revenue_gate_usd,revenue_target_usd,revenue_status,next_action,updated_at
  FROM hermes_owner_work_items
  WHERE organization_scope='hermes_internal'
    AND status IN ('ready','planned')
    AND (hae_plan_job_id IS NULL OR hae_plan_job_id='')
    AND (hae_execution_job_id IS NULL OR hae_execution_job_id='')
    AND (hae_dispatch_state IS NULL OR hae_dispatch_state IN ('','RETRY_READY','REVENUE_NEEDS_CAPABILITY','REVENUE_CYCLE_SUCCEEDED'))
    AND (revenue_status IS NULL OR revenue_status!='active' OR updated_at<=?)
  ORDER BY
    CASE WHEN revenue_status='active' THEN 0 ELSE 1 END,
    CASE status WHEN 'ready' THEN 0 ELSE 1 END,
    CASE priority WHEN 'p0' THEN 0 WHEN 'p1' THEN 1 WHEN 'p2' THEN 2 ELSE 3 END,
    CASE WHEN revenue_rank IS NULL THEN 999999 ELSE revenue_rank END ASC,
    created_at ASC
  LIMIT 5`;

/**
 * @param {string|null|undefined} checkedAt
 * @returns {string}
 */
export function revenueCooldownCutoff(checkedAt) {
  const base = Date.parse(String(checkedAt || ""));
  const nowMs = Number.isFinite(base) ? base : Date.now();
  return new Date(nowMs - ENGINE_REVENUE_COOLDOWN_MS).toISOString();
}

/**
 * @param {unknown} value
 * @param {number} max
 * @returns {string|null}
 */
const cleanText = (value, max) => {
  const text = String(value == null ? "" : value).trim();
  if (!text) return null;
  return text.slice(0, max);
};

/**
 * @param {unknown} value
 * @returns {number|null}
 */
const cleanNumber = (value) => {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

/**
 * @typedef {{scheduled_at?: string|null, observed_at?: string|null, execution_lag_ms?: number|null, cron_expression?: string|null, eligible?: number|null, source_sha?: string|null, automation_mode?: string|null, publication_config?: string|null, publication_enabled?: number|null}} EngineHeartbeat
 * @typedef {{id?: string|null, status?: string|null, title?: string|null, priority?: string|null, workstream?: string|null, revenue_gate_usd?: number|string|null, revenue_target_usd?: number|string|null, revenue_status?: string|null, next_action?: string|null}} LaunchableWorkItem
 * @typedef {{job_id?: string|null, state?: string|null, current_step?: string|null, last_error_class?: string|null, attempt_count?: number|null, max_attempts?: number|null, updated_at?: string|null}} OwnerWorkJob
 */

/**
 * Build the owner-facing engine status projection.
 *
 * @param {{heartbeat?: EngineHeartbeat|null, launchableRows?: LaunchableWorkItem[], lastJob?: OwnerWorkJob|null, checkedAt?: string|null, sourceAvailable?: boolean}} [options]
 * @returns {Record<string, any>}
 */
export function buildEngineStatus({
  heartbeat = null,
  launchableRows = [],
  lastJob = null,
  checkedAt = null,
  sourceAvailable = true,
} = {}) {
  const base = Date.parse(String(checkedAt || ""));
  const nowMs = Number.isFinite(base) ? base : Date.now();
  const scheduledMs = heartbeat ? Date.parse(String(heartbeat.scheduled_at || "")) : NaN;
  // A future-dated heartbeat is clock skew, not liveness.
  const cronAlive = Number.isFinite(scheduledMs) && scheduledMs > 0 &&
    scheduledMs <= nowMs && (nowMs - scheduledMs) <= ENGINE_CRON_STALE_MS;

  const candidates = (Array.isArray(launchableRows) ? launchableRows : []).map((row) => ({
    id: cleanText(row?.id, 160),
    status: cleanText(row?.status, 40),
    title: cleanText(row?.title, 240),
    priority: cleanText(row?.priority, 20),
    workstream: cleanText(row?.workstream, 60),
    revenue_gate_usd: cleanNumber(row?.revenue_gate_usd),
    revenue_target_usd: cleanNumber(row?.revenue_target_usd),
    revenue_status: cleanText(row?.revenue_status, 40),
    next_action: cleanText(row?.next_action, 600),
  }));

  const sourceSha = cleanText(heartbeat?.source_sha, 64);
  return {
    source_state: sourceAvailable ? ENGINE_SOURCE_CONNECTED : ENGINE_SOURCE_UNAVAILABLE,
    cron_alive: cronAlive,
    cron_expression: cleanText(heartbeat?.cron_expression, 80),
    last_scheduled_at: cleanText(heartbeat?.scheduled_at, 40),
    last_observed_at: cleanText(heartbeat?.observed_at, 40),
    execution_lag_ms: cleanNumber(heartbeat?.execution_lag_ms),
    eligible: heartbeat ? Number(heartbeat.eligible) === 1 : null,
    automation_mode: cleanText(heartbeat?.automation_mode, 40),
    publication_config: cleanText(heartbeat?.publication_config, 40),
    publication_enabled: heartbeat ? Number(heartbeat.publication_enabled) === 1 : null,
    deployed_source_sha: sourceSha && /^[0-9a-f]{40}$/.test(sourceSha) ? sourceSha : null,
    launchable_work_items: {
      count: candidates.length,
      next: candidates[0] || null,
      candidates,
    },
    last_owner_work_job: lastJob ? {
      job_id: cleanText(lastJob.job_id, 180),
      state: cleanText(lastJob.state, 60) || "UNKNOWN",
      current_step: cleanText(lastJob.current_step, 60),
      error_class: cleanText(lastJob.last_error_class, 120),
      attempt_count: cleanNumber(lastJob.attempt_count) ?? 0,
      max_attempts: cleanNumber(lastJob.max_attempts) ?? 0,
      updated_at: cleanText(lastJob.updated_at, 40),
    } : null,
    launch_policy: "The HAE cron intake reserves one eligible owner work item per run. A candidate here is the next scheduled input, not a guarantee of execution, of a receipt, or of a business result.",
  };
}
