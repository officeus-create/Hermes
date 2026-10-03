import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { companySlug, ensureHermesCompanyProfilesSchema } from "../../_lib/hermes-company-profiles.mjs";
import {
  academyBusinessSlug,
  cleanAcademyBusinessText,
  ensureAcademyBusinessProfilesSchema,
  normalizeAcademyBusinessType,
} from "../../_lib/academy-business-profiles.mjs";

type Env = { DB?: any };

const fold = (value: unknown) => String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase("uk");

function safeProfile(row: any) {
  if (!row) return null;
  return {
    id: row.profile_id || row.id,
    companyId: row.canonical_company_id || row.company_id || null,
    businessName: row.canonical_business_name || row.business_name,
    slug: row.canonical_slug || row.slug,
    academyType: row.academy_type,
    city: row.canonical_city || row.city,
    region: row.canonical_region || row.region || null,
    countryCode: row.canonical_country_code || row.country_code || "UA",
    website: row.canonical_website || row.website || null,
    phone: row.canonical_phone || row.phone || null,
    timezone: row.canonical_timezone || row.timezone || null,
    catalogOptIn: Boolean(row.canonical_catalog_opt_in ?? row.catalog_opt_in),
    catalogStatus: row.canonical_catalog_status || row.catalog_status,
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

function sameWebsite(left: unknown, right: unknown) {
  if (!left || !right) return false;
  try {
    const a = new URL(String(left)).hostname.toLowerCase().replace(/^www\./, "");
    const b = new URL(String(right)).hostname.toLowerCase().replace(/^www\./, "");
    return Boolean(a && a === b);
  } catch {
    return false;
  }
}

async function academyBusinessForOwner(db: any, ownerId: string) {
  return db.prepare(`
    SELECT
      a.id AS profile_id,
      a.company_id,
      a.owner_specialist_id,
      a.business_name,
      a.slug,
      a.academy_type,
      a.city,
      a.region,
      a.country_code,
      a.website,
      a.phone,
      a.timezone,
      a.catalog_opt_in,
      a.catalog_status,
      a.created_at,
      a.updated_at,
      c.id AS canonical_company_id,
      c.company_name AS canonical_business_name,
      c.slug AS canonical_slug,
      c.city AS canonical_city,
      c.state AS canonical_region,
      c.country_code AS canonical_country_code,
      c.website AS canonical_website,
      c.phone AS canonical_phone,
      c.timezone AS canonical_timezone,
      c.catalog_opt_in AS canonical_catalog_opt_in,
      c.catalog_status AS canonical_catalog_status
    FROM hermes_academy_business_profiles a
    LEFT JOIN hermes_company_profiles c ON c.id = a.company_id
    WHERE a.owner_specialist_id=?
    LIMIT 1
  `).bind(ownerId).first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  await ensureHermesCompanyProfilesSchema(env.DB);
  await ensureAcademyBusinessProfilesSchema(env.DB);
  const row = await academyBusinessForOwner(env.DB, specialist.id);
  return jsonResponse(200, { success: true, academyBusiness: safeProfile(row) }, { "Cache-Control": "private, no-store" });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  await ensureHermesCompanyProfilesSchema(env.DB);
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
  const catalogOptIn = body.catalogOptIn === true;

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
      if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) throw new Error("protocol");
      website = parsed.toString().slice(0, 240);
    } catch { errors.push("website_invalid"); }
  }
  if (errors.length) return jsonResponse(400, { success: false, errors });

  const [existingProfile, existingCompany] = await Promise.all([
    env.DB.prepare(
      "SELECT id,company_id,slug,created_at FROM hermes_academy_business_profiles WHERE owner_specialist_id=? LIMIT 1"
    ).bind(specialist.id).first() as Promise<{ id?: string; company_id?: string | null; slug?: string; created_at?: string } | null>,
    env.DB.prepare(
      "SELECT id,company_name,slug,company_type,city,state,country_code,website,catalog_status,load_board_access,created_at FROM hermes_company_profiles WHERE owner_specialist_id=? LIMIT 1"
    ).bind(specialist.id).first() as Promise<any>,
  ]);

  if (existingProfile?.company_id && existingCompany?.id && String(existingProfile.company_id) !== String(existingCompany.id)) {
    return jsonResponse(409, { success: false, error: "academy_company_identity_conflict" });
  }

  if (existingCompany && !existingProfile) {
    const sameIdentity = fold(existingCompany.company_name) === fold(businessName) || sameWebsite(existingCompany.website, website);
    if (!sameIdentity) {
      return jsonResponse(409, {
        success: false,
        error: "existing_company_requires_manual_link",
        existingCompany: { id: existingCompany.id, name: existingCompany.company_name },
      });
    }
  }

  const now = new Date().toISOString();
  let companyId = String(existingCompany?.id || existingProfile?.company_id || "");
  let canonicalSlug = String(existingCompany?.slug || existingProfile?.slug || "");

  let canonicalInsertChanges: number | null = null;
  if (!existingCompany) {
    companyId = companyId || `company-${crypto.randomUUID()}`;
    canonicalSlug = canonicalSlug || companySlug(businessName, specialist.id) || academyBusinessSlug(businessName, specialist.id);
    const created = await env.DB.prepare(`
      INSERT OR IGNORE INTO hermes_company_profiles (
        id,owner_specialist_id,company_name,slug,company_type,city,state,website,phone,
        country_code,timezone,public_source_ref,catalog_opt_in,catalog_status,load_board_access,created_at,updated_at
      ) VALUES (?,?,?,?, 'other', ?,?,?,?,?,?,?,?,'self_submitted',0,?,?)
    `).bind(
      companyId,
      specialist.id,
      businessName,
      canonicalSlug,
      city,
      region || countryCode,
      website || null,
      phone || null,
      countryCode,
      timezone || null,
      website || "hermes_connect_academy_business_owner",
      catalogOptIn ? 1 : 0,
      now,
      now,
    ).run();
    canonicalInsertChanges = Number(created?.meta?.changes ?? 0);
  }

  const canonical = await env.DB.prepare(
    "SELECT id,company_name,slug,company_type,city,state,country_code,website,catalog_status,load_board_access,created_at FROM hermes_company_profiles WHERE owner_specialist_id=? LIMIT 1"
  ).bind(specialist.id).first() as any;
  if (!canonical?.id) return jsonResponse(409, { success: false, error: "canonical_company_create_conflict" });

  if (existingProfile?.company_id && String(existingProfile.company_id) !== String(canonical.id)) {
    return jsonResponse(409, { success: false, error: "academy_company_identity_conflict" });
  }

  if (!existingCompany && canonicalInsertChanges !== 1) {
    const sameConcurrentIdentity = fold(canonical.company_name) === fold(businessName) || sameWebsite(canonical.website, website);
    if (!sameConcurrentIdentity) {
      return jsonResponse(409, {
        success: false,
        error: "canonical_company_concurrent_conflict",
        existingCompany: { id: canonical.id, name: canonical.company_name },
      });
    }
  }

  companyId = String(canonical.id);
  canonicalSlug = String(canonical.slug || canonicalSlug || academyBusinessSlug(businessName, specialist.id));

  await env.DB.prepare(`
    UPDATE hermes_company_profiles SET
      company_name=?,
      city=?,
      state=?,
      website=?,
      phone=?,
      country_code=?,
      timezone=?,
      public_source_ref=COALESCE(NULLIF(public_source_ref,''),?),
      catalog_opt_in=?,
      catalog_status=CASE WHEN catalog_status='verified_public' THEN 'verified_public' ELSE 'self_submitted' END,
      updated_at=?
    WHERE id=? AND owner_specialist_id=?
  `).bind(
    businessName,
    city,
    region || countryCode,
    website || null,
    phone || null,
    countryCode,
    timezone || null,
    website || "hermes_connect_academy_business_owner",
    catalogOptIn ? 1 : 0,
    now,
    companyId,
    specialist.id,
  ).run();

  const profileId = existingProfile?.id || `academy-profile-${crypto.randomUUID()}`;
  const createdAt = existingProfile?.created_at || now;
  await env.DB.prepare(`
    INSERT INTO hermes_academy_business_profiles (
      id,company_id,owner_specialist_id,business_name,slug,academy_type,city,region,country_code,
      website,phone,timezone,catalog_opt_in,catalog_status,created_at,updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'self_submitted',?,?)
    ON CONFLICT(owner_specialist_id) DO UPDATE SET
      company_id=excluded.company_id,
      business_name=excluded.business_name,
      slug=excluded.slug,
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
    profileId,
    companyId,
    specialist.id,
    businessName,
    canonicalSlug,
    academyType,
    city,
    region || null,
    countryCode,
    website || null,
    phone || null,
    timezone || null,
    catalogOptIn ? 1 : 0,
    createdAt,
    now,
  ).run();

  const row = await academyBusinessForOwner(env.DB, specialist.id);
  const profile = safeProfile(row);
  return jsonResponse(200, {
    success: true,
    academyBusiness: profile,
    canonicalCompany: { id: profile?.companyId || companyId, slug: profile?.slug || canonicalSlug },
    catalog: catalogOptIn
      ? { listed: true, status: profile?.catalogStatus || "self_submitted", profileUrl: `/businesses/connect/academy/${encodeURIComponent(String(profile?.slug || canonicalSlug))}/` }
      : { listed: false, status: "opted_out", profileUrl: null },
    next_url: "/services/hermes-connect/academy/business/workspace/",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
