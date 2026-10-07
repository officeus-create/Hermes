import {
  cleanHrText,
  sha256Hex,
} from "../_lib/hr.mjs";
import {
  ensureHrAssessmentSchema,
  normalizeHrAssessmentSubmission,
  readHrCandidateByToken,
  safeHrAssessmentAssignment,
  safeHrAssessmentTemplate,
} from "../_lib/hr-assessment.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env };

const MAIN_ORIGIN = "https://hermeslogisticsus.com";
const CONNECT_ORIGIN = "https://connect.hermeslogisticsus.com";
const ALLOWED_ORIGINS = new Set([MAIN_ORIGIN, CONNECT_ORIGIN]);

const headers = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-HR-Candidate-Token",
  "Cache-Control": "private, no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin",
  "X-Robots-Tag": "noindex, nofollow",
});

const json = (origin: string, status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers: headers(origin) });

const allowedOrigin = (request: Request) => {
  const origin = request.headers.get("Origin") || "";
  return ALLOWED_ORIGINS.has(origin) ? origin : "";
};

const candidateToken = (request: Request) => cleanHrText(request.headers.get("X-HR-Candidate-Token"), 220);

async function readAssignment(db: any, assignmentId: string) {
  return db.prepare(`
    SELECT *
    FROM hr_assessment_assignments
    WHERE id=?
    LIMIT 1
  `).bind(assignmentId).first();
}

async function readTemplate(db: any, templateId: string) {
  return db.prepare(`
    SELECT *
    FROM hr_assessment_templates
    WHERE id=?
    LIMIT 1
  `).bind(templateId).first();
}

async function readSubmission(db: any, assignmentId: string, candidateId: string) {
  return db.prepare(`
    SELECT *
    FROM hr_assessment_submissions
    WHERE assignment_id=? AND candidate_id=?
    LIMIT 1
  `).bind(assignmentId,candidateId).first();
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

async function requireCandidate(request: Request, env: Env, origin: string, candidateId: string) {
  if (!env.DB) return { error: json(origin,503,{success:false,error:"database_not_configured"}) } as const;
  const candidate = await readHrCandidateByToken(env.DB,candidateId,candidateToken(request));
  if (!candidate) return { error: json(origin,403,{success:false,error:"candidate_identity_required"}) } as const;
  return { candidate } as const;
}

export async function onRequestOptions({ request }: Context) {
  const origin = allowedOrigin(request);
  if (!origin) return json(MAIN_ORIGIN,403,{success:false,error:"origin_not_allowed"});
  return new Response(null,{status:204,headers:headers(origin)});
}

export async function onRequestGet({ request, env }: Context) {
  const origin = allowedOrigin(request);
  if (!origin) return json(MAIN_ORIGIN,403,{success:false,error:"origin_not_allowed"});
  const url = new URL(request.url);
  const candidateId = cleanHrText(url.searchParams.get("candidate_id"),120);
  const assignmentId = cleanHrText(url.searchParams.get("assignment_id"),160);
  const auth = await requireCandidate(request,env,origin,candidateId);
  if ("error" in auth) return auth.error;
  await ensureHrAssessmentSchema(env.DB);
  const assignment = await readAssignment(env.DB,assignmentId);
  if (!assignment || assignment.archived_at || assignment.candidate_id !== candidateId) {
    return json(origin,404,{success:false,error:"assessment_assignment_not_found"});
  }
  const [template,submission,review] = await Promise.all([
    readTemplate(env.DB,String(assignment.template_id)),
    readSubmission(env.DB,assignmentId,candidateId),
    readLatestReview(env.DB,assignmentId),
  ]);
  return json(origin,200,{
    success:true,
    template:safeHrAssessmentTemplate(template),
    assignment:safeHrAssessmentAssignment(assignment,submission,review),
    boundary:{automatedHiringDecision:false,finalEmploymentDecision:false},
  });
}

export async function onRequestPost({ request, env }: Context) {
  const origin = allowedOrigin(request);
  if (!origin) return json(MAIN_ORIGIN,403,{success:false,error:"origin_not_allowed"});
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json(origin,415,{success:false,error:"content_type_required"});
  }
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return json(origin,400,{success:false,error:"invalid_json"}); }

  const action = cleanHrText(body.action,60);
  const candidateId = cleanHrText(body.candidateId ?? body.candidate_id,120);
  const assignmentId = cleanHrText(body.assignmentId ?? body.assignment_id,160);
  const auth = await requireCandidate(request,env,origin,candidateId);
  if ("error" in auth) return auth.error;
  await ensureHrAssessmentSchema(env.DB);
  const assignment = await readAssignment(env.DB,assignmentId);
  if (!assignment || assignment.archived_at) return json(origin,404,{success:false,error:"assessment_assignment_not_found"});

  if (action === "claim_assignment") {
    const rawToken = cleanHrText(body.assignmentToken,220);
    if (rawToken.length < 48 || assignment.claim_token_hash !== await sha256Hex(rawToken)) {
      return json(origin,403,{success:false,error:"assessment_assignment_token_invalid"});
    }
    if (assignment.candidate_id && assignment.candidate_id !== candidateId) {
      return json(origin,409,{success:false,error:"assessment_assignment_already_claimed"});
    }
    if (assignment.state === "archived") return json(origin,409,{success:false,error:"assessment_assignment_archived"});
    const now = new Date().toISOString();
    if (!assignment.candidate_id) {
      await env.DB.prepare(`
        UPDATE hr_assessment_assignments
        SET candidate_id=?,state='claimed',updated_at=?
        WHERE id=? AND candidate_id IS NULL AND archived_at IS NULL
      `).bind(candidateId,now,assignmentId).run();
    }
    const reread = await readAssignment(env.DB,assignmentId);
    const template = await readTemplate(env.DB,String(reread.template_id));
    return json(origin,200,{
      success:true,
      template:safeHrAssessmentTemplate(template),
      assignment:safeHrAssessmentAssignment(reread),
      identityLink:"existing_hr_candidate_claim",
    });
  }

  if (action === "submit_assignment") {
    const forbidden = ["scores","totalScore","total_score","decision","reviewer","reviewerId","hire","reject","employmentDecision"];
    if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body,key))) {
      return json(origin,400,{success:false,error:"assessment_review_fields_not_candidate_editable"});
    }
    if (assignment.candidate_id !== candidateId) return json(origin,403,{success:false,error:"assessment_assignment_not_claimed_by_candidate"});
    if (!["claimed","submitted"].includes(String(assignment.state))) {
      return json(origin,409,{success:false,error:"assessment_submission_not_editable"});
    }
    const template = await readTemplate(env.DB,String(assignment.template_id));
    if (!template || template.archived_at) return json(origin,409,{success:false,error:"assessment_template_unavailable"});
    const normalized = normalizeHrAssessmentSubmission(body,template);
    if (normalized.errors.length) return json(origin,400,{success:false,errors:normalized.errors});
    const now = new Date().toISOString();
    const existing = await readSubmission(env.DB,assignmentId,candidateId);
    if (existing) {
      await env.DB.prepare(`
        UPDATE hr_assessment_submissions
        SET google_doc_ref=?,mindmap_ref=?,notes=?,submitted_at=?,updated_at=?
        WHERE assignment_id=? AND candidate_id=?
      `).bind(
        normalized.value.googleDocRef || null,normalized.value.mindmapRef || null,
        normalized.value.notes || null,now,now,assignmentId,candidateId
      ).run();
    } else {
      const submissionId = `hr-assessment-submission-${crypto.randomUUID()}`;
      await env.DB.prepare(`
        INSERT INTO hr_assessment_submissions (
          id,assignment_id,candidate_id,google_doc_ref,mindmap_ref,notes,submitted_at,updated_at
        ) VALUES (?,?,?,?,?,?,?,?)
      `).bind(
        submissionId,assignmentId,candidateId,normalized.value.googleDocRef || null,
        normalized.value.mindmapRef || null,normalized.value.notes || null,now,now
      ).run();
    }
    await env.DB.prepare(`
      UPDATE hr_assessment_assignments
      SET state='submitted',updated_at=?
      WHERE id=? AND candidate_id=? AND archived_at IS NULL
    `).bind(now,assignmentId,candidateId).run();
    const [reread,submission] = await Promise.all([
      readAssignment(env.DB,assignmentId),
      readSubmission(env.DB,assignmentId,candidateId),
    ]);
    return json(origin,200,{
      success:true,
      assignment:safeHrAssessmentAssignment(reread,submission),
      submittedLate:Date.parse(now)>Date.parse(String(reread.deadline_at)),
      automatedHiringDecision:false,
      finalEmploymentDecision:false,
    });
  }

  return json(origin,400,{success:false,error:"unknown_action"});
}
