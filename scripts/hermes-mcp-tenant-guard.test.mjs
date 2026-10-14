import assert from "node:assert/strict";
import { authorizeMcpTenantRead, HERMES_MCP_RESOURCE } from "../functions/api/_lib/mcp-tenant-guard.mjs";

const current = Math.floor(Date.now() / 1000);
const companyRef = "company:verified-dealer";
const workspaceRef = "dealer_crm:company:verified-dealer";
const memberRow = {
  id: "grant-real-1", business_ref: companyRef,
  workspace_ref: workspaceRef, specialist_id: "specialist-1",
  role: "member", active: 1, grant_source: "verified_owner_grant",
  granted_by: "specialist-owner", revoked_at: null,
};
const validProof = {
  active: true, iss: "https://accounts.hermeslogisticsus.com",
  aud: HERMES_MCP_RESOURCE, resource: HERMES_MCP_RESOURCE,
  sub: "specialist-1", subject_type: "hermes_specialist",
  client_id: "approved-agent-client", consent_granted: true,
  scope: "hermes:crm:read", iat: current - 30, exp: current + 300,
};
const token = "A".repeat(72);
const request = (authorization, cookie = null) => {
  const headers = {};
  if (authorization) headers.Authorization = authorization;
  if (cookie) headers.Cookie = cookie;
  return new Request(HERMES_MCP_RESOURCE, { headers });
};
function mocks(overrides = {}) {
  let dbReads = 0;
  let introspections = 0;
  let mutationCount = 0;
  let row = overrides.row === undefined ? memberRow : overrides.row;
  let proof = overrides.proof === undefined ? validProof : overrides.proof;
  const env = {
    MCP_PRIVATE_READS_ENABLED: "true",
    MCP_AUTH_ISSUER: "https://accounts.hermeslogisticsus.com",
    MCP_AUTH_INTROSPECTOR: {
      async fetch(uri, opts) {
        introspections++;
        assert.equal(uri, "https://mcp-introspector.internal/introspect");
        assert.equal(opts.method, "POST");
        assert.equal(opts.headers.Authorization, "Bearer " + token);
        assert.deepEqual(JSON.parse(opts.body), {
          resource: HERMES_MCP_RESOURCE, scope: "hermes:crm:read",
        });
        if (overrides.introspectionUnavailable) throw Error("service offline");
        if (overrides.introspectionReject) return new Response(null, { status: 401 });
        return new Response(JSON.stringify(proof), { status: 200 });
      },
    },
    DB: {
      prepare(sql) {
        assert.match(sql, /^\s*SELECT /);
        dbReads++;
        const identityLookup = /FROM specialists WHERE id/.test(sql);
        return {
          bind(...args) {
            assert.deepEqual(args, identityLookup
              ? ["specialist-1"]
              : ["specialist-1", overrides.expectedCompanyRef || companyRef]);
            return { async first() {
              if (overrides.dbUnavailable) throw Error("db offline");
              if (identityLookup) {
                if (overrides.identityDbUnavailable) throw Error("specialist database offline");
                return overrides.identityMissing ? null : { id: "specialist-1" };
              }
              return row;
            }};
          },
          async run() { mutationCount++; throw Error("MCP reads cannot mutate tenant"); },
        };
      },
    },
  };
  return {
    env, calls() { return { dbReads, introspections, mutationCount }; },
  };
}
const attempt = (env, auth = "Bearer " + token, company = companyRef, workspace = workspaceRef) =>
  authorizeMcpTenantRead({ request: request(auth), env, companyRef: company, workspaceRef: workspace });

{
  const mock = mocks();
  const proof = await attempt(mock.env);
  assert.deepEqual(proof, {
    ok: true, status: 200, identity_id: "specialist-1",
    company_ref: companyRef, workspace_ref: workspaceRef,
    role: "member", capabilities: ["hermes:crm:read"],
    client_id: "approved-agent-client", grant_id: "grant-real-1",
  });
  assert.deepEqual(mock.calls(), { dbReads: 2, introspections: 1, mutationCount: 0 });
}
{
  const mock = mocks();
  const denied = await attempt({ ...mock.env, MCP_PRIVATE_READS_ENABLED: "false" });
  assert.deepEqual(denied, { ok: false, status: 503, reason: "private_mcp_disabled" });
  const noService = await attempt({ ...mock.env, MCP_AUTH_INTROSPECTOR: undefined });
  assert.equal(noService.reason, "private_mcp_disabled");
  assert.deepEqual(mock.calls(), { dbReads: 0, introspections: 0, mutationCount: 0 });
}
{
  const mock = mocks();
  for (const auth of ["", "Basic " + token, "Bearer short", "Bearer " + token + " malicious"]) {
    const result = await attempt(mock.env, auth);
    assert.equal(result.reason, "bearer_required");
  }
  const cookieOnly = await authorizeMcpTenantRead({
    request: request(null, "hermes_session=session-owner"),
    env: mock.env, companyRef, workspaceRef,
  });
  assert.equal(cookieOnly.reason, "bearer_required");
  const promptIdentity = await authorizeMcpTenantRead({
    request: request(null),
    env: mock.env, companyRef, workspaceRef,
    claimedRole: "superadmin", email: "owner@example.com",
  });
  assert.equal(promptIdentity.reason, "bearer_required");
  assert.deepEqual(mock.calls(), { dbReads: 0, introspections: 0, mutationCount: 0 });
}
{
  const mock = mocks({ expectedCompanyRef: "company:someone-else" });
  const result = await attempt(mock.env, "Bearer " + token, "company:someone-else", workspaceRef);
  assert.equal(result.reason, "tenant_access_denied");
}
{
  const mock = mocks();
  const denied = await attempt(mock.env, "Bearer " + token, "garbage", workspaceRef);
  assert.equal(denied.reason, "invalid_tenant_scope");
  assert.deepEqual(mock.calls(), { dbReads: 0, introspections: 0, mutationCount: 0 });
}
const wrongGrants = [
  { active: 0 }, { revoked_at: "2026-10-14T17:00:00Z" },
  { role: "superadmin" }, { specialist_id: "specialist-other" },
  { workspace_ref: "dealer_crm:company:other" },
  { business_ref: "company:other" },
  { granted_by: "specialist-1" },
  { grant_source: "" },
];
for (const invalid of wrongGrants) {
  const mock = mocks({ row: { ...memberRow, ...invalid } });
  const denied = await attempt(mock.env);
  assert.equal(denied.reason, "tenant_access_denied", JSON.stringify(invalid));
  assert.equal(mock.calls().mutationCount, 0);
}
const wrongProofs = [
  { active: false }, { iss: "https://attacker.example" },
  { aud: "https://another-service.example/mcp" },
  { resource: "https://another-service.example/mcp" },
  { subject_type: "email" }, { sub: "attacker@example.com" },
  { client_id: "" }, { consent_granted: false },
  { scope: "hermes:crm:write" }, { scope: "hermes:crm:read-all" },
  { exp: undefined }, { iat: undefined }, { exp: current - 10 },
  { nbf: current + 30 }, { nbf: "not-a-time" }, { nbf: null },
  { iat: current + 120 }, { exp: current + 7200 },
];
for (const change of wrongProofs) {
  const mock = mocks({ proof: { ...validProof, ...change } });
  const result = await attempt(mock.env);
  assert.equal(result.reason, "invalid_oauth_resource_grant", JSON.stringify(change));
  assert.equal(mock.calls().dbReads, 0, "invalid token may not query tenant data");
}
for (const failure of ["introspectionReject", "introspectionUnavailable", "dbUnavailable", "identityDbUnavailable"]) {
  const mock = mocks({ [failure]: true });
  const result = await attempt(mock.env);
  assert.equal(result.ok, false, failure);
  assert.equal(mock.calls().mutationCount, 0);
}

// An expired/deleted specialist must not be resurrected by an orphaned,
// apparently valid Company/Workspace grant and a previously minted token.
{
  const mock = mocks({ identityMissing: true });
  const denied = await attempt(mock.env);
  assert.equal(denied.status, 403);
  assert.equal(denied.reason, "identity_not_active");
  assert.deepEqual(mock.calls(), { dbReads: 2, introspections: 1, mutationCount: 0 });
}

console.log("HERMES_MCP_PRIVATE_TENANT_GUARD_CONTRACT_PASS=YES: fail closed, approved resource, consent, read scope and exact membership; no writes");
