# Hermes Website Agent Instructions

This file is read by Codex, Cursor, Claude, ChatGPT, and other coding agents working in this repository.

## First read

1. `docs/AI_START_HERE.md`
2. `docs/ai-project-state.json`
3. `docs/ERROR_REGISTER.md`
4. The current issue or bounded mission assigned in the prompt
5. `docs/DESIGN_INTEGRATION_CONTRACT.md`
6. `docs/PUBLIC_INFORMATION_POLICY.md`
7. Only the domain runbooks needed for the assigned task
8. The newest relevant entries in `docs/AI_HANDOFF.md` when historical continuity is needed

`README.md`, `CLAUDE.md`, `docs/AI_ROLES.md`, `docs/CODEX_WEBSITE_HANDOFF.md`, and numbered `docs/CURSOR_*_MISSION_*.md` are supporting or agent-specific documents. They do not override the current owner instruction, code/tests on `main`, the current project state, or an accepted bounded issue.

Before asking the owner for history, inspect the current branch, recent commits, open PRs, the project-state file, and the error register. Do not repeat work already recorded as complete.

## Project boundary

- The active local checkout is `/Users/progressopro/Hermes` (`~/Hermes`). Older documents may mention `/Users/progressopro/Documents/hermeslogisticus.com`; treat that as a legacy path.
- Work only inside this repository unless the owner explicitly assigns a connected external source.
- Do not read or modify Database Carrier, Digital CEO Bridge, CRM, manager queues, or private company records unless the current task explicitly requires that source and the approved connector is used.
- Do not publish internal AI prompts, routing rules, employee information, revenue targets, or unfinished experiments on the public website.
- Do not deploy, change DNS, push to `main`, send messages, or connect a live external service without the owner's explicit confirmation for that action.
- Do not add secrets or real credentials. Use environment-variable placeholders only.

## Engineering rules

- Preserve the functional contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md`.
- Do not redesign the website during a revenue sprint unless the owner explicitly changes the mission.
- Keep preview mode as the default.
- Make small, reviewable commits and do not overwrite unrelated work.
- Use existing Astro, TypeScript, Lucide, CSS, and Playwright patterns.
- Add tests for every behavior change.
- Never claim completion without current-head command output or a browser test.
- Use one active agent owner per task/branch; do not edit the same files in parallel without a written handoff.
- When a large or obsolete branch has diverged, prefer rebuilding the bounded change from current `main` over carrying unrelated history forward.
- Record discovered, resolved, superseded, and owner-required failures in `docs/ERROR_REGISTER.md`.

## Agent collaboration and delegation

The owner is the only CEO and final decision-maker. Agents are specialists operating from the same repository memory.

- Codex: primary coding agent when available.
- Claude Code: local Mac execution, shell, code, tests, commits, feature-branch pushes, and PR creation; becomes primary implementation agent when Codex is unavailable.
- Claude Web/Cowork: SEO/live-site audit, architecture and PR review, browser-connected checks, research, and precise implementation briefs; may write when repository access is available.
- ChatGPT: coordination, explanation, public research, connected GitHub/Drive/Gmail work, review, and bounded overflow execution.
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

A historical green run does not validate a newer head. Do not merge a red, stale, unexpectedly diverged, or untested PR.

## Handoff format

Append a concise entry to `docs/AI_HANDOFF.md` and report:

- agent and task owner;
- branch, commits, and PR;
- files changed;
- behavior delivered;
- tests passed on the current head;
- screenshots when UI changed;
- risks and assumptions;
- what remains incomplete;
- recommended next task and responsible agent.

Update `docs/ai-project-state.json` only when canonical project state materially changes. Update `docs/ERROR_REGISTER.md` whenever an error changes status. Keep `docs/CURSOR_WORK_LOG.md` updated only when a Cursor mission specifically requires it.