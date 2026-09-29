import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureCatalogBusinessInquirySchema } from "../_lib/catalog-business-inquiries.mjs";

type Env = { DB?: any };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureCatalogBusinessInquirySchema(env.DB);
  const now = new Date().toISOString();
  await env.DB.prepare(
    "DELETE FROM catalog_business_inquiries WHERE retention_until <= ?"
  ).bind(now).run();

  const requestedLimit = Number(new URL(request.url).searchParams.get("limit") || 0);
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, 500)
    : 250;

  const result = await env.DB.prepare(`
    SELECT id, request_id, catalog_business_id, catalog_profile, business_name,
           contact_name, contact_email, contact_phone, contact_whatsapp, contact_telegram,
           preferred_language, preferred_contact_time, message, services_json, status,
           internal_delivery_status, owner_delivery_status, owner_delivery_at, created_at, updated_at
    FROM catalog_business_inquiries
    WHERE owner_specialist_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).bind(specialist.id, limit).all();

  const inquiries = (result?.results || []).map((row: any) => {
    let services: string[] = [];
    try {
      const parsed = JSON.parse(String(row.services_json || "[]"));
      if (Array.isArray(parsed)) services = parsed.map((item) => String(item)).slice(0, 12);
    } catch {}
    return {
      id: String(row.id || ""),
      request_id: String(row.request_id || ""),
      catalog_business_id: String(row.catalog_business_id || ""),
      catalog_profile: String(row.catalog_profile || ""),
      business_name: String(row.business_name || ""),
      contact_name: String(row.contact_name || ""),
      contact_email: String(row.contact_email || ""),
      contact_phone: row.contact_phone == null ? null : String(row.contact_phone),
      contact_whatsapp: row.contact_whatsapp == null ? null : String(row.contact_whatsapp),
      contact_telegram: row.contact_telegram == null ? null : String(row.contact_telegram),
      preferred_language: row.preferred_language == null ? null : String(row.preferred_language),
      preferred_contact_time: row.preferred_contact_time == null ? null : String(row.preferred_contact_time),
      message: String(row.message || ""),
      services,
      status: String(row.status || "new"),
      internal_delivery_status: String(row.internal_delivery_status || "pending"),
      owner_delivery_status: String(row.owner_delivery_status || "skipped"),
      owner_delivery_at: row.owner_delivery_at == null ? null : String(row.owner_delivery_at),
      created_at: String(row.created_at || ""),
      updated_at: String(row.updated_at || ""),
    };
  });

  return jsonResponse(200, { success: true, inquiries }, { "Cache-Control": "no-store" });
}
