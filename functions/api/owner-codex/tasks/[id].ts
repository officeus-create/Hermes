import { jsonResponse } from "../../_lib/session.mjs";
import {
  ensureOwnerCodexSchema,
  nowIso,
  publicTask,
  requireHermesOwner,
} from "../../_lib/owner-codex.mjs";

type Env = {
  DB?: any;
  HERMES_OWNER_SPECIALIST_ID?: string;
  HERMES_OWNER_EMAIL?: string;
};

type Context = {
  request: Request;
  env: Env;
  params: { id?: string };
};

export async function onRequestGet({ request, env, params }: Context) {
  const owner = await requireHermesOwner(request, env);
  if (owner.response) return owner.response;
  await ensureOwnerCodexSchema(env.DB);

  const row = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(params.id || "").first();
  if (!row) return jsonResponse(404, { success: false, error: "task_not_found" });
  const events = await env.DB.prepare(
    `SELECT id, event_type, message, created_at FROM owner_codex_events WHERE task_id = ? ORDER BY id ASC LIMIT 200`,
  )
    .bind(params.id || "")
    .all();
  return jsonResponse(200, { success: true, task: publicTask(row), events: events.results || [] });
}

export async function onRequestPatch({ request, env, params }: Context) {
  const owner = await requireHermesOwner(request, env);
  if (owner.response) return owner.response;
  await ensureOwnerCodexSchema(env.DB);

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  if (payload?.action !== "cancel") return jsonResponse(400, { success: false, error: "unsupported_action" });

  const row = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(params.id || "").first();
  if (!row) return jsonResponse(404, { success: false, error: "task_not_found" });
  if (["completed", "failed", "cancelled"].includes(row.status)) {
    return jsonResponse(409, { success: false, error: "task_already_terminal", task: publicTask(row) });
  }

  const now = nowIso();
  if (row.status === "queued") {
    await env.DB.prepare(
      `UPDATE owner_codex_tasks SET status = 'cancelled', cancel_requested = 1, completed_at = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(now, now, row.id)
      .run();
  } else {
    await env.DB.prepare(
      `UPDATE owner_codex_tasks SET cancel_requested = 1, updated_at = ? WHERE id = ?`,
    )
      .bind(now, row.id)
      .run();
  }
  const updated = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(row.id).first();
  return jsonResponse(200, { success: true, task: publicTask(updated) });
}
