# Recruiting Growth Loop implementation — 2026-08-14

Source of truth: GitHub issue #513

## Phase 1 — canonical job + safe intake bridge

Pilot: `Car Hauling Dispatcher — Remote / U.S. Market`.

Verified public facts are limited to facts visible in the active Hermes Logistics Work.ua posting and current owner instruction. Unsupported promotional claims from older external copy are intentionally excluded from the canonical page.

Phase 1 target:

`external board/search → /careers/car-hauling-dispatcher/ → application intake → existing protected Hermes delivery receiver → human recruiting review`

The candidate account/status layer in Hermes Connect is Phase 2. Do not pretend an account exists until the Connect custom-domain deployment and candidate identity/storage contract are verified.

## Evidence classification

- Work.ua active role facts: `PUBLIC_PLATFORM_VERIFIED` on 2026-08-14.
- Owner instruction to proceed with the recruiting loop: `OWNER_APPROVED_BOUNDED_EXECUTION`.
- Repository implementation and tests: `REPOSITORY_VERIFIED` only after current-head CI is green.
- Hermes Connect production status: remains separate from this phase; do not upgrade it without current production verification.

## Pilot public facts used

- title: Car Hauling Dispatcher
- remote
- full-time
- U.S. market / U.S. carrier operations
- candidates may be located internationally
- experienced and entry-level candidates are considered
- U.S. Central Time availability matters
- role-specific screening includes location, English/US logistics background, car-hauling experience, workload/results where applicable, and availability

Not carried forward without separate proof: employer-size claims, agency-count claims, superlative commission claims, or other promotional facts that are not needed to describe the role truthfully.

## Source attribution

Use non-PII source values only (`workua`, `staffam`, `linkedin`, `indeed`, `google`, `hermes_careers`, etc.). Never put candidate name, email, phone, resume content, or free-text answers in query parameters or analytics events.

## Phase 2 — Hermes Connect Jobs & Candidates

After current Connect production is independently verified, implement:

- candidate account create/resume;
- applications/status/next action;
- screening/tasks/training/interview/messages;
- HR pipeline with role/source/country/stage/next action/unread state;
- dedupe across candidate identity and role application;
- consent/retention contract;
- board→Connect→qualified/hired funnel measurement;
- 7d/28d retained candidate-user cohort.

Historical 100Hires example jobs/applications remain test data and are not a production candidate source of truth. This boundary does not apply to the separately verified public vacancy `https://100hires.com/j/G4ek3eN`, observed HTTP 200 on 2026-10-03 with public JobPosting data for the owner-approved Wisconsin Owner-Operator campaign. That exact listing and its employer directory may be used as public source links while the bounded recruiting review remains current; candidate receipt and hiring outcomes remain separate evidence.


## 2026-10-08 — Wisconsin request-time expiry (owner-assigned continuation)

- Owner: Codex / Wisconsin recruiting page, Project31; HR owns business verification and applicant receipt. Branch: `fix/wisconsin-vacancy-runtime-expiry-20261008`; base `d82279a8d81f5415137cefef4ac3cc656df52086` includes #1746, #1748 and #1747.
- Defect: registry eligibility was evaluated only at build time. An October 3 HTML build could retain active JobPosting/Apply and the hub's Verified open state after validThrough.
- Change: path-scoped Pages middleware evaluates the server clock on every request for the existing Wisconsin page and careers hub. At `2026-10-10T23:59:59Z` and later, no new review means no JobPosting or vacancy Apply; the reference page, recruiting phone, related resources, self-canonical, robots and sitemap remain. Hub no longer labels the expired vacancy open and keeps a reference link. Unrelated pages/root middleware are untouched.
- The seven-day owner-review window and dated owner source reference must both hold. Merely extending expiresAt cannot renew the October 3 review. A new review updates reviewedAt, matching owner evidence, expiry, source readback and visible dated copy; it does not prove business authority. No query/header/client-clock override. GET/HEAD remove conditional validators and use no-store headers to prevent stale 304/cached current-state reuse.
- Business-confirmation checklist (one HR/owner review): (1) truck+trailer requirement vs Power Only exception and trailer provision; (2) actual contracting/hiring organization and Hermes role; (3) exact MC/USDOT and active authority evidence; (4) insurance and responsibility; (5) an approved current partner program; (6) equipment/driver qualification, onboarding, written fees/deductions/settlement/exit; (7) ATS pipeline and named human who receives and follows up applications. All seven remain evidence blockers; no new operating terms are published.
- Verification: 399-page Astro build passed, full npm test passed; request-time expiry regression passed before/exact/after cutoff, same old HTML without rebuild, stale TTL extension, owner-review provenance, nested JobPosting/graph pruning, canonical/robots/link retention, cache validators, GET/HEAD and no client override. Both Pages route bundles passed esbuild. Desktop/mobile E2E attempted after recovering Astro preview startup, but all 12 selected cases could not launch missing Chromium 1228; browser download returned truncated/zero-byte archives. No local mobile acceptance claim. Exact-head CI/browser and Pages preview are required before release.
- Open-PR overlap check: no open PR owns these page/registry/panel/lifecycle files. Existing #1731 owns production-job-posting workflow and #1744 owns BaseLayout; neither file is edited. Shared docs #1679 hold unrelated entries; only this bounded recruiting section and a distinct error row are added.
- Rollback: remove the two scoped route middlewares and helper, revert lifecycle markers/copy/test delta; do not alter canonical or delete the recruiting owner. That rollback reintroduces build-only expiry and must be paired with a timely rebuild/source review.
- Release status: IMPLEMENTED / LOCAL_STATIC_VERIFIED, browser/edge/production PENDING. No merge, deployment, ATS mutation, applicant submission, notification, MC activation or human receipt claim. After approved release, verify expired fixture on Pages preview and current production source; at expiry verify raw response contains no JobPosting/Apply, the review message is visible and the careers hub count/links are honest. 100Hires itself remains a separate HR-controlled source and requires its own expiry review.
- Lesson: a date check in a static generator does not enforce runtime lifecycle. Expirable public claims need server-time validation, expiry-safe cache behavior and a before/at/after regression using the same built HTML.
