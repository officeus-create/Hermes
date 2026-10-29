import { jsonResponse } from "../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, isRunnerHeartbeatFresh, parseRunnerTelemetry, publicTask, requireInternalAiViewer } from "../_lib/internal-ai.mjs";
type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const viewer = await requireInternalAiViewer(request, env); if (viewer.response) return viewer.response;
  const runner = await env.DB.prepare("SELECT id, last_seen_at, repo_sha, runtime_version, telemetry_json FROM hermes_internal_ai_runner_state WHERE id = 'internal-ai-mac-runner' AND organization_scope = ?").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  const online = isRunnerHeartbeatFresh(runner?.last_seen_at);
  // A stale/future heartbeat must never project prior RUNNING work as current.
  const operations = online ? parseRunnerTelemetry(runner?.telemetry_json) : null;

  if (viewer.access_level === "team") {
    const teamOperations = operations ? {
      status: operations.status ?? null,
      phase: operations.phase ?? null,
      cycle: operations.cycle ?? null,
      current_task: operations.current_task ?? null,
      model: operations.model ?? null,
    } : null;
    const countRows = await env.DB.prepare("SELECT status, COUNT(*) AS count FROM hermes_internal_ai_tasks WHERE organization_scope = ? GROUP BY status").bind(INTERNAL_AI_ORGANIZATION_SCOPE).all();
    const taskSummary: Record<string, number> = { total: 0, queued: 0, running: 0, needs_approval: 0, completed: 0, failed: 0, cancelled: 0 };
    for (const row of countRows.results || []) {
      const status = String(row.status || "");
      if (!(status in taskSummary) || status === "total") continue;
      const count = Number(row.count);
      if (!Number.isInteger(count) || count < 0) continue;
      taskSummary[status] = count;
      taskSummary.total += count;
    }
    return jsonResponse(200, {
      success: true,
      access_level: "team",
      runtime: {
        online,
        last_seen_at: runner?.last_seen_at || null,
        primary_executor: "mac",
        operations: teamOperations,
      },
      task_summary: taskSummary,
    }, headers);
  }

  const active = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? AND status IN ('queued','running','needs_approval') ORDER BY created_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  const latest = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? ORDER BY created_at DESC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  return jsonResponse(200, {
    success: true,
    access_level: "owner",
    runtime: {
      online,
      last_seen_at: runner?.last_seen_at || null,
      repo_sha: runner?.repo_sha || null,
      runtime_version: runner?.runtime_version || null,
      primary_executor: "mac",
      operations,
      remote_browser_to_codex: "UNVERIFIED",
    },
    active_task: publicTask(active),
    latest_task: publicTask(latest),
  }, headers);
}
