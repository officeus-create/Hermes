import { mzmJunkRemovalClient } from "../../../src/data/catalog-client-mzm-junk-removal.ts";
import { hashPassword, verifyPassword } from "../../../src/legacy-prototype/auth.mjs";
import { bearerToken, verifyGitHubMzmManagedClientOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureHomeServiceCrmSchema } from "../_lib/home-service-crm.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import { ensureManagedClientAccessSchema } from "../_lib/managed-client-access.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = { DB?: any; LEAD_EMAIL_SERVICE?: ServiceFetcher; LEAD_SERVICE_TOKEN?: string };

const OPERATION_ID = "provision_mzm_hermes_managed_2026_10_09";
const COMPANY_ID = "home-service-managed:mzm-junk-removal";
const PROFILE_ID = "home-service-managed-profile:mzm-junk-removal";
const DATA_OWNER_ID = "hermes-managed:mzm-junk-removal";
const SLUG = "mzm-junk-removal";
const MANAGEMENT_MODE = "hermes_managed";
const PUBLICATION_BASIS = "hermes_client_publication_approved";
const PUBLIC_PROFILE_PATH = "/businesses/connect/company/mzm-junk-removal/";
const REVIEWER_EMAIL = "mzm.crm.review@hermeslogisticsus.com";
const REVIEWER_ROLE = "Hermes Client Reviewer";
const ACCOUNT_EMAIL_PATH = "https://lead-email.internal/v1/send-account";
const ACCOUNT_EMAIL_SUBJECT = "[HERMES ACCOUNT] [PASSWORD RESET]";
const INTERNAL_RECIPIENT = "officeus@hermeslogisticsus.com";
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
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_managed_client_reviewer_receipts (
      company_id TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      email TEXT NOT NULL,
      credential_delivery TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT NOT NULL
    )
  `).run();
}

function temporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#_-";
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  let value = "MZM-";
  for (const byte of bytes) value += alphabet[byte % alphabet.length];
  return value;
}

async function sendReviewerCredentials(env: Env, password: string) {
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) return false;
  const text = [
    "Hermes Connect MZM CRM reviewer access",
    "",
    "Business: MZM Junk Removal",
    "Access: read-only reviewer",
    "Login: " + REVIEWER_EMAIL,
    "Temporary password: " + password,
    "Sign in: https://hermeslogisticsus.com/services/hermes-connect/home-services/reviewer-access/",
    "",
    "This account can review the existing MZM Hermes-managed CRM. It is not the MZM owner identity.",
    "The temporary credential is delivered only to the Hermes internal admin mailbox.",
  ].join("\n");
  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(ACCOUNT_EMAIL_PATH, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.LEAD_SERVICE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: "mzm_reviewer_" + crypto.randomUUID(),
        subject: ACCOUNT_EMAIL_SUBJECT,
        text,
        recipient_email: INTERNAL_RECIPIENT,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function provisionReviewerAccess(env: Env, now: string) {
  await ensureManagedClientAccessSchema(env.DB);
  const prior = await env.DB.prepare(`
    SELECT r.specialist_id,r.email,r.credential_delivery,s.role,a.access_level,a.active
    FROM hermes_managed_client_reviewer_receipts r
    JOIN specialists s ON s.id=r.specialist_id
    JOIN hermes_managed_client_access a ON a.specialist_id=r.specialist_id AND a.company_id=r.company_id
    WHERE r.company_id=? LIMIT 1
  `).bind(COMPANY_ID).first();

  if (prior &&
      String(prior.email || "").toLowerCase() === REVIEWER_EMAIL &&
      String(prior.role || "") === REVIEWER_ROLE &&
      String(prior.access_level || "") === "viewer" &&
      Number(prior.active || 0) === 1) {
    return {
      specialistId: String(prior.specialist_id || ""),
      credentialDelivery: "previously_delivered",
      accessState: "read_only",
    };
  }

  const existing = await env.DB.prepare(`
    SELECT id,email,password_hash,password_salt,role
    FROM specialists WHERE lower(email)=lower(?) LIMIT 1
  `).bind(REVIEWER_EMAIL).first();

  if (existing && String(existing.role || "") !== REVIEWER_ROLE) {
    throw new Error("reviewer_identity_conflict");
  }

  const password = temporaryPassword();
  const { hash, salt } = await hashPassword(password);
  const specialistId = existing?.id ? String(existing.id) : `specialist-${crypto.randomUUID()}`;
  const created = !existing;
  const oldHash = String(existing?.password_hash || "");
  const oldSalt = String(existing?.password_salt || "");
  const priorAccess = existing
    ? await env.DB.prepare("SELECT specialist_id FROM hermes_managed_client_access WHERE specialist_id=? AND company_id=? LIMIT 1")
        .bind(specialistId, COMPANY_ID).first()
    : null;

  try {
    if (created) {
      await env.DB.prepare(`
        INSERT INTO specialists (id,email,password_hash,password_salt,name,role,location,bio,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).bind(
        specialistId, REVIEWER_EMAIL, hash, salt, "MZM CRM Reviewer", REVIEWER_ROLE,
        "Roseville, CA", "Internal Hermes reviewer account for read-only MZM Junk Removal CRM review.", now,
      ).run();
    } else {
      const update = await env.DB.prepare(
        "UPDATE specialists SET password_hash=?,password_salt=? WHERE id=? AND lower(email)=lower(?) AND role=?"
      ).bind(hash, salt, specialistId, REVIEWER_EMAIL, REVIEWER_ROLE).run();
      if (Number(update?.meta?.changes || 0) !== 1) throw new Error("reviewer_credential_update_conflict");
    }

    await env.DB.prepare(`
      INSERT INTO hermes_managed_client_access
        (specialist_id,company_id,access_level,active,source,created_at,updated_at)
      VALUES (?,?,'viewer',1,'mzm_internal_reviewer_provisioning',?,?)
      ON CONFLICT(specialist_id,company_id) DO UPDATE SET
        access_level='viewer',active=1,source=excluded.source,updated_at=excluded.updated_at
    `).bind(specialistId, COMPANY_ID, now, now).run();
    await env.DB.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(specialistId).run();

    if (!await verifyPassword(password, salt, hash)) throw new Error("reviewer_credential_hash_readback_failed");
    if (!await sendReviewerCredentials(env, password)) throw new Error("reviewer_credential_delivery_failed");

    await env.DB.prepare(`
      INSERT INTO hermes_managed_client_reviewer_receipts
        (company_id,specialist_id,email,credential_delivery,created_at,completed_at)
      VALUES (?,?,?,'internal_admin_mailbox',?,?)
      ON CONFLICT(company_id) DO UPDATE SET
        specialist_id=excluded.specialist_id,
        email=excluded.email,
        credential_delivery=excluded.credential_delivery,
        completed_at=excluded.completed_at
    `).bind(COMPANY_ID, specialistId, REVIEWER_EMAIL, now, now).run();

    return { specialistId, credentialDelivery: "internal_admin_mailbox", accessState: "read_only" };
  } catch (error) {
    if (!priorAccess) {
      await env.DB.prepare("DELETE FROM hermes_managed_client_access WHERE specialist_id=? AND company_id=?")
        .bind(specialistId, COMPANY_ID).run();
    }
    await env.DB.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(specialistId).run();
    if (created) {
      await env.DB.prepare("DELETE FROM specialists WHERE id=? AND lower(email)=lower(?) AND role=?")
        .bind(specialistId, REVIEWER_EMAIL, REVIEWER_ROLE).run();
    } else if (oldHash && oldSalt) {
      await env.DB.prepare("UPDATE specialists SET password_hash=?,password_salt=? WHERE id=?")
        .bind(oldHash, oldSalt, specialistId).run();
    }
    throw error;
  }
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

  await ensureHermesCompanyProfilesSchema(env.DB);
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
      SELECT id,owner_specialist_id,company_name,slug,company_type,city,state,website,phone,address_line1,postal_code,country_code,timezone,
             catalog_opt_in,catalog_status,load_board_access,public_source_ref,management_mode,catalog_publication_basis
      FROM hermes_company_profiles WHERE id=? LIMIT 1
    `).bind(COMPANY_ID).first(),
    env.DB.prepare(`
      SELECT id,owner_specialist_id,company_id,service_subtype,services_json,service_areas_json,public_summary,semantic_core_ref,content_status
      FROM hermes_home_service_profiles WHERE company_id=? LIMIT 1
    `).bind(COMPANY_ID).first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM hermes_home_service_leads WHERE owner_specialist_id=?").bind(DATA_OWNER_ID).first(),
  ]);

  const expectedServicesJson = JSON.stringify(mzmJunkRemovalClient.services);
  const expectedServiceAreasJson = JSON.stringify(mzmJunkRemovalClient.serviceAreas);
  const persistedZero = (value: unknown) => value === 0 || value === "0";
  const realLeadsTracked = leadCount?.count;
  const validLeadCount = typeof realLeadsTracked === "number" && Number.isInteger(realLeadsTracked) && realLeadsTracked >= 0;
  const validCompany =
    String(company?.id || "") === COMPANY_ID &&
    String(company?.owner_specialist_id || "") === DATA_OWNER_ID &&
    String(company?.company_name || "") === mzmJunkRemovalClient.companyName &&
    String(company?.slug || "") === SLUG &&
    String(company?.company_type || "") === "home_service" &&
    String(company?.city || "") === mzmJunkRemovalClient.base.city &&
    String(company?.state || "") === mzmJunkRemovalClient.base.state &&
    String(company?.website || "") === mzmJunkRemovalClient.website &&
    String(company?.phone || "") === mzmJunkRemovalClient.phone &&
    String(company?.address_line1 || "") === "" &&
    String(company?.postal_code || "") === "" &&
    String(company?.country_code || "") === mzmJunkRemovalClient.base.countryCode &&
    String(company?.timezone || "") === mzmJunkRemovalClient.base.timezone &&
    String(company?.public_source_ref || "") === mzmJunkRemovalClient.publicEvidence.officialWebsite.url &&
    persistedZero(company?.catalog_opt_in) &&
    String(company?.catalog_status || "") === "managed_private" &&
    persistedZero(company?.load_board_access) &&
    String(company?.management_mode || "") === MANAGEMENT_MODE &&
    String(company?.catalog_publication_basis || "") === PUBLICATION_BASIS;
  const validProfile =
    String(profile?.id || "") === PROFILE_ID &&
    String(profile?.owner_specialist_id || "") === DATA_OWNER_ID &&
    String(profile?.company_id || "") === COMPANY_ID &&
    String(profile?.service_subtype || "") === mzmJunkRemovalClient.serviceSubtype &&
    String(profile?.services_json || "") === expectedServicesJson &&
    String(profile?.service_areas_json || "") === expectedServiceAreasJson &&
    String(profile?.public_summary || "") === mzmJunkRemovalClient.publicSummary &&
    String(profile?.semantic_core_ref || "") === mzmJunkRemovalClient.semanticCore.sourceRef &&
    String(profile?.content_status || "") === "active_content_planning";

  if (!validCompany || !validProfile || !validLeadCount) {
    return jsonResponse(409, { success: false, error: "managed_client_readback_mismatch" }, privateHeaders);
  }

  let reviewer;
  try {
    reviewer = await provisionReviewerAccess(env, now);
  } catch (error) {
    const code = error instanceof Error ? error.message : "reviewer_provisioning_failed";
    const allowed = new Set([
      "reviewer_identity_conflict",
      "reviewer_credential_update_conflict",
      "reviewer_credential_hash_readback_failed",
      "reviewer_credential_delivery_failed",
    ]);
    return jsonResponse(allowed.has(code) ? 409 : 500, {
      success: false,
      error: allowed.has(code) ? code : "reviewer_provisioning_failed",
    }, privateHeaders);
  }

  const publish = await env.DB.prepare(`
    UPDATE hermes_company_profiles
    SET catalog_status='verified_public',catalog_publication_basis=?,updated_at=?
    WHERE id=? AND management_mode=? AND catalog_opt_in=0
  `).bind(PUBLICATION_BASIS, now, COMPANY_ID, MANAGEMENT_MODE).run();
  if (Number(publish?.meta?.changes || 0) !== 1) {
    return jsonResponse(409, { success: false, error: "managed_catalog_publication_update_failed" }, privateHeaders);
  }

  const publishedCompany = await env.DB.prepare(`
    SELECT catalog_opt_in,catalog_status,management_mode,catalog_publication_basis
    FROM hermes_company_profiles WHERE id=? LIMIT 1
  `).bind(COMPANY_ID).first();
  const publicationVerified =
    persistedZero(publishedCompany?.catalog_opt_in) &&
    String(publishedCompany?.catalog_status || "") === "verified_public" &&
    String(publishedCompany?.management_mode || "") === MANAGEMENT_MODE &&
    String(publishedCompany?.catalog_publication_basis || "") === PUBLICATION_BASIS;
  if (!publicationVerified) {
    return jsonResponse(409, { success: false, error: "managed_catalog_publication_readback_failed" }, privateHeaders);
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
    public_profile_path: PUBLIC_PROFILE_PATH,
    crm_workspace_path: `/services/hermes-connect/home-services/workspace/?managed=${SLUG}`,
    reviewer_login_path: "/services/hermes-connect/home-services/reviewer-access/",
    reviewer_access_state: reviewer.accessState,
    credential_delivery: reviewer.credentialDelivery,
    management_mode: MANAGEMENT_MODE,
    publication_basis: PUBLICATION_BASIS,
    catalog_status: "verified_public",
    catalog_publication_eligible: true,
    catalog_owner_consent_claimed: false,
    owner_authentication_claimed: false,
    reviewer_authentication_claimed: false,
    internal_operator_capability: "HERMES_INTERNAL_OWNER",
    internal_operator_ui_readback: "REQUIRED_SEPARATELY",
    managed_fact_snapshot_verified: true,
    real_leads_tracked: realLeadsTracked,
    business_outcomes: "UNKNOWN_UNLESS_RECORDED_WITH_EVIDENCE",
  }, privateHeaders);
}
