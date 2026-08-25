import { jsonResponse } from "../../_lib/session.mjs";
import {
  ensureOwnerCodexSchema,
  nowIso,
  requireRunner,
  sanitizeExecutionText,
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
  const eventType = sanitizeExecutionText(payload?.event_type, 80);
  const message = sanitizeExecutionText(payload?.message, 4000);
  if (!taskId || !eventType || !message) return jsonResponse(400, { success: false, error: "invalid_event" });

  const task = await env.DB.prepare(`SELECT id FROM owner_codex_tasks WHERE id = ?`).bind(taskId).first();
  if (!task) return jsonResponse(404, { success: false, error: "task_not_found" });

  await env.DB.prepare(
    `INSERT INTO owner_codex_events (task_id, event_type, message, created_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(taskId, eventType, message, nowIso())
    .run();

  return jsonResponse(202, { success: true });
}
