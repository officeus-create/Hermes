import { jsonResponse } from "../../_lib/session.mjs";
import {
  academyBusinessEvidenceErrors,
  aggregateAcademyBusinessMeasurement,
  getAcademyBusinessMeasurementContext,
  normalizeAcademyBusinessEvidence,
  safeAcademyBusinessEvidence,
} from "../../_lib/academy-business-measurement.mjs";

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

async function readEvidence(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT *
    FROM hermes_academy_business_evidence
    WHERE id=? AND owner_specialist_id=? AND company_id=?
    LIMIT 1
  `).bind(id, ownerId, companyId).first();
}

async function readEvidenceRows(db: any, ownerId: string, companyId: string, includeArchived = false) {
  const result = await db.prepare(`
    SELECT *
    FROM hermes_academy_business_evidence
    WHERE owner_specialist_id=? AND company_id=?
      ${includeArchived ? "" : "AND archived_at IS NULL"}
    ORDER BY updated_at DESC
    LIMIT 2000
  `).bind(ownerId, companyId).all();
  return result?.results || [];
}

async function readLeadRows(db: any, ownerId: string, companyId: string) {
  const result = await db.prepare(`
    SELECT *
    FROM hermes_academy_business_leads
    WHERE owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    ORDER BY updated_at DESC
    LIMIT 5000
  `).bind(ownerId, companyId).all();
  return result?.results || [];
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const ctx = await getAcademyBusinessMeasurementContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const url = new URL(request.url);
  const module = url.searchParams.get("module") || "dashboard";
  const includeArchived = url.searchParams.get("include_archived") === "1";

  const rows = await readEvidenceRows(env.DB, ownerId, companyId, includeArchived);
  if (module === "evidence") {
    return jsonResponse(200, { success: true, evidence: rows.map(safeAcademyBusinessEvidence) }, privateHeaders);
  }
  if (module === "dashboard") {
    const leads = await readLeadRows(env.DB, ownerId, companyId);
    return jsonResponse(200, {
      success: true,
      measurement: aggregateAcademyBusinessMeasurement(rows, leads),
      recentEvidence: rows.filter((row: any) => !row.archived_at).slice(0, 50).map(safeAcademyBusinessEvidence),
    }, privateHeaders);
  }
  return jsonResponse(400, { success: false, error: "unknown_module" }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const ctx = await getAcademyBusinessMeasurementContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);

  const action = String(body.action || "");
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const now = new Date().toISOString();

  if (action === "create_evidence") {
    const value = normalizeAcademyBusinessEvidence(body);
    const errors = academyBusinessEvidenceErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    const id = `academy-evidence-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_academy_business_evidence (
        id,owner_specialist_id,company_id,kind,source_channel,content_id,campaign_id,
        metric_key,metric_value,metric_unit,amount_cents,currency,source_ref,observed_at,
        period_start,period_end,definition,evidence_owner_label,claim_text,approved_wording,
        claim_state,review_at,notes,archived_at,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?)
    `).bind(
      id,ownerId,companyId,value.kind,value.sourceChannel || null,value.contentId || null,
      value.campaignId || null,value.metricKey || null,value.metricValue,value.metricUnit || null,
      value.amountCents,value.currency || null,value.sourceRef,value.observedAt,value.periodStart || null,
      value.periodEnd || null,value.definition,value.evidenceOwnerLabel,value.claimText || null,
      value.approvedWording || null,value.claimState,value.reviewAt || null,value.notes || null,now,now
    ).run();
    const row = await readEvidence(env.DB, id, ownerId, companyId);
    return jsonResponse(201, { success: true, evidence: safeAcademyBusinessEvidence(row) }, privateHeaders);
  }

  if (action === "update_evidence") {
    const id = String(body.id || "").trim();
    if (!id) return jsonResponse(400, { success: false, error: "evidence_id_required" }, privateHeaders);
    const existing = await readEvidence(env.DB, id, ownerId, companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "evidence_not_found" }, privateHeaders);
    const value = normalizeAcademyBusinessEvidence(body, existing);
    const errors = academyBusinessEvidenceErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_evidence SET
        kind=?,source_channel=?,content_id=?,campaign_id=?,metric_key=?,metric_value=?,metric_unit=?,
        amount_cents=?,currency=?,source_ref=?,observed_at=?,period_start=?,period_end=?,definition=?,
        evidence_owner_label=?,claim_text=?,approved_wording=?,claim_state=?,review_at=?,notes=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(
      value.kind,value.sourceChannel || null,value.contentId || null,value.campaignId || null,
      value.metricKey || null,value.metricValue,value.metricUnit || null,value.amountCents,
      value.currency || null,value.sourceRef,value.observedAt,value.periodStart || null,value.periodEnd || null,
      value.definition,value.evidenceOwnerLabel,value.claimText || null,value.approvedWording || null,
      value.claimState,value.reviewAt || null,value.notes || null,now,id,ownerId,companyId
    ).run();
    const row = await readEvidence(env.DB, id, ownerId, companyId);
    return jsonResponse(200, { success: true, evidence: safeAcademyBusinessEvidence(row) }, privateHeaders);
  }

  if (action === "archive_evidence") {
    const id = String(body.id || "").trim();
    if (!id) return jsonResponse(400, { success: false, error: "evidence_id_required" }, privateHeaders);
    const existing = await readEvidence(env.DB, id, ownerId, companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "evidence_not_found" }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_evidence
      SET archived_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,now,id,ownerId,companyId).run();
    const row = await readEvidence(env.DB, id, ownerId, companyId);
    return jsonResponse(200, { success: true, evidence: safeAcademyBusinessEvidence(row) }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_action" }, privateHeaders);
}
