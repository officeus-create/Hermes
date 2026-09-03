import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  cleanHrLongText,
  cleanHrText,
  ensureHrAcademyLink,
  ensureHrSchema,
  getHrCandidateSnapshot,
  getHrReviewerAccess,
  isHrCandidateId,
  isHrReviewOutcome,
  sameOriginMutation,
} from "../../_lib/hr.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env };

const privateHeaders = { "Cache-Control": "no-store" };

async function requireReviewer(request: Request, env: Env) {
  if (!env.DB) {
    return { ok: false as const, response: jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders) };
  }
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) {
    return { ok: false as const, response: jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders) };
  }
  await ensureHrSchema(env.DB);
  const access = await getHrReviewerAccess(env.DB, specialist.id);
  if (!access) {
    return { ok: false as const, response: jsonResponse(403, { success: false, error: "hr_reviewer_not_authorized" }, privateHeaders) };
  }
  return { ok: true as const, specialist, access };
}

export async function onRequestGet({ request, env }: Context) {
  const auth = await requireReviewer(request, env);
  if (!auth.ok) return auth.response;

  const candidateId = cleanHrText(new URL(request.url).searchParams.get("candidate_id"), 120);
  if (candidateId) {
    if (!isHrCandidateId(candidateId)) {
      return jsonResponse(400, { success: false, error: "candidate_id_invalid" }, privateHeaders);
    }
    const snapshot = await getHrCandidateSnapshot(env.DB, candidateId);
    if (!snapshot) return jsonResponse(404, { success: false, error: "candidate_not_found" }, privateHeaders);
    return jsonResponse(200, {
      success: true,
      reviewer: { id: auth.specialist.id, name: auth.specialist.name, access_source: auth.access.source },
      snapshot,
    }, privateHeaders);
  }

  const result = await env.DB.prepare(`
    SELECT
      c.id,c.name,c.email,c.telegram_handle,c.country,c.language,c.source,c.track,c.status,
      c.specialist_id,c.created_at,c.updated_at,
      s.state AS interview_state,s.completed_at,s.practice_signals_json,s.recommendation_code,
      (SELECT r.outcome FROM hr_reviews r WHERE r.candidate_id=c.id ORDER BY r.created_at DESC LIMIT 1) AS latest_outcome,
      (SELECT r.created_at FROM hr_reviews r WHERE r.candidate_id=c.id ORDER BY r.created_at DESC LIMIT 1) AS latest_reviewed_at
    FROM hr_candidates c
    LEFT JOIN hr_interview_sessions s ON s.candidate_id=c.id
    WHERE c.status <> 'interviewing'
    ORDER BY CASE WHEN latest_outcome IS NULL THEN 0 ELSE 1 END, COALESCE(s.completed_at,c.created_at) ASC
    LIMIT 100
  `).all();

  const candidates = (Array.isArray(result?.results) ? result.results : []).map((row: any) => {
    let practiceSignals = null;
    try { practiceSignals = row.practice_signals_json ? JSON.parse(row.practice_signals_json) : null; }
    catch { practiceSignals = null; }
    const { practice_signals_json, ...rest } = row;
    return { ...rest, practice_signals: practiceSignals };
  });

  return jsonResponse(200, {
    success: true,
    reviewer: { id: auth.specialist.id, name: auth.specialist.name, access_source: auth.access.source },
    candidates,
  }, privateHeaders);
}

export async function onRequestPut({ request, env }: Context) {
  if (!sameOriginMutation(request)) {
    return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" }, privateHeaders);
  }
  const auth = await requireReviewer(request, env);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }

  const forbidden = [
    "reviewer_specialist_id", "reviewer_id", "specialist_id", "learner_id", "employment_state",
    "hire", "reject", "auto_hire", "auto_reject", "academy_enrollment_state", "readiness_score",
  ];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "review_control_fields_not_editable_here" }, privateHeaders);
  }

  const candidateId = cleanHrText(body.candidate_id, 120);
  const outcome = cleanHrText(body.outcome, 40);
  const reason = cleanHrLongText(body.reason, 4000);
  if (!isHrCandidateId(candidateId)) {
    return jsonResponse(400, { success: false, error: "candidate_id_invalid" }, privateHeaders);
  }
  if (!isHrReviewOutcome(outcome)) {
    return jsonResponse(400, { success: false, error: "review_outcome_invalid" }, privateHeaders);
  }
  if (reason.length < 15) {
    return jsonResponse(400, { success: false, error: "review_reason_required" }, privateHeaders);
  }

  const candidate = await env.DB.prepare(`
    SELECT id,name,email,track,status,specialist_id
    FROM hr_candidates
    WHERE id=?
    LIMIT 1
  `).bind(candidateId).first();
  if (!candidate) return jsonResponse(404, { success: false, error: "candidate_not_found" }, privateHeaders);
  if (candidate.status === "interviewing") {
    return jsonResponse(409, { success: false, error: "interview_not_completed" }, privateHeaders);
  }

  const statusByOutcome: Record<string, string> = {
    ACADEMY: "academy_pending",
    MORE_EVIDENCE: "more_evidence",
    SUPERVISED_TEST: "supervised_test",
  };
  const now = new Date().toISOString();
  const reviewId = `hr-review-${crypto.randomUUID()}`;

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO hr_reviews
        (id,candidate_id,reviewer_specialist_id,outcome,reason,created_at)
      VALUES (?,?,?,?,?,?)
    `).bind(reviewId, candidateId, auth.specialist.id, outcome, reason, now),
    env.DB.prepare(`
      UPDATE hr_candidates
      SET status=?,updated_at=?
      WHERE id=?
    `).bind(statusByOutcome[outcome], now, candidateId),
  ]);

  let academyLink = null;
  if (outcome === "ACADEMY" && candidate.specialist_id) {
    academyLink = await ensureHrAcademyLink(env.DB, candidate, candidate.specialist_id);
  } else if (outcome !== "ACADEMY" && candidate.specialist_id) {
    await env.DB.prepare(`
      UPDATE hr_academy_links
      SET state='claimed',updated_at=?
      WHERE candidate_id=? AND specialist_id=?
    `).bind(now, candidateId, candidate.specialist_id).run();
  }

  return jsonResponse(200, {
    success: true,
    review: {
      id: reviewId,
      candidate_id: candidateId,
      outcome,
      reason,
      reviewer_specialist_id: auth.specialist.id,
      created_at: now,
      automated: false,
    },
    candidate_status: statusByOutcome[outcome],
    academy_link: academyLink,
  }, privateHeaders);
}
