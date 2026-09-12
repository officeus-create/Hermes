import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  cleanCompanyText,
  companySlug,
  ensureHermesCompanyProfilesSchema,
  normalizeCompanyType,
  normalizeState,
} from "../_lib/hermes-company-profiles.mjs";

type Env = { DB?: any };

function safeCompany(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    companyName: row.company_name,
    slug: row.slug,
    companyType: row.company_type,
    city: row.city,
    state: row.state,
    website: row.website || null,
    catalogOptIn: Boolean(row.catalog_opt_in),
    catalogStatus: row.catalog_status,
    loadBoardAccess: Boolean(row.load_board_access),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  await ensureHermesCompanyProfilesSchema(env.DB);
  const row = await env.DB.prepare(
    "SELECT * FROM hermes_company_profiles WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();
  return jsonResponse(200, { success: true, company: safeCompany(row) }, { "Cache-Control": "private, no-store" });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  await ensureHermesCompanyProfilesSchema(env.DB);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const companyName = cleanCompanyText(body.companyName, 140);
  const companyType = normalizeCompanyType(body.companyType);
  const city = cleanCompanyText(body.city, 100);
  const state = normalizeState(body.state);
  const websiteRaw = cleanCompanyText(body.website, 240);
  const authorityNumber = cleanCompanyText(body.authorityNumber, 40);
  const catalogOptIn = body.catalogOptIn !== false;

  const errors: string[] = [];
  if (companyName.length < 2) errors.push("company_name_required");
  if (city.length < 2) errors.push("city_required");
  if (!state) errors.push("state_required");

  let website = "";
  if (websiteRaw) {
    try {
      const parsed = new URL(websiteRaw.startsWith("http") ? websiteRaw : `https://${websiteRaw}`);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("protocol");
      website = parsed.toString().slice(0, 240);
    } catch { errors.push("website_invalid"); }
  }
  if (errors.length) return jsonResponse(400, { success: false, errors });

  const existing = await env.DB.prepare(
    "SELECT id, slug, created_at FROM hermes_company_profiles WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first() as { id?: string; slug?: string; created_at?: string } | null;
  const now = new Date().toISOString();
  const id = existing?.id || `company-${crypto.randomUUID()}`;
  const slug = existing?.slug || companySlug(companyName, specialist.id);
  const createdAt = existing?.created_at || now;

  await env.DB.prepare(`
    INSERT INTO hermes_company_profiles (
      id, owner_specialist_id, company_name, slug, company_type, city, state, website,
      authority_number, catalog_opt_in, catalog_status, load_board_access, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'self_submitted', 1, ?, ?)
    ON CONFLICT(owner_specialist_id) DO UPDATE SET
      company_name = excluded.company_name,
      company_type = excluded.company_type,
      city = excluded.city,
      state = excluded.state,
      website = excluded.website,
      authority_number = excluded.authority_number,
      catalog_opt_in = excluded.catalog_opt_in,
      catalog_status = CASE WHEN hermes_company_profiles.catalog_status = 'verified_public' THEN 'verified_public' ELSE 'self_submitted' END,
      load_board_access = 1,
      updated_at = excluded.updated_at
  `).bind(
    id, specialist.id, companyName, slug, companyType, city, state, website || null,
    authorityNumber || null, catalogOptIn ? 1 : 0, createdAt, now,
  ).run();

  const row = await env.DB.prepare(
    "SELECT * FROM hermes_company_profiles WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();

  return jsonResponse(200, {
    success: true,
    company: safeCompany(row),
    load_board_access: true,
    catalog: catalogOptIn
      ? { listed: true, status: row?.catalog_status || "self_submitted", note: "Self-submitted company facts remain verification-pending until reviewed." }
      : { listed: false, status: "opted_out" },
    next_url: "/load-board/?access=unlocked#live-marketplace",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
