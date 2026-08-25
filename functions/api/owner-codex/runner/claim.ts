import { jsonResponse } from "../../_lib/session.mjs";
import {
  ensureOwnerCodexSchema,
  nowIso,
  publicTask,
  requireRunner,
  sanitizeExecutionText,
} from "../../_lib/owner-codex.mjs";

type Env = { DB?: any; HERMES_CODEX_RUNNER_TOKEN?: string };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = requireRunner(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureOwnerCodexSchema(env.DB);

  let payload: any = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const now = nowIso();
  const repoSha = sanitizeExecutionText(payload?.repo_sha, 80) || null;
  const runtimeVersion = sanitizeExecutionText(payload?.runtime_version, 120) || null;
  const model = sanitizeExecutionText(payload?.model, 180) || null;
  const fallbackRoute = sanitizeExecutionText(payload?.fallback_route, 600) || null;
  await env.DB.prepare(
    `INSERT INTO owner_codex_runner_state (id, last_seen_at, repo_sha, runtime_version, model, fallback_route)
     VALUES ('mac-owner-runner', ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       last_seen_at = excluded.last_seen_at,
       repo_sha = excluded.repo_sha,
       runtime_version = excluded.runtime_version,
       model = excluded.model,
       fallback_route = excluded.fallback_route`,
  )
    .bind(now, repoSha, runtimeVersion, model, fallbackRoute)
    .run();

  const candidate = await env.DB.prepare(
    `SELECT * FROM owner_codex_tasks
     WHERE status = 'queued' AND cancel_requested = 0
     ORDER BY created_at ASC LIMIT 1`,
  ).first();

  if (!candidate) return jsonResponse(200, { success: true, task: null });

  const update = await env.DB.prepare(
    `UPDATE owner_codex_tasks
     SET status = 'running', started_at = COALESCE(started_at, ?), updated_at = ?, runner_id = 'mac-owner-runner'
     WHERE id = ? AND status = 'queued' AND cancel_requested = 0`,
  )
    .bind(now, now, candidate.id)
    .run();
  if (!update?.meta?.changes) return jsonResponse(200, { success: true, task: null });

  const claimed = await env.DB.prepare(`SELECT * FROM owner_codex_tasks WHERE id = ?`).bind(candidate.id).first();
  return jsonResponse(200, { success: true, task: publicTask(claimed) });
}
