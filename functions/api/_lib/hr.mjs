import { ensureAcademyLearnerProfile, ensureAcademySchema, getAcademyEnrollment } from "./academy.mjs";
import { ensureInternalAiSchema } from "./internal-ai.mjs";

export const HR_TRACKS = Object.freeze(["logistics", "sales", "marketing"]);
export const HR_REVIEW_OUTCOMES = Object.freeze(["ACADEMY", "MORE_EVIDENCE", "SUPERVISED_TEST"]);
export const HR_CANDIDATE_STATUSES = Object.freeze([
  "interviewing",
  "completed",
  "academy_pending",
  "more_evidence",
  "supervised_test",
]);
export const HR_EVALUATION_POLICY_VERSION = "hr-eval-policy-v1";
export const HR_INTERVIEW_VERSION = "hr-interview-v2";
export const HR_MODEL_VERSION = "deterministic-practice-signals-v1";
export const HR_ROUTE_RECOMMENDATIONS = Object.freeze([
  "DIRECT_HIRE_REVIEW",
  "ACADEMY",
  "MORE_EVIDENCE_REQUIRED",
  "HUMAN_SPECIAL_REVIEW",
  "NO_CURRENT_FIT",
]);

export const HR_ATTRIBUTION_KEYS = Object.freeze([
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "vacancy", "creative", "market", "placement", "landing_path", "referrer_host",
]);

const HR_LANGUAGES = new Set(["en", "ru", "uk"]);

export function cleanHrText(value, maxLength = 1000) {
  const text = String(value ?? "")
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, maxLength) : "";
}

export function cleanHrLongText(value, maxLength = 4000) {
  const text = String(value ?? "")
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
  return text ? text.slice(0, maxLength) : "";
}

export function normalizeHrEmail(value) {
  return cleanHrText(value, 160).toLowerCase();
}

export function isHrEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

export function isHrCandidateId(value) {
  return /^hr_[a-zA-Z0-9][a-zA-Z0-9_-]{20,100}$/.test(String(value || ""));
}

export function isHrEvidenceId(value) {
  return /^evidence_[a-zA-Z0-9][a-zA-Z0-9_-]{12,120}$/.test(String(value || ""));
}

export function isHrEventId(value) {
  return /^evt_[a-zA-Z0-9][a-zA-Z0-9_-]{12,120}$/.test(String(value || ""));
}

export function isHrTrack(value) {
  return HR_TRACKS.includes(String(value || ""));
}

export function isHrReviewOutcome(value) {
  return HR_REVIEW_OUTCOMES.includes(String(value || ""));
}

export function isHrLanguage(value) {
  return HR_LANGUAGES.has(String(value || ""));
}

export function buildHrScoreDimensions(signals, evidenceIds = []) {
  const safeEvidenceIds = Array.isArray(evidenceIds)
    ? [...new Set(evidenceIds.map((value) => cleanHrText(value, 140)).filter(Boolean))].slice(0, 24)
    : [];
  const keys = ["clarity", "evidence", "learning", "discovery", "application"];
  const dimensions = {};
  for (const key of keys) {
    const raw = signals && typeof signals === "object" ? Number(signals[key]) : Number.NaN;
    const score = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : null;
    dimensions[key] = {
      score,
      confidence: score === null ? "UNKNOWN" : (safeEvidenceIds.length ? "LOW" : "UNKNOWN"),
      evidence_ids: score === null ? [] : safeEvidenceIds,
    };
  }
  return dimensions;
}

export function hrRouteRecommendation(recommendationCode, dimensions = {}) {
  const missing = Object.entries(dimensions)
    .filter(([, value]) => !value || value.score === null || value.confidence === "UNKNOWN")
    .map(([key]) => key);
  if (recommendationCode === "ACADEMY_PRACTICE_RECOMMENDED") {
    return {
      recommendation: "ACADEMY",
      rationale: "Structured Academy practice is the current automated development suggestion; an authorized human reviewer decides the consequential next step.",
      missing_evidence: [...missing, "independent_or_supervised_job_evidence"],
    };
  }
  if (recommendationCode === "REVIEW_FOR_SUPERVISED_TEST") {
    return {
      recommendation: "HUMAN_SPECIAL_REVIEW",
      rationale: "Written evidence may justify a supervised test review, but the system does not authorize employment or live work.",
      missing_evidence: [...missing, "supervised_live_roleplay_or_call"],
    };
  }
  return {
    recommendation: "MORE_EVIDENCE_REQUIRED",
    rationale: "The current evidence is insufficient for a stronger development recommendation; human review remains required.",
    missing_evidence: missing.length ? missing : ["additional_job_relevant_evidence"],
  };
}

export function hrHumanRouteForReviewOutcome(outcome) {
  if (outcome === "ACADEMY") return "ACADEMY";
  if (outcome === "SUPERVISED_TEST") return "HUMAN_SPECIAL_REVIEW";
  return "MORE_EVIDENCE_REQUIRED";
}

export function cleanHrAttribution(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value;
  const result = {};
  for (const key of HR_ATTRIBUTION_KEYS) {
    const normalized = cleanHrText(source[key], 240);
    if (normalized) result[key] = normalized;
  }
  return result;
}

export async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

export function hrProgramForTrack(track) {
  if (track === "logistics") return "us-logistics-operations";
  if (track === "marketing") return "marketing";
  return null;
}

export function sameOriginMutation(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const secFetchSite = request.headers.get("Sec-Fetch-Site");
  if (secFetchSite === "cross-site") return false;
  return !origin || origin === url.origin;
}

export async function ensureHrSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_candidates (
      id TEXT PRIMARY KEY,
      access_token_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      telegram_handle TEXT,
      country TEXT NOT NULL,
      language TEXT NOT NULL CHECK (language IN ('en','ru','uk')),
      source TEXT NOT NULL,
      track TEXT NOT NULL CHECK (track IN ('logistics','sales','marketing')),
      attribution_json TEXT NOT NULL DEFAULT '{}',
      consent_at TEXT NOT NULL,
      specialist_id TEXT UNIQUE,
      status TEXT NOT NULL CHECK (status IN ('interviewing','completed','academy_pending','more_evidence','supervised_test')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_interview_sessions (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL UNIQUE,
      track TEXT NOT NULL CHECK (track IN ('logistics','sales','marketing')),
      state TEXT NOT NULL CHECK (state IN ('in_progress','completed')),
      started_at TEXT NOT NULL,
      completed_at TEXT,
      practice_signals_json TEXT,
      recommendation_code TEXT,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_interview_answers (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      phase TEXT NOT NULL,
      parent_question_id TEXT,
      answer_text TEXT NOT NULL,
      submitted_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_events (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}'
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_evidence_items (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('INTERVIEW_ANSWER')),
      source_ref TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_question_path_events (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      parent_question_id TEXT,
      phase TEXT NOT NULL,
      occurred_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_score_snapshots (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      policy_version TEXT NOT NULL,
      interview_version TEXT NOT NULL,
      model_version TEXT NOT NULL,
      dimensions_json TEXT NOT NULL,
      missing_evidence_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_route_decisions (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      recommendation TEXT NOT NULL CHECK (recommendation IN ('DIRECT_HIRE_REVIEW','ACADEMY','MORE_EVIDENCE_REQUIRED','HUMAN_SPECIAL_REVIEW','NO_CURRENT_FIT')),
      rationale TEXT NOT NULL,
      evidence_ids_json TEXT NOT NULL DEFAULT '[]',
      requires_human_review INTEGER NOT NULL DEFAULT 1 CHECK (requires_human_review IN (0,1)),
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_calibration_reviews (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL UNIQUE,
      candidate_id TEXT NOT NULL,
      reviewer_specialist_id TEXT NOT NULL,
      human_route TEXT NOT NULL,
      ai_route TEXT,
      disagreement_category TEXT NOT NULL CHECK (disagreement_category IN ('MATCH','DIFFERENT_ROUTE','AI_ROUTE_MISSING')),
      reviewer_confidence TEXT NOT NULL CHECK (reviewer_confidence IN ('LOW','MEDIUM','HIGH')),
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_reviewer_access (
      specialist_id TEXT PRIMARY KEY,
      active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_reviews (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      reviewer_specialist_id TEXT NOT NULL,
      outcome TEXT NOT NULL CHECK (outcome IN ('ACADEMY','MORE_EVIDENCE','SUPERVISED_TEST')),
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_academy_links (
      candidate_id TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL UNIQUE,
      program_slug TEXT,
      enrollment_id TEXT,
      state TEXT NOT NULL CHECK (state IN ('claimed','awaiting_program','enrollment_applied')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_candidates_email ON hr_candidates(email)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_candidates_track_status ON hr_candidates(track,status,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_candidates_source ON hr_candidates(source,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_answers_candidate ON hr_interview_answers(candidate_id,submitted_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_events_candidate ON hr_events(candidate_id,occurred_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_reviews_candidate ON hr_reviews(candidate_id,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_evidence_candidate ON hr_evidence_items(candidate_id,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_question_path_candidate ON hr_question_path_events(candidate_id,occurred_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_scores_candidate ON hr_score_snapshots(candidate_id,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_routes_candidate ON hr_route_decisions(candidate_id,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_calibration_candidate ON hr_calibration_reviews(candidate_id,created_at)").run();
}

export async function getHrReviewerAccess(db, specialistId) {
  await ensureHrSchema(db);
  const explicit = await db.prepare(`
    SELECT specialist_id,active,created_at,updated_at
    FROM hr_reviewer_access
    WHERE specialist_id = ? AND active = 1
    LIMIT 1
  `).bind(specialistId).first();
  if (explicit) return { source: "hr_reviewer_access", ...explicit };

  await ensureInternalAiSchema(db);
  const owner = await db.prepare(`
    SELECT specialist_id,active,capability,created_at,updated_at
    FROM hermes_internal_owner_access
    WHERE specialist_id = ? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER'
    LIMIT 1
  `).bind(specialistId).first();
  return owner ? { source: "hermes_internal_owner_access", ...owner } : null;
}

export async function getLatestHrReview(db, candidateId) {
  return db.prepare(`
    SELECT id,candidate_id,reviewer_specialist_id,outcome,reason,created_at
    FROM hr_reviews
    WHERE candidate_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(candidateId).first();
}

export async function getHrCandidateSnapshot(db, candidateId) {
  await ensureHrSchema(db);
  const candidate = await db.prepare(`
    SELECT id,name,email,telegram_handle,country,language,source,track,attribution_json,
           consent_at,specialist_id,status,created_at,updated_at
    FROM hr_candidates
    WHERE id = ?
    LIMIT 1
  `).bind(candidateId).first();
  if (!candidate) return null;

  const session = await db.prepare(`
    SELECT id,candidate_id,track,state,started_at,completed_at,practice_signals_json,
           recommendation_code,updated_at
    FROM hr_interview_sessions
    WHERE candidate_id = ?
    LIMIT 1
  `).bind(candidateId).first();

  const [answerResult, eventResult, reviewResult, academyLink, evidenceResult, pathResult, scoreResult, routeResult, calibrationResult] = await Promise.all([
    db.prepare(`
      SELECT id,question_id,phase,parent_question_id,answer_text,submitted_at
      FROM hr_interview_answers
      WHERE candidate_id = ?
      ORDER BY submitted_at ASC
    `).bind(candidateId).all(),
    db.prepare(`
      SELECT id,type,occurred_at,payload_json
      FROM hr_events
      WHERE candidate_id = ?
      ORDER BY occurred_at ASC
    `).bind(candidateId).all(),
    db.prepare(`
      SELECT id,reviewer_specialist_id,outcome,reason,created_at
      FROM hr_reviews
      WHERE candidate_id = ?
      ORDER BY created_at ASC
    `).bind(candidateId).all(),
    db.prepare(`
      SELECT candidate_id,specialist_id,program_slug,enrollment_id,state,created_at,updated_at
      FROM hr_academy_links
      WHERE candidate_id = ?
      LIMIT 1
    `).bind(candidateId).first(),
    db.prepare(`
      SELECT id,kind,source_ref,created_at
      FROM hr_evidence_items
      WHERE candidate_id = ?
      ORDER BY created_at ASC
    `).bind(candidateId).all(),
    db.prepare(`
      SELECT id,question_id,parent_question_id,phase,occurred_at
      FROM hr_question_path_events
      WHERE candidate_id = ?
      ORDER BY occurred_at ASC
    `).bind(candidateId).all(),
    db.prepare(`
      SELECT id,policy_version,interview_version,model_version,dimensions_json,missing_evidence_json,created_at
      FROM hr_score_snapshots
      WHERE candidate_id = ?
      ORDER BY created_at ASC
    `).bind(candidateId).all(),
    db.prepare(`
      SELECT id,recommendation,rationale,evidence_ids_json,requires_human_review,created_at
      FROM hr_route_decisions
      WHERE candidate_id = ?
      ORDER BY created_at ASC
    `).bind(candidateId).all(),
    db.prepare(`
      SELECT id,review_id,reviewer_specialist_id,human_route,ai_route,disagreement_category,reviewer_confidence,created_at
      FROM hr_calibration_reviews
      WHERE candidate_id = ?
      ORDER BY created_at ASC
    `).bind(candidateId).all(),
  ]);

  const parseJson = (value, fallback) => {
    try { return value ? JSON.parse(String(value)) : fallback; }
    catch { return fallback; }
  };

  return {
    candidate: {
      ...candidate,
      attribution: parseJson(candidate.attribution_json, {}),
      attribution_json: undefined,
    },
    session: session ? {
      ...session,
      practice_signals: parseJson(session.practice_signals_json, null),
      practice_signals_json: undefined,
    } : null,
    answers: (answerResult?.results || []).map((row) => ({
      evidence_id: row.id,
      question_id: row.question_id,
      phase: row.phase,
      parent_question_id: row.parent_question_id || null,
      answer: row.answer_text,
      submitted_at: row.submitted_at,
    })),
    events: (eventResult?.results || []).map((row) => ({
      event_id: row.id,
      type: row.type,
      occurred_at: row.occurred_at,
      payload: parseJson(row.payload_json, {}),
    })),
    reviews: Array.isArray(reviewResult?.results) ? reviewResult.results : [],
    academy_link: academyLink || null,
    evidence_items: Array.isArray(evidenceResult?.results) ? evidenceResult.results : [],
    question_path: Array.isArray(pathResult?.results) ? pathResult.results : [],
    score_snapshots: (scoreResult?.results || []).map((row) => ({
      ...row,
      dimensions: parseJson(row.dimensions_json, {}),
      missing_evidence: parseJson(row.missing_evidence_json, []),
      dimensions_json: undefined,
      missing_evidence_json: undefined,
    })),
    route_decisions: (routeResult?.results || []).map((row) => ({
      ...row,
      evidence_ids: parseJson(row.evidence_ids_json, []),
      requires_human_review: Boolean(row.requires_human_review),
      evidence_ids_json: undefined,
    })),
    calibration_reviews: Array.isArray(calibrationResult?.results) ? calibrationResult.results : [],
  };
}

export async function ensureHrAcademyLink(db, candidate, specialistId) {
  await ensureHrSchema(db);
  const now = new Date().toISOString();
  const programSlug = hrProgramForTrack(candidate.track);

  if (!programSlug) {
    await db.prepare(`
      INSERT INTO hr_academy_links
        (candidate_id,specialist_id,program_slug,enrollment_id,state,created_at,updated_at)
      VALUES (?,?,NULL,NULL,'awaiting_program',?,?)
      ON CONFLICT(candidate_id) DO UPDATE SET
        specialist_id=excluded.specialist_id,
        program_slug=NULL,
        enrollment_id=NULL,
        state='awaiting_program',
        updated_at=excluded.updated_at
    `).bind(candidate.id, specialistId, now, now).run();
    return { state: "awaiting_program", program_slug: null, enrollment_id: null };
  }

  await ensureAcademySchema(db);
  await ensureAcademyLearnerProfile(db, specialistId);
  let enrollment = await getAcademyEnrollment(db, specialistId, programSlug);
  if (!enrollment) {
    const enrollmentId = `academy-enrollment-${crypto.randomUUID()}`;
    await db.prepare(`
      INSERT INTO academy_enrollments
        (id,specialist_id,program_slug,state,participation_model,cohort_code,created_at,updated_at)
      VALUES (?,?,?,'applied','unspecified',NULL,?,?)
    `).bind(enrollmentId, specialistId, programSlug, now, now).run();
    enrollment = await getAcademyEnrollment(db, specialistId, programSlug);
  }

  await db.prepare(`
    INSERT INTO hr_academy_links
      (candidate_id,specialist_id,program_slug,enrollment_id,state,created_at,updated_at)
    VALUES (?,?,?,?, 'enrollment_applied', ?, ?)
    ON CONFLICT(candidate_id) DO UPDATE SET
      specialist_id=excluded.specialist_id,
      program_slug=excluded.program_slug,
      enrollment_id=excluded.enrollment_id,
      state='enrollment_applied',
      updated_at=excluded.updated_at
  `).bind(candidate.id, specialistId, programSlug, enrollment.id, now, now).run();

  return { state: "enrollment_applied", program_slug: programSlug, enrollment_id: enrollment.id };
}
