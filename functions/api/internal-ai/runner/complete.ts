import { jsonResponse } from "../../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso, publicTask, requireInternalAiRunner, sanitizeTaskResult } from "../../_lib/internal-ai.mjs";
type Env = { DB?: any; HERMES_INTERNAL_AI_RUNNER_TOKEN?: string };
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = requireInternalAiRunner(request, env); if (auth.response) return auth.response; if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  let payload: any; try { payload = await request.json(); } catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  const taskId = String(payload?.task_id || "").trim(); if (!taskId) return jsonResponse(400, { success: false, error: "task_id_required" });
  const existing = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ?").bind(taskId, INTERNAL_AI_ORGANIZATION_SCOPE).first(); if (!existing) return jsonResponse(404, { success: false, error: "task_not_found" });
  const result = sanitizeTaskResult(payload); const finalStatus = existing.cancel_requested ? "cancelled" : result.status;
  if (!new Set(["completed", "failed", "cancelled", "needs_approval"]).has(finalStatus)) return jsonResponse(400, { success: false, error: "terminal_or_approval_status_required" });
  if (finalStatus === "needs_approval" && !result.approval_gate) return jsonResponse(400, { success: false, error: "approval_gate_required" });
  const now = nowIso();
  const update = await env.DB.prepare(`UPDATE hermes_internal_ai_tasks SET status = ?, completed_at = ?, updated_at = ?, repo_sha = ?, branch = ?, pr_url = ?, evidence_class = ?, output_summary = ?, approval_gate = ? WHERE id = ? AND organization_scope = ? AND runner_id = 'internal-ai-mac-runner' AND status = 'running'`).bind(finalStatus, now, now, result.repo_sha, result.branch, result.pr_url, result.evidence_class, result.output_summary, finalStatus === "needs_approval" ? result.approval_gate : null, taskId, INTERNAL_AI_ORGANIZATION_SCOPE).run();
  if (!update?.meta?.changes) return jsonResponse(409, { success: false, error: "task_not_running_for_runner", task: publicTask(existing) });
  const row = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ?").bind(taskId, INTERNAL_AI_ORGANIZATION_SCOPE).first(); return jsonResponse(200, { success: true, task: publicTask(row) });
}
