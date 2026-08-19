import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  cleanAcademyText,
  ensureAcademySchema,
  isAcademyProgram,
} from "../../_lib/academy.mjs";
import {
  ACADEMY_SUPPORT_RESPONDER_MESSAGES_PER_HOUR,
  academySupportCanAccessProgram,
  academySupportMessageRateExceeded,
  attachAcademySupportMessages,
  ensureAcademySupportSchema,
  getAcademySupportAccess,
  isAcademySupportAction,
  listAcademySupportMessages,
} from "../../_lib/academy-support.mjs";

type Env = { DB?: any };

const forbiddenControlFields = [
  "specialist_id",
  "learner_id",
  "learner_email",
  "author_specialist_id",
  "author_kind",
  "state",
  "support_specialist_id",
  "reviewer_specialist_id",
  "employment_state",
  "certificate_state",
  "payment_state",
  "commercial_access",
  "operational_access",
];

function hasForbiddenControlField(payload: Record<string, unknown>) {
  return forbiddenControlFields.some((key) => Object.prototype.hasOwnProperty.call(payload, key));
}

async function requireSupport(request: Request, env: Env) {
  if (!env.DB) return { ok: false as const, response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { ok: false as const, response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  await ensureAcademySchema(env.DB);
  await ensureAcademySupportSchema(env.DB);
  const access = await getAcademySupportAccess(env.DB, specialist.id);
  if (!access) return { ok: false as const, response: jsonResponse(403, { success: false, error: "academy_support_not_authorized" }) };
  return { ok: true as const, specialist, access };
}

function resolveProgram(access: any, requested: string | null) {
  if (access.program_scope) {
    if (requested && requested !== access.program_scope) return { ok: false as const, status: 403, error: "support_program_scope_forbidden" };
    return { ok: true as const, program: access.program_scope as string };
  }
  if (!requested) return { ok: true as const, program: null };
  if (!isAcademyProgram(requested)) return { ok: false as const, status: 400, error: "program_invalid" };
  return { ok: true as const, program: requested };
}

async function listQueue(db: any, supportId: string, access: any, requestedProgram: string | null) {
  const filter = resolveProgram(access, requestedProgram);
  if (!filter.ok) return filter;
  const query = filter.program
    ? db.prepare(`
        SELECT t.id, t.program_slug, t.lesson_id, t.subject, t.state, t.created_at, t.updated_at,
               s.name AS learner_name
        FROM academy_support_threads t
        JOIN specialists s ON s.id = t.specialist_id
        WHERE t.program_slug = ? AND t.specialist_id <> ?
        ORDER BY CASE t.state WHEN 'open' THEN 0 WHEN 'answered' THEN 1 ELSE 2 END, t.updated_at ASC
        LIMIT 50
      `).bind(filter.program, supportId)
    : db.prepare(`
        SELECT t.id, t.program_slug, t.lesson_id, t.subject, t.state, t.created_at, t.updated_at,
               s.name AS learner_name
        FROM academy_support_threads t
        JOIN specialists s ON s.id = t.specialist_id
        WHERE t.specialist_id <> ?
        ORDER BY CASE t.state WHEN 'open' THEN 0 WHEN 'answered' THEN 1 ELSE 2 END, t.updated_at ASC
        LIMIT 50
      `).bind(supportId);
  const result = await query.all();
  const threads = Array.isArray(result?.results) ? result.results : [];
  const messages = await listAcademySupportMessages(db, threads.map((thread: any) => thread.id));
  return { ok: true as const, threads: attachAcademySupportMessages(threads, messages) };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireSupport(request, env);
  if (!auth.ok) return auth.response;
  const requestedProgram = new URL(request.url).searchParams.get("program");
  const queue = await listQueue(env.DB, auth.specialist.id, auth.access, requestedProgram);
  if (!queue.ok) return jsonResponse(queue.status, { success: false, error: queue.error });
  return jsonResponse(200, {
    success: true,
    support: { name: auth.specialist.name, program_scope: auth.access.program_scope || null },
    threads: queue.threads,
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const auth = await requireSupport(request, env);
  if (!auth.ok) return auth.response;

  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object") return jsonResponse(400, { success: false, error: "support_payload_invalid" });
  if (hasForbiddenControlField(payload)) return jsonResponse(400, { success: false, error: "support_control_fields_not_editable_here" });

  const threadId = cleanAcademyText(payload.thread_id, 160);
  const action = String(payload.action || "");
  const bodyText = cleanAcademyText(payload.body_text, 4000);
  if (!threadId) return jsonResponse(400, { success: false, error: "support_thread_id_invalid" });
  if (!isAcademySupportAction(action)) return jsonResponse(400, { success: false, error: "support_action_invalid" });
  if (!bodyText || bodyText.length < 2) return jsonResponse(400, { success: false, error: "support_message_invalid" });
  if (await academySupportMessageRateExceeded(env.DB, auth.specialist.id, "authorized_support", ACADEMY_SUPPORT_RESPONDER_MESSAGES_PER_HOUR)) {
    return jsonResponse(429, { success: false, error: "support_rate_limited" });
  }

  const thread = await env.DB.prepare(`
    SELECT id, specialist_id, program_slug, state
    FROM academy_support_threads
    WHERE id = ?
    LIMIT 1
  `).bind(threadId).first();
  if (!thread) return jsonResponse(404, { success: false, error: "support_thread_not_found" });
  if (!academySupportCanAccessProgram(auth.access, thread.program_slug)) {
    return jsonResponse(403, { success: false, error: "support_program_scope_forbidden" });
  }
  if (thread.specialist_id === auth.specialist.id) return jsonResponse(403, { success: false, error: "support_cannot_answer_own_thread" });
  if (thread.state === "closed") return jsonResponse(409, { success: false, error: "support_thread_closed" });

  const nextState = action === "close" ? "closed" : "answered";
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO academy_support_messages
        (id, thread_id, author_specialist_id, author_kind, body_text, created_at)
      VALUES (?, ?, ?, 'authorized_support', ?, ?)
    `).bind(crypto.randomUUID(), thread.id, auth.specialist.id, bodyText, now),
    env.DB.prepare(`
      UPDATE academy_support_threads
      SET state = ?, updated_at = ?
      WHERE id = ?
    `).bind(nextState, now, thread.id),
  ]);

  const queue = await listQueue(env.DB, auth.specialist.id, auth.access, thread.program_slug);
  if (!queue.ok) return jsonResponse(queue.status, { success: false, error: queue.error });
  return jsonResponse(200, { success: true, thread_id: thread.id, state: nextState, threads: queue.threads });
}
