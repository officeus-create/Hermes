export const ACADEMY_PROGRAMS = ["us-logistics-operations", "marketing"];
export const ACADEMY_ENROLLMENT_STATES = ["applied", "approved", "enrolled", "paused", "completed", "cancelled"];
export const ACADEMY_PARTICIPATION_MODELS = ["free_practice", "paid_cohort", "unspecified"];
export const ACADEMY_LANGUAGES = ["en", "ru", "uk", "es", "it", "fr"];
export const ACADEMY_PROGRESS_STATES = ["not_started", "in_progress", "completed"];
export const ACADEMY_LESSONS = {
  "us-logistics-operations": [
    "dispatch-foundations",
    "carrier-broker-communication",
    "equipment-lane-logic",
    "documents-setup",
    "negotiation-practice",
    "operating-rhythm",
  ],
  marketing: [
    "positioning-offer",
    "website-first-content",
    "platform-distribution",
    "lead-journey",
    "sales-follow-up",
    "analytics-improvement",
  ],
};

export function isAcademyProgram(value) {
  return ACADEMY_PROGRAMS.includes(String(value || ""));
}

export function isAcademyEnrollmentState(value) {
  return ACADEMY_ENROLLMENT_STATES.includes(String(value || ""));
}

export function isAcademyParticipationModel(value) {
  return ACADEMY_PARTICIPATION_MODELS.includes(String(value || ""));
}

export function isAcademyLanguage(value) {
  return ACADEMY_LANGUAGES.includes(String(value || ""));
}

export function isAcademyProgressState(value) {
  return ACADEMY_PROGRESS_STATES.includes(String(value || ""));
}

export function isAcademyLesson(programSlug, lessonId) {
  const lessons = ACADEMY_LESSONS[String(programSlug || "")];
  return Array.isArray(lessons) && lessons.includes(String(lessonId || ""));
}

export function cleanAcademyTimezone(value) {
  const text = String(value || "").trim().slice(0, 80);
  if (!text) return null;
  return /^[A-Za-z0-9_+\-/:. ]+$/.test(text) ? text : null;
}

export async function ensureAcademySchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS academy_learner_profiles (
      specialist_id TEXT PRIMARY KEY,
      preferred_language TEXT CHECK (preferred_language IS NULL OR preferred_language IN ('en','ru','uk','es','it','fr')),
      timezone TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS academy_enrollments (
      id TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      program_slug TEXT NOT NULL CHECK (program_slug IN ('us-logistics-operations','marketing')),
      state TEXT NOT NULL CHECK (state IN ('applied','approved','enrolled','paused','completed','cancelled')),
      participation_model TEXT NOT NULL CHECK (participation_model IN ('free_practice','paid_cohort','unspecified')),
      cohort_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(specialist_id, program_slug)
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS academy_lesson_progress (
      specialist_id TEXT NOT NULL,
      program_slug TEXT NOT NULL CHECK (program_slug IN ('us-logistics-operations','marketing')),
      lesson_id TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('not_started','in_progress','completed')),
      started_at TEXT,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(specialist_id, program_slug, lesson_id)
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_enrollments_specialist ON academy_enrollments(specialist_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_enrollments_program_state ON academy_enrollments(program_slug, state)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_progress_specialist_program ON academy_lesson_progress(specialist_id, program_slug)").run();
}

export async function ensureAcademyLearnerProfile(db, specialistId) {
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT OR IGNORE INTO academy_learner_profiles
      (specialist_id, preferred_language, timezone, created_at, updated_at)
    VALUES (?, NULL, NULL, ?, ?)
  `).bind(specialistId, now, now).run();
}

export async function getAcademyLearnerProfile(db, specialistId) {
  return db.prepare(`
    SELECT specialist_id, preferred_language, timezone, created_at, updated_at
    FROM academy_learner_profiles
    WHERE specialist_id = ?
    LIMIT 1
  `).bind(specialistId).first();
}

export async function listAcademyEnrollments(db, specialistId) {
  const result = await db.prepare(`
    SELECT id, program_slug, state, participation_model, cohort_code, created_at, updated_at
    FROM academy_enrollments
    WHERE specialist_id = ?
    ORDER BY created_at ASC
  `).bind(specialistId).all();
  return Array.isArray(result?.results) ? result.results : [];
}

export async function getAcademyEnrollment(db, specialistId, programSlug) {
  return db.prepare(`
    SELECT id, program_slug, state, participation_model, cohort_code, created_at, updated_at
    FROM academy_enrollments
    WHERE specialist_id = ? AND program_slug = ?
    LIMIT 1
  `).bind(specialistId, programSlug).first();
}

export async function listAcademyLessonProgress(db, specialistId, programSlug) {
  const result = await db.prepare(`
    SELECT lesson_id, state, started_at, completed_at, updated_at
    FROM academy_lesson_progress
    WHERE specialist_id = ? AND program_slug = ?
    ORDER BY updated_at ASC
  `).bind(specialistId, programSlug).all();
  return Array.isArray(result?.results) ? result.results : [];
}
