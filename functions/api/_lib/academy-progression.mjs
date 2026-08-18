import {
  ACADEMY_LESSONS,
  getAcademyEnrollment,
  listAcademyLessonProgress,
} from "./academy.mjs";

export const ACADEMY_PROGRESSION_DECISIONS = ["continue", "changes_requested", "completed"];

export function isAcademyProgressionDecision(value) {
  return ACADEMY_PROGRESSION_DECISIONS.includes(String(value || ""));
}

export function academyProgressionStateFromDecision(decision) {
  if (decision === "completed") return "completed";
  if (decision === "changes_requested") return "changes_requested";
  return "in_progress";
}

export async function ensureAcademyProgressionSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS academy_progression_reviews (
      id TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      program_slug TEXT NOT NULL CHECK (program_slug IN ('us-logistics-operations','marketing')),
      reviewer_specialist_id TEXT NOT NULL,
      decision TEXT NOT NULL CHECK (decision IN ('continue','changes_requested','completed')),
      feedback_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_progression_learner_program ON academy_progression_reviews(specialist_id, program_slug, created_at)").run();
}

export async function listAcademyProgressionReviews(db, specialistId, programSlug) {
  const result = await db.prepare(`
    SELECT id, decision, feedback_text, created_at
    FROM academy_progression_reviews
    WHERE specialist_id = ? AND program_slug = ?
    ORDER BY created_at ASC
  `).bind(specialistId, programSlug).all();
  return Array.isArray(result?.results) ? result.results : [];
}

export async function getAcademyProgressionSummary(db, specialistId, programSlug) {
  const enrollment = await getAcademyEnrollment(db, specialistId, programSlug);
  if (!enrollment) return null;

  const lessons = Array.isArray(ACADEMY_LESSONS[programSlug]) ? ACADEMY_LESSONS[programSlug] : [];
  const progress = await listAcademyLessonProgress(db, specialistId, programSlug);
  const progressByLesson = new Map(progress.map((item) => [item.lesson_id, item.state]));

  const submissionResult = await db.prepare(`
    SELECT lesson_id, state, COUNT(*) AS count
    FROM academy_submissions
    WHERE specialist_id = ? AND program_slug = ?
    GROUP BY lesson_id, state
  `).bind(specialistId, programSlug).all();
  const submissionRows = Array.isArray(submissionResult?.results) ? submissionResult.results : [];

  const lessonEvidence = new Map();
  const evidenceTotals = { submitted: 0, changes_requested: 0, accepted: 0 };
  for (const row of submissionRows) {
    const current = lessonEvidence.get(row.lesson_id) || { submitted: 0, changes_requested: 0, accepted: 0 };
    const count = Number(row.count || 0);
    if (row.state === "submitted" || row.state === "changes_requested" || row.state === "accepted") {
      current[row.state] = count;
      evidenceTotals[row.state] += count;
    }
    lessonEvidence.set(row.lesson_id, current);
  }

  const progressionReviews = await listAcademyProgressionReviews(db, specialistId, programSlug);
  const latestReview = progressionReviews.length ? progressionReviews[progressionReviews.length - 1] : null;

  const lessonSummary = lessons.map((lessonId) => ({
    lesson_id: lessonId,
    lesson_state: progressByLesson.get(lessonId) || "not_started",
    evidence: lessonEvidence.get(lessonId) || { submitted: 0, changes_requested: 0, accepted: 0 },
  }));

  return {
    program_slug: programSlug,
    enrollment_state: enrollment.state,
    total_lessons: lessons.length,
    completed_lessons: lessonSummary.filter((item) => item.lesson_state === "completed").length,
    evidence: evidenceTotals,
    lessons: lessonSummary,
    progression_state: academyProgressionStateFromDecision(latestReview?.decision),
    latest_review: latestReview ? {
      decision: latestReview.decision,
      feedback_text: latestReview.feedback_text,
      created_at: latestReview.created_at,
    } : null,
    review_history: progressionReviews.map((review) => ({
      decision: review.decision,
      feedback_text: review.feedback_text,
      created_at: review.created_at,
    })),
  };
}
