# Bounded Worker Template: Build Worker

**Worker Role**: Bounded Static Build & Asset Compilation Execution  
**Parent Supervisor**: Antigravity  
**Lead Lead/Reviewer**: Codex

---

## 1. Required Input
- Target Astro/Node workspace path (e.g. `/Users/progressopro/Projects/hermes-connect-next`).
- Target build mode (`preview` default).
- Specific branch name (e.g. `feature/*`).

## 2. Allowed Project and File Scope
- Read/Write: `src/`, `public/`, `astro.config.mjs`, `package.json`, `tsconfig.json`.
- Read-Only: `docs/`, `scripts/`, `tests/`.
- Prohibited: Outside workspace, `.env*` secrets, external repos.

## 3. Expected Output Artifact
- Built static directory: `dist/`.
- Build log output or JSON build manifest (`dist/manifest.json` / console log).

## 4. Allowed Commands / Tests
- `npm run build`
- `npx astro check`
- `npx astro build`

## 5. Stop Condition
- Immediately stop upon clean completion of `dist/` generation or if `astro check` returns non-zero exit code.

## 6. Prohibited External Actions
- No `git push`, no production deployment trigger, no Cloudflare API calls, no network API mutations, no credential handling, no creation of child subagents.

## 7. Handoff Fields (Back to Antigravity & Codex)
```text
WORKER_ID: build-worker
STATUS: [SUCCESS | FAIL]
PAGES_BUILT: <number>
BUILD_TIME_SECONDS: <number>
ERRORS_DETECTED: <number>
LOG_SUMMARY: <summary>
```
