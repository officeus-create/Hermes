import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { listActiveCompanyMemberships } from "../_lib/company-memberships.mjs";
import { parseBusinessRef } from "../_lib/business-identity.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";

type Env = { DB?: any };

const headers = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Robots-Tag": "noindex, nofollow",
};

const clean = (value: unknown, max = 240) =>
  String(value ?? "").replace(/[<>\u0000-\u001f\u007f]/g, "").trim().slice(0, max);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, headers);

  await ensureHermesCompanyProfilesSchema(env.DB);
  const memberships = await listActiveCompanyMemberships(env.DB, { specialistId: specialist.id });

  const workspaces = [];
  for (const membership of memberships) {
    const business = parseBusinessRef(membership.companyId);
    if (!business || business.namespace !== "company") continue;
    const company = await env.DB.prepare(`
      SELECT id,company_name,company_type,city,state
      FROM hermes_company_profiles
      WHERE id=? LIMIT 1
    `).bind(business.native_id).first();

    if (!company) continue;
    workspaces.push({
      business_ref: "company:" + clean(company.id, 160),
      workspace_ref: membership.workspaceId || null,
      role: membership.role,
      company: {
        name: clean(company.company_name, 180),
        type: clean(company.company_type, 80),
        city: clean(company.city, 120),
        state: clean(company.state, 8),
      },
      capabilities: {
        read_workspace: true,
        mutate_workspace: false,
        owner_command_center: false,
        internal_ai: false,
        cross_tenant_search: false,
      },
    });
  }

  return jsonResponse(200, {
    success: true,
    identity_mode: "CUSTOMER",
    client_view_state: workspaces.length ? "MEMBERSHIP_SCOPED" : "NO_ACTIVE_MEMBERSHIP",
    checked_at: new Date().toISOString(),
    workspaces,
    policy: {
      tenant_source: "server_authenticated_session_plus_active_membership",
      client_supplied_tenant_selector_trusted: false,
      owner_internal_data_exposed: false,
      write_enabled: false,
    },
  }, headers);
}
