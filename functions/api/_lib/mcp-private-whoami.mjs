import { authorizeMcpTenantRead } from "./mcp-tenant-guard.mjs";

// FIRST PRIVATE MCP READ CANDIDATE. There is deliberately no public API route,
// no tools/list registration, no OAuth server and no session-cookie shortcut.
// A future authenticated MCP handler may call this ONLY after the owner has
// approved an independent issuer, consent flow and audited deployment.
export async function getScopedMcpWhoami({ request, env, companyRef, workspaceRef }) {
  const allowed = await authorizeMcpTenantRead({
    request, env, companyRef, workspaceRef,
  });
  if (!allowed.ok) return allowed;

  // Return an identity and ONE existing, authorized workspace. Do not return
  // email, phone, tokens, arbitrary company lists, customer CRM records, or
  // any write capability. Every future tool call must independently repeat
  // authorization; this response is not a delegated bearer credential.
  return {
    ok: true,
    status: 200,
    identity: {
      type: "hermes_specialist",
      id: allowed.identity_id,
    },
    workspace: {
      company_ref: allowed.company_ref,
      workspace_ref: allowed.workspace_ref,
      role: allowed.role,
      capabilities: [...allowed.capabilities],
    },
    authorization: {
      client_id: allowed.client_id,
      membership_id: allowed.grant_id,
      scope: "hermes:crm:read",
      fresh_validation_required_per_call: true,
    },
    effects: {
      data_read: "AUTHORIZATION_CONTEXT_ONLY",
      customer_records_read: false,
      writes_permitted: false,
      messages_sent: false,
      background_job_started: false,
    },
  };
}
