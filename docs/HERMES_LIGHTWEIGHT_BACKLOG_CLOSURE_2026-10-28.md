# Hermes lightweight backlog closure — 30 bounded tasks

Date: 2026-10-28  
Stage: **DRAFT PR / NO LIVE WRITE**  
Scope: low-risk backlog items recovered from August–October 2026 workstreams. This file is a closure index, not a new control plane. Existing One Brain, GitHub owners, plugin contracts, HAE #2033 and current domain guardrails remain authoritative.

## Rules

- No merge, deploy, provider mutation, billing change, credential handling, outreach, production publication or destructive action is authorized by this document.
- Do not create a second One Brain, scheduler, queue, admin, plugin fleet or runtime.
- Every item below is implemented as a repository contract/checklist and is machine-checked by `scripts/hermes-lightweight-backlog-closure.test.mjs`.
- Runtime truth still requires runtime evidence. A documented contract is not proof that an agent or provider is live.

## A. Automation registry hygiene

**L01 — IMPLEMENTED — canonical automation fields.**  
Use: `automation_id, name, project, owner, purpose, status, trigger, provider, adapter, schedule, last_success, health, metric, cost, version, repository, endpoint`.

**L02 — IMPLEMENTED — automation disposition.**  
Every automation candidate is classified as exactly one of `AUTOMATE | KEEP_MANUAL | MERGE | OBSOLETE | BLOCKED | NEEDS_BUSINESS_DECISION`.

**L03 — IMPLEMENTED — schedule is not success.**  
A configured schedule, last-run timestamp or completed counter never proves execution success. Health requires a fresh result/evidence receipt.

**L04 — IMPLEMENTED — duplicate prevention.**  
Search the current automation registry and canonical owner before creating a new scheduled task. Prefer update/merge over parallel automation.

**L05 — IMPLEMENTED — owner/runtime separation.**  
Business owner, trigger, provider, adapter and scheduler are distinct fields. A provider or model never becomes the business source of truth.

## B. One Brain + plugin/agent governance

**L06 — IMPLEMENTED — canonical truth precedence.**  
Repository `main` + exact current task owner + fresh authenticated evidence + One Brain outrank historical handoffs, local caches and old screenshots.

**L07 — IMPLEMENTED — stale artifact classification.**  
Stale docs/PRs/registries must be labelled `KEEP | FIX | MERGE_INTO | SUPERSEDED | CLOSE`; each unresolved item gets one concrete `NEXT_ACTION`.

**L08 — IMPLEMENTED — plugins are knowledge packages.**  
A plugin release supplies role knowledge/contracts/skills. It is not a daemon, scheduler, live worker or proof of 24/7 execution.

**L09 — IMPLEMENTED — one runtime.**  
HAE #2033 remains the canonical persistent runtime/backlog. No second HAE, queue, D1, scheduler, command center or One Brain may be created for convenience.

**L10 — IMPLEMENTED — role contract binding.**  
Executable work binds `role_id, plugin_version, contract_version, source_scope, tool_allowlist, write_mode, evaluation, KPI, rollback, owner, QA` and an immutable source/contract digest where available.

## C. SEO/GEO/entity/profile registry

**L11 — IMPLEMENTED — business profile registry fields.**  
Each public profile/citation record tracks platform, canonical entity, URL, market, owner, status, evidence date, target canonical page and source class.

**L12 — IMPLEMENTED — deep-link + UTM discipline.**  
Profiles should deep-link to the relevant canonical owner where useful; campaign links use governed UTM fields instead of ad-hoc parameters.

**L13 — IMPLEMENTED — entity consistency.**  
Names, descriptions, canonical site, contact facts and service direction must match approved company facts. Conflicts are `UNKNOWN`/open defects, never silently normalized.

**L14 — IMPLEMENTED — profile quality state.**  
Track indexability/discoverability, quality, spam-risk, duplication and ownership. Directory count is never a KPI by itself.

**L15 — IMPLEMENTED — outcome chain.**  
Measure `PROFILE -> TRAFFIC -> CTA -> HUMAN_QUALIFIED -> OPPORTUNITY -> BUSINESS_RESULT` separately from `INDEXING` and `AI_VISIBILITY`. Do not collapse views/clicks/leads/revenue.

## D. Content and social lanes

**L16 — IMPLEMENTED — ProgressoPro content lane.**  
Every item declares audience, offer, proof source, canonical destination, CTA, publish state, UTM/attribution plan and business outcome field.

**L17 — IMPLEMENTED — Academy content lane.**  
Content follows Awareness -> Understanding -> Application and must identify the program/outcome owner, learner next step and evidence boundary.

**L18 — IMPLEMENTED — Threads/X lane.**  
Research, reply, engagement and publishing are separate capabilities. No autonomous mass replies; no algorithm claim without dated evidence.

**L19 — IMPLEMENTED — Instagram lane.**  
Reels/carousels/stories/profile work use the existing Marketing owner, Design quality review and evidence-to-business handoff; task skills are not new agents.

**L20 — IMPLEMENTED — social evidence ladder.**  
`VIEW != SESSION != LEAD != QUALIFIED_LEAD != OPPORTUNITY != REVENUE`. Synthetic/internal activity stays separate.

## E. Command Center status semantics

**L21 — IMPLEMENTED — progress calculation.**  
Progress is derived from accepted checklist/gate completion, not agent prose. Blocked external gates do not count as completed work.

**L22 — IMPLEMENTED — elapsed and duration.**  
Track `started_at, updated_at, completed_at` and calculate elapsed/duration from timestamps; never invent execution time.

**L23 — IMPLEMENTED — ETA semantics.**  
ETA may be `KNOWN | ESTIMATED | WAITING_DEPENDENCY | UNKNOWN`; dependency-blocked work must not show a fabricated countdown.

**L24 — IMPLEMENTED — execution/error states.**  
Use explicit states such as `RUNNING, BLOCKED, DEGRADED, WAITING_FREE_AI, WAITING_OWNER, FAILED, COMPLETE` plus evidence/last error/next action.

**L25 — IMPLEMENTED — navigation contract.**  
The unified command surface must expose links/ownership for Admin -> HAE -> Agents -> Plugins -> One Brain/Knowledge, plus local-agent online/offline status without treating localhost as cloud runtime.

## F. CI / work-intake hygiene

**L26 — IMPLEMENTED — CI failure triage.**  
For a red workflow capture repository, PR/branch, exact head SHA, workflow, job, failed step/annotation, current-main reproducibility and owner before proposing a fix.

**L27 — IMPLEMENTED — failure evidence fields.**  
A failure record includes `observed_at, source_ref, exact_sha, failure_class, evidence_ref, reproduced, impact, safe_next, rollback, owner, qa`.

**L28 — IMPLEMENTED — read-only first.**  
Do not blind-rerun, blind-redrive or mutate provider state when the failure cause is unknown. Read job/receipt state first and preserve idempotency evidence.

**L29 — IMPLEMENTED — one next action.**  
Every unresolved defect gets one smallest executable `NEXT_ACTION`; parallel speculative fix lists are not execution state.

**L30 — IMPLEMENTED — privacy and scope exclusion.**  
Do not place secrets, credentials, raw PII or private health data in public repo evidence. The personal-health plugin remains outside Hermes business ingestion/investor evidence.

## Machine-readable closure contract

The companion registry is `src/data/hermes-lightweight-backlog-closure-20261028.json`.

The CI contract requires:

1. exactly 30 unique task IDs `L01..L30`;
2. every task status = `IMPLEMENTED`;
3. every task has category, owner, source window, implementation summary and evidence files;
4. every evidence file exists in the repository;
5. this document contains the corresponding task ID and implementation marker;
6. global safety boundaries remain `no_live_write=true`, `no_second_control_plane=true`, `no_paid_fallback=true`.

## NEXT_ACTION

Independent review only. If CI is green, this PR may be considered for protected merge through the normal owner/review gate. No production action follows automatically.
