import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  cleanAcademyText,
  ensureAcademySchema,
  getAcademyEnrollment,
  isAcademyLesson,
  isAcademyProgram,
} from "../_lib/academy.mjs";
import {
  ACADEMY_SUPPORT_LEARNER_MESSAGES_PER_HOUR,
  academySupportMessageRateExceeded,
  ensureAcademySupportSchema,
  listLearnerAcademySupportThreads,
} from "../_lib/academy-support.mjs";

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

async function requireLearner(request: Request, env: Env) {
  if (!env.DB) return { ok: false as const, response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { ok: false as const, response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  await ensureAcademySchema(env.DB);
  await ensureAcademySupportSchema(env.DB);
  return { ok: true as const, specialist };
}

async function requireCurrentEnrollment(db: any, specialistId: string, programSlug: string) {
  const enrollment = await getAcademyEnrollment(db, specialistId, programSlug);
  if (!enrollment || enrollment.state !== "enrolled") {
    return { ok: false as const, response: jsonResponse(409, { success: false, error: "support_requires_enrolled_program", enrollment_state: enrollment?.state || null }) };
  }
  return { ok: true as const, enrollment };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireLearner(request, env);
  if (!auth.ok) return auth.response;
  const threads = await listLearnerAcademySupportThreads(env.DB, auth.specialist.id);
  return jsonResponse(200, { success: true, threads });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireLearner(request, env);
  if (!auth.ok) return auth.response;

  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object") return jsonResponse(400, { success: false, error: "support_payload_invalid" });
  if (hasForbiddenControlField(payload)) return jsonResponse(400, { success: false, error: "support_control_fields_not_editable_here" });

  const bodyText = cleanAcademyText(payload.body_text, 4000);
  if (!bodyText || bodyText.length < 2) return jsonResponse(400, { success: false, error: "support_message_invalid" });
  if (await academySupportMessageRateExceeded(env.DB, auth.specialist.id, "learner", ACADEMY_SUPPORT_LEARNER_MESSAGES_PER_HOUR)) {
    return jsonResponse(429, { success: false, error: "support_rate_limited" });
  }

  const threadId = cleanAcademyText(payload.thread_id, 160);
  const now = new Date().toISOString();
  if (threadId) {
    const thread = await env.DB.prepare(`
      SELECT id, specialist_id, program_slug, state
      FROM academy_support_threads
      WHERE id = ? AND specialist_id = ?
      LIMIT 1
    `).bind(threadId, auth.specialist.id).first();
    if (!thread) return jsonResponse(404, { success: false, error: "support_thread_not_found" });
    if (thread.state === "closed") return jsonResponse(409, { success: false, error: "support_thread_closed" });
    const currentEnrollment = await requireCurrentEnrollment(env.DB, auth.specialist.id, thread.program_slug);
    if (!currentEnrollment.ok) return currentEnrollment.response;

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO academy_support_messages
          (id, thread_id, author_specialist_id, author_kind, body_text, created_at)
        VALUES (?, ?, ?, 'learner', ?, ?)
      `).bind(crypto.randomUUID(), thread.id, auth.specialist.id, bodyText, now),
      env.DB.prepare(`
        UPDATE academy_support_threads
        SET state = 'open', updated_at = ?
        WHERE id = ? AND specialist_id = ?
      `).bind(now, thread.id, auth.specialist.id),
    ]);
    const threads = await listLearnerAcademySupportThreads(env.DB, auth.specialist.id);
    return jsonResponse(200, { success: true, thread_id: thread.id, threads });
  }

  const programSlug = String(payload.program_slug || "");
  const lessonId = cleanAcademyText(payload.lesson_id, 160);
  const subject = cleanAcademyText(payload.subject, 160);
  if (!isAcademyProgram(programSlug)) return jsonResponse(400, { success: false, error: "program_invalid" });
  if (lessonId && !isAcademyLesson(programSlug, lessonId)) return jsonResponse(400, { success: false, error: "lesson_invalid" });
  if (!subject || subject.length < 3) return jsonResponse(400, { success: false, error: "support_subject_invalid" });

  const currentEnrollment = await requireCurrentEnrollment(env.DB, auth.specialist.id, programSlug);
  if (!currentEnrollment.ok) return currentEnrollment.response;

  const newThreadId = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO academy_support_threads
        (id, specialist_id, program_slug, lesson_id, subject, state, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
    `).bind(newThreadId, auth.specialist.id, programSlug, lessonId || null, subject, now, now),
    env.DB.prepare(`
      INSERT INTO academy_support_messages
        (id, thread_id, author_specialist_id, author_kind, body_text, created_at)
      VALUES (?, ?, ?, 'learner', ?, ?)
    `).bind(crypto.randomUUID(), newThreadId, auth.specialist.id, bodyText, now),
  ]);

  const threads = await listLearnerAcademySupportThreads(env.DB, auth.specialist.id);
  return jsonResponse(201, { success: true, thread_id: newThreadId, threads });
}
