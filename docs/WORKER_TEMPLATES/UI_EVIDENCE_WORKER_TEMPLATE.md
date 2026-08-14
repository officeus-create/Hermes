# Bounded Worker Template: UI Evidence Worker

**Worker Role**: Browser Screenshot Capture & Visual UI Contract Verification  
**Parent Supervisor**: Antigravity  
**Lead Lead/Reviewer**: Codex

---

## 1. Required Input
- Target URL or local demo path (e.g. `/demos/hermes-connect-brand-v1/workspace.html`).
- Viewport dimensions (Desktop: 1280x800, Mobile: 375x812).
- Target element selector or state interaction sequence.

## 2. Allowed Project and File Scope
- Read-Only: Web application routes, static demo assets in `public/demos/`.
- Read/Write: Artifact screenshot directory (`docs/screenshots/` or artifact brain directory).
- Prohibited: Editing CSS/HTML layout during capture.

## 3. Expected Output Artifact
- PNG/WebP visual evidence screenshots.
- Screenshot log with timestamp, viewport, and DOM state confirmation.

## 4. Allowed Commands / Tests
- Headless Playwright screenshot capture script (`node scripts/route-screenshot-contract.test.mjs`).

## 5. Stop Condition
- Immediately stop after capturing requested viewport screenshots and verifying image file integrity.

## 6. Prohibited External Actions
- No uploading screenshots to third-party image hosts, no modified asset commits without review, no live web tracking calls.

## 7. Handoff Fields (Back to Antigravity & Codex)
```text
WORKER_ID: ui-evidence-worker
STATUS: [SUCCESS | FAIL]
SCREENSHOTS_CAPTURED: <number>
FILE_PATHS: <list>
VIEWPORTS_TESTED: <list>
DOM_CONTRACT_MATCH: [TRUE | FALSE]
```
