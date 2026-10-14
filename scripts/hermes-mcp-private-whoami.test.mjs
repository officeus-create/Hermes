import assert from "node:assert/strict";
import { getScopedMcpWhoami } from "../functions/api/_lib/mcp-private-whoami.mjs";
import { HERMES_MCP_RESOURCE } from "../functions/api/_lib/mcp-tenant-guard.mjs";

const now = Math.floor(Date.now() / 1000);
const companyRef = "company:dealer-test";
const workspaceRef = "dealer_crm:company:dealer-test";
const bearer = "Bearer " + "A".repeat(64);
const tokenProof = {
  active: true, iss: "https://accounts.hermeslogisticsus.com",
  aud: HERMES_MCP_RESOURCE, resource: HERMES_MCP_RESOURCE,
  sub: "specialist-1", subject_type: "hermes_specialist",
  client_id: "approved-client",
  consent_granted: true, scope: "hermes:crm:read",
  iat: now - 30, exp: now + 300,
};
const membership = {
  id: "existing-grant", business_ref: companyRef, workspace_ref: workspaceRef,
  specialist_id: "specialist-1", role: "read_only", active: 1,
  grant_source: "owner_invited", granted_by: "specialist-owner",
  revoked_at: null,
};

function fixture({ proof = tokenProof, grant = membership, specialist = { id: "specialist-1" } } = {}) {
  const statements = [], upstream = [];
  const DB = {
    prepare(sql) {
      if (!/SELECT/i.test(sql) || /\b(UPDATE|INSERT|DELETE|DROP|CREATE|ALTER)\b/i.test(sql)) {
        throw Error("Private whoami must never alter database");
      }
      statements.push(sql);
      return {
        bind(...params) {
          return {
            async first() {
              if (/FROM specialists WHERE id/.test(sql)) {
                assert.deepEqual(params, ["specialist-1"]);
                return specialist;
              }
              assert.deepEqual(params, ["specialist-1", companyRef]);
              return grant;
            },
          };
        },
      };
    },
  };
  const env = {
    DB,
    MCP_PRIVATE_READS_ENABLED: "true",
    MCP_AUTH_ISSUER: "https://accounts.hermeslogisticsus.com",
    MCP_AUTH_INTROSPECTOR: {
      async fetch(url, options) {
        upstream.push({ url, options });
        assert.equal(url, "https://mcp-introspector.internal/introspect");
        assert.equal(options.redirect, "error");
        assert.equal(options.headers.Authorization, bearer);
        assert.deepEqual(JSON.parse(options.body), {
          resource: HERMES_MCP_RESOURCE, scope: "hermes:crm:read",
        });
        return new Response(JSON.stringify(proof), { status: 200 });
      },
    },
  };
  return {
    env, statements, upstream,
    run: (headers = { Authorization: bearer }, scope = {}) => getScopedMcpWhoami({
      request: new Request(HERMES_MCP_RESOURCE, { headers }),
      env, companyRef, workspaceRef, ...scope,
    }),
  };
}

{
  const f = fixture();
  const result = await f.run();
  assert.deepEqual(result, {
    ok: true, status: 200,
    identity: { type: "hermes_specialist", id: "specialist-1" },
    workspace: {
      company_ref: companyRef, workspace_ref: workspaceRef,
      role: "read_only", capabilities: ["hermes:crm:read"],
    },
    authorization: {
      client_id: "approved-client", membership_id: "existing-grant",
      scope: "hermes:crm:read", fresh_validation_required_per_call: true,
    },
    effects: {
      data_read: "AUTHORIZATION_CONTEXT_ONLY",
      customer_records_read: false, writes_permitted: false,
      messages_sent: false, background_job_started: false,
    },
  });
  assert.equal(f.statements.length, 2, "read membership then current specialist only");
  assert.equal(f.upstream.length, 1, "re-validate single bearer introspection");
  const output = JSON.stringify(result);
  for (const forbidden of ["Bearer", "email", "password", "phone", "customer_notes", "session_cookie"]) {
    assert.equal(output.includes(forbidden), false);
  }
}
{
  const f = fixture();
  f.env.MCP_PRIVATE_READS_ENABLED = "false";
  assert.deepEqual(await f.run(), { ok: false, status: 503, reason: "private_mcp_disabled" });
  assert.equal(f.statements.length, 0);
  assert.equal(f.upstream.length, 0);
}
{
  const f = fixture();
  assert.equal((await f.run({ Cookie: "hermes_session=owner" })).reason, "bearer_required");
  assert.equal((await f.run({ Authorization: "Bearer short" })).reason, "bearer_required");
  assert.equal(f.statements.length, 0);
}
for (const { input, error } of [
  { input: { proof: { ...tokenProof, aud: "https://another-mcp.example" } }, error: "invalid_oauth_resource_grant" },
  { input: { proof: { ...tokenProof, consent_granted: false } }, error: "invalid_oauth_resource_grant" },
  { input: { proof: { ...tokenProof, scope: "hermes:crm:write" } }, error: "invalid_oauth_resource_grant" },
  { input: { proof: { ...tokenProof, nbf: now + 90 } }, error: "invalid_oauth_resource_grant" },
  { input: { grant: { ...membership, revoked_at: "2026-10-14T10:00:00Z" } }, error: "tenant_access_denied" },
  { input: { grant: { ...membership, workspace_ref: "dealer_crm:company:other" } }, error: "tenant_access_denied" },
  { input: { specialist: null }, error: "identity_not_active" },
]) {
  const f = fixture(input);
  const result = await f.run();
  assert.equal(result.ok, false, "must deny rather than synthesize personal identity");
  assert.equal(result.reason, error);
  assert.equal("identity" in result, false);
  assert.equal("workspace" in result, false);
}
{
  const f = fixture();
  const result = await f.run({ Authorization: bearer }, { companyRef: "company:unrelated" });
  assert.equal(result.reason, "tenant_access_denied");
}

console.log("HERMES_MCP_SCOPED_WHOAMI_CONTRACT_PASS=YES: identity scoped by bearer+company/workspace, no CRM read/write or external action");
