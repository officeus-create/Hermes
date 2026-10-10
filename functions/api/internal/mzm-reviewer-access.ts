import { bearerToken, verifyGitHubMzmManagedClientOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureHomeServiceCrmSchema, ensureManagedClientAccessSchema } from "../_lib/home-service-crm.mjs";

type Env = { DB?: any };

const COMPANY_ID = "home-service-managed:mzm-junk-removal";
const MANAGEMENT_MODE = "hermes_managed";
const OPERATION_ID = "grant_mzm_reviewer_access_2026_10_11";
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

const cleanEmail = (value: unknown) => String(value ?? "").trim().toLowerCase().slice(0, 160);

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const token = bearerToken(request);
  if (!token || !await verifyGitHubMzmManagedClientOidcToken(token)) {
    return jsonResponse(403, { success: false, error: "operator_not_authorized" }, privateHeaders);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders); }

  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" }, privateHeaders);
  }
  const email = cleanEmail(body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { success: false, error: "reviewer_email_invalid" }, privateHeaders);
  }

  await ensureHomeServiceCrmSchema(env.DB);
  await ensureManagedClientAccessSchema(env.DB);

  const specialist = await env.DB.prepare(
    "SELECT id,email,name,role FROM specialists WHERE lower(email)=? LIMIT 1"
  ).bind(email).first();
  if (!specialist) {
    return jsonResponse(404, { success: false, error: "reviewer_account_not_found" }, privateHeaders);
  }

  const company = await env.DB.prepare(
    "SELECT id,slug,management_mode FROM hermes_company_profiles WHERE id=? LIMIT 1"
  ).bind(COMPANY_ID).first();
  if (!company || String(company.management_mode || "") !== MANAGEMENT_MODE) {
    return jsonResponse(409, { success: false, error: "managed_mzm_company_not_ready" }, privateHeaders);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO hermes_managed_client_access
      (specialist_id,company_id,access_role,active,created_at,updated_at)
    VALUES (?,?,'viewer',1,?,?)
    ON CONFLICT(specialist_id,company_id) DO UPDATE SET
      access_role='viewer',active=1,updated_at=excluded.updated_at
  `).bind(specialist.id, COMPANY_ID, now, now).run();

  const access = await env.DB.prepare(`
    SELECT specialist_id,company_id,access_role,active
    FROM hermes_managed_client_access
    WHERE specialist_id=? AND company_id=? LIMIT 1
  `).bind(specialist.id, COMPANY_ID).first();

  if (!access || Number(access.active || 0) !== 1 || String(access.access_role || "") !== "viewer") {
    return jsonResponse(409, { success: false, error: "reviewer_access_readback_mismatch" }, privateHeaders);
  }

  return jsonResponse(200, {
    success: true,
    email,
    specialist_id: String(specialist.id),
    company_id: COMPANY_ID,
    access_role: "viewer",
    login_path: "/services/hermes-connect/home-services/access/?mode=login&managed=mzm-junk-removal",
    workspace_path: "/services/hermes-connect/home-services/workspace/?managed=mzm-junk-removal",
    owner_authentication_claimed: false,
  }, privateHeaders);
}
