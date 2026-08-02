# Hermes AI Start Here

Reviewed: 2026-08-02

This is the vendor-neutral entry point for every AI agent working on the Hermes repository: ChatGPT, Codex, Claude, Cursor, Gemini, Kimi, or another approved tool.

## 1. Read in this order

1. `docs/ai-project-state.json` — compact current state, canonical revenue pages, completed capabilities, active blockers, and approval gates.
2. `AGENTS.md` — engineering boundaries, branch rules, tests, and handoff requirements.
3. The current issue or mission assigned to the branch.
4. `docs/ERROR_REGISTER.md` — active, owner-required, resolved, and obsolete errors.
5. Only the domain documents relevant to the task.

Do **not** read the complete `docs/AI_HANDOFF.md` from the beginning unless a historical decision is disputed. It is an append-only audit journal, not the current project dashboard.

## 2. Canonical sources of truth

Use this precedence when documents disagree:

1. Current production-safe code and tests on `main`.
2. The current owner instruction and accepted GitHub issue for the bounded task.
3. `docs/ai-project-state.json`.
4. `AGENTS.md` and the frozen contracts it references.
5. Domain runbooks and query-to-page maps.
6. The newest relevant entry in `docs/AI_HANDOFF.md`.
7. Agent-specific adapters such as `CLAUDE.md`.

Agent-specific files may add tool advice, but they must not redefine business priorities, page ownership, privacy rules, or approval gates.

## 3. Before changing anything

- Inspect `main`, the current branch, open PRs, recent commits, and changed files.
- Confirm one active owner for the task and branch.
- Search for an existing implementation, issue, PR, or superseding current-main branch.
- Record a baseline appropriate to the change: route ownership, metadata, generated page count, current CI, and available analytics/search evidence.
- Check overlap with Appleton/Codex, Shipment History, Load Board, trust pages, and commercial funnel work.
- Stop the specific package when there is a credible risk of index loss, canonical conflict, doorway duplication, privacy exposure, or untested production behavior. Continue only independent safe work.

## 4. Revenue priority

The primary commercial chain is:

`organic discovery → canonical commercial page → commercial CTA → intake start → preview ready → explicit handoff → human qualification → proposal/contract → revenue`

Canonical commercial owners:

- Car hauling dispatch: `/logistics/car-hauling-dispatch/`
- Website development: `/services/website-development/`
- SEO services: `/services/seo/`

Supporting pages must strengthen one of these owners through a distinct search intent and a natural internal link. Do not create a competing thin conversion page.

## 5. Required safety boundaries

- Preview mode remains the default unless a separately approved live-delivery release is configured and tested.
- Never place names, email addresses, phone numbers, MC/USDOT, routes, submitted website URLs, budgets, messages, credentials, contracts, or payment details in GA4, public URLs, GitHub templates, screenshots, or public fixtures.
- Never invent people, offices, licenses, testimonials, case results, partnerships, rankings, traffic, revenue, or availability.
- No mass page generation, keyword stuffing, doorway pages, hidden text, PBNs, undisclosed paid links, fake reviews, spam directories, prohibited scraping, or virtual-office location claims.
- Search and backlink tools are clean-room public-research inputs only. Do not connect them to CRM, Shipment History, private repositories, customer files, or credentials.

## 6. Change and verification protocol

Use a feature branch and a small PR. Keep unrelated generated files out of the diff.

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
2. Update the applicable issue checklist.
3. Append one concise entry to `docs/AI_HANDOFF.md` with branch, commits, PR, tests, remaining risks, and next owner.
4. Update `docs/ERROR_REGISTER.md` when an error is discovered, resolved, superseded, or requires owner action.

Do not paste entire conversations into the repository. Store decisions, evidence, boundaries, and reproducible next steps.

## 8. Human-only or owner-confirmed actions

Explicit confirmation remains required for merge/deploy, DNS or Cloudflare account/configuration changes, billing/subscriptions/users/permissions, destructive deletion, credential handling, and sending public or private communications on the owner's behalf.

Connected inspection may identify a required action, but it does not authorize changing an account setting or dismissing a security alert without verification.