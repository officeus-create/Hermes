# Hermes Website Agent Instructions

This file is read by Cursor and other coding agents working in this repository.

## First read

1. `README.md`
2. `docs/CODEX_WEBSITE_HANDOFF.md`
3. `docs/DESIGN_INTEGRATION_CONTRACT.md`
4. `docs/PUBLIC_INFORMATION_POLICY.md`
5. `docs/CURSOR_FIRST_MISSION_REVENUE_SPRINT_01.md`
6. Read the newest numbered `docs/CURSOR_*_MISSION_*.md` assigned in the
   current prompt. The active mission is authoritative for its bounded scope.

## Project boundary

- Work only in `/Users/progressopro/Documents/hermeslogisticus.com`.
- Do not read or modify Database Carrier, Digital CEO Bridge, CRM, manager queues, or private company records.
- Do not publish internal AI prompts, routing rules, employee information, revenue targets, or unfinished experiments on the public website.
- Do not deploy, change DNS, push to `main`, send messages, or connect a live external service.
- Do not add secrets or real credentials. Use environment-variable placeholders only.

## Engineering rules

- Preserve the functional contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md`.
- Do not redesign the website during the revenue sprint.
- Keep preview mode as the default.
- Make small, reviewable commits and do not overwrite unrelated work.
- Use existing Astro, TypeScript, Lucide, CSS, and Playwright patterns.
- Add tests for every behavior change.
- Never claim completion without command output or a browser test.

## Required verification

Run all of these before handoff:

```bash
npm test
npm run build
npm run test:e2e
```

## Handoff format

Report:

- files changed;
- behavior delivered;
- tests passed;
- screenshots when UI changed;
- risks and assumptions;
- what remains incomplete;
- recommended next task.

Keep `docs/CURSOR_WORK_LOG.md` updated with facts learned while doing the work.
