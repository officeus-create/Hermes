import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  ensureAcademySchema,
  getAcademyEnrollment,
  isAcademyLesson,
  isAcademyProgram,
  listAcademyLessonProgress,
} from "../_lib/academy.mjs";

type Env = { DB?: any };

function writableProgressState(value: unknown) {
  const state = String(value || "");
  return state === "in_progress" || state === "completed" ? state : null;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const programSlug = new URL(request.url).searchParams.get("program") || "";
  if (!isAcademyProgram(programSlug)) {
    return jsonResponse(400, { success: false, error: "program_invalid" });
  }

  await ensureAcademySchema(env.DB);
  const enrollment = await getAcademyEnrollment(env.DB, specialist.id, programSlug);
  if (!enrollment) {
    return jsonResponse(404, { success: false, error: "enrollment_not_found", program_slug: programSlug });
  }

  return jsonResponse(200, {
    success: true,
    enrollment,
    progress: await listAcademyLessonProgress(env.DB, specialist.id, programSlug),
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const forbidden = [
    "specialist_id",
    "learner_id",
    "email",
    "enrollment_state",
    "cohort_code",
    "reviewer_score",
    "readiness_score",
    "certificate_state",
    "employment_state",
  ];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "progress_control_fields_not_editable_here" });
  }

  const programSlug = String(body.program_slug || "").trim();
  const lessonId = String(body.lesson_id || "").trim();
  const state = writableProgressState(body.state);
  if (!isAcademyProgram(programSlug)) {
    return jsonResponse(400, { success: false, error: "program_invalid" });
  }
  if (!isAcademyLesson(programSlug, lessonId)) {
    return jsonResponse(400, { success: false, error: "lesson_invalid" });
  }
  if (!state) {
    return jsonResponse(400, { success: false, error: "progress_state_invalid" });
  }

  await ensureAcademySchema(env.DB);
  const enrollment = await getAcademyEnrollment(env.DB, specialist.id, programSlug);
  if (!enrollment) {
    return jsonResponse(404, { success: false, error: "enrollment_not_found" });
  }
  if (enrollment.state !== "enrolled") {
    return jsonResponse(409, {
      success: false,
      error: "enrollment_not_active",
      enrollment_state: enrollment.state,
    });
  }

  const now = new Date().toISOString();
  const completedAt = state === "completed" ? now : null;
  await env.DB.prepare(`
    INSERT INTO academy_lesson_progress
      (specialist_id, program_slug, lesson_id, state, started_at, completed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(specialist_id, program_slug, lesson_id) DO UPDATE SET
      state = excluded.state,
      started_at = COALESCE(academy_lesson_progress.started_at, excluded.started_at),
      completed_at = excluded.completed_at,
      updated_at = excluded.updated_at
  `).bind(specialist.id, programSlug, lessonId, state, now, completedAt, now).run();

  const progress = await env.DB.prepare(`
    SELECT lesson_id, state, started_at, completed_at, updated_at
    FROM academy_lesson_progress
    WHERE specialist_id = ? AND program_slug = ? AND lesson_id = ?
    LIMIT 1
  `).bind(specialist.id, programSlug, lessonId).first();

  return jsonResponse(200, { success: true, enrollment_state: enrollment.state, progress });
}
