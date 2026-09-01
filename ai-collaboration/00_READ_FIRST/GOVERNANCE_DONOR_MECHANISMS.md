# Governance Donor Mechanisms

Grafted 2026-08-23 from an earlier ("Generation 1", 2026-07-10) Google Drive AI-governance system (`AI_COMMAND_CENTER/12_AI_GOVERNANCE_CONTROL`) that is otherwise superseded. Its top-level task/handoff boards are historical, but the mechanisms below remain useful. Per owner directive: do not rebuild One Brain from zero; recover strong mechanisms, preserve provenance, and adapt them to the current peer-agent / Hermes Operating Stack model.

Additional donor mechanisms were grafted 2026-09-01 from PR #871 (`audit/corporate-one-brain-2026-08-25`) after current-main comparison proved that the old PR remained stale as a whole but still contained a small set of unique governance controls. PR #871 remains source provenance, not a parallel control plane.

Source: Drive docs `AI_CONFLICT_LOCK_AND_WORK_OWNERSHIP_PROTOCOL`, `AI_ARTIFACT_EVIDENCE_AND_STATUS_PROTOCOL`, `AI_AUTONOMY_APPROVAL_AND_EXTERNAL_ACTION_MATRIX`, `AI_RECOVERY_TAKEOVER_BUNDLE_TEMPLATE`, `AI_COST_AWARE_MODEL_ROUTING_PROTOCOL`, `AI_SYSTEM_HEALTH_AUDIT_CHECKLIST` (2026-07-10), plus PR #871 donor docs `HERMES_ONE_BRAIN_BLUEPRINT.md`, `AI_WORKFORCE_24_7.md`, `CORPORATE_INTEGRATION_MAP.md` and related discovery material (2026-08-25).

## 1. Autonomy matrix (A0–A5)

Use a named tier instead of ad-hoc approval judgment.

- **A0 — Read/analyze/summarize.** No approval needed, any capable agent.
- **A1 — Design/draft.** Needs an assigned task; drafts remain clearly labelled drafts.
- **A2 — Build in a safe workspace.** Standing task authorization is enough; branches/sandboxes/test data, no live consequential mutation.
- **A3 — Controlled internal deployment.** Needs explicit task authorization and a rollback plan; staging/non-destructive triggers/test data only.
- **A4 — Live business action.** Needs explicit owner approval unless an existing standing authorization clearly covers the action.
- **A5 — High-risk/irreversible.** Explicit in-the-moment owner approval; no standing exception.

Typical A4/A5 boundaries include external client/carrier sends, consequential production CRM/telephony changes, publishing, contracts, payments, credential/security ownership changes, destructive deletion and irreversible migrations.

Rule: autonomy continues until the next tier boundary is crossed. Do not interrupt the owner for actions already covered by the current authorized tier. For A3–A5 record: action / target / expected result / risk / rollback / test result / approval source / monitor.

Standing rules regardless of tier: never silently overwrite raw business data; distinguish `DRAFT_CREATED` from `SENT`; never place secrets or identifying details of a known credential exposure in public Git, shared prompts or public/semi-public evidence. Private security records may store sanitized pointers, never secret values in ordinary knowledge docs.

## 2. Conflict lock / work ownership

One current writer per artifact; multiple reviewers are allowed. Before editing an artifact another agent may be touching, inspect the current router/handoff state.

Lifecycle: `available → claimed → in_progress → review_only → blocked → handoff_ready → released → stale`.

Suggested stale thresholds: quick task 2h, standard task 8h, long sprint by checkpoint, critical incident 30min without a heartbeat. These thresholds are operational defaults, not evidence that an executor is actually dead or disconnected.

Takeover checklist:
1. confirm the original executor is unavailable or the slice was explicitly transferred;
2. read source of truth, current task, latest revision, tests and risks;
3. create a branch/backup before mutation where relevant;
4. log takeover;
5. continue only from the last physically proven state;
6. hand back or release the lock when appropriate.

Conflicting versions are not silently auto-merged. Record the competing versions, owners, actual difference, risk, recommendation, decision and resolution evidence.

## 3. Evidence / status protocol

Status verbs such as `created`, `updated`, `tested`, `deployed`, `verified`, `sent`, `synchronized` require claim-matching evidence. The conceptual ladder cannot skip proof: `idea → designed → drafted → created → tested → deployed → verified`.

Chat output is not an artifact. A described automation is not real merely because an AI produced JSON or a plausible command transcript.

High-impact artifacts require independent verification where practical: builder != verifier. Peer authority does not mean two agents edit the same files at once.

HUEG in `HERMES_OPERATING_STACK.md` is the current promotion protocol and supersedes any looser historical interpretation of “done.”

## 4. Recovery takeover bundle

For unfinished work, include:
- task/project, original executor, takeover executor, reason, urgency, autonomy tier and objective;
- `LAST_PROVEN_STATE` with links/commit SHAs/artifact revisions;
- artifact status and verified completed work vs work-in-progress;
- untested assumptions and open decisions;
- tests run vs tests still required;
- smallest safe next action;
- protected/out-of-scope areas;
- hand-back or release condition.

Never hand off intended progress as if it already existed.

## 5. Capability- and cost-aware routing

Task classes:
- **C1** routine/low effort;
- **C2** standard structured work;
- **C3** complex — strongest available reasoning for plan/review, then bounded execution;
- **C4** critical — strongest available reasoning + independent review + appropriate owner gate.

Escalate when two attempts fail, requirements conflict, evidence is uncertain, a higher autonomy tier is crossed, or the current agent lacks the necessary verified access.

Routing is skill/capability first, model identity second. Codex, Claude, Gemini, ChatGPT, Antigravity and future agents may perform different roles depending on the current execution surface. Equal governance class never means fake equal capability.

## 6. Health audit

Daily:
- every active task has owner, lifecycle stage, next action and evidence requirement;
- no unproven `tested/deployed/live` claim sits in current-state docs;
- no duplicate writer owns the same artifact.

Weekly:
- no contradicting source-of-truth docs remain active;
- stale locks are released or explained;
- permissions and shared artifacts do not expose secrets or unsafe write access;
- false-done claims and reopened work are reviewed.

Monthly:
- run a simulated takeover drill;
- review production automations and permissions;
- archive obsolete protocols;
- review whether owner interruptions, duplicate work and access blockers are decreasing.

Score Continuity, Truth, Safety, Quality, Efficiency, Recovery and Clarity separately as green/yellow/red rather than hiding weak dimensions behind one overall score.

## 7. Memory tiers and promotion boundaries

Do not treat all remembered information as the same class. Use four conceptual memory tiers:

1. **Immutable evidence** — source artifacts, receipts, revisions, logs and other provenance-preserving proof. Evidence is retained according to its data/retention policy; it is not silently rewritten to fit a later narrative.
2. **Approved decisions** — current owner/governance decisions with scope, rationale, effective date and supersession chain.
3. **Working memory with expiry** — temporary hypotheses, task-local notes, cached summaries and intermediate state. It must carry freshness/expiry and cannot silently become durable truth.
4. **Untrusted proposals** — model output, imported ideas, recommendations and donor material that have not passed reconciliation. They are `SOURCE_ONLY` / `NEEDS_REVIEW`, never current canonical state by themselves.

Secrets are outside these knowledge tiers. Passwords, API keys, OAuth tokens, private keys and recovery values belong in an approved secret boundary, not One Brain memory.

Promotion is explicit: `proposal/working memory → source reconciliation → evidence/owner gate as applicable → approved decision or canonical knowledge`. Expired working memory is refreshed or discarded; it is not allowed to masquerade as a current fact.

## 8. Minimal registry and event contracts

The donor blueprint proposed useful conceptual contracts. These are schema ideas, not a claim that a new database or service already exists.

Where a machine-readable implementation is justified, preserve at least these semantics:

- **source registry:** source reference, owner, data class, canonical status, retention, connector/access state, freshness/last observed;
- **evidence registry:** claim, evidence class, source revision/time, verifier, limitation and retrievable evidence reference;
- **task registry:** objective, HOS stage, autonomy tier, writer lock, dependencies, budget, input/output, required evidence and owner gate;
- **agent registry:** verified skills/capabilities, read/write scope, prohibited actions, budget, fallback, execution surface and memory scope;
- **event envelope:** event ID, type, source reference, subject class, timestamp, dedupe/idempotency key and privacy level.

Do not create these registries merely to satisfy an architecture diagram. Reuse current One Brain/GitHub structures when they already cover the need; add machine-readable storage only when a real workflow requires it.

## 9. Bounded 24/7 worker controls

A continuously running agent loop must be bounded against runaway recursion, duplicate work and silent spending. Donor defaults that remain useful:

- per-agent/task budget appropriate to the workload;
- one active writer per artifact;
- queue TTL so abandoned work cannot remain silently actionable forever;
- bounded task depth (historical donor default: max depth 2 unless the current task contract explicitly authorizes otherwise);
- idempotency/dedupe key for repeated events and external-capable actions;
- circuit breaker after repeated failures, contradictory evidence or dependency outage;
- a task cannot recursively create work for itself indefinitely: every child task needs a business objective, evidence requirement and responsible owner/executor;
- provider/model fallback changes computation only; it never grants additional business-action authorization.

Schedules should default to observation, reconciliation and evidence production. A schedule does not itself authorize sends, account changes, deployments, payments or destructive mutations.

Useful audit cadence from the donor design: daily stale-task/lock/failed-CI/security/measurement freshness checks; weekly funnel/duplicate-source/unowned-work review; monthly access review, recovery drill, automation budget review and learning review.

## 10. Observability and connector contract

For material automated work, record enough metadata to explain both *what happened* and *why the system allowed it*. Useful fields include:

- event/source ID and source revision;
- task ID and HOS stage;
- executor/agent/model route and execution surface;
- permission/autonomy tier used;
- cost/latency where meaningful;
- tool/action class;
- output/artifact hash or revision where practical;
- evidence references and verifier verdict;
- impact cohort/business outcome reference where available;
- failure taxonomy / retry / circuit-breaker state.

Every connector or adapter that may enter the One Brain execution loop should declare: source owner, data class, read/write scope, trigger, idempotency/dedupe behavior, retention, audit logging, failure behavior, human escalation and rollback/recovery path.

Knowledge retrieval never grants credential access, and connector read permission never implies write/business-action permission.
