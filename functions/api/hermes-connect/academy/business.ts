import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  academyBusinessSlug,
  cleanAcademyBusinessText,
  ensureAcademyBusinessProfilesSchema,
  normalizeAcademyBusinessType,
} from "../../_lib/academy-business-profiles.mjs";

type Env = { DB?: any };

function safeProfile(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    businessName: row.business_name,
    slug: row.slug,
    academyType: row.academy_type,
    city: row.city,
    region: row.region || null,
    countryCode: row.country_code || "UA",
    website: row.website || null,
    phone: row.phone || null,
    timezone: row.timezone || null,
    catalogOptIn: Boolean(row.catalog_opt_in),
    catalogStatus: row.catalog_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validTimezone(value: string) {
  if (!value) return true;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  await ensureAcademyBusinessProfilesSchema(env.DB);
  const row = await env.DB.prepare(
    "SELECT * FROM hermes_academy_business_profiles WHERE owner_specialist_id=? LIMIT 1"
  ).bind(specialist.id).first();
  return jsonResponse(200, { success: true, academyBusiness: safeProfile(row) }, { "Cache-Control": "private, no-store" });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  await ensureAcademyBusinessProfilesSchema(env.DB);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const businessName = cleanAcademyBusinessText(body.businessName, 140);
  const academyType = normalizeAcademyBusinessType(body.academyType);
  const city = cleanAcademyBusinessText(body.city, 100);
  const region = cleanAcademyBusinessText(body.region, 100);
  const countryCode = cleanAcademyBusinessText(body.countryCode || "UA", 2).toUpperCase();
  const websiteRaw = cleanAcademyBusinessText(body.website, 240);
  const phone = cleanAcademyBusinessText(body.phone, 40);
  const timezone = cleanAcademyBusinessText(body.timezone, 64);
  const catalogOptIn = body.catalogOptIn !== false;

  const errors: string[] = [];
  if (businessName.length < 2) errors.push("business_name_required");
  if (city.length < 2) errors.push("city_required");
  if (!/^[A-Z]{2}$/.test(countryCode)) errors.push("country_code_invalid");
  if (phone && phone.length < 7) errors.push("phone_invalid");
  if (timezone && !validTimezone(timezone)) errors.push("timezone_invalid");

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
    "SELECT id,slug,created_at FROM hermes_academy_business_profiles WHERE owner_specialist_id=? LIMIT 1"
  ).bind(specialist.id).first() as { id?: string; slug?: string; created_at?: string } | null;

  const now = new Date().toISOString();
  const id = existing?.id || `academy-business-${crypto.randomUUID()}`;
  const slug = existing?.slug || academyBusinessSlug(businessName, specialist.id);
  const createdAt = existing?.created_at || now;

  await env.DB.prepare(`
    INSERT INTO hermes_academy_business_profiles (
      id,owner_specialist_id,business_name,slug,academy_type,city,region,country_code,
      website,phone,timezone,catalog_opt_in,catalog_status,created_at,updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 'self_submitted', ?, ?)
    ON CONFLICT(owner_specialist_id) DO UPDATE SET
      business_name=excluded.business_name,
      academy_type=excluded.academy_type,
      city=excluded.city,
      region=excluded.region,
      country_code=excluded.country_code,
      website=excluded.website,
      phone=excluded.phone,
      timezone=excluded.timezone,
      catalog_opt_in=excluded.catalog_opt_in,
      catalog_status=CASE WHEN hermes_academy_business_profiles.catalog_status='verified_public' THEN 'verified_public' ELSE 'self_submitted' END,
      updated_at=excluded.updated_at
  `).bind(
    id, specialist.id, businessName, slug, academyType, city, region || null, countryCode,
    website || null, phone || null, timezone || null, catalogOptIn ? 1 : 0, createdAt, now
  ).run();

  const row = await env.DB.prepare(
    "SELECT * FROM hermes_academy_business_profiles WHERE owner_specialist_id=? LIMIT 1"
  ).bind(specialist.id).first();

  return jsonResponse(200, {
    success: true,
    academyBusiness: safeProfile(row),
    catalog: catalogOptIn
      ? { listed: true, status: row?.catalog_status || "self_submitted", profileUrl: `/businesses/connect/academy/${encodeURIComponent(String(row?.slug || slug))}/` }
      : { listed: false, status: "opted_out", profileUrl: null },
    next_url: "/services/hermes-connect/academy/business/workspace/",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
