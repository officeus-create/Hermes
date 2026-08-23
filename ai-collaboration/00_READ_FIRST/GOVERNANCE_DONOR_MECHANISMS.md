# Governance Donor Mechanisms

Grafted 2026-08-23 from an earlier ("Generation 1", 2026-07-10) Google Drive AI-governance system (`AI_COMMAND_CENTER/12_AI_GOVERNANCE_CONTROL`) that is otherwise superseded — its top-level task/handoff boards are stale, but this specific governance layer was never actually implemented anywhere live. Per owner directive (2026-08-23): don't rebuild from zero, recover and strengthen what already worked. These mechanisms are adopted here, adapted to the current DEC-007 peer-agent model (Codex and Claude as co-primary executors, not a fixed hierarchy).

Source: Drive docs `AI_CONFLICT_LOCK_AND_WORK_OWNERSHIP_PROTOCOL`, `AI_ARTIFACT_EVIDENCE_AND_STATUS_PROTOCOL`, `AI_AUTONOMY_APPROVAL_AND_EXTERNAL_ACTION_MATRIX`, `AI_RECOVERY_TAKEOVER_BUNDLE_TEMPLATE`, `AI_COST_AWARE_MODEL_ROUTING_PROTOCOL`, `AI_SYSTEM_HEALTH_AUDIT_CHECKLIST` (all 2026-07-10, folder id `1HuiMnjK2S_37ipIIwvVXTm0ji0gxLr8u`).

## 1. Autonomy matrix (A0–A5)

The most directly reusable mechanism found in the archaeology pass. Use this to decide, per action, whether an agent proceeds alone or needs approval — replaces ad-hoc judgment calls with a named tier.

- **A0 — Read/analyze/summarize.** No approval needed, any agent, any time.
- **A1 — Design/draft.** Needs an assigned task; drafts must be clearly labeled as drafts, not shipped.
- **A2 — Build in a safe workspace.** Needs standing task authorization (an open issue/PR is enough); sandbox tests, branches, no live data.
- **A3 — Controlled internal deployment.** Needs explicit task authorization *and* a stated rollback plan (staging, non-destructive triggers, test data only).
- **A4 — Live business action.** Needs explicit owner (Vladimir) approval unless a standing authorization already covers it (e.g. an approved recurring SEO delegation). Examples: client/carrier-facing emails, production CRM/telephony changes, publishing.
- **A5 — High-risk/irreversible.** Always needs explicit in-the-moment owner approval, no standing exception. Examples: payments, contracts, credential/DNS changes, deletions, bulk outbound communication.

Rule: autonomy continues until the next boundary is crossed — don't stop mid-tier to ask about something the current tier already covers. For A3–A5, state before acting: action / target / expected result / risk / rollback / test result / approval source / who is monitoring.

Standing rules regardless of tier: never overwrite raw business data silently; distinguish `DRAFT_CREATED` from `SENT`; never put secrets — or specifics of a known credential exposure — in shared docs, prompts, commits, or any other public/semi-public artifact. Known credential exposures are tracked only in the private security register; secret values and identifying exposure details must never enter public Git, shared prompts, or public artifacts.

## 2. Conflict-lock / work-ownership

One current editor per artifact; a task may have multiple reviewers. Before editing something another agent might be touching, check active tasks/handoffs. States: `available → claimed → in_progress → review_only → blocked → handoff_ready → released → stale`.

Stale-lock thresholds: quick task 2h, standard task 8h, long sprint = per checkpoint, critical incident 30min without a heartbeat.

Takeover checklist: confirm the original agent is actually unavailable → read the task/source-of-truth/latest revision/tests/risks → create a backup/branch before changing anything → log the takeover → continue only from the last *proven* state, not assumed progress → hand back when the original agent returns.

Conflicting versions are never auto-merged. Log a conflict record instead: conflict id, both versions, both owners, the actual differences, risk, recommended resolution, who decided, when resolved. For GitHub work this is naturally task-scoped branches; for Docs/Sheets, an explicit owner field plus separate draft tabs.

## 3. Evidence/status protocol

Seven status verbs — created / updated / tested / deployed / verified / sent / synchronized — each require specific evidence before being claimed. The ladder cannot skip stages: `idea → designed → drafted → created → tested → deployed → verified`. "Chat output is not an artifact" — a described automation isn't real until it's deployed *and* tested.

High-impact artifacts need independent verification — builder ≠ verifier. This is the direct ancestor of DEC-007's peer-review clause: under the peer-agent model, either Codex or Claude may build, but whichever one builds, the other (or the owner) verifies before it's called done.

## 4. Recovery takeover bundle (template)

When handing an unfinished task to another agent (including a future session of the same agent), include:
- Header: task/project, original + taking-over agent, reason, urgency, autonomy tier, objective.
- `LAST_PROVEN_STATE` — only what physically exists, with links/commit SHAs, not what was *intended*.
- Status by artifact; work completed (verified only) vs. work in progress; untested assumptions; open decisions; blockers.
- Tests run vs. tests still required.
- Safe next action (the smallest safe step, not the whole remaining task).
- Protected areas (explicitly out of scope for the taking-over agent).
- Hand-back condition (when does this return to the original owner).

## 5. Cost-aware model routing

Task classes: **C1** routine/low-effort, **C2** standard (structured docs, ordinary code), **C3** complex (plan with the strongest available reasoning, then execute at standard effort), **C4** critical (strongest model + independent review + explicit owner approval). Escalate a class when: two attempts already failed, requirements conflict, source data is uncertain, the action crosses an autonomy-tier boundary, or the current agent lacks the needed access.

## 6. Health audit (adapt to a periodic check, not yet automated)

Daily: every active task has an owner/status/next-step; no unproven created/tested/deployed claims sitting in current-state docs.
Weekly: no contradicting source-of-truth docs; stale locks released; no credentials in shared docs.
Monthly: one simulated takeover drill; review production automations/permissions; archive obsolete protocols.

Score across 7 dimensions when doing this: Continuity, Truth, Safety, Quality, Efficiency, Recovery, Clarity — green/yellow/red per dimension, not just an overall pass/fail.
