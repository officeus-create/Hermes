import { jsonResponse } from "../../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso, requireInternalAiRunner, sanitizeExecutionText } from "../../_lib/internal-ai.mjs";
type Env = { DB?: any; HERMES_INTERNAL_AI_RUNNER_TOKEN?: string };
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = requireInternalAiRunner(request, env); if (auth.response) return auth.response; if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  let payload: any; try { payload = await request.json(); } catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  const taskId = String(payload?.task_id || "").trim(), eventType = sanitizeExecutionText(payload?.event_type, 80), message = sanitizeExecutionText(payload?.message, 4000); if (!taskId || !eventType || !message) return jsonResponse(400, { success: false, error: "invalid_event" });
  const task = await env.DB.prepare("SELECT id FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ? AND status = 'running' AND runner_id = 'internal-ai-mac-runner'").bind(taskId, INTERNAL_AI_ORGANIZATION_SCOPE).first(); if (!task) return jsonResponse(409, { success: false, error: "task_not_running_for_runner" });
  await env.DB.prepare("INSERT INTO hermes_internal_ai_events (organization_scope, task_id, event_type, message, created_at) VALUES (?, ?, ?, ?, ?)").bind(INTERNAL_AI_ORGANIZATION_SCOPE, taskId, eventType, message, nowIso()).run(); return jsonResponse(202, { success: true });
}
