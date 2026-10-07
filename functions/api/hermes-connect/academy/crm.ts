import { jsonResponse } from "../../_lib/session.mjs";
import {
  academyCrmLeadErrors,
  aggregateAcademyCrmLeads,
  getAcademyBusinessCrmContext,
  normalizeAcademyCrmLead,
  safeAcademyCrmLead,
} from "../../_lib/academy-business-crm.mjs";

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

async function readLead(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT *
    FROM hermes_academy_business_leads
    WHERE id=? AND owner_specialist_id=? AND company_id=?
    LIMIT 1
  `).bind(id, ownerId, companyId).first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const ctx = await getAcademyBusinessCrmContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const url = new URL(request.url);
  const module = url.searchParams.get("module") || "dashboard";
  const includeArchived = url.searchParams.get("include_archived") === "1";

  const result = await env.DB.prepare(`
    SELECT *
    FROM hermes_academy_business_leads
    WHERE owner_specialist_id=? AND company_id=?
      ${includeArchived ? "" : "AND archived_at IS NULL"}
    ORDER BY updated_at DESC
    LIMIT 1000
  `).bind(ownerId, companyId).all();
  const rows = result?.results || [];

  if (module === "leads") {
    return jsonResponse(200, { success: true, leads: rows.map(safeAcademyCrmLead) }, privateHeaders);
  }

  if (module === "dashboard") {
    return jsonResponse(200, {
      success: true,
      company: {
        id: companyId,
        name: String(ctx.company.company_name || ""),
        slug: String(ctx.company.slug || ""),
        academyType: String(ctx.company.academy_type || "business_academy"),
      },
      metrics: aggregateAcademyCrmLeads(rows),
      recentLeads: rows.filter((row: any) => !row.archived_at).slice(0, 20).map(safeAcademyCrmLead),
    }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_module" }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const ctx = await getAcademyBusinessCrmContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);

  const action = String(body.action || "");
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const now = new Date().toISOString();

  if (action === "create_lead") {
    const value = normalizeAcademyCrmLead(body);
    const errors = academyCrmLeadErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    const id = `academy-lead-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_academy_business_leads (
        id,owner_specialist_id,company_id,contact_name,contact_phone,contact_email,
        source_channel,content_id,content_format,campaign_id,cta_keyword,entry_offer,
        organic_state,paid_learning_state,audience_geo,primary_pain,diagnostic_primary_gap,
        diagnostic_result,baseline,recommended_module,reason_to_believe,business_stage,manager,
        consultation_status,next_action,next_contact_at,promise_text,program_fit,objection,
        sale_revenue_cents,revenue_currency,revenue_source_ref,outcome,cohort,completion_status,renewal_status,
        notes,archived_at,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?)
    `).bind(
      id,ownerId,companyId,value.contactName,value.contactPhone || null,value.contactEmail || null,
      value.sourceChannel,value.contentId || null,value.contentFormat || null,value.campaignId || null,
      value.ctaKeyword || null,value.entryOffer || null,value.organicState,value.paidLearningState,
      value.audienceGeo || null,value.primaryPain || null,value.diagnosticPrimaryGap || null,
      value.diagnosticResult || null,value.baseline || null,value.recommendedModule || null,
      value.reasonToBelieve || null,value.businessStage,value.manager || null,value.consultationStatus,
      value.nextAction || null,value.nextContactAt || null,value.promise || null,value.programFit || null,
      value.objection || null,value.saleRevenueCents,value.revenueCurrency || null,value.revenueSourceRef || null,value.outcome || null,
      value.cohort || null,value.completionStatus,value.renewalStatus,value.notes || null,now,now
    ).run();
    const row = await readLead(env.DB, id, ownerId, companyId);
    return jsonResponse(201, { success: true, lead: safeAcademyCrmLead(row) }, privateHeaders);
  }

  if (action === "update_lead") {
    const id = String(body.id || "").trim();
    if (!id) return jsonResponse(400, { success: false, error: "lead_id_required" }, privateHeaders);
    const existing = await readLead(env.DB, id, ownerId, companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "lead_not_found" }, privateHeaders);
    const value = normalizeAcademyCrmLead(body, existing);
    const errors = academyCrmLeadErrors(value);
    if (errors.length) return jsonResponse(400, { success: false, errors }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_leads SET
        contact_name=?,contact_phone=?,contact_email=?,source_channel=?,content_id=?,content_format=?,
        campaign_id=?,cta_keyword=?,entry_offer=?,organic_state=?,paid_learning_state=?,audience_geo=?,
        primary_pain=?,diagnostic_primary_gap=?,diagnostic_result=?,baseline=?,recommended_module=?,
        reason_to_believe=?,business_stage=?,manager=?,consultation_status=?,next_action=?,next_contact_at=?,
        promise_text=?,program_fit=?,objection=?,sale_revenue_cents=?,revenue_currency=?,revenue_source_ref=?,outcome=?,cohort=?,
        completion_status=?,renewal_status=?,notes=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(
      value.contactName,value.contactPhone || null,value.contactEmail || null,value.sourceChannel,
      value.contentId || null,value.contentFormat || null,value.campaignId || null,value.ctaKeyword || null,
      value.entryOffer || null,value.organicState,value.paidLearningState,value.audienceGeo || null,
      value.primaryPain || null,value.diagnosticPrimaryGap || null,value.diagnosticResult || null,
      value.baseline || null,value.recommendedModule || null,value.reasonToBelieve || null,value.businessStage,
      value.manager || null,value.consultationStatus,value.nextAction || null,value.nextContactAt || null,
      value.promise || null,value.programFit || null,value.objection || null,value.saleRevenueCents,
      value.revenueCurrency || null,value.revenueSourceRef || null,value.outcome || null,value.cohort || null,value.completionStatus,
      value.renewalStatus,value.notes || null,now,id,ownerId,companyId
    ).run();
    const row = await readLead(env.DB, id, ownerId, companyId);
    return jsonResponse(200, { success: true, lead: safeAcademyCrmLead(row) }, privateHeaders);
  }

  if (action === "archive_lead") {
    const id = String(body.id || "").trim();
    if (!id) return jsonResponse(400, { success: false, error: "lead_id_required" }, privateHeaders);
    const existing = await readLead(env.DB, id, ownerId, companyId);
    if (!existing || existing.archived_at) return jsonResponse(404, { success: false, error: "lead_not_found" }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_leads
      SET archived_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,now,id,ownerId,companyId).run();
    const row = await readLead(env.DB, id, ownerId, companyId);
    return jsonResponse(200, { success: true, lead: safeAcademyCrmLead(row) }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_action" }, privateHeaders);
}
