# One Local Hermes Workspace

Updated: 2026-08-23

## Canonical local root

All coding agents on the Mac must work from one physical repository root:

`/Users/progressopro/Hermes` (`~/Hermes`)

This is the only canonical local checkout. Every AI application should attach its project/workspace to this same directory.

`hermes-connect-next`, `/Users/progressopro/Documents/hermeslogisticus.com`, copied project folders, nested clones, and ad-hoc worktrees must not become independent sources of truth. If a legacy name is still needed by an application, it should resolve to `~/Hermes` as an alias/symlink after the old directory is verified and preserved safely.

## One repository, many workstreams

The numbered AI conversations are workstreams, not separate repositories:

1. `HERMES CORE` — global architecture, shared contracts, AI command center, canonical state.
2. `WEB` — website implementation, performance, release engineering, CI and production readiness.
3. `HERMES CONNECT` — Hermes Connect product, repair-shop onboarding, booking/CRM, mobile/PWA and revenue features.
4. `SEO` — technical SEO, organic authority, GSC/Bing measurement, search content and links.
5. `GEO` — public AI visibility, entity consistency, citations, answer-engine evidence and AI referrals.
6. `AUDIT` — independent QA, current-head verification, conflicts, regressions and decision review.

All six must read and write against the same `~/Hermes` checkout, use feature branches, and hand off through the same repository memory.

## Shared source-of-truth order

Before starting work, every AI should read:

1. `docs/AI_START_HERE.md`
2. `docs/ai-project-state.json`
3. `AGENTS.md`
4. `ai-collaboration/00_READ_FIRST/AI_COLLABORATION_PROTOCOL.md`
5. `ai-collaboration/00_READ_FIRST/CURRENT_STATE.md`
6. `ai-collaboration/workstreams/README.md`
7. The assigned issue/mission and only the domain docs required for that workstream.

Do not create a second project-state file in a workstream folder. `docs/ai-project-state.json` remains the compact canonical state.

## Local folder shape

```text
~/Hermes/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── docs/
│   ├── AI_START_HERE.md
│   ├── ai-project-state.json
│   ├── AI_HANDOFF.md
│   └── ERROR_REGISTER.md
├── ai-collaboration/
│   ├── 00_READ_FIRST/
│   ├── workstreams/
│   │   ├── 01_HERMES_CORE/
│   │   ├── 02_WEB/
│   │   ├── 03_HERMES_CONNECT/
│   │   ├── 04_SEO/
│   │   ├── 05_GEO/
│   │   └── 06_AUDIT/
│   └── templates/
├── src/
├── public/
├── functions/
├── scripts/
└── tests/
```

Existing department folders under `ai-collaboration/` may remain for durable domain knowledge. The `workstreams/` layer is only the routing layer that matches the six active AI conversations.

## Anti-duplication rules

- Do not clone Hermes again to solve an agent-specific problem.
- Do not copy `public/demos/hermes-connect/` into another repository to work on Connect.
- Do not create a separate SEO/GEO repository.
- Do not keep a private agent-only status file that contradicts canonical state.
- Do not use a stale local branch as evidence of production state.
- A historical green SHA does not validate a newer head.

## Branch ownership

Use one feature branch per bounded task. Different agents may work in parallel only when their changed-file sets do not collide or when an explicit handoff transfers ownership.

Suggested prefixes:

- `core/`
- `web/`
- `connect/`
- `seo/`
- `geo/`
- `audit/`

## Laptop normalization

Run `scripts/unify-ai-workspace-macos.sh --check` first. If it reports a safe normalization path, run it again with `--apply` from a local terminal or a local coding agent. The script never deletes a conflicting checkout; it stops and preserves evidence when the two directories differ.
