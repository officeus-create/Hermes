import { membershipRowAsPermission } from "./company-memberships.mjs";

// This module is deliberately NOT wired to the public /mcp handler.
// It prepares a fail-closed private read boundary for the future owner-
// approved OAuth 2.1 resource server, with no user-secret in the model.
export const HERMES_MCP_RESOURCE = "https://hermeslogisticsus.com/api/hermes-connect/mcp";
const REQUIRED_READ_SCOPE = "hermes:crm:read";
const SUBJECT_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,179}$/;
const REF_RE = /^company:[A-Za-z0-9_-]{1,160}$/;
const WORKSPACE_RE = /^[A-Za-z0-9][A-Za-z0-9._:/#-]{0,219}$/;

function denied(status, reason) {
  return { ok: false, status, reason };
}

function introspectionReady(env) {
  return env?.MCP_PRIVATE_READS_ENABLED === "true" &&
    Boolean(env?.DB && typeof env.DB.prepare === "function") &&
    typeof env?.MCP_AUTH_INTROSPECTOR?.fetch === "function" &&
    typeof env?.MCP_AUTH_ISSUER === "string" &&
    /^https:\/\/[^/\s]+\/?$/.test(env.MCP_AUTH_ISSUER);
}

export async function authorizeMcpTenantRead({ request, env, companyRef, workspaceRef }) {
  if (!introspectionReady(env)) return denied(503, "private_mcp_disabled");
  // Browser cookies, a prompt claiming to be the CEO, and user-supplied email
  // are not MCP authentication. Only an introspected, consented bearer works.
  const authorization = request?.headers?.get("Authorization") || "";
  if (!/^Bearer [A-Za-z0-9._~+/-]{32,4096}={0,2}$/.test(authorization)) {
    return denied(401, "bearer_required");
  }
  if (typeof companyRef !== "string" || !REF_RE.test(companyRef) ||
      typeof workspaceRef !== "string" || !WORKSPACE_RE.test(workspaceRef)) {
    return denied(400, "invalid_tenant_scope");
  }

  let proof;
  try {
    // First-party Cloudflare Worker service binding, not a public user-provided
    // URL. The future authenticator must validate signature, client, revocation,
    // per-client consent and token audience before returning active=true.
    const response = await env.MCP_AUTH_INTROSPECTOR.fetch(
      "https://mcp-introspector.internal/introspect",
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({
          resource: HERMES_MCP_RESOURCE,
          scope: REQUIRED_READ_SCOPE,
        }),
      },
    );
    if (!response?.ok) return denied(401, "token_not_verified");
    proof = await response.json();
  } catch {
    return denied(503, "introspection_unavailable");
  }

  const now = Math.floor(Date.now() / 1000);
  const validTimes = Number.isSafeInteger(proof?.exp) &&
    Number.isSafeInteger(proof?.iat) &&
    proof.exp > now &&
    proof.iat <= now + 60 &&
    proof.iat <= proof.exp &&
    proof.exp - proof.iat <= 3600;
  const audience = proof?.aud;
  const hasAudience = audience === HERMES_MCP_RESOURCE ||
    (Array.isArray(audience) && audience.includes(HERMES_MCP_RESOURCE));
  const scopes = typeof proof?.scope === "string"
    ? proof.scope.split(/\s+/).filter(Boolean) : [];

  if (proof?.active !== true ||
      proof.iss !== env.MCP_AUTH_ISSUER ||
      !hasAudience || proof.resource !== HERMES_MCP_RESOURCE ||
      proof.subject_type !== "hermes_specialist" ||
      typeof proof.sub !== "string" || !SUBJECT_RE.test(proof.sub) ||
      typeof proof.client_id !== "string" || !SUBJECT_RE.test(proof.client_id) ||
      proof.consent_granted !== true ||
      !scopes.includes(REQUIRED_READ_SCOPE) || !validTimes) {
    return denied(401, "invalid_oauth_resource_grant");
  }

  let row;
  try {
    row = await env.DB.prepare(`
      SELECT id,business_ref,workspace_ref,specialist_id,role,active,
             grant_source,granted_by,revoked_at
      FROM hermes_company_memberships
      WHERE specialist_id=? AND business_ref=? AND active=1 AND revoked_at IS NULL
      LIMIT 1
    `).bind(proof.sub, companyRef).first();
  } catch {
    return denied(503, "membership_unavailable");
  }

  const membership = membershipRowAsPermission(row);
  if (!membership || membership.specialistId !== proof.sub ||
      membership.companyId !== companyRef ||
      membership.workspaceId !== workspaceRef ||
      !["admin", "member", "read_only"].includes(membership.role)) {
    return denied(403, "tenant_access_denied");
  }

  return {
    ok: true,
    status: 200,
    identity_id: proof.sub,
    company_ref: companyRef,
    workspace_ref: workspaceRef,
    role: membership.role,
    capabilities: [REQUIRED_READ_SCOPE],
    client_id: proof.client_id,
    grant_id: membership.membershipId,
  };
}
