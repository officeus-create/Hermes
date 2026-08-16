# Hermes Connect Runtime Status — 2026-08-16

Status: **CURRENT CANONICAL OPERATING NOTE**

This document records the verified Hermes Connect boundary after the Repair Shop stabilization, compatibility-host consolidation, Design Track merge, mobile first-visit QA fix, and P0 local-bridge audit. It does not authorize deletion of legacy runtimes, production data, recovery material, native-mobile source, secrets, or external account access.

## CURRENT PRODUCTION

### Canonical product family

- Repository source: `officeus-create/Hermes`.
- Production branch: `main`.
- Current verified main SHA at this checkpoint: `dc2a88aac82d62f2d27f8aa8225871c227207ff6`.
- Cloudflare Pages deployment for that SHA: **SUCCESS**.
- GitHub `build-and-test` for that SHA: **SUCCESS**.
- Production route verification for that SHA: **SUCCESS**.
- Production consent verification for that SHA: **SUCCESS**.
- Current-main route screenshot workflow: **SUCCESS** on run `31956529810`; all 18 controlled observations returned HTTP 200. Those screenshots are `local-reviewed-build` visual QA and are explicitly **not** production-domain evidence.
- Primary public Hermes Connect product family: `/services/hermes-connect/`.
- Primary current vertical: `/services/hermes-connect/repair-shops/`.
- Shared auth/data direction: the canonical Repair Shop flow uses the existing Hermes Connect D1-backed identity/data layer rather than creating a second database or auth system.

### User-facing runtime consolidation

- `connect.hermeslogisticsus.com` is a compatibility entry, not a second current product. Human entry/workspace/mobile paths were canonicalized to the main Hermes Connect product-family routes while API/PWA/static compatibility behavior was preserved where required.
- Repair Shop referral capture remains server-side/private; raw attribution tokens are not carried into the public auth destination URL.
- Product-family language state is constrained to the supported Hermes Connect locale set.
- Historical workspace/demo surfaces remain explicit demo/compatibility material rather than current-product navigation.

### Current Design Track state

- PR #576 merged the selected Hermes visual language: **Hermes Knot silhouette + calm, short motion**.
- The large animated Knot is limited to the Product Hub visual focus area; deeper task routes retain a static brand mark rather than decorative continuous motion.
- `prefers-reduced-motion` removes the decorative animation; forced-colors hides the decorative object.
- Connect routes receive the Pearl header treatment from first paint instead of waiting for client-side enhancement.
- PR #578 fixed the 390×844 first-visit consent overlay that previously covered the primary Repair Shops CTA.
- Fresh screenshot evidence confirms the compact mobile consent panel sits below the primary `Open Repair Shops` action and preserves both consent choices.
- Mobile consent actions retain >=44px touch targets.

### Repair Shops / STO

Current canonical flow:

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

## BETA — EXTERNAL ACTIVATION PAUSED BY P0

- **Repair Shops / STO** remains the only current Hermes Connect live-pilot vertical.
- Pilot objective remains the first 5–10 real repair shops using the activation/booking loop before choosing the next major feature.
- Product-development priority is operational learning, activation, booking conversion, support questions and missing-feature evidence — not demo feature expansion.
- **Real external pilot outreach/activation is currently paused by security gate #566.** Product UX is not the blocker at this checkpoint.

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

Current classification: **TEMPORARY_COMPATIBILITY — retirement evidence pending**.

Known evidence:

- it is a separate preserved Cloudflare Pages runtime (`hermes-connect-prototype`);
- it historically contains profile / availability / booking behavior plus additional legacy structures;
- the canonical Repair Shop product now covers the first-user path required for the initial 5–10 pilots;
- no unique legacy capability should be ported pre-emptively;
- issue #567 remains the read-only retirement/classification gate.

`app.hermeslogisticsus.com` must **not** be disabled, redirected, deleted, or have its D1 data removed until authenticated evidence answers the remaining dependency questions, including current traffic/users/sessions, API/table activity, deployment identity, external links, and whether any unique capability is actually required by real pilot users.

Issue #567 is **not** a blocker for first-user pilot activation once #566 is contained. Legacy inspection may continue read-only in parallel with real-user learning.

### `connect.hermeslogisticsus.com` / old visual workspace

Treat historical visual workspace surfaces as **DEMO / COMPATIBILITY**, not as a second canonical application. User-facing current-product navigation resolves to the canonical Hermes Connect product-family routes on the main site.

No domain/runtime should be disabled as part of a documentation or UI cleanup without separate dependency evidence.

## RECOVERY — DO NOT DELETE

- `hermes-connect-next`: retain until uncommitted files are reconciled; do not treat it as another product.
- `hermes-connect-mobile`: protected unique local source; historical native-wrapper material must not be inferred from remote branch state alone.
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

Remote mobile branch state is not sufficient evidence for local protected-source uniqueness.

## SECURITY GATE — P0 / NOT CLEARED

Issue #566 is now a confirmed containment gate rather than an unaudited placeholder.

Read-only evidence established:

- the local Mac bridge `/Users/progressopro/hermes_tunnel.py` contains an unsafe arbitrary-command execution primitive;
- the tunnel process was **not running** at audit time;
- no audited LaunchAgent/cron/autostart reference was found;
- authenticated Drive evidence ties the legacy command source to `HERMES_CORE_OS` / `Agent_Commands`;
- that legacy command source currently has link-based public write access, so the upstream authorization boundary is not strong enough;
- a full bounded queue scan found **0 PENDING**, **0 RUNNING**, and **1 historical FAILED** command row;
- the command queue is therefore dormant rather than actively executing work;
- no evidence of active compromise was found;
- current Hermes Connect production code does **not** depend on this legacy local bridge;
- the Apps Script deployment/project ACL remains a blind spot and must not be assumed safe.

Security conclusion:

- **P0 / pilot gate NOT CLEARED**;
- this is containment/retirement work for a dormant legacy control plane, not evidence that the current Repair Shop Pages runtime is compromised;
- real Repair Shop outreach/activation remains paused until the unsafe path is contained and re-verified.

Minimum closure criteria before pilot activation:

1. keep the legacy tunnel stopped and without autostart;
2. remove public-writer access from the legacy command source and restrict access to explicitly approved principals;
3. verify the Apps Script project/deployment does not expose an uncontrolled write/control path;
4. disable/remove the arbitrary shell-command path locally, or retire the legacy tunnel entirely before it can be started again;
5. re-run read-only proof of process/autostart state, upstream ACL, and absence of a reachable arbitrary-command dispatcher.

Changing only one layer (for example only the Sheet ACL) is not sufficient while the arbitrary-command primitive remains startable.

Do not place direct writable-source identifiers, deployment URLs, secrets, or exploit payloads in public repository documentation.

## NEXT OPERATING SEQUENCE

1. contain and re-verify security gate #566;
2. only after #566 is cleared, validate the already prepared Milwaukee first-user prospect rows for duplicates/DNC/current phone/site/Maps state;
3. obtain explicit authorization before writing those vetted prospects into the authority `ACHEME` workbook tab;
4. contact one repair shop at a time and log every attempt/follow-up in the authority workbook;
5. target the first 5–10 real repair shops on the canonical Repair Shop flow;
6. measure activation rate, time to first value, registration abandonment, profile completion, booking conversion, operational errors, support questions, repeat booking and requested missing features;
7. keep issue #567 read-only in parallel; migrate a legacy capability only if real pilot evidence proves it is both unique and required;
8. choose the next product feature only from observed pilot evidence.

## DO NOT DO YET

- real Repair Shop outreach before #566 is cleared;
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
- retirement of `app.hermeslogisticsus.com` without dependency evidence;
- migration of legacy features merely because they exist;
- publication of writable control-plane identifiers/secrets in public docs.

## Documentation labels

Older Hermes Connect documents should remain available but be interpreted using explicit lifecycle labels:

- `CURRENT PRODUCTION`;
- `BETA`;
- `DEMO`;
- `LEGACY`;
- `RECOVERY`;
- `PLANNED`;
- `HISTORICAL / SUPERSEDED` where an older document conflicts with this checkpoint.
