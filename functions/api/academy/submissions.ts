import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  cleanAcademyEvidenceUrl,
  cleanAcademyText,
  ensureAcademySchema,
  getAcademyEnrollment,
  isAcademyLesson,
  isAcademyProgram,
  isAcademySubmissionType,
  listAcademySubmissionReviews,
} from "../_lib/academy.mjs";

type Env = { DB?: any };

async function ownSubmissionPayload(db: any, specialistId: string) {
  const result = await db.prepare(`
    SELECT id, program_slug, lesson_id, submission_type, text_content, evidence_url, state, created_at, updated_at
    FROM academy_submissions
    WHERE specialist_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(specialistId).all();
  const submissions = Array.isArray(result?.results) ? result.results : [];
  const reviews = await listAcademySubmissionReviews(db, submissions.map((item: any) => item.id));
  const reviewsBySubmission = new Map<string, any[]>();
  for (const review of reviews) {
    const list = reviewsBySubmission.get(review.submission_id) || [];
    list.push({
      id: review.id,
      decision: review.decision,
      feedback_text: review.feedback_text,
      created_at: review.created_at,
    });
    reviewsBySubmission.set(review.submission_id, list);
  }
  return submissions.map((item: any) => ({
    ...item,
    reviews: reviewsBySubmission.get(item.id) || [],
  }));
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureAcademySchema(env.DB);
  return jsonResponse(200, {
    success: true,
    submissions: await ownSubmissionPayload(env.DB, specialist.id),
  });
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
    "email",
    "reviewer_id",
    "reviewer_specialist_id",
    "review_decision",
    "state",
    "enrollment_state",
    "readiness_score",
    "certificate_state",
    "employment_state",
  ];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "submission_control_fields_not_editable_here" });
  }

  const programSlug = String(body.program_slug || "").trim();
  const lessonId = String(body.lesson_id || "").trim();
  const submissionType = String(body.submission_type || "").trim();
  if (!isAcademyProgram(programSlug)) return jsonResponse(400, { success: false, error: "program_invalid" });
  if (!isAcademyLesson(programSlug, lessonId)) return jsonResponse(400, { success: false, error: "lesson_invalid" });
  if (!isAcademySubmissionType(submissionType)) return jsonResponse(400, { success: false, error: "submission_type_invalid" });

  const rawText = String(body.text_content || "").replace(/\u0000/g, "").trim();
  const rawUrl = String(body.evidence_url || "").trim();
  if (rawText.length > 5000) return jsonResponse(400, { success: false, error: "text_too_long" });
  if (rawUrl.length > 2048) return jsonResponse(400, { success: false, error: "evidence_url_too_long" });

  let textContent: string | null = null;
  let evidenceUrl: string | null = null;
  if (submissionType === "written_reflection") {
    textContent = cleanAcademyText(rawText, 5000);
    if (!textContent || textContent.length < 20) {
      return jsonResponse(400, { success: false, error: "written_reflection_too_short" });
    }
    if (rawUrl) return jsonResponse(400, { success: false, error: "evidence_url_not_allowed_for_written_reflection" });
  } else {
    evidenceUrl = cleanAcademyEvidenceUrl(rawUrl);
    if (!evidenceUrl) return jsonResponse(400, { success: false, error: "evidence_url_invalid" });
    textContent = cleanAcademyText(rawText, 2000);
    if (rawText.length > 2000) return jsonResponse(400, { success: false, error: "evidence_note_too_long" });
  }

  await ensureAcademySchema(env.DB);
  const enrollment = await getAcademyEnrollment(env.DB, specialist.id, programSlug);
  if (!enrollment) return jsonResponse(404, { success: false, error: "enrollment_not_found" });
  if (enrollment.state !== "enrolled") {
    return jsonResponse(409, {
      success: false,
      error: "enrollment_not_active",
      enrollment_state: enrollment.state,
    });
  }

  const id = `academy-submission-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO academy_submissions
      (id, specialist_id, program_slug, lesson_id, submission_type, text_content, evidence_url, state, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)
  `).bind(id, specialist.id, programSlug, lessonId, submissionType, textContent, evidenceUrl, now, now).run();

  const submission = await env.DB.prepare(`
    SELECT id, program_slug, lesson_id, submission_type, text_content, evidence_url, state, created_at, updated_at
    FROM academy_submissions
    WHERE id = ? AND specialist_id = ?
    LIMIT 1
  `).bind(id, specialist.id).first();

  return jsonResponse(201, { success: true, submission: { ...submission, reviews: [] } });
}
