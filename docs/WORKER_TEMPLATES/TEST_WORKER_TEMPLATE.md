# Bounded Worker Template: Test Worker

**Worker Role**: Unit, Contract & E2E Verification Execution  
**Parent Supervisor**: Antigravity  
**Lead Lead/Reviewer**: Codex

---

## 1. Required Input
- Test suite scope (`npm test`, specific script, or Playwright spec).
- Active working branch head.

## 2. Allowed Project and File Scope
- Read-Only: Entire codebase, `tests/`, `scripts/`.
- Read/Write: Test result logs, coverage output, E2E trace artifacts in test output directories.
- Prohibited: Editing application logic in `src/` to force tests to pass (no masking symptoms or deleting assertions).

## 3. Expected Output Artifact
- Console test execution report.
- Exit code 0 confirmation or exact error log trace.

## 4. Allowed Commands / Tests
- `npm test`
- `node scripts/*.test.mjs`
- `npx playwright test [spec_path]`

## 5. Stop Condition
- Immediately stop upon completion of test suite run or first assertion failure (with full failure traceback captured).

## 6. Prohibited External Actions
- No commenting out failing assertions, no modifying test expectations without spec change approval, no network mutation.

## 7. Handoff Fields (Back to Antigravity & Codex)
```text
WORKER_ID: test-worker
STATUS: [PASS | FAIL]
CONTRACT_SCRIPTS_PASSED: <number>
E2E_SPECS_PASSED: <number>
FAILURES_COUNT: <number>
FAILED_SPEC_NAMES: <list>
RAW_LOG_LOCATION: <path>
```
