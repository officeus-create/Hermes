import { jsonResponse } from "../../_lib/session.mjs";
import {
  ensureOwnerCodexSchema,
  nowIso,
  publicTask,
  requireRunner,
} from "../../_lib/owner-codex.mjs";

type Env = { DB?: any; HERMES_CODEX_RUNNER_TOKEN?: string };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = requireRunner(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureOwnerCodexSchema(env.DB);

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return jsonResponse(400, { success: false, error: "task_id_required" });

  // This endpoint is polled by the already-running local worker for cancellation.
  // Treat that authenticated poll as a bounded heartbeat so long tasks do not
  // incorrectly make the owner UI report the Mac runtime as offline.
  await env.DB.prepare(
    `UPDATE owner_codex_runner_state SET last_seen_at = ? WHERE id = 'mac-owner-runner'`,
  )
    .bind(nowIso())
    .run();

  const row = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(id).first();
  if (!row) return jsonResponse(404, { success: false, error: "task_not_found" });
  return jsonResponse(200, { success: true, task: publicTask(row) });
}
