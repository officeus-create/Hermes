import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  cleanAcademyTimezone,
  ensureAcademyLearnerProfile,
  ensureAcademySchema,
  getAcademyLearnerProfile,
  isAcademyLanguage,
  listAcademyEnrollments,
} from "../_lib/academy.mjs";

type Env = { DB?: any };

async function loadOwnAcademyState(env: Env, specialist: any) {
  await ensureAcademySchema(env.DB);
  await ensureAcademyLearnerProfile(env.DB, specialist.id);
  const [profile, enrollments] = await Promise.all([
    getAcademyLearnerProfile(env.DB, specialist.id),
    listAcademyEnrollments(env.DB, specialist.id),
  ]);
  return {
    success: true,
    learner: {
      id: specialist.id,
      email: specialist.email,
      name: specialist.name,
      identity_role: specialist.role,
      preferred_language: profile?.preferred_language ?? null,
      timezone: profile?.timezone ?? null,
    },
    enrollments,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  return jsonResponse(200, await loadOwnAcademyState(env, specialist));
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

  const forbidden = ["specialist_id", "email", "name", "role", "identity_role", "state", "cohort_code"];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "identity_or_progress_fields_not_editable_here" });
  }

  const preferredLanguage = body.preferred_language == null || body.preferred_language === ""
    ? null
    : String(body.preferred_language);
  if (preferredLanguage !== null && !isAcademyLanguage(preferredLanguage)) {
    return jsonResponse(400, { success: false, error: "preferred_language_invalid" });
  }

  const rawTimezone = body.timezone == null ? "" : String(body.timezone);
  const timezone = cleanAcademyTimezone(rawTimezone);
  if (rawTimezone.trim() && timezone === null) {
    return jsonResponse(400, { success: false, error: "timezone_invalid" });
  }

  await ensureAcademySchema(env.DB);
  await ensureAcademyLearnerProfile(env.DB, specialist.id);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE academy_learner_profiles
    SET preferred_language = ?, timezone = ?, updated_at = ?
    WHERE specialist_id = ?
  `).bind(preferredLanguage, timezone, now, specialist.id).run();

  return jsonResponse(200, await loadOwnAcademyState(env, specialist));
}
