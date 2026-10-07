import { jsonResponse } from "../../_lib/session.mjs";
import { getAcademyBusinessCrmContext } from "../../_lib/academy-business-crm.mjs";
import {
  createHrAssessmentClaimToken,
  ensureHrAssessmentSchema,
  hrAssessmentAssignmentErrors,
  hrAssessmentTemplateErrors,
  normalizeHrAssessmentAssignment,
  normalizeHrAssessmentReview,
  normalizeHrAssessmentTemplate,
  safeHrAssessmentAssignment,
  safeHrAssessmentTemplate,
  HR_ASSESSMENT_RUBRIC_VERSION,
} from "../../_lib/hr-assessment.mjs";

type Env = { DB?: any };
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

const errorResponse = (error: { status: number; code: string }) =>
  jsonResponse(error.status, { success: false, error: error.code }, privateHeaders);

const parseBody = async (request: Request) => {
  try { return await request.json() as Record<string, unknown>; }
  catch { return null; }
};

async function readTemplate(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT *
    FROM hr_assessment_templates
    WHERE id=? AND owner_specialist_id=? AND company_id=?
    LIMIT 1
  `).bind(id, ownerId, companyId).first();
}

async function readAssignment(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT *
    FROM hr_assessment_assignments
    WHERE id=? AND owner_specialist_id=? AND company_id=?
    LIMIT 1
  `).bind(id, ownerId, companyId).first();
}

async function readSubmission(db: any, assignmentId: string) {
  return db.prepare(`
    SELECT *
    FROM hr_assessment_submissions
    WHERE assignment_id=?
    LIMIT 1
  `).bind(assignmentId).first();
}

async function readLatestReview(db: any, assignmentId: string) {
  return db.prepare(`
    SELECT *
    FROM hr_assessment_reviews
    WHERE assignment_id=?
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(assignmentId).first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const ctx = await getAcademyBusinessCrmContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  await ensureHrAssessmentSchema(env.DB);
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const url = new URL(request.url);
  const module = url.searchParams.get("module") || "dashboard";
  const includeArchived = url.searchParams.get("include_archived") === "1";

  if (module === "templates") {
    const result = await env.DB.prepare(`
      SELECT *
      FROM hr_assessment_templates
      WHERE owner_specialist_id=? AND company_id=?
        ${includeArchived ? "" : "AND archived_at IS NULL"}
      ORDER BY updated_at DESC
      LIMIT 200
    `).bind(ownerId, companyId).all();
    return jsonResponse(200, { success: true, templates: (result?.results || []).map(safeHrAssessmentTemplate) }, privateHeaders);
  }

  if (module === "assignments" || module === "dashboard") {
    const [templatesResult, assignmentsResult] = await Promise.all([
      env.DB.prepare(`
        SELECT *
        FROM hr_assessment_templates
        WHERE owner_specialist_id=? AND company_id=? AND archived_at IS NULL
        ORDER BY updated_at DESC
        LIMIT 200
      `).bind(ownerId, companyId).all(),
      env.DB.prepare(`
        SELECT *
        FROM hr_assessment_assignments
        WHERE owner_specialist_id=? AND company_id=?
          ${includeArchived ? "" : "AND archived_at IS NULL"}
        ORDER BY updated_at DESC
        LIMIT 300
      `).bind(ownerId, companyId).all(),
    ]);
    const assignments = [];
    for (const row of assignmentsResult?.results || []) {
      const [submission, review] = await Promise.all([
        readSubmission(env.DB, String(row.id)),
        readLatestReview(env.DB, String(row.id)),
      ]);
      assignments.push(safeHrAssessmentAssignment(row, submission, review));
    }
    return jsonResponse(200, {
      success: true,
      templates: (templatesResult?.results || []).map(safeHrAssessmentTemplate),
      assignments,
      boundary: {
        candidateSearch: false,
        identityLink: "candidate_claim_token",
        automatedHiringDecision: false,
        finalEmploymentDecision: false,
      },
    }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_module" }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const ctx = await getAcademyBusinessCrmContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  await ensureHrAssessmentSchema(env.DB);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);

  const action = String(body.action || "");
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const now = new Date().toISOString();

  if (action === "create_template") {
    const value = normalizeHrAssessmentTemplate(body);
    const errors = hrAssessmentTemplateErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    const id = `hr-assessment-template-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hr_assessment_templates (
        id,company_id,owner_specialist_id,title,role_title,brief,submission_format,
        sources_json,rubric_version,status,archived_at,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,'active',NULL,?,?)
    `).bind(
      id,companyId,ownerId,value.title,value.roleTitle,value.brief,value.submissionFormat,
      JSON.stringify(value.sources),HR_ASSESSMENT_RUBRIC_VERSION,now,now
    ).run();
    const row = await readTemplate(env.DB, id, ownerId, companyId);
    return jsonResponse(201, { success: true, template: safeHrAssessmentTemplate(row) }, privateHeaders);
  }

  if (action === "archive_template") {
    const id = String(body.id || "").trim();
    const template = await readTemplate(env.DB, id, ownerId, companyId);
    if (!template || template.archived_at) return jsonResponse(404, { success: false, error: "assessment_template_not_found" }, privateHeaders);
    const open = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM hr_assessment_assignments
      WHERE template_id=? AND company_id=? AND archived_at IS NULL AND state IN ('issued','claimed','submitted')
    `).bind(id, companyId).first();
    if (Number(open?.count || 0) > 0) return jsonResponse(409, { success: false, error: "assessment_template_has_open_assignments" }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hr_assessment_templates
      SET status='archived',archived_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,now,id,ownerId,companyId).run();
    return jsonResponse(200, { success: true, template: safeHrAssessmentTemplate(await readTemplate(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  if (action === "create_assignment") {
    const forbidden = ["candidateId","candidate_id","candidateEmail","email","scores","decision","hire","reject"];
    if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body,key))) {
      return jsonResponse(400, { success: false, error: "assessment_candidate_must_claim_explicitly" }, privateHeaders);
    }
    const value = normalizeHrAssessmentAssignment(body);
    const errors = hrAssessmentAssignmentErrors(value);
    if (value.deadlineAt && Date.parse(value.deadlineAt) <= Date.now()) errors.push("assessment_deadline_must_be_future");
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    const template = await readTemplate(env.DB, value.templateId, ownerId, companyId);
    if (!template || template.archived_at || template.status !== "active") {
      return jsonResponse(404, { success: false, error: "assessment_template_not_found" }, privateHeaders);
    }
    const id = `hr-assessment-assignment-${crypto.randomUUID()}`;
    const claim = await createHrAssessmentClaimToken();
    await env.DB.prepare(`
      INSERT INTO hr_assessment_assignments (
        id,template_id,company_id,owner_specialist_id,candidate_id,claim_token_hash,
        deadline_at,state,archived_at,created_at,updated_at
      ) VALUES (?,?,?,?,NULL,?,?,'issued',NULL,?,?)
    `).bind(id,value.templateId,companyId,ownerId,claim.hash,value.deadlineAt,now,now).run();
    const row = await readAssignment(env.DB,id,ownerId,companyId);
    return jsonResponse(201, {
      success: true,
      assignment: safeHrAssessmentAssignment(row),
      assignmentToken: claim.token,
      tokenReturnedOnce: true,
      candidateMustClaimWithExistingHrIdentity: true,
    }, privateHeaders);
  }

  if (action === "review_submission") {
    const id = String(body.id || "").trim();
    const assignment = await readAssignment(env.DB,id,ownerId,companyId);
    if (!assignment || assignment.archived_at) return jsonResponse(404, { success: false, error: "assessment_assignment_not_found" }, privateHeaders);
    if (!["submitted","reviewed"].includes(String(assignment.state))) {
      return jsonResponse(409, { success: false, error: "assessment_submission_required" }, privateHeaders);
    }
    const submission = await readSubmission(env.DB,id);
    if (!submission) return jsonResponse(409, { success: false, error: "assessment_submission_required" }, privateHeaders);
    const value = normalizeHrAssessmentReview(body);
    if (value.errors.length) return jsonResponse(400, { success: false, errors: value.errors }, privateHeaders);
    const reviewId = `hr-assessment-review-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hr_assessment_reviews (
        id,assignment_id,reviewer_specialist_id,scores_json,total_score,reviewer_notes,decision,created_at
      ) VALUES (?,?,?,?,?,?,?,?)
    `).bind(
      reviewId,id,ownerId,JSON.stringify(value.scores),value.totalScore,value.reviewerNotes,value.decision,now
    ).run();
    await env.DB.prepare(`
      UPDATE hr_assessment_assignments
      SET state='reviewed',updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,id,ownerId,companyId).run();
    const [row,review] = await Promise.all([
      readAssignment(env.DB,id,ownerId,companyId),
      readLatestReview(env.DB,id),
    ]);
    return jsonResponse(200, {
      success: true,
      assignment: safeHrAssessmentAssignment(row,submission,review),
      automated: false,
      finalEmploymentDecision: false,
    }, privateHeaders);
  }

  if (action === "archive_assignment") {
    const id = String(body.id || "").trim();
    const assignment = await readAssignment(env.DB,id,ownerId,companyId);
    if (!assignment || assignment.archived_at) return jsonResponse(404, { success: false, error: "assessment_assignment_not_found" }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hr_assessment_assignments
      SET state='archived',archived_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,now,id,ownerId,companyId).run();
    return jsonResponse(200, { success: true, assignment: safeHrAssessmentAssignment(await readAssignment(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_action" }, privateHeaders);
}
