# Governance Donor Mechanisms

Grafted 2026-08-23 from an earlier ("Generation 1", 2026-07-10) Google Drive AI-governance system (`AI_COMMAND_CENTER/12_AI_GOVERNANCE_CONTROL`) that is otherwise superseded. Its top-level task/handoff boards are historical, but the mechanisms below remain useful. Per owner directive: do not rebuild One Brain from zero; recover strong mechanisms, preserve provenance, and adapt them to the current peer-agent / Hermes Operating Stack model.

Source: Drive docs `AI_CONFLICT_LOCK_AND_WORK_OWNERSHIP_PROTOCOL`, `AI_ARTIFACT_EVIDENCE_AND_STATUS_PROTOCOL`, `AI_AUTONOMY_APPROVAL_AND_EXTERNAL_ACTION_MATRIX`, `AI_RECOVERY_TAKEOVER_BUNDLE_TEMPLATE`, `AI_COST_AWARE_MODEL_ROUTING_PROTOCOL`, `AI_SYSTEM_HEALTH_AUDIT_CHECKLIST` (2026-07-10).

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
