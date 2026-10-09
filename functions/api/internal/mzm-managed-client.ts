import { mzmJunkRemovalClient } from "../../../src/data/catalog-client-mzm-junk-removal.ts";
import { bearerToken, verifyGitHubMzmManagedClientOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureHomeServiceCrmSchema } from "../_lib/home-service-crm.mjs";

type Env = { DB?: any };

const OPERATION_ID = "provision_mzm_hermes_managed_2026_10_09";
const COMPANY_ID = "home-service-managed:mzm-junk-removal";
const PROFILE_ID = "home-service-managed-profile:mzm-junk-removal";
const DATA_OWNER_ID = "hermes-managed:mzm-junk-removal";
const SLUG = "mzm-junk-removal";
const MANAGEMENT_MODE = "hermes_managed";
const PUBLICATION_BASIS = "owner_consent_pending";
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

async function ensureReceiptSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_managed_client_receipts (
      operation_id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      management_mode TEXT NOT NULL,
      publication_basis TEXT NOT NULL,
      first_completed_at TEXT NOT NULL,
      last_verified_at TEXT NOT NULL
    )
  `).run();
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);

  const token = bearerToken(request);
  if (!token || !await verifyGitHubMzmManagedClientOidcToken(token)) {
    return jsonResponse(403, { success: false, error: "operator_not_authorized" }, privateHeaders);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }
  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" }, privateHeaders);
  }

  await ensureHomeServiceCrmSchema(env.DB);
  await ensureReceiptSchema(env.DB);

  const slugCollision = await env.DB.prepare(`
    SELECT id,owner_specialist_id,management_mode
    FROM hermes_company_profiles
    WHERE slug=?
    LIMIT 1
  `).bind(SLUG).first();
  if (slugCollision && (
    String(slugCollision.id || "") !== COMPANY_ID ||
    String(slugCollision.owner_specialist_id || "") !== DATA_OWNER_ID ||
    String(slugCollision.management_mode || "") !== MANAGEMENT_MODE
  )) {
    return jsonResponse(409, { success: false, error: "managed_slug_collision" }, privateHeaders);
  }

  const now = new Date().toISOString();
  const existingCompany = await env.DB.prepare(
    "SELECT created_at FROM hermes_company_profiles WHERE id=? LIMIT 1"
  ).bind(COMPANY_ID).first();
  const createdAt = String(existingCompany?.created_at || now);

  await env.DB.prepare(`
    INSERT INTO hermes_company_profiles (
      id,owner_specialist_id,company_name,slug,company_type,city,state,website,authority_number,
      catalog_opt_in,catalog_status,load_board_access,created_at,updated_at,
      phone,address_line1,postal_code,country_code,timezone,public_source_ref,management_mode,catalog_publication_basis
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      owner_specialist_id=excluded.owner_specialist_id,
      company_name=excluded.company_name,
      slug=excluded.slug,
      company_type=excluded.company_type,
      city=excluded.city,
      state=excluded.state,
      website=excluded.website,
      catalog_opt_in=excluded.catalog_opt_in,
      catalog_status=excluded.catalog_status,
      load_board_access=excluded.load_board_access,
      updated_at=excluded.updated_at,
      phone=excluded.phone,
      address_line1=excluded.address_line1,
      postal_code=excluded.postal_code,
      country_code=excluded.country_code,
      timezone=excluded.timezone,
      public_source_ref=excluded.public_source_ref,
      management_mode=excluded.management_mode,
      catalog_publication_basis=excluded.catalog_publication_basis
  `).bind(
    COMPANY_ID,
    DATA_OWNER_ID,
    mzmJunkRemovalClient.companyName,
    SLUG,
    "home_service",
    mzmJunkRemovalClient.base.city,
    mzmJunkRemovalClient.base.state,
    mzmJunkRemovalClient.website,
    null,
    0,
    "managed_private",
    0,
    createdAt,
    now,
    mzmJunkRemovalClient.phone,
    null,
    null,
    mzmJunkRemovalClient.base.countryCode,
    mzmJunkRemovalClient.base.timezone,
    mzmJunkRemovalClient.publicEvidence.officialWebsite.url,
    MANAGEMENT_MODE,
    PUBLICATION_BASIS,
  ).run();

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
    PROFILE_ID,
    DATA_OWNER_ID,
    COMPANY_ID,
    mzmJunkRemovalClient.serviceSubtype,
    JSON.stringify(mzmJunkRemovalClient.services),
    JSON.stringify(mzmJunkRemovalClient.serviceAreas),
    mzmJunkRemovalClient.publicSummary,
    mzmJunkRemovalClient.semanticCore.sourceRef,
    "active_content_planning",
    createdAt,
    now,
  ).run();

  const [company, profile, leadCount] = await Promise.all([
    env.DB.prepare(`
      SELECT id,owner_specialist_id,company_name,slug,company_type,city,state,website,catalog_opt_in,catalog_status,
             load_board_access,public_source_ref,management_mode,catalog_publication_basis
      FROM hermes_company_profiles WHERE id=? LIMIT 1
    `).bind(COMPANY_ID).first(),
    env.DB.prepare(`
      SELECT id,owner_specialist_id,company_id,service_subtype,services_json,service_areas_json,public_summary,semantic_core_ref,content_status
      FROM hermes_home_service_profiles WHERE company_id=? LIMIT 1
    `).bind(COMPANY_ID).first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM hermes_home_service_leads WHERE owner_specialist_id=?").bind(DATA_OWNER_ID).first(),
  ]);

  const validCompany =
    String(company?.id || "") === COMPANY_ID &&
    String(company?.owner_specialist_id || "") === DATA_OWNER_ID &&
    String(company?.slug || "") === SLUG &&
    String(company?.company_type || "") === "home_service" &&
    Number(company?.catalog_opt_in || 0) === 0 &&
    String(company?.catalog_status || "") === "managed_private" &&
    Number(company?.load_board_access || 0) === 0 &&
    String(company?.management_mode || "") === MANAGEMENT_MODE &&
    String(company?.catalog_publication_basis || "") === PUBLICATION_BASIS;
  const validProfile =
    String(profile?.owner_specialist_id || "") === DATA_OWNER_ID &&
    String(profile?.company_id || "") === COMPANY_ID &&
    String(profile?.service_subtype || "") === mzmJunkRemovalClient.serviceSubtype &&
    String(profile?.semantic_core_ref || "") === mzmJunkRemovalClient.semanticCore.sourceRef;

  if (!validCompany || !validProfile) {
    return jsonResponse(409, { success: false, error: "managed_client_readback_mismatch" }, privateHeaders);
  }

  await env.DB.prepare(`
    INSERT INTO hermes_managed_client_receipts (
      operation_id,company_id,management_mode,publication_basis,first_completed_at,last_verified_at
    ) VALUES (?,?,?,?,?,?)
    ON CONFLICT(operation_id) DO UPDATE SET
      company_id=excluded.company_id,
      management_mode=excluded.management_mode,
      publication_basis=excluded.publication_basis,
      last_verified_at=excluded.last_verified_at
  `).bind(OPERATION_ID, COMPANY_ID, MANAGEMENT_MODE, PUBLICATION_BASIS, now, now).run();

  return jsonResponse(200, {
    success: true,
    operation: OPERATION_ID,
    business_name: mzmJunkRemovalClient.companyName,
    public_profile_path: null,
    crm_workspace_path: `/services/hermes-connect/home-services/workspace/?managed=${SLUG}`,
    management_mode: MANAGEMENT_MODE,
    publication_basis: PUBLICATION_BASIS,
    catalog_status: "managed_private",
    catalog_publication_eligible: false,
    catalog_owner_consent_claimed: false,
    owner_authentication_claimed: false,
    real_leads_tracked: Number(leadCount?.count || 0),
    business_outcomes: "UNKNOWN_UNLESS_RECORDED_WITH_EVIDENCE",
  }, privateHeaders);
}
