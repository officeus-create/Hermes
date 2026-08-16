# Hermes Connect Runtime Status — 2026-08-16

Status: **CURRENT CANONICAL OPERATING NOTE**

This document records the production boundary after the Hermes Connect Repair Shop stabilization cycle. It does not authorize deletion of legacy runtimes, production data, recovery material, or native-mobile source.

## CURRENT PRODUCTION

### Canonical product family

- Repository source: `officeus-create/Hermes`.
- Production branch: `main`.
- Current verified main SHA at this checkpoint: `9ea76245caac15360e7c2dcf882bbe6e92758bf6`.
- Cloudflare Pages deployment for that SHA: **SUCCESS**.
- GitHub `build-and-test` for that SHA: **SUCCESS**.
- Primary public Hermes Connect product family: `/services/hermes-connect/`.
- Primary live vertical: `/services/hermes-connect/repair-shops/`.
- Shared auth/data direction: the canonical Repair Shop flow uses the existing Hermes Connect D1-backed identity/data layer rather than creating a second database or auth system.

### Repair Shops / STO

Current live-pilot flow:

1. owner registration / login;
2. shop profile;
3. services;
4. availability;
5. public booking link;
6. customer booking and vehicle details;
7. booking inbox / status history;
8. customer CRM;
9. private feedback;
10. consented Corporate Offer delivery;
11. private manager/source attribution;
12. direct auth mode links (`?mode=register|login`).

No second Repair Shop application should be created.

## BETA

- **Repair Shops / STO** is the only current live pilot vertical.
- Pilot objective: first 5–10 real repair shops using the full activation loop before choosing the next major feature.
- Product-development priority is operational learning, activation, booking conversion, support questions and missing-feature evidence — not demo feature expansion.

## DEMO / REFERENCE CAPABILITY

The following Hermes Connect modules are part of the product family but are not current live pilots unless separately promoted by verified production evidence:

- AI Command Center;
- Unified Inbox;
- Load Analyzer;
- Rate Negotiator;
- Proposal Builder;
- ROI Calculator;
- Business Automation.

Canonical pages must not present historical pricing, mocked success, unverified integrations, Brand V1/V2 claims, or a legacy workspace as current production behavior.

## LEGACY — DO NOT RETIRE YET

### `app.hermeslogisticsus.com`

Current classification: **UNIQUE_FUNCTION_MIGRATION_REQUIRED — usage check pending**.

Known evidence:

- separate Cloudflare Pages project: `hermes-connect-prototype`;
- historically used for the previous profile / availability / booking runtime;
- forensic evidence identifies D1-backed specialists, services, availability, sessions, bookings, CRM notes and staff-management structures;
- forensic evidence also identified a Telegram Login Widget and working booking flow;
- the modern canonical Hermes Connect flow now uses the same existing D1 family for shared identity/data and Repair Shop tables.

Therefore `app.hermeslogisticsus.com` must **not** be disabled, redirected, deleted or have its D1 data removed until an authenticated inspection answers all of the following:

1. which routes still receive real traffic;
2. whether any current users or sessions exist;
3. which API routes are called;
4. which D1 tables are read/written;
5. the deployed source/runtime SHA or immutable deployment identifier;
6. which capabilities remain unique versus current canonical Hermes Connect;
7. which external links still point to `app.hermeslogisticsus.com`.

Only after that evidence may the runtime be reclassified as `RETIRE`, `TEMPORARY_COMPATIBILITY`, or remain `UNIQUE_FUNCTION_MIGRATION_REQUIRED`.

### `connect.hermeslogisticsus.com` / old visual workspace

Treat historical visual workspace surfaces as **DEMO / COMPATIBILITY**, not as a second canonical application. User-facing current-product navigation should resolve to the canonical Hermes Connect product-family routes on the main site.

No domain/runtime should be disabled as part of a documentation or UI cleanup without separate dependency evidence.

## RECOVERY — DO NOT DELETE

- `hermes-connect-next`: retain until uncommitted files are reconciled; do not treat it as another product.
- `hermes-connect-mobile`: protected unique local source; local forensic evidence found 25 unique historical mobile commits plus uncommitted Capacitor material.
- Hermes Connect prototype recovery package: retain, including D1 recovery material.
- Telegram Hermes Connect bot: separate operational runtime; it is not a duplicate website copy.

## MOBILE SOURCE CLASSIFICATION

Do not publish APK, App Store or Google Play builds during the current Repair Shop pilot.

Current salvage policy for unique local mobile material:

- Capacitor configuration: **KEEP / PORT_TO_CANONICAL when native work resumes**.
- `@capacitor/app`, network, preferences and share integration: **PORT_TO_CANONICAL selectively** if they support the canonical responsive product without forking business logic.
- haptics: **KEEP as optional native UX**, not a web-product dependency.
- Android/iOS wrapper source: **KEEP**.
- signing/store metadata: **SECURITY/RELEASE ONLY**.
- generated Gradle caches/build outputs: **OBSOLETE / do not treat as source**.
- Brand V1/V2 mobile UI forks: **OBSOLETE or DUPLICATE unless a specific native-only behavior is proven unique**.
- monetization-deferred guardrail: **KEEP** if it continues to enforce the no-pricing/no-release boundary.

Remote branch `release/hermes-connect-mobile-v2-current-main` currently has no unique commits versus current `main`; the protected uniqueness is in the local Mac worktree and must not be inferred from the remote branch alone.

## SECURITY GATE

Before inviting the first real repair shops, complete a read-only audit of:

`/Users/progressopro/hermes_tunnel.py`

Required checks:

- inbound attack surface and bind interfaces/ports;
- authentication;
- accepted command format and validation;
- `subprocess`, `os.system`, `shell=True` or equivalent shell execution;
- shell injection paths;
- secret/env access;
- process privilege;
- LaunchAgent/autostart/persistence;
- realistic external exploitation path;
- severity;
- minimum safe fix.

If a realistic unauthenticated or weakly authenticated remote-command-execution path is confirmed at Critical/High severity, it becomes P0 and the real-user pilot pauses until contained.

This file is not present in the GitHub repository and was not available in the connected ChatGPT file library at this checkpoint, so no security conclusion is recorded here.

## PLANNED — AFTER STABILIZATION GATES

1. authenticated legacy `app.` dependency/usage inspection;
2. `hermes_tunnel.py` security audit;
3. read-only desktop/mobile regression by an independent tester;
4. first 5–10 real repair shops;
5. measure activation rate, time to first value, registration abandonment, profile completion, booking conversion, operational errors, support questions, repeat booking and requested missing features;
6. choose the next product feature only from observed pilot evidence.

## DO NOT DO YET

- Brand V2/V3;
- second Repair Shop product;
- new D1;
- new auth system;
- new generic workspace;
- pricing/subscriptions;
- App Store / Google Play release;
- desktop apps;
- large redesign;
- new vertical;
- AI feature expansion for demo value only;
- deletion of recovery material;
- retirement of `app.hermeslogisticsus.com` without dependency evidence.

## Documentation labels

Older Hermes Connect documents should remain available but be interpreted using explicit lifecycle labels:

- `CURRENT PRODUCTION`;
- `BETA`;
- `DEMO`;
- `LEGACY`;
- `RECOVERY`;
- `PLANNED`;
- `HISTORICAL / SUPERSEDED` where an older document conflicts with this checkpoint.
