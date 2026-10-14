# Private scoped MCP whoami — isolated next-stage proof (2026-10-14)

**State:** CODED on stacked PR, **not deployed**, **not a public MCP tool**, **not a functioning OAuth provider**. The implementation lives in `functions/api/_lib/mcp-private-whoami.mjs` and builds on private bearer guard PR #1891. It is deliberately not wired to `functions/api/hermes-connect/mcp.ts` and does not alter tools/list, public discoverability, production, roles or tenant records.

## User journey after future authorization

A user explicitly approves connecting ChatGPT/Claude (or a supported MCP client) to Hermes. The MCP host completes a verified issuer-bound OAuth flow; the server introspects the client's scoped bearer and independently verifies the user's current Company/Workspace membership. Only then can an approved **private** MCP route return one existing, selected workspace's identity summary.

Synthetic fixture input in `scripts/hermes-mcp-private-whoami.test.mjs` is deliberately not reusable as a credential.

Expected minimal result:

```json
{
  "ok": true,
  "status": 200,
  "identity": { "type": "hermes_specialist", "id": "specialist-1" },
  "workspace": {
    "company_ref": "company:dealer-test",
    "workspace_ref": "dealer_crm:company:dealer-test",
    "role": "read_only",
    "capabilities": ["hermes:crm:read"]
  },
  "authorization": {
    "client_id": "approved-client",
    "membership_id": "existing-grant",
    "scope": "hermes:crm:read",
    "fresh_validation_required_per_call": true
  },
  "effects": {
    "data_read": "AUTHORIZATION_CONTEXT_ONLY",
    "customer_records_read": false,
    "writes_permitted": false,
    "messages_sent": false,
    "background_job_started": false
  }
}
```

These are **synthetic example identifiers** and must not be treated as a real login, lead, company, task or account. No raw email, telephone, bearer token, session cookie, private notes or user-owned data is copied into the result.

## Boundaries

1. The existing `authorizeMcpTenantRead` helper is called per operation; disabled by default and denies missing signed/introspected bearer, revoked/incorrect client consent, wrong issuer/resource/audience/scope, expired/future token, orphaned specialist, revoked/self-granted or other-company membership.
2. A single selected Company/Workspace is returned. This does **not** provide universal portfolio enumeration or discover another person's companies; a later `list_my_workspaces` needs independent consent and server-bounded pagination.
3. `whoami` cannot become a reusable authority. Every subsequent tool request must independently validate the token, active specialist, exact tenant membership, capability and any required confirmation.
4. No extra endpoint is created in this PR. The `MCP_AUTH_INTROSPECTOR` service binding is still a missing **first-party verified token issuer/introspection implementation**. Do not turn on `MCP_PRIVATE_READS_ENABLED` before issuer/client registration and negative real-user tests.
5. Tests are local mocks. `node scripts/hermes-mcp-private-whoami.test.mjs` is now in `npm test`; test cases prove denied cookie-only, unconsented/wrong-resource bearer, revoked tenant grant, wrong workspace and deleted identity. No D1 mutation, outbound message or actual OAuth round-trip.

## Updated 2026 protocol and hosted portal warning

- The [2026-07-28 MCP specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/) formalizes stateless requests, issuer validation per RFC 9207, client-bound OAuth grants, and Tasks as an extension. Avoid building new session-based per-client authorization from the HTTP transport.
- [Cloudflare MCP Portals (updated Oct 12, 2026)](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/) states that users **blocked by a portal Access policy may still use an upstream MCP server's direct URL** if the upstream server is not independently protected. Every future private Hermes MCP host must enforce OAuth/Access at its own resource endpoint, never only at the Portal.
- Cloudflare also states that service-token sessions with `on_behalf=false` call upstream with the portal **admin credential**, which is not per-user consent. Restrict any future service-token channel to separately approved machine-only capabilities; private customer `whoami` must use per-user OAuth.
- Source-driven recommendation, not an implemented change: reuse official maintained SDK authorization/resource metadata and real OAuth consent, verify exact issuer and expected resource, independently test ChatGPT/Claude host support.

## Next acceptance gate

`CODED → EXACT-HEAD CI → OWNER + SECURITY REVIEW → ISSUER/CONSENT/REVOCATION IMPLEMENTATION → INDEPENDENT TEST PROVIDER → AUTHORIZED MERGE/DEPLOY → REAL USER/HOST MCP SIGN-IN → NEGATIVE CROSS-TENANT PROOF → USER-PROVEN RESULT`.

Do not skip or infer any gate. No email send or dispatcher contact, no paid worker/portal, no permission changes, no customer CRM read/write in this step.
