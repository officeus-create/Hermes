# HAE — Ecosystem learning intake, source coverage and agent conversion (preflight)

**Observed:** 2026-10-26 (Kyiv)

**Status:** SOURCE / DRAFT_ONLY; not deployed, not autonomous ingestion.

**Canonical runtime owner:** [#2033](https://github.com/officeus-create/Hermes/issues/2033).

**Existing source contracts:** [historical learning](HERMES_AUTOMATION_ENGINE_HISTORICAL_LEARNING.md), [self-improvement](HERMES_HAE_SELF_IMPROVEMENT.md).

**Non-negotiable:** reuse existing HAE Worker + D1 + Queue + Cron; One Brain is the only canonical knowledge store. No second brain, database, scheduler, control plane, or independent agent with hidden privileges.

## CEO objective

Build one evidence-grounded digital workforce from existing Hermes private plugins. Initially it should study the authorized business corpus, locate canonical/current sources, discover contradictions, prove historical coverage, map knowledge to existing roles, identify missing skills (create new roles only after demonstrated capability gaps), and submit evaluated lessons/proposals. Later: execute bounded work via HAE, measure KPI, independently QA, and learn from accepted results.

A ChatGPT private plugin is a knowledge/skill surface. It does **not** become a continuously running agent merely because instructions were updated. Autonomous operation additionally requires an authorized executable capability, deterministic or free-AI provider, HAE job envelope, credentials controlled outside model prompts, runtime receipt and independent evaluation.

## Observed readback: inventory, not completeness

- Private Plugin Creator readback: **28** owned personal plugins accessible, including **27 Hermes-named roles plus one personal-health plugin that must remain outside Hermes business ingestion**.
- Compiled HAE plugin runtime registry currently contains **9** allowed roles, not all 28.
- Historical authenticated-version drift was observed on 2026-10-26. It is **superseded by the 2026-10-27 provider readback** in `docs/HERMES_HAE_PLUGIN_RELEASE_READBACK_2026-10-27.md`.
- Current reconciled HAE registry versions from that read-only Plugin Creator readback are:
  - hermes-automatic-engineer 0.1.26;
  - hermes-agent-coordinator 0.1.71;
  - hermes-technology-developer 0.1.56;
  - hermes-qa-evidence-auditor 0.1.8;
  - hermes-knowledge-curator 0.1.81;
  - hermes-marketing-growth 0.1.8;
  - hermes-search-growth 0.1.8;
  - hermes-academy 0.1.12;
  - hermes-dispatch-os 0.1.21.
- This reconciliation updates HAE source truth only. Plugin version equality still does **not** prove runtime compatibility, autonomous execution, or permission to dispatch/write; those remain separate protected gates.
- Google Drive search found "00 — HAE CURRENT STATE + ONE BRAIN AUDIT" (updated 2026-10-25), "CHAT ROUTING REGISTRY — HERMES ONE BRAIN — CURRENT", and "ONE BRAIN CONTROL LOOP"; a sample of CURRENT documents was read. This is not a complete Drive inventory.
- Existing historical evidence lake recorded in CURRENT HAE doc: 2,001 extracted items from 376 ChatGPT conversations / 1,229 structured decisions; Claude Wave 1 partial. These are historical claims to reconcile through source receipt and coverage, **not** proof of complete chat history.
- Gmail and additional communications are not automatically HAE-ingested merely because a ChatGPT connector exists.

## Source coverage checklist

| Source family | Initial honest state | First authorized action |
| --- | --- | --- |
| chatgpt_history | PARTIAL / export boundary UNKNOWN | Inventory accessible conversations, retain existing B001–B057 lineage; use owner-provided export for exhaustive history, do not claim a ChatGPT API for full archive |
| existing_chatgpt_evidence_lake | INDEX_ONLY / coverage unverified | Reconcile original 376-chat corpus, provenance and duplicate/superseded decisions |
| claude_archive | INDEX_ONLY / Wave 1 partial | Compare existing extraction batches, enumerate absent periods and unresolved source refs |
| google_drive_one_brain | READ_ONLY sample / PARTIAL | Metadata-only inventory by folder; identify CURRENT, SUPERSEDED, SOURCE_ONLY, versions, owner |
| authorized_gmail | ChatGPT connector available, no HAE adapter / UNKNOWN | Authorized mailbox inventory and scoped non-PII metadata projection; no mass forwarding, no third-party model ingest |
| github_ci | Existing #2067 draft / NOT LIVE | Finish #2084 gate, rebase/QA #2067 and prove real one-event D1 receipt |
| plugin_creator | READ_ONLY snapshot observed / PARTIAL | Enumerate all roles, read current manifests/versions, verify capability overlap and drift |
| cloudflare_runtime | Existing P0.1/P0.2/P0.3 accepted / PARTIAL | Read-only receipts tied to exact SHA; no new T4 canary/email |
| employee_communications | NOT AUTHORIZED / UNKNOWN | Explicit account/source-by-source access governance; no scraping personal chat histories |

Do **not** treat email addresses, message bodies, attached files, private Drive content, names/phones, tokens or recovery data as telemetry. The metadata-only preflight code rejects arbitrary fields; this is an initial boundary, **not** a complete privacy/redaction service. The existing data-policy explicitly reports `DECLARATIVE_PRE_ACTIVATION`. Any real PII-bearing ingestion requires separate policy, tenant/source-level permission, retention and enforced redaction/isolation before activation.

## Existing role graph — no new plugins now

1. **Knowledge Curator** — classifies source, extracts candidate lessons, dedupes, annotates CURRENT/SUPERSEDED/UNKNOWN, maps owner, prepares training receipts.
2. **Agent Coordinator** — resolves capability, dependencies, one writer, permissions and source freshness; never grants its own rights.
3. **Hermes Automatic Engineer** — implements bounded runtime integration and repair proposal under existing HAE.
4. **QA Evidence Auditor** — independently tests source, evaluation, change and KPI; cannot verify its own implementation.
5. **Access/Identity Governor + Security Engineer** — privacy, scoped connectors, entitlements, secrets and retention gate.
6. **CEO/COO** — approves necessary new digital job descriptions and consequential policies.
7. **Domain plugins** (SEO, GEO, Sales, Dispatch, Academy, Finance, Marketing, HR, Design, Technology, etc.) — domain truth and approved executable skills, not competing schedulers.

For each role, qualify `ROLE_ID → capability_id → source_scope → tool_allowlist → READ_ONLY/DRAFT_WRITE/LIVE_WRITE → evaluation → KPI → rollback → owner/QA`. A plugin update alone is `KNOWLEDGE_RELEASED`, never `AGENT_LIVE`.

### Digital-employee routing invariants carried forward

- One accountable plugin/role and one active implementation writer per task/file scope. Reviewers may verify, but they do not become parallel writers.
- If the current host cannot actually invoke the selected plugin/tool, record `ROUTED_NOT_EXECUTED`; never impersonate another plugin or claim autonomous inter-plugin communication.
- A new private plugin is allowed only after a **durable capability gap** is evidenced across the current role/capability inventory and skill extension of an existing owner has been ruled out. An individual task, chat, or temporary access failure is not a plugin gap.
- Every accepted lesson/skill change remains versioned evidence: source → bounded delta → independent eval → release/readback. A note, handoff or registry row alone is not learning.
- Search the current plugin directory/registry and canonical One Brain/GitHub owner before creating or routing anything new; historical plugin IDs/versions are evidence only and must not be copied into current authorization policy.

## Learning ladder (requires evidence at every step)

`SOURCE_INDEXED → SOURCE_READ_AUTHORIZED → COVERAGE_RECORDED → EXTRACTED_CANDIDATE → DEDUPED → CURRENT_VERIFIED → OWNER/DOMAIN REVIEW → SKILL_DELTA → EVAL_PASS → RELEASE_CREATED → RELEASE_READBACK → AGENT_CAPABILITY_ACCEPTED → LIVE_RECEIPT → KPI_MEASURED`

- Historical material can propose a skill or work item but cannot activate a provider write.
- Default to deterministic rules, then bounded Workers AI or attested free local model for semantic ambiguity only. No paid fallbacks and no mass emailing/contacts.
- Self-authored knowledge never promotes itself. No policy/skill change without separate QA and readback.
- Stable evidence link per claim; one canonical work id; source snapshots and age; no inferred zero when a source is unavailable.
- A complete **scoped batch** may propose reviewed lessons, but ecosystem-wide coverage remains PARTIAL until **every required family** has independent verified scan evidence and no unresolved gaps. No global completion percentage from search sample sizes.
- Detect ROLE_GAP only after capability dedupe against all existing roles; propose skill extension first, new plugin second.

## First acceptance sequence

1. **CURRENT gate**: #2084 exact-head CI → protected merge → read-only T4 D1/Gmail correlation; never re-trigger the one-off canary.
2. **Autonomy feed**: #2067 verified GitHub/CI intake → one stable WORK_ID → #2070 bounded self-backlog → #2068 DRAFT_ONLY repair → #2069 proposed reviewed lesson.
3. **Knowledge batch**: inventory One Brain + existing evidence lake + all 27 Hermes plugin manifests, record sources/candidates/coverage without raw contents in D1/GitHub.
4. **First role conversion**: run `history.coverage.evaluate` and `hae.self.improvement.audit` with real authorized read-only evidence; prove one job, exactly one D1 receipt, and independent QA. Then enable first domain pilot in SEO/GEO.
5. **Widen by scopes**: scoped Gmail metadata, Claude, ChatGPT export, then authorized employee communication archives. Apply source-level permission and missing-coverage truth for each; no broad extraction into public repo.

## Implementation introduced by this PR

`ecosystem-learning-preflight.mjs`: pure metadata-only fail-closed source inventory; nine explicit source families; no unclassified fields; null ≠ 0; no self-declared completeness; partial coverage cannot globally certify the ecosystem or promote knowledge/plugin updates. Test file enforces adversarial rejections.

This PR **does not** connect to Gmail/Drive/ChatGPT APIs, store data, mutate the production Worker, edit a private plugin, create a new D1 table, call paid AI, deploy or merge itself. Its evidence state is SOURCE until verified in the protected CI and subsequent live adapters.

## NEXT_ACTION

QA this preflight separately while #2084 remains the main P0 release owner. After #2084 accepted, integrate first read-only authorized source-metadata projection with existing historical-learning job types (not a new ledger), and add a test-backed isolated converter from approved source receipts into the canonical Knowledge Curator training candidate format. Track all remaining work under existing #2033 / #2067 / #2070 / #2068 / #2069, not a duplicate issue tree.
