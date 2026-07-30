# Hermes Website Agent Instructions

This file is read by Codex, Cursor, Claude, ChatGPT, and other coding agents working in this repository.

## First read

1. `README.md`
2. `CLAUDE.md`
3. `docs/AI_ROLES.md`
4. `docs/AI_HANDOFF.md`
5. `docs/CODEX_WEBSITE_HANDOFF.md`
6. `docs/DESIGN_INTEGRATION_CONTRACT.md`
7. `docs/PUBLIC_INFORMATION_POLICY.md`
8. `docs/CURSOR_FIRST_MISSION_REVENUE_SPRINT_01.md`
9. Read the newest numbered `docs/CURSOR_*_MISSION_*.md` assigned in the current prompt. The active mission is authoritative for its bounded scope.

Before asking the owner for history, inspect the current branch, recent commits, open PRs, and the latest handoff entry. Do not repeat work already recorded as complete.

## Project boundary

- The active local checkout is `/Users/progressopro/Hermes` (`~/Hermes`). Older documents may mention `/Users/progressopro/Documents/hermeslogisticus.com`; treat that as a legacy path.
- Work only inside this repository unless the owner explicitly assigns a connected external source.
- Do not read or modify Database Carrier, Digital CEO Bridge, CRM, manager queues, or private company records unless the current task explicitly requires that source and the approved connector is used.
- Do not publish internal AI prompts, routing rules, employee information, revenue targets, or unfinished experiments on the public website.
- Do not deploy, change DNS, push to `main`, send messages, or connect a live external service without the owner's explicit confirmation for that action.
- Do not add secrets or real credentials. Use environment-variable placeholders only.

## Engineering rules

- Preserve the functional contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md`.
- Do not redesign the website during the revenue sprint unless the owner explicitly changes the mission.
- Keep preview mode as the default.
- Make small, reviewable commits and do not overwrite unrelated work.
- Use existing Astro, TypeScript, Lucide, CSS, and Playwright patterns.
- Add tests for every behavior change.
- Never claim completion without command output or a browser test.
- Use one active agent owner per task/branch; do not edit the same files in parallel without a written handoff.

## Agent collaboration and delegation

The owner is the only CEO and final decision-maker. Agents are specialists operating from the same repository memory.

- Codex: primary coding agent when available.
- Claude Code: local Mac execution, shell, code, tests, commits, feature-branch pushes, and PR creation; becomes primary implementation agent when Codex is unavailable.
- Claude Web/Cowork: SEO/live-site audit, architecture and PR review, browser-connected checks, research, and precise implementation briefs; may write when repository access is available.
- ChatGPT: coordination, explanation, public research, connected GitHub/Drive work, review, and bounded overflow execution.
- Other approved AI tools: specialist research or second opinions; verified conclusions must be written into the repository before implementation.

Use the lowest-cost capable agent for each task. If a task is context-heavy, delegate bounded sub-tasks through a compact prompt rather than consuming one agent's entire session. Full role and routing rules are in `docs/AI_ROLES.md`.

## Standing autonomy

Agents may, without repeated permission, audit, research, edit files, create feature branches, run checks, commit, push feature branches, open pull requests, and update project documentation/handoffs.

Explicit owner confirmation is still required for merge to `main`, production deployment, DNS/Cloudflare/account/billing/permission changes, deletions, credential handling, messages or public communications, and any standing permission-bypass/full-access mode.

## Required verification

Run all of these before handoff, in CI order:

```bash
npm run build
npm test
npm run test:e2e
```

## Handoff format

Append to `docs/AI_HANDOFF.md` and report:

- agent and task owner;
- branch, commits, and PR;
- files changed;
- behavior delivered;
- tests passed;
- screenshots when UI changed;
- risks and assumptions;
- what remains incomplete;
- recommended next task and responsible agent.

Keep `docs/CURSOR_WORK_LOG.md` updated when a Cursor mission specifically requires it.
