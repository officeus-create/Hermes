import { jsonResponse } from "../../_lib/session.mjs";
import { getHomeServicePublicAssets } from "../../_lib/home-service-public-assets.mjs";
import {
  aggregateHomeServiceLeads,
  getHomeServiceContext,
  homeServiceLeadErrors,
  normalizeHomeServiceLead,
  normalizeHomeServiceProfile,
  safeHomeServiceLead,
} from "../../_lib/home-service-crm.mjs";

type Env = { DB?: any };
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

const errorResponse = (error: { status: number; code: string }) =>
  jsonResponse(error.status, { success: false, error: error.code }, privateHeaders);

const parseBody = async (request: Request) => {
  try { return await request.json() as Record<string, unknown>; }
  catch { return null; }
};

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

async function readProfile(db: any, ownerId: string) {
  return db.prepare(`
    SELECT *
    FROM hermes_home_service_profiles
    WHERE owner_specialist_id=?
    LIMIT 1
  `).bind(ownerId).first();
}

function safeProfile(row: any) {
  if (!row) return null;
  let services: string[] = [];
  let serviceAreas: string[] = [];
  try { services = JSON.parse(row.services_json || "[]"); } catch {}
  try { serviceAreas = JSON.parse(row.service_areas_json || "[]"); } catch {}
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    serviceSubtype: String(row.service_subtype || "other"),
    services,
    serviceAreas,
    publicSummary: row.public_summary || "",
    semanticCoreRef: row.semantic_core_ref || "",
    contentStatus: row.content_status || "ready_for_clustering",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const ctx = await getHomeServiceContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const url = new URL(request.url);
  const module = url.searchParams.get("module") || "dashboard";
  const ownerId = String(ctx.specialist.id);

  if (module === "profile") {
    const profile = await readProfile(env.DB, ownerId);
    return jsonResponse(200, {
      success: true,
      company: ctx.company,
      profile: safeProfile(profile),
    }, privateHeaders);
  }

  if (module === "public_assets") {
    return jsonResponse(200, {
      success: true,
      assets: getHomeServicePublicAssets({ website: ctx.company.website }),
    }, privateHeaders);
  }

  const result = await env.DB.prepare(`
    SELECT *
    FROM hermes_home_service_leads
    WHERE owner_specialist_id=?
    ORDER BY updated_at DESC
    LIMIT 1000
  `).bind(ownerId).all();
  const rows = result?.results || [];

  if (module === "leads") {
    return jsonResponse(200, {
      success: true,
      leads: rows.map(safeHomeServiceLead),
    }, privateHeaders);
  }

  if (module === "dashboard") {
    const profile = await readProfile(env.DB, ownerId);
    return jsonResponse(200, {
      success: true,
      company: {
        id: String(ctx.company.id),
        name: String(ctx.company.company_name || ""),
        slug: String(ctx.company.slug || ""),
        city: String(ctx.company.city || ""),
        state: String(ctx.company.state || ""),
        website: ctx.company.website || null,
        catalogOptIn: Number(ctx.company.catalog_opt_in || 0) === 1,
        catalogStatus: String(ctx.company.catalog_status || "self_submitted"),
      },
      profile: safeProfile(profile),
      metrics: aggregateHomeServiceLeads(rows),
      recentLeads: rows.slice(0, 12).map(safeHomeServiceLead),
    }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_module" }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) {
    return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  }
  const ctx = await getHomeServiceContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);

  const action = String(body.action || "");
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const now = new Date().toISOString();

  if (action === "upsert_profile") {
    const existing = await readProfile(env.DB, ownerId);
    const value = normalizeHomeServiceProfile(body, existing || {});
    if (!value.services.length) {
      return jsonResponse(400, { success: false, error: "services_required" }, privateHeaders);
    }
    if (!value.serviceAreas.length) {
      return jsonResponse(400, { success: false, error: "service_areas_required" }, privateHeaders);
    }
    const id = existing?.id || `home-service-${crypto.randomUUID()}`;
    const createdAt = existing?.created_at || now;
    await env.DB.prepare(`
      INSERT INTO hermes_home_service_profiles (
        id,owner_specialist_id,company_id,service_subtype,services_json,service_areas_json,
        public_summary,semantic_core_ref,content_status,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(owner_specialist_id) DO UPDATE SET
        company_id=excluded.company_id,
        service_subtype=excluded.service_subtype,
        services_json=excluded.services_json,
        service_areas_json=excluded.service_areas_json,
        public_summary=excluded.public_summary,
        semantic_core_ref=excluded.semantic_core_ref,
        content_status=excluded.content_status,
        updated_at=excluded.updated_at
    `).bind(
      id, ownerId, companyId, value.serviceSubtype, JSON.stringify(value.services), JSON.stringify(value.serviceAreas),
      value.publicSummary || null, value.semanticCoreRef || null, value.contentStatus, createdAt, now,
    ).run();
    const profile = await readProfile(env.DB, ownerId);
    return jsonResponse(200, { success: true, profile: safeProfile(profile) }, privateHeaders);
  }

  if (action === "create_lead") {
    const value = normalizeHomeServiceLead(body);
    if (value.customerName.length < 2) {
      return jsonResponse(400, { success: false, error: "customer_name_required" }, privateHeaders);
    }
    const moneyErrors = homeServiceLeadErrors(value);
    if (moneyErrors.length) {
      return jsonResponse(400, { success: false, errors: moneyErrors }, privateHeaders);
    }
    const id = `home-lead-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_home_service_leads (
        id,owner_specialist_id,company_id,source,search_query,customer_name,customer_phone,customer_email,
        address_line1,postal_code,city,job_type,photo_refs_json,approximate_volume,
        lead_cost_cents,lead_cost_known,lead_cost_source_ref,quote_cents,quote_known,quote_source_ref,
        status,job_start_at,assigned_driver,
        final_amount_cents,final_amount_known,final_amount_source_ref,disposal_cost_cents,disposal_cost_known,disposal_cost_source_ref,
        duration_minutes,payment_method,loss_reason,follow_up_at,review_requested_at,review_received_at,notes,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      id,ownerId,companyId,value.source,value.searchQuery || null,value.customerName,value.customerPhone || null,value.customerEmail || null,
      value.addressLine1 || null,value.postalCode || null,value.city || null,value.jobType || null,JSON.stringify(value.photoRefs),value.approximateVolume || null,
      value.leadCostCents,value.leadCostKnown ? 1 : 0,value.leadCostSourceRef || null,
      value.quoteCents,value.quoteKnown ? 1 : 0,value.quoteSourceRef || null,
      value.status,value.jobStartAt || null,value.assignedDriver || null,
      value.finalAmountCents,value.finalAmountKnown ? 1 : 0,value.finalAmountSourceRef || null,
      value.disposalCostCents,value.disposalCostKnown ? 1 : 0,value.disposalCostSourceRef || null,
      value.durationMinutes,value.paymentMethod || null,value.lossReason || null,value.followUpAt || null,value.reviewRequestedAt || null,
      value.reviewReceivedAt || null,value.notes || null,now,now
    ).run();
    const row = await env.DB.prepare("SELECT * FROM hermes_home_service_leads WHERE id=? AND owner_specialist_id=?").bind(id,ownerId).first();
    return jsonResponse(201, { success: true, lead: safeHomeServiceLead(row) }, privateHeaders);
  }

  if (action === "update_lead") {
    const id = String(body.id || "").trim();
    if (!id) return jsonResponse(400, { success: false, error: "lead_id_required" }, privateHeaders);
    const existing = await env.DB.prepare("SELECT * FROM hermes_home_service_leads WHERE id=? AND owner_specialist_id=? LIMIT 1").bind(id,ownerId).first();
    if (!existing) return jsonResponse(404, { success: false, error: "lead_not_found" }, privateHeaders);
    const value = normalizeHomeServiceLead(body, existing);
    if (value.customerName.length < 2) return jsonResponse(400, { success: false, error: "customer_name_required" }, privateHeaders);
    const moneyErrors = homeServiceLeadErrors(value);
    if (moneyErrors.length) return jsonResponse(400, { success: false, errors: moneyErrors }, privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_home_service_leads SET
        source=?,search_query=?,customer_name=?,customer_phone=?,customer_email=?,address_line1=?,postal_code=?,city=?,job_type=?,
        photo_refs_json=?,approximate_volume=?,
        lead_cost_cents=?,lead_cost_known=?,lead_cost_source_ref=?,quote_cents=?,quote_known=?,quote_source_ref=?,status=?,job_start_at=?,assigned_driver=?,
        final_amount_cents=?,final_amount_known=?,final_amount_source_ref=?,disposal_cost_cents=?,disposal_cost_known=?,disposal_cost_source_ref=?,
        duration_minutes=?,payment_method=?,loss_reason=?,follow_up_at=?,
        review_requested_at=?,review_received_at=?,notes=?,updated_at=?
      WHERE id=? AND owner_specialist_id=?
    `).bind(
      value.source,value.searchQuery || null,value.customerName,value.customerPhone || null,value.customerEmail || null,value.addressLine1 || null,
      value.postalCode || null,value.city || null,value.jobType || null,JSON.stringify(value.photoRefs),value.approximateVolume || null,
      value.leadCostCents,value.leadCostKnown ? 1 : 0,value.leadCostSourceRef || null,
      value.quoteCents,value.quoteKnown ? 1 : 0,value.quoteSourceRef || null,value.status,value.jobStartAt || null,value.assignedDriver || null,
      value.finalAmountCents,value.finalAmountKnown ? 1 : 0,value.finalAmountSourceRef || null,
      value.disposalCostCents,value.disposalCostKnown ? 1 : 0,value.disposalCostSourceRef || null,
      value.durationMinutes,value.paymentMethod || null,value.lossReason || null,value.followUpAt || null,
      value.reviewRequestedAt || null,value.reviewReceivedAt || null,value.notes || null,now,id,ownerId
    ).run();
    const row = await env.DB.prepare("SELECT * FROM hermes_home_service_leads WHERE id=? AND owner_specialist_id=?").bind(id,ownerId).first();
    return jsonResponse(200, { success: true, lead: safeHomeServiceLead(row) }, privateHeaders);
  }

  return jsonResponse(400, { success: false, error: "unknown_action" }, privateHeaders);
}
