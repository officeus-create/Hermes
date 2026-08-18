import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  ensureAcademyLearnerProfile,
  ensureAcademySchema,
  isAcademyProgram,
  listAcademyEnrollments,
} from "../_lib/academy.mjs";

type Env = { DB?: any };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureAcademySchema(env.DB);
  await ensureAcademyLearnerProfile(env.DB, specialist.id);
  return jsonResponse(200, { success: true, enrollments: await listAcademyEnrollments(env.DB, specialist.id) });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
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
    "state",
    "participation_model",
    "cohort_code",
    "approved_at",
    "completed_at",
    "price",
    "payment_state",
  ];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "learner_cannot_set_controlled_enrollment_fields" });
  }

  const programSlug = String(body.program_slug || "").trim();
  if (!isAcademyProgram(programSlug)) {
    return jsonResponse(400, { success: false, error: "program_invalid" });
  }

  await ensureAcademySchema(env.DB);
  await ensureAcademyLearnerProfile(env.DB, specialist.id);

  const existing = await env.DB.prepare(`
    SELECT id, program_slug, state, participation_model, cohort_code, created_at, updated_at
    FROM academy_enrollments
    WHERE specialist_id = ? AND program_slug = ?
    LIMIT 1
  `).bind(specialist.id, programSlug).first();

  if (existing) {
    return jsonResponse(200, { success: true, existing: true, enrollment: existing });
  }

  const id = `academy-enrollment-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO academy_enrollments
      (id, specialist_id, program_slug, state, participation_model, cohort_code, created_at, updated_at)
    VALUES (?, ?, ?, 'applied', 'unspecified', NULL, ?, ?)
  `).bind(id, specialist.id, programSlug, now, now).run();

  const enrollment = await env.DB.prepare(`
    SELECT id, program_slug, state, participation_model, cohort_code, created_at, updated_at
    FROM academy_enrollments
    WHERE id = ? AND specialist_id = ?
    LIMIT 1
  `).bind(id, specialist.id).first();

  return jsonResponse(201, { success: true, existing: false, enrollment });
}
