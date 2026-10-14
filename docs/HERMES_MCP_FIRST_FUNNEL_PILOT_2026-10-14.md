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

