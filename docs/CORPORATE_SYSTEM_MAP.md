# Hermes Corporate System Map

**Audit date:** 2026-08-25 · **Last reconciliation:** 2026-08-25 11:37 UTC. **Evidence boundary:** repository/current remote ref, GitHub read-only issue/PR metadata, public HTTP/title/canonical observations, and local-Mac directory/configuration structure are verified. Gmail, Drive content/permissions, GA4/GSC/Bing, Cloudflare account, CRM/Database Carrier/Digital CEO Bridge, payments, and credentials remain outside this audit's authenticated scope.

## Evidence language
`CONFIRMED` = current source/code inspected; `SUPPORTED` = current documentation or local structure corroborates it; `INFERRED` = reconciliation hypothesis; `CONFLICTING` = sources disagree; `UNKNOWN` = no adequate evidence; `STALE` = superseded/old snapshot; `BLOCKED_BY_ACCESS` = required source unavailable.

## Corporate map
| System/division | Reality and maturity | Canonical source | Status | Key boundary |
|---|---|---|---|---|
| Hermes Logistics | Commercial public site: dispatch, carrier onboarding/contract review, vehicle transport, resources, Load Board/demo tools | `src/pages/logistics`, `src/data/site.ts`, current `main` | CONFIRMED / PARTIAL_LIVE | Lead delivery is environment-gated; legal execution remains gated. |
| Hermes Marketing / SEO / GEO | Public service pages, measurement contracts, content/authority registries, GSC/Bing/GA4 evidence contracts | `src/pages/services`, `data/{seo,marketing}`, `docs/SEO*` | CONFIRMED / MEASUREMENT_BLOCKED | No authenticated measurement view in this audit. |
| Hermes IT / software | Website-development services plus Hermes Connect product family | `src/pages/services/website-development`, Connect runtime | CONFIRMED | Public claims must not expose internal architecture. |
| Hermes Connect / Repair Shops (STO) | D1-backed auth, profile, services, availability, public booking, CRM, follow-ups, feedback and plan request | `functions/api/{auth,repair-shop,public}`, `src/pages/services/hermes-connect` | CONFIRMED / PILOT_PAUSED | P0 #566 legacy bridge containment precedes outreach. |
| Academy / training / recruiting | Public program/application pages; authenticated enrollment, lessons, evidence, reviewer and support flows | `src/pages/academy`, `functions/api/academy` | CONFIRMED / PARTIAL_LIVE | Human eligibility/reviewer decisions remain required. |
| Sales / commercial ops | Qualified-inquiry definitions, manual receiver/lead contracts, carrier/repair activation handoffs | `docs/QUALIFIED_INQUIRY_DEFINITIONS.md`, receivers | SUPPORTED | Private CRM/actual outcomes not inspected. |
| Finance / commercial | Repair $99/month proposal and manual-close documentation; payment gates | `docs/REPAIR_SHOP_REVENUE_V1_2026-08-16.md`, compliance docs | SUPPORTED / OWNER_GATED | No payment system should be inferred as live. |
| AI infrastructure | HOS/HUEG, repo collaboration, Codex/FCC isolated runtime, Claude/Gemini/Antigravity local state | `ai-collaboration`, `scripts/ai`, local structure | CONFIRMED / PARTIAL | Router is not One Brain; provider/fallback proof remains incomplete. |
| Telegram / AI agents | Telegram auth endpoint and separate local ecosystem/agent workspaces exist | `functions/api/auth/telegram.ts`, local directory structure | SUPPORTED / UNKNOWN_OPERATIONAL | No token/config/message content inspected. |
| Legacy/recovery | `hermes-connect-next`, mobile, prototype, old website checkout, recovery package | local structure + Connect runtime status | CONFIRMED / RETAIN_PENDING_CLASSIFICATION | Do not delete or merge without dependency evidence. |

## Read-only source inventory
| Source | What was safely observed | Classification | Required next gate |
|---|---|---|---|
| `officeus-create/Hermes` | Remote `main` is `ff20f033`; 6 open PRs, 30 open issues, 703 closed PRs and 127 closed issues in the GitHub API window. | CANONICAL / CONFIRMED | Continue using GitHub issue/PR ownership and HOS receipts. |
| `~/Hermes` | Active local checkout is PR #862 head with pre-existing unrelated screenshot and `.claude/` changes. | ACTIVE_NONCANONICAL_CHECKOUT | Do not absorb unrelated working-tree changes. |
| `~/Projects/hermes-connect-next` | Full sibling checkout with substantial uncommitted GEO/public-surface work. | RECOVERY / MERGE_CANDIDATE | Diff and owner-select any unique, current-main-compatible slice. |
| `~/Projects/hermes-connect-mobile` | Separate full product tree including Android/iOS directories. | RETAIN_PROTECTED | Produce native-capability manifest before any consolidation. |
| `~/Projects/hermes-connect-prototype` + recovery package | Legacy source and recovery snapshot exist. | RETAIN_PENDING | Complete #567 dependency/traffic/API evidence before retirement. |
| `~/Documents/hermeslogisticus.com` | Older full repository checkout at an Aug-11 head with uncommitted work. | ARCHIVE_CANDIDATE | Preserve unique material; owner approves archival only after a diff. |
| `~/Documents/AI_WORKSPACE` | 17 named source lanes (mail, Drive sync, Telegram, task queue, handoffs, source-of-truth, archive). | PRIVATE_KNOWLEDGE_INDEX / NOT_READ | Use an approved, scoped connector and provenance policy; do not bulk-copy. |
| `~/Documents/{COO, Digital CEO, Мозг CEO Антигравити, Отдел маркетинга, Отдел прдаж}` | Structured business-workspace trees exist; Sales area is large. | PRIVATE_KNOWLEDGE / NOT_READ | Owner-approved source-by-source inventory/redaction plan; Database/CRM boundaries remain protected. |
| `~/.sales_knowledge_hub` | Separate operational-memory/Telegram runtime structure exists. | PRIVATE_OPERATIONAL_MEMORY / NOT_READ | Define retention, PII classification and a read-only approved connector before indexing. |
| `.claude`, `.codex`, `.codex-hermes`, `.gemini`, `.grok`, `.kimi-code`, `.fcc`, `.hermes-ai` | Multiple agent runtimes and session/config stores exist; Hermes FCC runtime is isolated. | TOOL_STATE / STRUCTURE_ONLY | Never ingest sessions, auth files, prompts or secrets; share sanitized handoffs instead. |

## Current GitHub ownership map
| PR | Writer-owned slice | HUEG/GitHub state at 2026-08-25 11:37 UTC | Corporate relevance |
|---|---|---|---|
| #865 | Hermes Codex browser/mobile control center and runner APIs | CLEAN; five checks SUCCESS | Potential task/evidence control surface; do not duplicate. |
| #862 | Local Hermes AI route benchmark | CLEAN; build and Pages SUCCESS | Runtime benchmark only; provider/fallback outcome remains unproven. |
| #861 | Intel macOS FCC bootstrap | CLEAN; contract/build/Pages SUCCESS | Isolated runtime bootstrap; no production routing claim. |
| #853 | Logistics SEO contextual support | CLEAN; build and Pages SUCCESS | Existing writer owns bounded SEO change; observation freeze applies. |
| #852 | Auction pickup winner depth | CLEAN; build and Pages SUCCESS | Existing writer owns bounded content depth; no new URL. |
| #788 | Beauty B1 owner preview | DRAFT; build and Pages SUCCESS | Separate Connect vertical preview; not a canonical replacement. |

## Public-surface observation
On 2026-08-25, HTTP 200 plus title/canonical were observed for the public home, dispatch, vehicle-request, SEO, website-development, Academy Logistics, Hermes Connect, and Repair Shops routes. `connect.hermeslogisticsus.com` returned a 308 to the canonical Hermes Connect service page and that target returned 200. This proves basic public reachability and canonical presentation only; it does **not** prove authenticated flows, form delivery, analytics receipt, conversion, or account configuration.

## Reality contradictions
1. **CONFLICTING:** `docs/ai-project-state.json` was reviewed 2026-08-15, but current-main docs record a newer #566 P0 security pilot gate and newer Academy/Connect work. Treat the JSON snapshot as stale for Connect activation.
2. **CONFLICTING:** historical Connect distribution/revenue documents describe public beta/pricing while the current runtime status says pilot outreach is paused by #566. Current runtime status wins for activation.
3. **CONFLICTING:** the local machine contains multiple full Hermes/Connect trees despite the one-workspace rule. They are evidence/recovery assets, not parallel canonical products.
4. **CONFIRMED:** 703 closed PRs and numerous retained remote refs are historical/recovery evidence, not automatically active work. GitHub read-only inspection confirms only six currently open PRs; their writer-owned file scopes are listed above.
5. **CONFLICTING:** older documentation calls authenticated GSC access confirmed, while this audit session has no approved GSC surface. That is a capability/evidence gap, not proof that the property disappeared.

## Corporate knowledge graph (conceptual)
`Hermes → {Logistics, Marketing, Academy, Technology, Connect}`; each division **owns** public pages and **produces** leads/events/evidence. `Website page → CTA → intake → receiver → private review → opportunity → outcome`; `GitHub issue/PR/CI → task/evidence → HOS/HUEG decision`; `AI employee → skill/permission → task → bounded tool → evidence`; `Connect identity → D1-scoped product record → booking/learning/support workflow`. Credentials are deliberately outside this graph's knowledge layer.
