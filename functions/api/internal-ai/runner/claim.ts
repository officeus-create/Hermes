import { jsonResponse } from "../../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso, publicTask, requireInternalAiRunner, sanitizeExecutionText } from "../../_lib/internal-ai.mjs";
type Env = { DB?: any; HERMES_INTERNAL_AI_RUNNER_TOKEN?: string };
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = requireInternalAiRunner(request, env); if (auth.response) return auth.response; if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  let payload: any = {}; try { payload = await request.json(); } catch {}
  const now = nowIso(); const repoSha = sanitizeExecutionText(payload?.repo_sha, 80) || null; const runtimeVersion = sanitizeExecutionText(payload?.runtime_version, 120) || null;
  await env.DB.prepare(`INSERT INTO hermes_internal_ai_runner_state (id, organization_scope, last_seen_at, repo_sha, runtime_version) VALUES ('internal-ai-mac-runner', ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET last_seen_at = excluded.last_seen_at, repo_sha = excluded.repo_sha, runtime_version = excluded.runtime_version`).bind(INTERNAL_AI_ORGANIZATION_SCOPE, now, repoSha, runtimeVersion).run();
  const running = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? AND status = 'running' AND runner_id = 'internal-ai-mac-runner' ORDER BY started_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  if (running) {
    if (running.cancel_requested) { await env.DB.prepare("UPDATE hermes_internal_ai_tasks SET status = 'cancelled', completed_at = ?, updated_at = ? WHERE id = ? AND organization_scope = ? AND status = 'running' AND cancel_requested = 1").bind(now, now, running.id, INTERNAL_AI_ORGANIZATION_SCOPE).run(); return jsonResponse(200, { success: true, task: null, reconciled_task_id: running.id, reconciliation: "cancelled_after_runner_restart" }); }
    return jsonResponse(409, { success: false, error: "running_task_requires_reconciliation", task_id: running.id });
  }
  const candidate = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? AND status = 'queued' AND cancel_requested = 0 ORDER BY created_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  if (!candidate) return jsonResponse(200, { success: true, task: null });
  const update = await env.DB.prepare("UPDATE hermes_internal_ai_tasks SET status = 'running', started_at = COALESCE(started_at, ?), updated_at = ?, runner_id = 'internal-ai-mac-runner' WHERE id = ? AND organization_scope = ? AND status = 'queued' AND cancel_requested = 0").bind(now, now, candidate.id, INTERNAL_AI_ORGANIZATION_SCOPE).run();
  if (!update?.meta?.changes) return jsonResponse(200, { success: true, task: null });
  return jsonResponse(200, { success: true, task: publicTask(await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ?").bind(candidate.id, INTERNAL_AI_ORGANIZATION_SCOPE).first()) });
}
