# Hermes MCP: first testable funnel preview

**State:** Review-only PR for [#1883](https://github.com/officeus-create/Hermes/issues/1883). This is a read-only demonstration on the **existing** Hermes Connect MCP endpoint; it does not install/activate a ChatGPT or Claude connection or write to a customer's CRM.

## The experience the owner should see

The owner opens a compatible AI client that has intentionally connected the approved Hermes MCP endpoint.

**Example owner message (English):**

> Use Hermes Connect MCP to preview a funnel for US car-hauling carriers. I want more verified qualified carriers from Instagram. Show stages, responsibility and the first measurable KPI, but do not send any messages or change customer records.

The client calls `preview_crm_funnel` with:

```json
{"business_type":"US car hauling carriers","goal":"Increase qualified carriers","entry_channel":"instagram"}
```

The tool returns five steps:
1. Carrier inquiry — capture source, equipment, and lanes
2. Qualification — verify authority, insurance, equipment, and contact
3. Offer — explain true service model, no claims that loads are available
4. Agreement — offer an approved contract for review without autonomous send
5. Onboarding — hand off only after actual approval; avoid disturbing dispatchers

Every stage says `automation_state=NOT_CONNECTED`, and the result says `status=PREVIEW_ONLY`. The measurable first KPI is verified qualified carrier inquiries/week excluding synthetic leads. The agent explains the **first useful approved** connector, with no implied database access.

**Second example:** `{"business_type":"auto repair shop","goal":"reduce missed bookings","entry_channel":"website"}`: five stages New request → Qualification → Estimate → Booking → Follow-up; opt-in feedback only.

## How to perform a reproducible technical test

1. From the PR's exact head, execute `npm run build`, `npm test` (includes `scripts/hermes-connect-public-mcp.test.mjs`), and `npm run test:e2e`.
2. Against a verified, approved deployment of `https://hermeslogisticsus.com/api/hermes-connect/mcp`, perform Streamable HTTP POST JSON-RPC `tools/list` and `tools/call` with `preview_crm_funnel`. Test both compatible protocol versions; do not infer deployment from green CI.
3. In a supported ChatGPT/Claude host, **after the user explicitly connects the Hermes remote MCP server**, request one of the examples. Compare the stages and labels with the server output. No login into private CRM should occur in public preview mode.

Do not claim the host integration is active from GitHub code alone. The user must approve installation/connection through their host and the Hermes remote endpoint must be actually reachable and accepted by that host.

## Security boundaries

- Public preview cannot enumerate/read/write tenants, user records, campaigns, email, or API tokens. Input requires generic business type and goal with sensitive-pattern rejection.
- Existing public tools remain compatible and the current Hermes identity/account system remains the source of truth.
- Future authorized `whoami` and CRM tools must use proper OAuth/MCP authorization and verified membership on *every call*, not share a browser session cookie across systems. Never pass external provider bearer secrets through the model.
- CEO's no-outbound-mail policy still applies; no external posts, DMs, calls, Telegram, or email.
- Asynchronous CRM creation requires a persisted `ProvisioningJob` with a real ID, state, cancellation and readback. A blueprint is not proof a background worker exists.
- Mobile and cross-client UI parity should be verified; add MCP Apps interactive forms only where supported with a text fallback.

## Technology horizon (plans, not predictions)

| Horizon from 2026-10-14 | Bounded next move | Acceptance evidence |
| --- | --- | --- |
| 3 months (Jan 2027) | Release compatible **public read-only** tools after owner approval, adopt clear client install guide; verify actual ChatGPT/Claude usage | Verified deployed SHA, tools/list and tools/call on both clients, real owner confirms |
| 6 months (Apr 2027) | OAuth-backed `whoami`, scoped company/workspace reads, accountable agent permissions | Tenant-isolation negative tests and authenticated human owner pilot |
| 9 months (Jul 2027) | Persist one small customer-approved workflow as `ProvisioningRequest/Job`; job Tasks extension only if supported | Durable ID + status/cancel/readback; no background claims from chat text |
| 12 months (Oct 2027) | Introduce MCP Apps inline CRM timeline/dashboard and approved connector adapters where usage justifies | Real usability, accessibility, rollback and user-value evidence |
| 15 months (Jan 2028) | Review multi-agent orchestration and protocol deprecations against observed adoption, licensing/security | Nonduplicated agent/tool registry with proof of reliability and budget |

**Watchlist:** official [MCP July 2026 changes](https://blog.modelcontextprotocol.io/posts/2026-07-28/), [official TypeScript SDK v2](https://github.com/modelcontextprotocol/typescript-sdk), [MCP Apps](https://apps.extensions.modelcontextprotocol.io/), [Tasks extension](https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks), and vendor OAuth 2.1/issuer rules. Do not automatically adopt a draft or build a second SDK abstraction.

**Operational loop:** scout public official releases and safe-licensed code → compare to current Hermes code/CI → create a one-page evidence-backed CapabilityCandidate → assign one owner and acceptance test → small PR → exact-head CI → owner-reviewed activation → production readback. Share sanitized lessons with relevant plugin skills, not raw customer conversations.

Canonical follow-ups: Identity [#1873](https://github.com/officeus-create/Hermes/issues/1873), integration [#1881](https://github.com/officeus-create/Hermes/pull/1881), MCP pilot [#1883](https://github.com/officeus-create/Hermes/issues/1883), existing [Customer MCP contract](./HERMES_CONNECT_CUSTOMER_MCP_CONTRACT.md).


## Verified protocol/client compatibility and practical connection prerequisites (2026-10-14)

The existing MCP endpoint is a lightweight custom handler, **not** an official SDK instance. Compared against official 2026-07-28 [Streamable HTTP spec](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/transports/streamable-http.mdx):
- Validate `Origin` on all requests to prevent DNS rebinding; default same-origin, with explicit `MCP_ALLOWED_ORIGINS` for vetted additional HTTPS origins. Normal cloud-to-cloud host connections may omit Origin.
- In 2026-07-28 mode compare `MCP-Protocol-Version` in HTTP and `params._meta` as well as `Mcp-Method` and `Mcp-Name` against the JSON-RPC body. Reject missing/mismatched modern headers with `-32020 HeaderMismatch`. Preserve old handshaking 2025-06-18 clients.
- The modern protocol does **not** require GET streams, legacy sessions or `initialize` calls. New write tools are out of scope until proper OAuth and server-side tenancy are implemented.

**Claude host:** official [Connectors documentation](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities) says a user can add a remote URL from Customize > Connectors > Add > Custom > Web, select authentication settings, then enable the connector for a conversation. An actual user/vendor connection must be confirmed; installation cannot be inferred from an issue/PR.

**ChatGPT host:** official [developer-mode / MCP apps documentation](https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt) describes custom full MCP applications and write-capable developer mode for eligible Business, Enterprise and Edu workspaces with developer/admin gating. Do **not** assume all individual plans can add a custom remote MCP endpoint just because ChatGPT supports other plugins or the user owns a private skill plugin. Check actual plan/UI entitlements before asking the owner to connect. If unavailable, test through Claude or a locally authorized MCP client/CI instead of trying to bypass workspace feature rules.

**Current public pilot limitations:** `preview_crm_funnel` is source code under draft PR #1884. No provider app installation, deployed SHA, verified user login, data write or autonomous workflow proof is implied. Owner review/approval is required for an actual release.


## One-command post-deploy proof (safe GET-free readback, never self-deploys)

After a separately owner-approved merge and deployment, use `node scripts/hermes-mcp-public-readback.mjs` on an authorized executor with Node.js network access. It sends three public **read-only** JSON-RPC calls to the fixed Hermes endpoint: `server/discover`, `tools/list`, and `preview_crm_funnel`. It checks the 2026-07-28 wire fields, five preview stages, NOT_CONNECTED state and no-outbound statement.

`MCP_PUBLIC_PREVIEW_LIVE_VERIFIED` means only this public-read-only sample responded. A failure prints `MCP_PUBLIC_PREVIEW_NOT_VERIFIED`; do not label a draft PR as live or treat a 200 from a homepage as passing this test. This script is intentionally **not** an authenticated customer test: it sends no tokens or cookies and cannot perform CRM writes or messaging.

The first complete external-host acceptance needs an additional explicit customer/user-host connection, a screenshot or host-side `tools/call` receipt, and proof the model correctly explains PREVIEW_ONLY. Do not request the owner to install anything until deployed endpoint actually passes independent readback.


## 2026-10-14 — full protocol parity and roadmap checkpoint

Verification sources: [MCP 2026-07-28 official changelog](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/changelog.mdx), [official TypeScript migration guide](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28) and [maintainers' updated roadmap (2026-08-22)](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/).

Further strict-schema review revealed **two additional legacy vs modern differences**, patched under this same draft PR rather than creating a new MCP service:

- Modern `tools/list` must include `ttlMs` and `cacheScope`, not only `server/discover`. Hermes now emits `ttlMs: 0` (immediately stale) and `cacheScope: "private"` (not reusable between identities). Legacy 2025 responses are unchanged. Unit test and independent remote readback verify both.
- `ping` is *removed* in the 2026-07-28 protocol. Hermes replies with `-32601 Method not found` to a modern call while preserving the already supported legacy 2025 `ping`. These are distinct protocol-era contracts, not two methods exposed to new clients.
- Modern headers and body routing remain strict, with supported-version negotiation by `-32022`. This server does not claim support for modern Tasks, subscriptions, MRTR or private OAuth; no such methods were added.

**Technology outlook / dated decisions:** The maintainers' 2026-08-22 roadmap identifies (1) agentic messaging, (2) HTTP transport hardening, (3) agent identity and enterprise security, (4) improved primitives, and (5) SDK developer experience. These are **R&D directions**, not releases that Hermes or a host is already running.

| Horizon from 2026-10-14 | Concrete Hermes decision | Promotion proof |
| --- | --- | --- |
| 3 months | Release owner-reviewed public `preview_crm_funnel` behind current public MCP handler, test 2025/2026 wire and supported AI host | Exact-head CI, independently reachable URL, user-host `tools/call` receipt |
| 6 months | First verified identity and *tenant-scoped* `whoami` with stable issuer, audience, consent and current Company/Workspace read grant | Real OAuth provider, revocation test, cross-tenant negative, approved owner release |
| 9 months | Durable `ProvisioningJob` proposal with idempotent, user-confirmed steps and cancellation; evaluate Tasks extension only for consenting client hosts | Actual job state, capability negotiation, caller/tenant ownership on `tasks/get/update/cancel`, billing bound |
| 12 months | MCP Apps *optional UI* for funnel review and employee handoff, with text fallback | Supported host matrix, accessibility, CSP, security test, versioned SDK review |
| 15 months | Evaluate multi-agent coordination and scoped delegation versus existing plugin skills/Cloudflare Portal | Measured run completion, human approval/audit, per-agent identity, permission revocation, operating cost |

**Release policy:** No commitment to autonomous execution or new background privileges from a technology blog, SDK example or green PR. Keep one MCP gateway, one existing Hermes Identity data model, one versioned plugin owner and a verified One Brain handoff. Work requiring owner approval remains a blocker, never an excuse to guess credentials, send emails or silently deploy.


## Pre-release security clarification: legacy public feedback tool can write D1

The **new** `preview_crm_funnel` and follow-on `preview_agent_handoff` are read-only, but the existing public Hermes MCP endpoint already exposes `submit_product_feedback` with `readOnlyHint:false`. When `consent_to_product_learning:true` and the configured D1 database are supplied, it creates/retains structured rows in `plugin_product_learning_events` (with retention cleanup and rate limiting). Therefore, describing the *entire existing MCP endpoint* as read-only is inaccurate.

That consent boolean is supplied by the calling client/model. It is **not a cryptographic or independently checked receipt of explicit human consent**, and is not equivalent to an authenticated CRM grant. The tool intentionally rejects ordinary PII patterns and limits learning events, but it remains a public write surface. Keep this distinction visible during security review.

**Pilot acceptance:**
- Treat `preview_crm_funnel` and `preview_agent_handoff` as preview-only; dedicated regression tests prove they cannot access D1. Do not send sensitive data or trigger the feedback write tool in an exploratory ChatGPT/Claude session.
- Before allowing general third-party AI hosts to invoke the full MCP tool catalog, the owner must decide whether to scope client-visible tools to public read-only, require independently verifiable per-user feedback consent, or leave the existing feedback endpoint intentionally public with clear disclosure and abuse controls. That decision requires an explicit existing-feature compatibility review, not an unannounced change.
- Any future OAuth-backed customer tool remains **separate** from public product feedback and must validate account, issuer, audience, consent, Company/Workspace membership, and capability on every call.
- CI proof of a read-only preview does not erase or test away this existing feedback write functionality. Source of truth: `functions/api/hermes-connect/mcp.ts`, `scripts/hermes-connect-public-mcp.test.mjs`.


## First external-host pilot: server-enforced preview-only mode (2026-10-14)

**Important distinction:** The existing public MCP endpoint includes the `submit_product_feedback` tool, which can mutate the `plugin_product_learning_events` table when a request carries `consent_to_product_learning:true` and D1 is available. This Boolean is **client-supplied** and does not independently prove a human approved that particular call. Neither a readOnlyHint on other tools nor the model's claim is a server-side authorization control.

To allow a future explicitly approved no-write pilot while preserving existing product-learning behavior in environments where the flag is absent, this PR adds an **opt-in deployment flag** `MCP_PUBLIC_PREVIEW_ONLY=true`:

- `tools/list` excludes `submit_product_feedback` for BOTH legacy 2025 and modern 2026 callers. Modern results remain `ttlMs:0` and `cacheScope:'private'`.
- `tools/call` rejects even a direct `submit_product_feedback` invocation with HTTP 403 / JSON-RPC -32000 **before inspecting arguments or accessing D1**. Hiding a tool in the list is not sufficient, because HTTP clients can call it directly.
- Public informational tools and `preview_crm_funnel` remain usable, without reading or mutating a customer's private CRM. The existing feedback writer remains available where this flag is unset, pending an explicit product owner decision.
- The operator must separately approve the production/preview environment configuration. **This change does not enable or set any Cloudflare env var.** A future readback must establish that the flag is in effect on the specific hostname being tested, including a forbidden direct `tools/call` negative probe.
- Long-term preference: implement verifiable end-user consent and separate capability scopes for all public and private write tools, rather than relying on a Boolean emitted by a model. Do not confuse public feedback writes with company-scoped CRM permissions.

The updated `scripts/hermes-connect-public-mcp.test.mjs` verifies excluded tool listings in both protocol eras, HTTP403 on direct write attempt, zero DB prepares, permitted funnel preview, and backward-compatible tool listing when the flag is absent. It uses synthetic data and does not send a real user message or modify production.

Relevant primary source: [MCP 2026-07-28 tools](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/server/tools.mdx) cautions that tool annotations are untrusted and human-in-the-loop confirmations SHOULD be provided for operations. Because annotations are not enforcement, the Hermes safeguard is in `onRequest`, ahead of the write handler.
