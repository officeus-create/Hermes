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
    phone: row.phone || null,
    addressLine1: row.address_line1 || null,
    postalCode: row.postal_code || null,
    countryCode: row.country_code || "US",
    timezone: row.timezone || null,
    publicSourceRef: row.public_source_ref || null,
    catalogOptIn: Boolean(row.catalog_opt_in),
    catalogStatus: row.catalog_status,
    loadBoardAccess: Boolean(row.load_board_access),
    managementMode: row.management_mode || "owner_managed",
    publicationBasis: row.catalog_publication_basis || "owner_opt_in",
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
  const phone = cleanCompanyText(body.phone, 40);
  const addressLine1 = cleanCompanyText(body.addressLine1, 180);
  const postalCode = cleanCompanyText(body.postalCode, 24);
  const countryCode = cleanCompanyText(body.countryCode || "US", 2).toUpperCase();
  const timezone = cleanCompanyText(body.timezone, 64);
  const publicSourceRef = cleanCompanyText(body.publicSourceRef, 160);
  // New Home Services profiles are private unless the owner explicitly opts into Catalog publication.
  const catalogOptIn = companyType === "home_service" ? body.catalogOptIn === true : body.catalogOptIn !== false;

  const errors: string[] = [];
  if (companyName.length < 2) errors.push("company_name_required");
  if (city.length < 2) errors.push("city_required");
  if (!state) errors.push("state_required");
  if (!/^[A-Z]{2}$/.test(countryCode)) errors.push("country_code_invalid");
  if (timezone && !validTimezone(timezone)) errors.push("timezone_invalid");
  if (phone && phone.length < 7) errors.push("phone_invalid");

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
    "SELECT id, slug, company_type, created_at FROM hermes_company_profiles WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first() as { id?: string; slug?: string; company_type?: string; created_at?: string } | null;

  // A Hermes-managed client must be adopted through a verified attachment workflow.
  // Never create a second owner-managed Home Services Company from matching public identity input.
  if (!existing && companyType === "home_service") {
    const managedCandidate = await env.DB.prepare(`
      SELECT id,slug
      FROM hermes_company_profiles
      WHERE management_mode='hermes_managed' AND company_type='home_service'
        AND (
          (? <> '' AND website IS NOT NULL AND lower(rtrim(website,'/')) = lower(rtrim(?,'/')))
          OR (lower(company_name)=lower(?) AND lower(city)=lower(?) AND state=?)
        )
      LIMIT 1
    `).bind(website, website, companyName, city, state).first();
    if (managedCandidate) {
      return jsonResponse(409, {
        success: false,
        error: "managed_company_claim_required",
        next_url: "/contacts/",
      }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
    }
  }

  // Business-type migrations need a separate verified workflow; a Home Services signup must never overwrite
  // an existing carrier/repair/other company, even when the endpoint is called outside the UI.
  if (existing?.company_type && existing.company_type !== companyType &&
      (existing.company_type === "home_service" || companyType === "home_service")) {
    return jsonResponse(409, { success: false, error: "existing_company_type_locked" }, { "Cache-Control": "private, no-store" });
  }
  const now = new Date().toISOString();
  const id = existing?.id || `company-${crypto.randomUUID()}`;
  const slug = existing?.slug || companySlug(companyName, specialist.id);
  const createdAt = existing?.created_at || now;
  const loadBoardAccess = companyType === "home_service" ? 0 : 1;

  await env.DB.prepare(`
    INSERT INTO hermes_company_profiles (
      id, owner_specialist_id, company_name, slug, company_type, city, state, website,
      phone, address_line1, postal_code, country_code, timezone, public_source_ref,
      authority_number, catalog_opt_in, catalog_status, load_board_access, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'self_submitted', ?, ?, ?)
    ON CONFLICT(owner_specialist_id) DO UPDATE SET
      company_name = excluded.company_name,
      company_type = excluded.company_type,
      city = excluded.city,
      state = excluded.state,
      website = excluded.website,
      phone = excluded.phone,
      address_line1 = excluded.address_line1,
      postal_code = excluded.postal_code,
      country_code = excluded.country_code,
      timezone = excluded.timezone,
      public_source_ref = excluded.public_source_ref,
      authority_number = excluded.authority_number,
      catalog_opt_in = excluded.catalog_opt_in,
      catalog_status = CASE WHEN hermes_company_profiles.catalog_status = 'verified_public' THEN 'verified_public' ELSE 'self_submitted' END,
      load_board_access = excluded.load_board_access,
      updated_at = excluded.updated_at
    WHERE hermes_company_profiles.company_type = excluded.company_type
      OR (hermes_company_profiles.company_type <> 'home_service' AND excluded.company_type <> 'home_service')
  `).bind(
    id, specialist.id, companyName, slug, companyType, city, state, website || null,
    phone || null, addressLine1 || null, postalCode || null, countryCode, timezone || null, publicSourceRef || null,
    authorityNumber || null, catalogOptIn ? 1 : 0, loadBoardAccess, createdAt, now,
  ).run();

  const row = await env.DB.prepare(
    "SELECT * FROM hermes_company_profiles WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();
  // Fail closed if a concurrent write collided with the protected cross-vertical boundary.
  if (row?.company_type !== companyType &&
      (row?.company_type === "home_service" || companyType === "home_service")) {
    return jsonResponse(409, { success: false, error: "existing_company_type_locked" }, { "Cache-Control": "private, no-store" });
  }

  return jsonResponse(200, {
    success: true,
    company: safeCompany(row),
    load_board_access: Boolean(loadBoardAccess),
    catalog: catalogOptIn
      ? { listed: true, status: row?.catalog_status || "self_submitted", note: "Self-submitted company facts remain verification-pending until reviewed." }
      : { listed: false, status: "opted_out" },
    next_url: companyType === "home_service" ? "/services/hermes-connect/home-services/workspace/" : "/load-board/?access=unlocked#live-marketplace",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
