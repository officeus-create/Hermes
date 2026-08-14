# Hermes AI Start Here

Reviewed: 2026-08-14

This is the vendor-neutral entry point for every AI agent working on the Hermes repository: ChatGPT, Codex, Claude, Cursor, Gemini, Antigravity, Kimi, or another approved tool.

## 1. Read in this order

1. `docs/ai-project-state.json` — compact machine-readable current state, canonical revenue pages, completed capabilities, active blockers, approval gates, and the freshest labelled measurement handoff.
2. `AGENTS.md` — engineering boundaries, branch rules, tests, and handoff requirements.
3. `ai-collaboration/00_READ_FIRST/AI_COLLABORATION_PROTOCOL.md` — cross-agent ownership, evidence receipt, anti-loop, access, and handoff contract.
4. `ai-collaboration/00_READ_FIRST/CURRENT_STATE.md` — current global Hermes/SEO/product context and freshness boundary.
5. The current issue or bounded mission assigned to the branch.
6. The relevant department `ai-collaboration/<department>/CURRENT_STATE.md` and approved decision log when present.
7. `docs/ECOSYSTEM_COMPOUNDING_STANDARD.md` — required scan for safe multi-direction value, reuse, and deferred opportunities.
8. `docs/ERROR_REGISTER.md` — active, owner-required, resolved, and obsolete errors.
9. Only the domain documents relevant to the task.

Do **not** read the complete `docs/AI_HANDOFF.md` from the beginning unless a historical decision is disputed. It is an append-only audit journal, not the current project dashboard.

## 2. Canonical sources of truth

Use this precedence when documents disagree:

1. Current production-safe code and tests on `main` for what is actually implemented.
2. The current owner instruction and accepted GitHub issue/approved decision for the bounded task.
3. Newer authenticated platform evidence, with exact scope/date/evidence class, for platform facts such as GSC/Bing/GA4 state.
4. `docs/ai-project-state.json`.
5. `ai-collaboration/00_READ_FIRST/CURRENT_STATE.md` and the relevant department `CURRENT_STATE.md`.
6. `AGENTS.md` and the frozen contracts it references.
7. Domain runbooks and query-to-page maps.
8. The newest relevant entry in `docs/AI_HANDOFF.md`.
9. Agent-specific adapters such as `CLAUDE.md`.

Agent-specific files may add tool advice, but they must not redefine business priorities, page ownership, privacy rules, evidence classes, or approval gates.

If a newer approved decision or authenticated measurement contradicts `docs/ai-project-state.json` or a `CURRENT_STATE.md`, do not silently choose one and continue. Preserve the contradiction, update or explicitly mark the stale state in the same workstream, and then hand off from the refreshed source of truth.

## 3. Before changing anything

- Inspect `main`, the current branch, open PRs, recent commits, and changed files.
- Confirm one active execution owner for the task and branch.
- Search for an existing implementation, issue, PR, decision, measurement source, or superseding current-main branch.
- Record a baseline appropriate to the change: route ownership, metadata, generated page count, current CI, and available analytics/search evidence.
- Check overlap with Appleton/Codex, Shipment History, Load Board, trust pages, and commercial funnel work.
- Run the opportunity scan in `docs/ECOSYSTEM_COMPOUNDING_STANDARD.md` and distinguish immediate low-cost improvements from deferred follow-up work.
- Stop the specific package when there is a credible risk of index loss, canonical conflict, doorway duplication, privacy exposure, or untested production behavior. Continue only independent safe work.
- A passing bridge/self-test proves transport or document-contract health only. It does not prove that the transported context is current; verify freshness before execution.

## 4. Revenue priority

The primary commercial chain is:

`organic discovery → canonical commercial page → commercial CTA → intake start → preview ready → explicit handoff → human qualification → proposal/contract → revenue`

Canonical commercial owners are defined in `docs/ai-project-state.json`. Supporting pages must strengthen an existing owner through a distinct search intent and a natural internal link. Do not create a competing thin conversion page or wording-variant doorway page.

For SEO work, also read `ai-collaboration/02_SEO/CURRENT_STATE.md` and, while current, `ai-collaboration/02_SEO/SEO_AGENT_ROUTING_2026-08-14.md` before opening parallel implementation or measurement work.

## 5. Required safety boundaries

- Preview mode remains the default unless a separately approved live-delivery release is configured and tested.
- Never place names, email addresses, phone numbers, MC/USDOT, routes, submitted website URLs, budgets, messages, credentials, contracts, or payment details in GA4, public URLs, GitHub templates, screenshots, or public fixtures.
- Never invent people, offices, licenses, testimonials, case results, partnerships, rankings, traffic, revenue, or availability.
- No mass page generation, keyword stuffing, doorway pages, hidden text, PBNs, undisclosed paid links, fake reviews, spam directories, prohibited scraping, or virtual-office location claims.
- Search and backlink tools are clean-room public-research inputs only. Do not connect them to CRM, Shipment History, private repositories, customer files, or credentials.
- Do not transfer passwords, PATs, OAuth tokens, cookies, session exports, or private account identifiers from one AI to another. Each agent uses its own approved authenticated environment.

## 6. Change and verification protocol

Use a feature branch and a small PR. Keep unrelated generated files out of the diff.

Implement adjacent ecosystem value in the same PR only when it passes the gate in `docs/ECOSYSTEM_COMPOUNDING_STANDARD.md`: coherent objective, low risk, current-task relevance, no active-file collision, no unverified claims, no privacy exposure, and coverage by the current verification plan. Otherwise record a bounded follow-up.

Run in this order:

```bash
npm run build
npm test
npm run test:e2e
```

A change is not complete until the current head has a full green build, static/unit/registry validation, and desktop/mobile Playwright result. A green historical commit does not make a newer head green.

Never merge a red, stale, unreviewed, or unexpectedly diverged PR. Rebuild the bounded change on current `main` when that is safer than reconciling a large obsolete branch.

## 7. Handoff protocol

At completion:

1. Update `docs/ai-project-state.json` only when canonical state materially changed.
2. Update the applicable issue/source of truth with sanitized evidence and exact scope/date.
3. Append one concise entry to `docs/AI_HANDOFF.md` with branch, commits, PR, tests, remaining risks, next owner, and the ecosystem compounding scorecard when the current tool can safely append without overwriting unrelated history.
4. Update `docs/ERROR_REGISTER.md` when an error is discovered, resolved, superseded, or requires owner action.
5. Use the collaboration handoff envelope: status, changes, tests, evidence class, unknowns, rollback, next smallest step, and next owner.

Do not paste entire conversations into the repository. Store decisions, evidence, boundaries, and reproducible next steps.

## 8. Human-only or owner-confirmed actions

Explicit confirmation remains required for merge/deploy, DNS or Cloudflare account/configuration changes, billing/subscriptions/users/permissions, destructive deletion, credential handling, and sending public or private communications on the owner's behalf, unless the owner has explicitly delegated that exact bounded action in the current workstream.

A broad delegation does not authorize exposing secrets, bypassing repository checks, fabricating evidence, or changing unrelated account ownership/billing/security state. Connected inspection may identify a required action, but it does not authorize changing an unrelated sensitive setting or dismissing a security alert without verification.
