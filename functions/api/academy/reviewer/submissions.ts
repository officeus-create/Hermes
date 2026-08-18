import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  academyReviewerCanAccessProgram,
  cleanAcademyText,
  ensureAcademySchema,
  getAcademyReviewerAccess,
  isAcademyProgram,
  isAcademyReviewDecision,
  listAcademySubmissionReviews,
} from "../../_lib/academy.mjs";

type Env = { DB?: any };

async function requireReviewer(request: Request, env: Env) {
  if (!env.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  await ensureAcademySchema(env.DB);
  const access = await getAcademyReviewerAccess(env.DB, specialist.id);
  if (!access) return { response: jsonResponse(403, { success: false, error: "academy_reviewer_not_authorized" }) };
  return { specialist, access };
}

async function reviewerQueue(db: any, access: any, requestedProgram: string | null) {
  let programFilter: string | null = null;
  if (access.program_scope) {
    if (requestedProgram && requestedProgram !== access.program_scope) {
      return { error: "reviewer_program_scope_forbidden" };
    }
    programFilter = access.program_scope;
  } else if (requestedProgram) {
    if (!isAcademyProgram(requestedProgram)) return { error: "program_invalid" };
    programFilter = requestedProgram;
  }

  const query = programFilter
    ? db.prepare(`
        SELECT s.id, s.program_slug, s.lesson_id, s.submission_type, s.text_content, s.evidence_url,
               s.state, s.created_at, s.updated_at,
               p.name AS learner_name, p.email AS learner_email
        FROM academy_submissions s
        JOIN specialists p ON p.id = s.specialist_id
        WHERE s.program_slug = ?
        ORDER BY CASE s.state WHEN 'submitted' THEN 0 WHEN 'changes_requested' THEN 1 ELSE 2 END, s.created_at ASC
        LIMIT 100
      `).bind(programFilter)
    : db.prepare(`
        SELECT s.id, s.program_slug, s.lesson_id, s.submission_type, s.text_content, s.evidence_url,
               s.state, s.created_at, s.updated_at,
               p.name AS learner_name, p.email AS learner_email
        FROM academy_submissions s
        JOIN specialists p ON p.id = s.specialist_id
        ORDER BY CASE s.state WHEN 'submitted' THEN 0 WHEN 'changes_requested' THEN 1 ELSE 2 END, s.created_at ASC
        LIMIT 100
      `);

  const result = await query.all();
  const submissions = Array.isArray(result?.results) ? result.results : [];
  const reviews = await listAcademySubmissionReviews(db, submissions.map((item: any) => item.id));
  const reviewsBySubmission = new Map<string, any[]>();
  for (const review of reviews) {
    const list = reviewsBySubmission.get(review.submission_id) || [];
    list.push({ id: review.id, decision: review.decision, feedback_text: review.feedback_text, created_at: review.created_at });
    reviewsBySubmission.set(review.submission_id, list);
  }

  return {
    program_scope: access.program_scope ?? null,
    submissions: submissions.map((item: any) => ({ ...item, reviews: reviewsBySubmission.get(item.id) || [] })),
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireReviewer(request, env);
  if ("response" in auth) return auth.response;

  const requestedProgram = new URL(request.url).searchParams.get("program");
  const queue = await reviewerQueue(env.DB, auth.access, requestedProgram);
  if ("error" in queue) {
    if (queue.error === "reviewer_program_scope_forbidden") {
      return jsonResponse(403, { success: false, error: queue.error });
    }
    return jsonResponse(400, { success: false, error: queue.error });
  }

  return jsonResponse(200, {
    success: true,
    reviewer: { name: auth.specialist.name, email: auth.specialist.email, program_scope: queue.program_scope },
    submissions: queue.submissions,
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const auth = await requireReviewer(request, env);
  if ("response" in auth) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const forbidden = [
    "reviewer_specialist_id",
    "reviewer_id",
    "specialist_id",
    "learner_id",
    "learner_email",
    "program_slug",
    "lesson_id",
    "enrollment_state",
    "progress_state",
    "readiness_score",
    "certificate_state",
    "employment_state",
  ];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "review_control_fields_not_editable_here" });
  }

  const submissionId = String(body.submission_id || "").trim();
  const decision = String(body.decision || "").trim();
  const rawFeedback = String(body.feedback_text || "").replace(/\u0000/g, "").trim();
  if (!submissionId || submissionId.length > 160) return jsonResponse(400, { success: false, error: "submission_id_invalid" });
  if (!isAcademyReviewDecision(decision)) return jsonResponse(400, { success: false, error: "review_decision_invalid" });
  if (rawFeedback.length < 5 || rawFeedback.length > 4000) return jsonResponse(400, { success: false, error: "feedback_length_invalid" });
  const feedbackText = cleanAcademyText(rawFeedback, 4000);
  if (!feedbackText) return jsonResponse(400, { success: false, error: "feedback_required" });

  const submission = await env.DB.prepare(`
    SELECT id, specialist_id, program_slug, lesson_id, state
    FROM academy_submissions
    WHERE id = ?
    LIMIT 1
  `).bind(submissionId).first();
  if (!submission) return jsonResponse(404, { success: false, error: "submission_not_found" });
  if (!academyReviewerCanAccessProgram(auth.access, submission.program_slug)) {
    return jsonResponse(403, { success: false, error: "reviewer_program_scope_forbidden" });
  }
  if (submission.specialist_id === auth.specialist.id) {
    return jsonResponse(403, { success: false, error: "reviewer_cannot_review_own_submission" });
  }

  const reviewId = `academy-review-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const insertReview = env.DB.prepare(`
    INSERT INTO academy_submission_reviews
      (id, submission_id, reviewer_specialist_id, decision, feedback_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(reviewId, submission.id, auth.specialist.id, decision, feedbackText, now);
  const updateSubmission = env.DB.prepare(`
    UPDATE academy_submissions
    SET state = ?, updated_at = ?
    WHERE id = ?
  `).bind(decision, now, submission.id);
  await env.DB.batch([insertReview, updateSubmission]);

  return jsonResponse(200, {
    success: true,
    review: { id: reviewId, submission_id: submission.id, decision, feedback_text: feedbackText, created_at: now },
    submission_state: decision,
  });
}
