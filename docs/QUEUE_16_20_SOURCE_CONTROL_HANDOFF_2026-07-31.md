# Queue Tasks 16–20 — Source Control and Handoff

Reviewed: 2026-07-31
Branch: `growth/58-task-expansion-sprint-v2`
Tracker: Issue #20 / draft PR #19

## Task 16 — obsolete handoff instructions

The following instruction families are obsolete when they conflict with current `main`, Issue #20, PR #19, or the canonical queue:

- instructions that treat PR #13 as unmerged;
- instructions that use old branch counts as current facts;
- instructions that authorize wholesale porting of PR #6 or PR #9;
- instructions that use `/uk/` as the current Ukrainian public path convention;
- instructions that treat historical Search Console, sitemap, GA4, console, or production observations as current without a dated recheck;
- instructions recommending legacy APIs when a current official API or architecture is required;
- instructions that imply direct connection of private operational spreadsheets to public routes;
- instructions that allow automatic publication from `completed` or `verified` shipment states.

Current source-of-truth order is defined in `docs/SOURCE_OF_TRUTH_INDEX_2026-07-31.md` and `docs/CODEX_CLAUDE_TAKEOVER_HANDOFF_2026-07-31.md`.

## Task 17 — duplicate recommendation control

Duplicate, obsolete, unsafe, and evidence-dependent recommendations are controlled by `docs/AI_RECOMMENDATION_REGISTER.md`.

Before implementation, every new cross-AI recommendation must be classified as one of:

- `SAFE_TO_IMPLEMENT`;
- `NEEDS_EVIDENCE`;
- `DUPLICATE_OR_IN_PROGRESS`;
- `OBSOLETE`;
- `REJECTED`.

No recommendation may bypass current-main conflict review, privacy rules, claim evidence, or publication gates.

## Task 18 — owner-only gates

Separate explicit owner approval is required for:

- merging any PR;
- production deployment;
- DNS or Cloudflare account changes;
- billing or paid subscriptions;
- API keys, credentials, secrets, or external account access;
- destructive deletion, force-push, or protected-branch replacement;
- external communications or provider outreach;
- connecting real CRM, TMS, Google Sheets, Shipment History, or load-board data;
- publishing prices, compensation, hiring status, course facts, routes, capacity, customer names, results, or guarantees not supported by approved sources.

These gates do not block safe documentation, synthetic tests, read-only prototypes, or evidence registries.

## Task 19 — clean next-action handoff

### Completed coordination package

- PR #13 confirmed incorporated into current `main`;
- PR #7 additive `#journey` fix reviewed and its head CI verified green;
- PR #6 and PR #9 classified; wholesale merge rejected;
- branch-conflict matrix created;
- source-of-truth index created;
- duplicate recommendation register created;
- owner-only gates recorded;
- Shipment History import-preview model and synthetic test files present in PR #19;
- current PR #19 remains draft and unsynchronized.

### Next safe action order

1. Audit current repository and production route inventories.
2. Audit frozen homepage anchors and navigation contracts.
3. Record P0–P3 development defects without changing runtime files.
4. Continue technical SEO verification that can be performed from current source.
5. Keep route/lane publication blocked until approved evidence exists.
6. Synchronize PR #19 with `main` only in an environment that can resolve conflicts and run the full build/test/e2e suite.

## Task 20 — visible blocker register

### Active blockers

- PR #19 is diverged from `main` and is not ready for review or merge.
- The latest PR #19 head has no confirmed complete CI run.
- Full branch synchronization, conflict resolution, build, and Playwright execution require a repository worktree/CLI environment.
- Historical lane publication is blocked until an approved sanitized origin-to-destination export is available.
- Real-data connection is blocked pending authentication, authorization, privacy, retention, and audit design.
- Academy pricing and detailed program claims are blocked pending written approval.
- Multilingual and location pages are blocked pending dated demand, competition, compliance, payment, response-capacity, and unique-value evidence.
- JobPosting schema is blocked unless each role is verified as currently open with complete visible facts.

### Non-blockers

The following may continue safely:

- source and route audits;
- technical SEO documentation;
- synthetic shipment-history tests and private prototypes;
- claim-safe carrier/dealer/shipper/broker content architecture;
- privacy-safe measurement specifications;
- official provider integration research;
- Careers and Academy governance documentation.

## Queue status

- Task 16: completed.
- Task 17: completed.
- Task 18: completed.
- Task 19: completed for this batch.
- Task 20: completed and remains continuously maintained.

Next queue section: tasks 21–23, route inventory and frozen homepage anchor verification.