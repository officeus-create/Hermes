import { jsonResponse } from "../../_lib/session.mjs";
import {
  ensureOwnerCodexSchema,
  nowIso,
  publicTask,
  requireRunner,
  sanitizeTaskResult,
} from "../../_lib/owner-codex.mjs";

type Env = { DB?: any; HERMES_CODEX_RUNNER_TOKEN?: string };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = requireRunner(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureOwnerCodexSchema(env.DB);

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const taskId = String(payload?.task_id || "").trim();
  if (!taskId) return jsonResponse(400, { success: false, error: "task_id_required" });
  const existing = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(taskId).first();
  if (!existing) return jsonResponse(404, { success: false, error: "task_not_found" });

  const result = sanitizeTaskResult(payload);
  const terminalStatus = existing.cancel_requested ? "cancelled" : result.status;
  if (!new Set(["completed", "failed", "cancelled"]).has(terminalStatus)) {
    return jsonResponse(400, { success: false, error: "terminal_status_required" });
  }

  const now = nowIso();
  const update = await env.DB.prepare(
    `UPDATE owner_codex_tasks SET
      status = ?, completed_at = ?, updated_at = ?, repo_sha = ?, branch = ?, pr_url = ?,
      model = ?, fallback_route = ?, evidence_class = ?, output_summary = ?
     WHERE id = ? AND runner_id = 'mac-owner-runner' AND status = 'running'`,
  )
    .bind(
      terminalStatus,
      now,
      now,
      result.repo_sha,
      result.branch,
      result.pr_url,
      result.model,
      result.fallback_route,
      result.evidence_class,
      result.output_summary,
      taskId,
    )
    .run();

  if (!update?.meta?.changes) {
    return jsonResponse(409, {
      success: false,
      error: "task_not_running_for_runner",
      task: publicTask(existing),
    });
  }

  const row = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(taskId).first();
  return jsonResponse(200, { success: true, task: publicTask(row) });
}
