import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureAcademySchema, isAcademyProgram } from "../_lib/academy.mjs";
import { ensureAcademyProgressionSchema, getAcademyProgressionSummary } from "../_lib/academy-progression.mjs";

type Env = { DB?: any };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const programSlug = new URL(request.url).searchParams.get("program") || "";
  if (!isAcademyProgram(programSlug)) return jsonResponse(400, { success: false, error: "program_invalid" });

  await ensureAcademySchema(env.DB);
  await ensureAcademyProgressionSchema(env.DB);
  const summary = await getAcademyProgressionSummary(env.DB, specialist.id, programSlug);
  if (!summary) return jsonResponse(404, { success: false, error: "enrollment_not_found" });

  return jsonResponse(200, { success: true, progression: summary });
}
