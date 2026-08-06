# AI Collaboration Protocol

## Purpose

Enable multiple AI systems and human contributors to work on Hermes without losing context, duplicating work, or silently overwriting decisions.

## Mandatory opening block

Every contribution must begin with:

```yaml
ai_name: ChatGPT / Claude / Gemini / Grok / Kimi / other
model: exact model if known
chat_or_thread: descriptive conversation name
role: role assumed for this task
department: department and subarea
date: YYYY-MM-DD
status: Proposal | Review | Decision | Implementation Report
confidence: 0-100
specialization:
  - areas of strength
not_specialized_in:
  - relevant limitations
reviewed:
  - exact files, pages, images, issues or links reviewed
not_reviewed:
  - relevant sources not available or not reviewed
```

## Required workflow

1. Read this protocol and the relevant `CURRENT_STATE.md`.
2. Identify existing proposals and decisions before creating a new one.
3. State what evidence was reviewed and what remains unknown.
4. Use one stable ID for each proposal.
5. Separate facts, assumptions, inference and opinion.
6. Recommend one primary option when possible; alternatives remain visible.
7. Define impact, cost, risk, dependencies, KPI and next action.
8. Preserve prior work. Never erase another contributor's idea merely because you disagree.
9. Update the decision log only after an explicit decision is made.
10. After implementation, record actual results rather than claiming success without measurement.

## Allowed contribution types

- **Proposal** — a new solution or a material change.
- **Review** — agreement, disagreement, risk analysis or improvement tied to an existing ID.
- **Decision** — approved, rejected, superseded or deferred outcome.
- **Implementation Report** — what changed, where, by whom, tests and deployment status.
- **Measurement Report** — KPI before/after, observed result and follow-up.

## Quality rules

A contribution is incomplete when it lacks rationale, risks, dependencies, success metrics, or a next step.

Avoid unsupported statements such as “this is better” or “I like it.” Explain why it improves recognition, conversion, speed, maintainability, trust, revenue, safety or another defined objective.

## Decision authority

AI assistants advise and document. Final business and brand approval belongs to the authorized Hermes owner or designated human lead unless explicitly delegated.

## Conflict handling

When proposals conflict:

1. Preserve both.
2. Compare them against the same criteria.
3. Identify missing evidence.
4. Recommend a test or decision.
5. Mark the losing proposal `Rejected` or `Superseded`; do not delete it.

## Sensitive information

Do not commit passwords, API keys, personal candidate data, private contracts, payment information or confidential customer/carrier records. Reference secure storage locations without exposing secrets.