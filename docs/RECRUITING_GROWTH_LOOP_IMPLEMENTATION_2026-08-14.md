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

100Hires example jobs/applications are test data and are not a production candidate source of truth.
