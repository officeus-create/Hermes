# Hermes MCP private read guard — review-only engineering contract

Status: **CODED / DISABLED / NOT WIRED TO PUBLIC MCP**, linked to Hermes Identity #1873, MCP pilot #1883, and existing [Adaptive Customer MCP Contract](./HERMES_CONNECT_CUSTOMER_MCP_CONTRACT.md). It **does not** provide a functioning OAuth authorization server or customer CRM read endpoint.

## Why this exists

The already implemented public Hermes MCP toolset and draft #1884 / stacked #1887 can show a CRM funnel or task owner, but cannot access private customer data. The first private step needs independent proof of the AI client authorization, bounded consent, and the *current* Hermes Company/Workspace membership. An identity claim, copied ChatGPT text, account email, browser cookie or admin-looking role string is never sufficient.

The new isolated helper `functions/api/_lib/mcp-tenant-guard.mjs` exports `authorizeMcpTenantRead` and a canonical resource URI. No existing API route calls it. No HTTP endpoint exposes private tools and no production flags or credentials were configured.

## Contract: what an eventual private MCP request must prove

1. Server flag `MCP_PRIVATE_READS_ENABLED=true` must be explicitly enabled after owner approval, and existing D1 + first-party `MCP_AUTH_INTROSPECTOR` Cloudflare service binding + HTTPS issuer must be present; default is **503 disabled**.
2. Per-request `Authorization: Bearer <token>` must be supplied. Browser `hermes_session`, email or text prompt must not authenticate MCP.
3. First-party **introspector** (to be implemented separately using an audited OAuth provider library) must validate token signatures, active status, revocation, specific OAuth client approval and per-client consent. The helper passes the token only to the internal, fixed service binding and requires a fresh `active:true` result. It does **not** take any user-supplied introspection URL.
4. Introspection response must have exact configured HTTPS issuer, exact Hermes MCP resource in both `aud` and `resource`, short-lived valid integer `iat/exp`, `hermes_specialist` subject type, nonblank approved `client_id`, `consent_granted:true` and exact `hermes:crm:read` scope (not `read-all` or `write`).
5. Existing `hermes_company_memberships` table is queried **by this verified subject and the requested company**, with active/revocation filters. Canonical `membershipRowAsPermission` validates the row; exact Company **and** Workspace must match. No new grants, memberships, elevated owner roles, or migrations are created.
6. Even a valid membership is denied if the referenced specialist no longer exists in the canonical `specialists` table. This checks *existence*, not an unspecified account suspension flag; any future suspension/deactivation state must also be checked when implemented. Optional `nbf` must be an integer not in the future; `iat` alone is insufficient.
7. The helper returns only a read-only authorization context (identity reference, company/workspace, role, scoped read capability, grant ID). **It does not return any CRM data**, make a CRM change, send email, publish content or launch a job.

## Introspector requirements before a future route can call this

- Build/choose a maintained provider under a separate reviewed PR. [Cloudflare OAuth Provider](https://developers.cloudflare.com/agents/model-context-protocol/protocol/authorization/) supports OAuth 2.1 patterns. Use real signatures/JWKS or standard token introspection, issuer and audience/resource validation, client binding and consent screen, expiration and revocation; do **not** trust the unverified JSON shape returned by arbitrary network service.
- Support [OAuth Protected Resource Metadata](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/authorization-server-discovery.mdx) and the appropriate `WWW-Authenticate` challenge **only when a real authorization server exists**; publishing metadata before this would falsely advertise a working authentication flow.
- Reuse Hermes Identity #1873 and #1881 only after their approved release and real user/provider readback; no second username/password store.
- Per-client consent precedes upstream auth, as required by the official [MCP Security Best Practices](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/2026-07-28/tutorials/security/security_best_practices.mdx). The OAuth context must bind to the particular client_id, not merely to a signed-in browser session.
- Strongly prefer standard or proven maintained token verification code over homemade JWT cryptography. `MCP_AUTH_INTROSPECTOR` is a **placeholder binding contract** with no deployed implementation.
- Server-side authorization must rerun for every call. Future tools get independent scope and confirmations; do not assume a read token can create CRM entries, send staff messages or change permission.

## Tests already added

`node scripts/hermes-mcp-tenant-guard.test.mjs` is wired into existing `npm test`. It checks: off by default; browser cookie/prompt spoofing denied; missing/invalid Bearer denied; wrong company/workspace, revoked/self-granted and invalid membership denied; deleted specialist and identity database outage denied; wrong issuer/audience/resource/client/scope/consent rejected before D1; missing/stale/long-lived exp/iat and future/noninteger nbf rejected; introspection or D1 errors fail closed; positive mock only reads membership, never writes.

Tests use **synthetic proofs from a mock introspector**, and are not external proof of a real OAuth provider, consent screen or production customer access. Keep the exact-head GitHub CI and later real-host tests separate.

## Technology decision and release

- **Existing server first:** public preview PR #1884 and stacked routing PR #1887 remain review-only. This helper is isolated on main-based branch to avoid conflicting with those in-flight code owners.
- **Cloudflare MCP Portals:** official documentation notes that upstream independent MFA and purpose/temporary authorization are not enforced by the portal. Do not route privileged Hermes tools through shared admin credential / `on_behalf=false` as a shortcut. Portal remains a later candidate contingent on per-user OAuth and budget review.
- **Cost:** this PR adds no dependency, Worker, Cloudflare Access seat, service token, paid workflow or live API endpoint.
- **Next safe PR:** implement an owner-approved OAuth resource server/introspector, protected metadata and consent; then a minimal read-only `whoami` that derives actual identity and membership on each call. Negative tenant, issuer, resource, scope, revocation and prompt-injection tests before any live tenant data.

**Mandatory release ladder:** drafted code → exact-head CI → security owner review → approved provider configuration/credentials → reviewed merge/deployment → independent live bearer and tenant-negative tests → specific user-host consent and proof. No automatic production deployment or outbound email.

## SDK review notes (official release, 2026-10-14)

[MCP TypeScript SDK v2.3.1](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/2.3.1) adds/aligns optional `expectedResource` for bearer-auth middleware, hardening acceptance to the intended MCP resource. Preserve our exact audience/resource check if later migrating to official SDK; `expectedResource` is **opt-in** and must be explicitly configured. The v2 migration guide notes authorization rules require independent opt-ins, not simply a protocol-version toggle. An isolated Cloudflare compatibility and security test is required before replacing existing Hermes transport; no dependency is added here.

Avoid treating a successful mocked introspector as proof of signature verification, OAuth client enrollment, end-user consent, owner MFA or suspended-identity checks. The live identity issuer, resource and per-client consent chain remain a separate release gate.


## Preventive npm SDK security gate (2026-10-14)

Independent source check on `main`: `package.json` **and** `package-lock.json` contain no `@modelcontextprotocol/*` packages. This means the Hermes **website repository's installed npm tree** is not presently affected by those SDK-specific advisories; it says nothing about ChatGPT, Claude, browser extensions, separately hosted MCP apps, other Hermes repos, or undisclosed indirect services.

Added `scripts/hermes-mcp-sdk-advisory-gate.test.mjs` to standard `npm test`. It inspects both direct and transitive lockfile nodes and intentionally conservatively blocks introduction of below-floor versions, missing direct lockfile records, unknown versions and prereleases for `@modelcontextprotocol/sdk` (1.32.0), `client/core/server/server-legacy` (2.3.1), or `mcp-handler` (1.1.0). The broader 2.3.1 floor is a **Hermes adoption policy**, not a claim that every earlier version in every package is vulnerable. Requires reviewer attention rather than silently installing/upgrading dependencies. This check covers only npm lockfile packages, not external app installations.

Official dated advisories and release evidence:

- [GHSA-6qxp-vccf-f47h](https://github.com/advisories/GHSA-6qxp-vccf-f47h), Sep 30 2026: affected OAuth MCP clients may leak credentials to untrusted issuer; fixed `@modelcontextprotocol/client` 2.2.0 / `@modelcontextprotocol/sdk` 1.31.0. All future clients must pin issuer, use explicit OAuth consent and rotate credentials if exposed.
- [GHSA-rvq5-wwqv-78pq](https://github.com/modelcontextprotocol/typescript-sdk/security), Oct 5 2026: bearer auth accepted tokens for another service; use a new SDK with **explicit** `expectedResource`. Hermes private guard already requires exact MCP audience/resource and a trusted introspection binding (not yet implemented).
- [GHSA-22jm-h49p-29qw](https://github.com/modelcontextprotocol/typescript-sdk/security/advisories/GHSA-22jm-h49p-29qw), Oct 2 2026: legacy taskStore sessions were not properly isolated; patched 1.32.0. The planned Hermes `ProvisioningJob` must be scoped to exact verified Company/Workspace and client, not a global task ID.
- [GHSA-w2fm-25vw-vh7f](https://github.com/advisories/GHSA-w2fm-25vw-vh7f): earlier `mcp-handler` releases could expose another client's tool response through a peer dependency. Do not add the package solely for convenience.
- [Official SDK release](https://github.com/modelcontextprotocol/typescript-sdk/releases), Oct 5 2026: 2.3.1 is available with opt-in audience controls. No SDK package was added in this PR.

Do not infer a library CVE is an exploitable defect in Hermes if the affected package is absent. Protect future dependencies, token routing and per-client session boundaries; rerun these checks when integrating outside MCP providers. Never forward client bearer tokens across untrusted redirects or store them in shared agent prompts/logs.
