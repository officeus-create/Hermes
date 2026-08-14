# AI Collaboration Protocol

## Purpose

Enable multiple AI systems and human contributors to work on Hermes without losing context, duplicating work, silently overwriting decisions, or confusing repository evidence with authenticated platform evidence.

## Mandatory opening block

Every repository contribution must begin with:

```yaml
ai_name: ChatGPT / Codex / Claude / Gemini / Antigravity / Grok / Kimi / other
model: exact model if known
chat_or_thread: descriptive conversation name
role: role assumed for this task
department: department and subarea
date: YYYY-MM-DD
contribution_type: Proposal | Review | Decision | Implementation Report | Measurement Report
confidence: 0-100
task_id: stable issue / PR / proposal ID when one exists
source_of_truth: exact issue, decision, current-state file or approved owner instruction
authority_scope: Read-only | Draft | Branch write | Repository write | Platform read | Platform write | Human approval required
write_scope:
  - exact files, branches, issues or authenticated platforms that may be changed
specialization:
  - areas of strength
not_specialized_in:
  - relevant limitations
reviewed:
  - exact files, pages, images, issues, platform views or links reviewed
not_reviewed:
  - relevant sources not available or not reviewed
handoff_to: next owner or NONE
```

## Required workflow

1. Read this protocol and `00_READ_FIRST/CURRENT_STATE.md`.
2. Read the relevant department `CURRENT_STATE.md`, active source-of-truth issue and approved decisions before starting work.
3. Identify existing implementation, proposals and measurements before creating a new one.
4. State what evidence was actually reviewed and what remains unknown.
5. Use one stable task/proposal ID and one current source of truth whenever possible.
6. Separate facts, authenticated observations, repository verification, inference and opinion.
7. Recommend one primary option when possible; alternatives remain visible.
8. Define impact, cost, risk, dependencies, KPI, rollback and next action.
9. Preserve prior work. Never erase another contributor's idea merely because you disagree.
10. Update the decision log only after an explicit owner or delegated-lead decision.
11. After implementation, record actual tests and deployment state rather than claiming success without measurement.
12. After external measurement, record the exact date range and evidence class; never mix synthetic tests with business KPIs.
13. Before handing off, name the next owner, the smallest remaining task and the exact evidence they need.

## Task ownership and anti-loop rule

- One GitHub issue, decision or explicitly named work item should be the current source of truth for each active slice.
- One agent is the execution owner for a slice at a time. Other agents may review, challenge or supply evidence, but should not independently re-implement the same slice.
- A handoff must say what is complete, what is not complete, which files/platforms changed, what tests passed, and who owns the next step.
- If two agents disagree, preserve both findings and resolve them against the same evidence. Do not start an AI-to-AI ping-pong loop.
- If a newer approved decision or authenticated measurement contradicts a `CURRENT_STATE.md`, update the stale current-state document in the same workstream or explicitly mark it stale.
- A passing bridge/self-test proves the transport or document contract only; it does not prove that the context being transported is current.

## Evidence receipt

Any material external/search/analytics claim must carry a compact receipt:

```yaml
evidence_class: REPOSITORY_VERIFIED | PRODUCTION_VERIFIED | PLATFORM_VERIFIED | PRIVATE_OPERATIONS_VERIFIED | OWNER_PROVIDED_HANDOFF | UNVERIFIED
source: GSC | Bing | GA4 | production | GitHub | private operations | owner handoff | other
observed_at: YYYY-MM-DD or exact timestamp/date range
scope: page/query/site/event/workflow inspected
freshness: CURRENT | AGING | STALE | UNKNOWN
result: sanitized finding or aggregate metric
limitations: what this evidence does not prove
```

Rules:

- `REPOSITORY_VERIFIED` never proves indexing, rankings, analytics receipt, qualified leads or revenue.
- `PLATFORM_VERIFIED` requires an authenticated platform view/export or a trusted evidence handoff that explicitly says it was authenticated.
- `OWNER_PROVIDED_HANDOFF` may guide prioritization but must not be silently upgraded to direct platform verification by an agent that did not inspect the platform.
- Public search sampling is a discovery signal, not a replacement for Search Console/Bing Webmaster authenticated evidence.
- Measurements must include exact date ranges when available.

## Delegated authority

Final business and brand authority belongs to the authorized Hermes owner or designated human lead. The owner may delegate bounded autonomy for a department or task.

When autonomy is delegated:

- use the narrowest authenticated permission that completes the task;
- prefer reversible branch/PR changes for code and collaboration-system changes;
- preserve rollback information;
- destructive account actions, ownership transfers, credential rotation, billing changes and disclosure of secrets remain human-gated unless separately and explicitly authorized;
- never interpret broad task access as permission to expose credentials to another AI or commit them to GitHub.

## Allowed contribution types

- **Proposal** — a new solution or a material change.
- **Review** — agreement, disagreement, risk analysis or improvement tied to an existing ID.
- **Decision** — approved, rejected, superseded or deferred outcome.
- **Implementation Report** — what changed, where, by whom, tests and deployment status.
- **Measurement Report** — KPI before/after, evidence receipt, observed result and follow-up.

## Quality rules

A contribution is incomplete when it lacks rationale, risks, dependencies, success metrics, evidence classification, or a next step.

Avoid unsupported statements such as “this is better”, “SEO improved” or “the platform is connected”. Explain what was observed and why it improves recognition, conversion, speed, maintainability, trust, revenue, safety or another defined objective.

## Conflict handling

When proposals or measurements conflict:

1. Preserve both.
2. Normalize them to the same scope and date range.
3. Compare evidence classes and freshness.
4. Identify missing evidence.
5. Recommend a bounded test or owner decision.
6. Mark the losing proposal `Rejected` or `Superseded`; do not delete it.

## Sensitive information

Do not commit or transmit between agents passwords, API keys, PATs, OAuth refresh tokens, cookies, session exports, private account identifiers, personal candidate data, private contracts, payment information or confidential customer/carrier records.

Reference secure storage or authenticated access without exposing secrets. A receiving AI should obtain its own authorized connector/session instead of receiving another agent's raw credential material.
