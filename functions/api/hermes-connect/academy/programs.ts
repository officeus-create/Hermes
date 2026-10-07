import { jsonResponse } from "../../_lib/session.mjs";
import {
  academyBusinessCohortCode,
  academyBusinessCohortErrors,
  academyBusinessProgramErrors,
  academyBusinessProgramSlug,
  getAcademyBusinessProgramsContext,
  normalizeAcademyBusinessCohort,
  normalizeAcademyBusinessProgram,
  safeAcademyBusinessCohort,
  safeAcademyBusinessProgram,
} from "../../_lib/academy-business-programs.mjs";

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

async function readProgram(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT *
    FROM hermes_academy_business_programs
    WHERE id=? AND owner_specialist_id=? AND company_id=?
    LIMIT 1
  `).bind(id, ownerId, companyId).first();
}

async function readCohort(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT c.*, p.name AS program_name
    FROM hermes_academy_business_cohorts c
    JOIN hermes_academy_business_programs p
      ON p.id=c.program_id AND p.owner_specialist_id=c.owner_specialist_id AND p.company_id=c.company_id
    WHERE c.id=? AND c.owner_specialist_id=? AND c.company_id=?
    LIMIT 1
  `).bind(id, ownerId, companyId).first();
}

async function requireProgram(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT *
    FROM hermes_academy_business_programs
    WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    LIMIT 1
  `).bind(id, ownerId, companyId).first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const ctx = await getAcademyBusinessProgramsContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const includeArchived = new URL(request.url).searchParams.get("include_archived") === "1";

  const [programResult, cohortResult] = await Promise.all([
    env.DB.prepare(`
      SELECT *
      FROM hermes_academy_business_programs
      WHERE owner_specialist_id=? AND company_id=?
        ${includeArchived ? "" : "AND archived_at IS NULL"}
      ORDER BY updated_at DESC
      LIMIT 500
    `).bind(ownerId, companyId).all(),
    env.DB.prepare(`
      SELECT c.*, p.name AS program_name
      FROM hermes_academy_business_cohorts c
      JOIN hermes_academy_business_programs p
        ON p.id=c.program_id AND p.owner_specialist_id=c.owner_specialist_id AND p.company_id=c.company_id
      WHERE c.owner_specialist_id=? AND c.company_id=?
        ${includeArchived ? "" : "AND c.archived_at IS NULL"}
      ORDER BY c.updated_at DESC
      LIMIT 1000
    `).bind(ownerId, companyId).all(),
  ]);

  return jsonResponse(200, {
    success: true,
    programs: (programResult?.results || []).map(safeAcademyBusinessProgram),
    cohorts: (cohortResult?.results || []).map(safeAcademyBusinessCohort),
    enrollmentBridge: "explicit_authenticated_specialist_claim",
  }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const ctx = await getAcademyBusinessProgramsContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);

  const action = String(body.action || "");
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const now = new Date().toISOString();

  if (action === "create_program") {
    const value = normalizeAcademyBusinessProgram(body);
    const errors = academyBusinessProgramErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    const id = `academy-business-program-${crypto.randomUUID()}`;
    const slug = academyBusinessProgramSlug(value.name, id);
    await env.DB.prepare(`
      INSERT INTO hermes_academy_business_programs (
        id,owner_specialist_id,company_id,name,slug,status,format_text,duration_text,eligibility_text,
        price_cents,currency,price_source_ref,notes,archived_at,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?)
    `).bind(
      id,ownerId,companyId,value.name,slug,value.status,value.formatText || null,value.durationText || null,
      value.eligibilityText || null,value.priceCents,value.currency || null,value.priceSourceRef || null,
      value.notes || null,now,now
    ).run();
    return jsonResponse(201, { success: true, program: safeAcademyBusinessProgram(await readProgram(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  if (action === "update_program") {
    const id = String(body.id || "").trim();
    if (!id) return jsonResponse(400, { success: false, error: "program_id_required" }, privateHeaders);
    const existing = await readProgram(env.DB,id,ownerId,companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "program_not_found" }, privateHeaders);
    const value = normalizeAcademyBusinessProgram(body, existing);
    const errors = academyBusinessProgramErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_programs SET
        name=?,status=?,format_text=?,duration_text=?,eligibility_text=?,price_cents=?,currency=?,
        price_source_ref=?,notes=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(
      value.name,value.status,value.formatText || null,value.durationText || null,value.eligibilityText || null,
      value.priceCents,value.currency || null,value.priceSourceRef || null,value.notes || null,now,id,ownerId,companyId
    ).run();
    return jsonResponse(200, { success: true, program: safeAcademyBusinessProgram(await readProgram(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  if (action === "archive_program") {
    const id = String(body.id || "").trim();
    const existing = await readProgram(env.DB,id,ownerId,companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "program_not_found" }, privateHeaders);
    const blocking = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM hermes_academy_business_cohorts
      WHERE program_id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
        AND status IN ('planned','enrolling','active')
    `).bind(id,ownerId,companyId).first();
    if (Number(blocking?.count || 0) > 0) return jsonResponse(409, { success: false, error: "program_has_open_cohorts" }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_programs
      SET status='archived',archived_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,now,id,ownerId,companyId).run();
    return jsonResponse(200, { success: true, program: safeAcademyBusinessProgram(await readProgram(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  if (action === "create_cohort") {
    const value = normalizeAcademyBusinessCohort(body);
    const errors = academyBusinessCohortErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    if (!await requireProgram(env.DB,value.programId,ownerId,companyId)) return jsonResponse(404, { success: false, error: "cohort_program_not_found" }, privateHeaders);
    const id = `academy-business-cohort-${crypto.randomUUID()}`;
    const code = academyBusinessCohortCode(value.name,id);
    await env.DB.prepare(`
      INSERT INTO hermes_academy_business_cohorts (
        id,owner_specialist_id,company_id,program_id,name,code,status,start_date,end_date,capacity,
        timezone,schedule_text,delivery_owner_label,notes,archived_at,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?)
    `).bind(
      id,ownerId,companyId,value.programId,value.name,code,value.status,value.startDate || null,value.endDate || null,
      value.capacity,value.timezone || null,value.scheduleText || null,value.deliveryOwnerLabel || null,value.notes || null,now,now
    ).run();
    return jsonResponse(201, { success: true, cohort: safeAcademyBusinessCohort(await readCohort(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  if (action === "update_cohort") {
    const id = String(body.id || "").trim();
    if (!id) return jsonResponse(400, { success: false, error: "cohort_id_required" }, privateHeaders);
    const existing = await readCohort(env.DB,id,ownerId,companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "cohort_not_found" }, privateHeaders);
    const value = normalizeAcademyBusinessCohort(body, existing);
    const errors = academyBusinessCohortErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    if (!await requireProgram(env.DB,value.programId,ownerId,companyId)) return jsonResponse(404, { success: false, error: "cohort_program_not_found" }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_cohorts SET
        program_id=?,name=?,code=?,status=?,start_date=?,end_date=?,capacity=?,timezone=?,schedule_text=?,
        delivery_owner_label=?,notes=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(
      value.programId,value.name,existing.code,value.status,value.startDate || null,value.endDate || null,
      value.capacity,value.timezone || null,value.scheduleText || null,value.deliveryOwnerLabel || null,value.notes || null,
      now,id,ownerId,companyId
    ).run();
    return jsonResponse(200, { success: true, cohort: safeAcademyBusinessCohort(await readCohort(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  if (action === "archive_cohort") {
    const id = String(body.id || "").trim();
    const existing = await readCohort(env.DB,id,ownerId,companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "cohort_not_found" }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_cohorts
      SET archived_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,now,id,ownerId,companyId).run();
    return jsonResponse(200, { success: true, cohort: safeAcademyBusinessCohort(await readCohort(env.DB,id,ownerId,companyId)) }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_action" }, privateHeaders);
}
