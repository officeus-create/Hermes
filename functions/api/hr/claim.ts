import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  cleanHrText,
  ensureHrAcademyLink,
  ensureHrSchema,
  getLatestHrReview,
  isHrCandidateId,
  normalizeHrEmail,
  sameOriginMutation,
  sha256Hex,
} from "../_lib/hr.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env };

const privateHeaders = { "Cache-Control": "no-store" };

export async function onRequestPost({ request, env }: Context) {
  if (!sameOriginMutation(request)) {
    return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" }, privateHeaders);
  }
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }

  const candidateId = cleanHrText(body.candidate_id, 120);
  const candidateToken = cleanHrText(body.candidate_token, 220);
  if (!isHrCandidateId(candidateId)) {
    return jsonResponse(400, { success: false, error: "candidate_id_invalid" }, privateHeaders);
  }
  if (candidateToken.length < 48) {
    return jsonResponse(400, { success: false, error: "candidate_token_required" }, privateHeaders);
  }

  await ensureHrSchema(env.DB);
  const candidate = await env.DB.prepare(`
    SELECT id,access_token_hash,name,email,track,status,specialist_id,created_at,updated_at
    FROM hr_candidates
    WHERE id=?
    LIMIT 1
  `).bind(candidateId).first();
  if (!candidate) return jsonResponse(404, { success: false, error: "candidate_not_found" }, privateHeaders);
  if (candidate.access_token_hash !== await sha256Hex(candidateToken)) {
    return jsonResponse(403, { success: false, error: "candidate_token_invalid" }, privateHeaders);
  }

  const candidateEmail = normalizeHrEmail(candidate.email);
  const specialistEmail = normalizeHrEmail(specialist.email);
  if (!candidateEmail || candidateEmail !== specialistEmail) {
    return jsonResponse(409, { success: false, error: "authenticated_email_does_not_match_candidate" }, privateHeaders);
  }
  if (candidate.specialist_id && candidate.specialist_id !== specialist.id) {
    return jsonResponse(409, { success: false, error: "candidate_already_claimed" }, privateHeaders);
  }

  const another = await env.DB.prepare(`
    SELECT id FROM hr_candidates
    WHERE specialist_id=? AND id<>?
    LIMIT 1
  `).bind(specialist.id, candidateId).first();
  if (another) {
    return jsonResponse(409, { success: false, error: "specialist_already_linked_to_another_hr_candidate" }, privateHeaders);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE hr_candidates
    SET specialist_id=?,updated_at=?
    WHERE id=?
  `).bind(specialist.id, now, candidateId).run();

  const latestReview = await getLatestHrReview(env.DB, candidateId);
  let academyLink;
  if (latestReview?.outcome === "ACADEMY") {
    academyLink = await ensureHrAcademyLink(env.DB, candidate, specialist.id);
  } else {
    await env.DB.prepare(`
      INSERT INTO hr_academy_links
        (candidate_id,specialist_id,program_slug,enrollment_id,state,created_at,updated_at)
      VALUES (?,?,NULL,NULL,'claimed',?,?)
      ON CONFLICT(candidate_id) DO UPDATE SET
        specialist_id=excluded.specialist_id,
        state='claimed',
        updated_at=excluded.updated_at
    `).bind(candidateId, specialist.id, now, now).run();
    academyLink = { state: "claimed", program_slug: null, enrollment_id: null };
  }

  return jsonResponse(200, {
    success: true,
    candidate_id: candidateId,
    specialist_id: specialist.id,
    identity_linked: true,
    latest_review_outcome: latestReview?.outcome || null,
    academy_link: academyLink,
  }, privateHeaders);
}
