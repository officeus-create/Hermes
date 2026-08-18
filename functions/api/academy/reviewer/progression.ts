import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  ACADEMY_LESSONS,
  academyReviewerCanAccessProgram,
  cleanAcademyText,
  ensureAcademySchema,
  getAcademyReviewerAccess,
  isAcademyProgram,
} from "../../_lib/academy.mjs";
import {
  academyProgressionStateFromDecision,
  ensureAcademyProgressionSchema,
  getAcademyProgressionSummary,
  isAcademyProgressionDecision,
} from "../../_lib/academy-progression.mjs";

type Env = { DB?: any };
type ReviewerAuth =
  | { ok: false; response: Response }
  | { ok: true; specialist: any; access: any };

const academyLessonsByProgram = ACADEMY_LESSONS as Record<string, string[]>;

async function requireReviewer(request: Request, env: Env): Promise<ReviewerAuth> {
  if (!env.DB) return { ok: false, response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { ok: false, response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  await ensureAcademySchema(env.DB);
  await ensureAcademyProgressionSchema(env.DB);
  const access = await getAcademyReviewerAccess(env.DB, specialist.id);
  if (!access) return { ok: false, response: jsonResponse(403, { success: false, error: "academy_reviewer_not_authorized" }) };
  return { ok: true, specialist, access };
}

function resolveProgramFilter(access: any, requestedProgram: string | null) {
  if (access.program_scope) {
    if (requestedProgram && requestedProgram !== access.program_scope) {
      return { ok: false as const, status: 403, error: "reviewer_program_scope_forbidden" };
    }
    return { ok: true as const, program: access.program_scope as string };
  }
  if (requestedProgram) {
    if (!isAcademyProgram(requestedProgram)) return { ok: false as const, status: 400, error: "program_invalid" };
    return { ok: true as const, program: requestedProgram };
  }
  return { ok: true as const, program: null };
}

async function loadTarget(db: any, reviewerId: string, access: any, learnerId: string, programSlug: string) {
  if (!learnerId || learnerId.length > 160) return { ok: false as const, status: 400, error: "learner_id_invalid" };
  if (!isAcademyProgram(programSlug)) return { ok: false as const, status: 400, error: "program_invalid" };
  if (!academyReviewerCanAccessProgram(access, programSlug)) {
    return { ok: false as const, status: 403, error: "reviewer_program_scope_forbidden" };
  }
  if (learnerId === reviewerId) return { ok: false as const, status: 403, error: "reviewer_cannot_review_own_progression" };

  const learner = await db.prepare(`
    SELECT id, name, email
    FROM specialists
    WHERE id = ?
    LIMIT 1
  `).bind(learnerId).first();
  if (!learner) return { ok: false as const, status: 404, error: "learner_not_found" };

  const summary = await getAcademyProgressionSummary(db, learnerId, programSlug);
  if (!summary) return { ok: false as const, status: 404, error: "enrollment_not_found" };
  if (summary.enrollment_state !== "enrolled") {
    return { ok: false as const, status: 409, error: "enrollment_not_active", enrollment_state: summary.enrollment_state };
  }
  return { ok: true as const, learner, summary };
}

const queueSelect = `
  SELECT e.specialist_id AS id, e.program_slug, p.name, p.email,
    (SELECT COUNT(*) FROM academy_lesson_progress lp
      WHERE lp.specialist_id = e.specialist_id AND lp.program_slug = e.program_slug AND lp.state = 'completed') AS completed_lessons,
    (SELECT COUNT(*) FROM academy_submissions s
      WHERE s.specialist_id = e.specialist_id AND s.program_slug = e.program_slug AND s.state = 'submitted') AS submitted_evidence,
    (SELECT COUNT(*) FROM academy_submissions s
      WHERE s.specialist_id = e.specialist_id AND s.program_slug = e.program_slug AND s.state = 'changes_requested') AS changes_requested_evidence,
    (SELECT COUNT(*) FROM academy_submissions s
      WHERE s.specialist_id = e.specialist_id AND s.program_slug = e.program_slug AND s.state = 'accepted') AS accepted_evidence,
    (SELECT pr.decision FROM academy_progression_reviews pr
      WHERE pr.specialist_id = e.specialist_id AND pr.program_slug = e.program_slug
      ORDER BY pr.created_at DESC LIMIT 1) AS latest_decision,
    (SELECT pr.feedback_text FROM academy_progression_reviews pr
      WHERE pr.specialist_id = e.specialist_id AND pr.program_slug = e.program_slug
      ORDER BY pr.created_at DESC LIMIT 1) AS latest_feedback,
    (SELECT pr.created_at FROM academy_progression_reviews pr
      WHERE pr.specialist_id = e.specialist_id AND pr.program_slug = e.program_slug
      ORDER BY pr.created_at DESC LIMIT 1) AS latest_reviewed_at
  FROM academy_enrollments e
  JOIN specialists p ON p.id = e.specialist_id
`;

async function listTargets(db: any, reviewerId: string, access: any, requestedProgram: string | null) {
  const filter = resolveProgramFilter(access, requestedProgram);
  if (!filter.ok) return filter;

  const query = filter.program
    ? db.prepare(`${queueSelect}
        WHERE e.state = 'enrolled' AND e.program_slug = ? AND e.specialist_id <> ?
        ORDER BY e.updated_at ASC
        LIMIT 50
      `).bind(filter.program, reviewerId)
    : db.prepare(`${queueSelect}
        WHERE e.state = 'enrolled' AND e.specialist_id <> ?
        ORDER BY e.updated_at ASC
        LIMIT 50
      `).bind(reviewerId);

  const result = await query.all();
  const rows = Array.isArray(result?.results) ? result.results : [];
  const learners = rows.map((row: any) => {
    const latestReview = row.latest_decision ? {
      decision: row.latest_decision,
      feedback_text: row.latest_feedback || "",
      created_at: row.latest_reviewed_at,
    } : null;
    const programLessons = academyLessonsByProgram[row.program_slug] || [];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      program_slug: row.program_slug,
      progression: {
        total_lessons: programLessons.length,
        completed_lessons: Number(row.completed_lessons || 0),
        evidence: {
          submitted: Number(row.submitted_evidence || 0),
          changes_requested: Number(row.changes_requested_evidence || 0),
          accepted: Number(row.accepted_evidence || 0),
        },
        progression_state: academyProgressionStateFromDecision(row.latest_decision),
        latest_review: latestReview,
      },
    };
  });
  return { ok: true as const, program_scope: access.program_scope ?? null, learners };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireReviewer(request, env);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const learnerId = url.searchParams.get("learner") || "";
  const requestedProgram = url.searchParams.get("program");

  if (!learnerId) {
    const queue = await listTargets(env.DB, auth.specialist.id, auth.access, requestedProgram);
    if (!queue.ok) return jsonResponse(queue.status, { success: false, error: queue.error });
    return jsonResponse(200, {
      success: true,
      reviewer: { name: auth.specialist.name, email: auth.specialist.email, program_scope: queue.program_scope },
      learners: queue.learners,
    });
  }

  const programSlug = requestedProgram || "";
  const target = await loadTarget(env.DB, auth.specialist.id, auth.access, learnerId, programSlug);
  if (!target.ok) return jsonResponse(target.status, { success: false, error: target.error, ...("enrollment_state" in target ? { enrollment_state: target.enrollment_state } : {}) });

  return jsonResponse(200, {
    success: true,
    reviewer: { name: auth.specialist.name, email: auth.specialist.email, program_scope: auth.access.program_scope ?? null },
    learner: { id: target.learner.id, name: target.learner.name, email: target.learner.email },
    progression: target.summary,
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const auth = await requireReviewer(request, env);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const forbidden = [
    "reviewer_specialist_id",
    "reviewer_id",
    "learner_email",
    "enrollment_state",
    "lesson_state",
    "progress_state",
    "submission_state",
    "readiness_score",
    "certificate_state",
    "employment_state",
    "payment_state",
    "commercial_access",
    "operational_access",
  ];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "progression_control_fields_not_editable_here" });
  }

  const learnerId = String(body.learner_id || "").trim();
  const programSlug = String(body.program_slug || "").trim();
  const decision = String(body.decision || "").trim();
  const rawFeedback = String(body.feedback_text || "").replace(/\u0000/g, "").trim();
  if (!isAcademyProgressionDecision(decision)) return jsonResponse(400, { success: false, error: "progression_decision_invalid" });
  if (rawFeedback.length < 5 || rawFeedback.length > 4000) return jsonResponse(400, { success: false, error: "feedback_length_invalid" });
  const feedbackText = cleanAcademyText(rawFeedback, 4000);
  if (!feedbackText) return jsonResponse(400, { success: false, error: "feedback_required" });

  const target = await loadTarget(env.DB, auth.specialist.id, auth.access, learnerId, programSlug);
  if (!target.ok) return jsonResponse(target.status, { success: false, error: target.error, ...("enrollment_state" in target ? { enrollment_state: target.enrollment_state } : {}) });

  const reviewId = `academy-progression-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO academy_progression_reviews
      (id, specialist_id, program_slug, reviewer_specialist_id, decision, feedback_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(reviewId, learnerId, programSlug, auth.specialist.id, decision, feedbackText, now).run();

  const progression = await getAcademyProgressionSummary(env.DB, learnerId, programSlug);
  return jsonResponse(200, {
    success: true,
    review: { id: reviewId, decision, feedback_text: feedbackText, created_at: now },
    progression,
  });
}
