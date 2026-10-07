import {
  cleanHrLongText,
  cleanHrText,
  ensureHrSchema,
  isHrCandidateId,
  sha256Hex,
} from "./hr.mjs";

export const HR_ASSESSMENT_RUBRIC_VERSION = "academy-business-assessment-v1";
export const HR_ASSESSMENT_DIMENSIONS = Object.freeze([
  "evidence_diagnosis",
  "audience_positioning",
  "funnel_logic",
  "readiness_offer",
  "kpi_measurement",
  "execution_thinking",
]);
export const HR_ASSESSMENT_DECISIONS = Object.freeze([
  "READY_FOR_FINAL_HUMAN_REVIEW",
  "MORE_EVIDENCE",
  "ASSESSMENT_NOT_PASSED",
]);

const TEMPLATE_STATES = new Set(["active","archived"]);
const ASSIGNMENT_STATES = new Set(["issued","claimed","submitted","reviewed","archived"]);
const SUBMISSION_FORMATS = new Set(["google_docs_mindmap","google_docs","external_refs"]);
const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

const clean = (value, max = 240) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const parseJson = (value, fallback) => {
  try { return value ? JSON.parse(String(value)) : fallback; }
  catch { return fallback; }
};

const cleanUrl = (value, max = 900) => {
  const text = clean(value, max);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString().slice(0, max) : "";
  } catch {
    return "";
  }
};

const cleanIso = (value) => {
  const text = clean(value, 48);
  if (!text || !Number.isFinite(Date.parse(text))) return "";
  return new Date(text).toISOString();
};

const enumValue = (value, allowed, fallback) => {
  const normalized = clean(value, 80).toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.has(normalized) ? normalized : fallback;
};

const safeSources = (value) => {
  const rows = Array.isArray(value) ? value : [];
  return [...new Set(rows.map((item) => cleanUrl(item, 900)).filter(Boolean))].slice(0, 12);
};

export async function ensureHrAssessmentSchema(db) {
  await ensureHrSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_assessment_templates (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      title TEXT NOT NULL,
      role_title TEXT NOT NULL,
      brief TEXT NOT NULL,
      submission_format TEXT NOT NULL,
      sources_json TEXT NOT NULL DEFAULT '[]',
      rubric_version TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active','archived')),
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_assessment_assignments (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      candidate_id TEXT,
      claim_token_hash TEXT NOT NULL,
      deadline_at TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('issued','claimed','submitted','reviewed','archived')),
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_assessment_submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL UNIQUE,
      candidate_id TEXT NOT NULL,
      google_doc_ref TEXT,
      mindmap_ref TEXT,
      notes TEXT,
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_assessment_reviews (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      reviewer_specialist_id TEXT NOT NULL,
      scores_json TEXT NOT NULL,
      total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 30),
      reviewer_notes TEXT NOT NULL,
      decision TEXT NOT NULL CHECK (decision IN ('READY_FOR_FINAL_HUMAN_REVIEW','MORE_EVIDENCE','ASSESSMENT_NOT_PASSED')),
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_assessment_templates_company ON hr_assessment_templates(company_id,status,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_assessment_assignments_company ON hr_assessment_assignments(company_id,state,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_assessment_assignments_candidate ON hr_assessment_assignments(candidate_id,state,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_assessment_reviews_assignment ON hr_assessment_reviews(assignment_id,created_at)").run();
}

export function normalizeHrAssessmentTemplate(body, existing = {}) {
  return {
    title: cleanHrText(body.title ?? existing.title, 180),
    roleTitle: cleanHrText(body.roleTitle ?? existing.role_title, 180),
    brief: cleanHrLongText(body.brief ?? existing.brief, 8000),
    submissionFormat: enumValue(
      body.submissionFormat ?? existing.submission_format ?? "google_docs_mindmap",
      SUBMISSION_FORMATS,
      "google_docs_mindmap",
    ),
    sources: safeSources(body.sources ?? parseJson(existing.sources_json, [])),
    status: enumValue(body.status ?? existing.status ?? "active", TEMPLATE_STATES, "active"),
  };
}

export function hrAssessmentTemplateErrors(value) {
  const errors = [];
  if (value.title.length < 3) errors.push("assessment_title_required");
  if (value.roleTitle.length < 2) errors.push("assessment_role_required");
  if (value.brief.length < 30) errors.push("assessment_brief_required");
  if (value.status === "archived") errors.push("use_archive_template_action");
  return errors;
}

export function normalizeHrAssessmentAssignment(body) {
  return {
    templateId: clean(body.templateId, 140),
    deadlineAt: cleanIso(body.deadlineAt),
  };
}

export function hrAssessmentAssignmentErrors(value) {
  const errors = [];
  if (!/^hr-assessment-template-[a-zA-Z0-9-]{20,}$/.test(value.templateId)) errors.push("assessment_template_id_invalid");
  if (!value.deadlineAt) errors.push("assessment_deadline_required");
  return errors;
}

export function normalizeHrAssessmentSubmission(body, template) {
  const submissionFormat = template?.submission_format || "google_docs_mindmap";
  const value = {
    googleDocRef: cleanUrl(body.googleDocRef, 900),
    mindmapRef: cleanUrl(body.mindmapRef, 900),
    notes: cleanHrLongText(body.notes, 4000),
  };
  const errors = [];
  if (submissionFormat === "google_docs_mindmap") {
    if (!value.googleDocRef) errors.push("google_doc_ref_required");
    if (!value.mindmapRef) errors.push("mindmap_ref_required");
  } else if (submissionFormat === "google_docs" && !value.googleDocRef) {
    errors.push("google_doc_ref_required");
  } else if (submissionFormat === "external_refs" && !value.googleDocRef && !value.mindmapRef) {
    errors.push("submission_reference_required");
  }
  return { value, errors };
}

export function normalizeHrAssessmentScores(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const scores = {};
  const errors = [];
  for (const dimension of HR_ASSESSMENT_DIMENSIONS) {
    const number = Number(source[dimension]);
    if (!Number.isInteger(number) || number < 0 || number > 5) {
      errors.push(`assessment_score_${dimension}_invalid`);
      continue;
    }
    scores[dimension] = number;
  }
  const totalScore = errors.length
    ? null
    : HR_ASSESSMENT_DIMENSIONS.reduce((sum, key) => sum + Number(scores[key] || 0), 0);
  return { scores, totalScore, errors };
}

export function normalizeHrAssessmentReview(body) {
  const scoring = normalizeHrAssessmentScores(body.scores);
  const decision = cleanHrText(body.decision, 80).toUpperCase();
  const reviewerNotes = cleanHrLongText(body.reviewerNotes, 5000);
  const errors = [...scoring.errors];
  if (!HR_ASSESSMENT_DECISIONS.includes(decision)) errors.push("assessment_decision_invalid");
  if (reviewerNotes.length < 15) errors.push("assessment_reviewer_notes_required");
  return {
    scores: scoring.scores,
    totalScore: scoring.totalScore,
    decision,
    reviewerNotes,
    errors,
  };
}

export function safeHrAssessmentTemplate(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    title: row.title,
    roleTitle: row.role_title,
    brief: row.brief,
    submissionFormat: row.submission_format,
    sources: parseJson(row.sources_json, []),
    rubricVersion: row.rubric_version,
    rubric: HR_ASSESSMENT_DIMENSIONS.map((key) => ({ key, maxScore: 5 })),
    status: row.status,
    archivedAt: row.archived_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function safeHrAssessmentAssignment(row, submission = null, review = null) {
  if (!row) return null;
  return {
    id: String(row.id),
    templateId: String(row.template_id),
    companyId: String(row.company_id),
    candidateId: row.candidate_id || null,
    deadlineAt: row.deadline_at,
    state: row.state,
    archivedAt: row.archived_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submission: submission ? {
      googleDocRef: submission.google_doc_ref || "",
      mindmapRef: submission.mindmap_ref || "",
      notes: submission.notes || "",
      submittedAt: submission.submitted_at,
      updatedAt: submission.updated_at,
    } : null,
    review: review ? {
      id: String(review.id),
      reviewerSpecialistId: String(review.reviewer_specialist_id),
      scores: parseJson(review.scores_json, {}),
      totalScore: Number(review.total_score),
      reviewerNotes: review.reviewer_notes,
      decision: review.decision,
      createdAt: review.created_at,
      automated: false,
      finalEmploymentDecision: false,
    } : null,
  };
}

export async function createHrAssessmentClaimToken() {
  const token = `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  return { token, hash: await sha256Hex(token) };
}

export async function readHrCandidateByToken(db, candidateId, token) {
  if (!isHrCandidateId(candidateId)) return null;
  const cleanToken = cleanHrText(token, 220);
  if (cleanToken.length < 48) return null;
  await ensureHrSchema(db);
  const row = await db.prepare(`
    SELECT id,access_token_hash,status,specialist_id,track
    FROM hr_candidates
    WHERE id=?
    LIMIT 1
  `).bind(candidateId).first();
  if (!row) return null;
  return row.access_token_hash === await sha256Hex(cleanToken) ? row : null;
}

export function assignmentState(value) {
  return enumValue(value, ASSIGNMENT_STATES, "issued");
}
