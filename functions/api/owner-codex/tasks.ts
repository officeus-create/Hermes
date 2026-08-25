import { jsonResponse } from "../_lib/session.mjs";
import {
  ensureOwnerCodexSchema,
  newTaskId,
  normalizePrompt,
  normalizeTaskType,
  nowIso,
  publicTask,
  requireHermesOwner,
} from "../_lib/owner-codex.mjs";

type Env = {
  DB?: any;
  HERMES_OWNER_SPECIALIST_ID?: string;
  HERMES_OWNER_EMAIL?: string;
};

function sameOriginMutation(request: Request) {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return false;
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireHermesOwner(request, env);
  if (owner.response) return owner.response;
  await ensureOwnerCodexSchema(env.DB);

  const result = await env.DB.prepare(
    `SELECT * FROM owner_codex_tasks ORDER BY created_at DESC LIMIT 30`,
  ).all();
  return jsonResponse(200, {
    success: true,
    tasks: (result.results || []).map(publicTask),
  });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const owner = await requireHermesOwner(request, env);
  if (owner.response) return owner.response;
  await ensureOwnerCodexSchema(env.DB);

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const taskType = normalizeTaskType(payload?.task_type);
  const prompt = normalizePrompt(payload?.prompt);
  if (!taskType) return jsonResponse(400, { success: false, error: "invalid_task_type" });
  if (!prompt) return jsonResponse(400, { success: false, error: "invalid_prompt" });

  const running = await env.DB.prepare(
    `SELECT id FROM owner_codex_tasks WHERE status IN ('queued', 'running') ORDER BY created_at ASC LIMIT 1`,
  ).first();
  if (running) {
    return jsonResponse(409, {
      success: false,
      error: "active_task_exists",
      active_task_id: running.id,
    });
  }

  const id = newTaskId();
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO owner_codex_tasks (
      id, task_type, prompt, status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, 'queued', ?, ?, ?)`,
  )
    .bind(id, taskType, prompt, String(owner.specialist.id), now, now)
    .run();

  const row = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(id).first();
  return jsonResponse(201, { success: true, task: publicTask(row) });
}
