# Bounded Worker Template: Documentation Worker

**Worker Role**: Technical Handoff, Handoff Journal Entry & Project State Synchronization  
**Parent Supervisor**: Antigravity  
**Lead Lead/Reviewer**: Codex

---

## 1. Required Input
- Completed workstream summary, git commit hash, branch name, and PR link.
- Verification command outputs (`npm run build`, `npm test`).
- Ecosystem compounding scorecard.

## 2. Allowed Project and File Scope
- Read/Write: `docs/AI_HANDOFF.md`, `docs/ai-project-state.json`, `docs/ERROR_REGISTER.md`, `docs/WORKER_TEMPLATES/`.
- Read-Only: All source code files and test logs for evidence verification.
- Prohibited: Editing prior agent handoff log entries (append-only rule for `docs/AI_HANDOFF.md`).

## 3. Expected Output Artifact
- Appended entry in `docs/AI_HANDOFF.md` following standard format.
- Shared handoff markdown document in `AI_WORKSPACE/13_AI_Handoffs/To_Codex/`.

## 4. Allowed Commands / Tests
- Read-only inspection commands, git status/log checks.

## 5. Stop Condition
- Immediately stop after documentation entry is appended and verified for accuracy.

## 6. Prohibited External Actions
- No publishing internal prompts or employee details, no deleting past handoff logs, no committing unverified or inaccurate claims.

## 7. Handoff Fields (Back to Antigravity & Codex)
```text
WORKER_ID: documentation-worker
STATUS: [SUCCESS | FAIL]
HANDOFF_FILE_UPDATED: <path>
COMMIT_HASH_RECORDED: <hash>
BRANCH_NAME: <branch>
ECOSYSTEM_SCORECARD_COMPLETE: [TRUE | FALSE]
```
