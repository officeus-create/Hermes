# Hermes Connect — Codex Product Handoff

Status: `ACTIVE WEB PRODUCT FUNNEL — CONTROLLED ACCESS`

## Owner intent

Hermes Connect is a category-aware Web App for service businesses. The current product direction is web-only. Do not create iPhone, Android, App Store, Google Play, APK, TestFlight, native-download, or mobile-waitlist paths unless the owner explicitly opens a new approved product phase.

The experience must help a visitor answer four questions quickly:

1. Is Hermes Connect relevant to my business category?
2. What client workflow will it improve?
3. What does the Web App do in the current controlled release?
4. What happens after I request access?

## Product and website connection

Hermes Connect has two connected public surfaces:

- product Web App entry point: `https://connect.hermeslogisticsus.com/`;
- indexed Hermes product overview: `https://hermeslogisticsus.com/services/hermes-connect/`.

The main Hermes homepage and IT Development path must link to the indexed overview. The overview must link to the Connect Web App. Keep copy and claims consistent across all three surfaces.

## Repository source of truth

The reviewed Web App funnel lives in:

- `public/demos/hermes-connect/index.html`
- `public/demos/hermes-connect/styles.css`
- `public/demos/hermes-connect/app.mjs`
- `public/demos/hermes-connect/profile-workspace.mjs`
- `functions/api/connect-lead.ts`
- `tests/hermes-connect-early-access.spec.ts`
- `scripts/connect-lead-receiver.test.mjs`

The main-site product bridge lives in:

- `src/pages/services/hermes-connect/index.astro`
- `src/components/TechnologyInteractivePrototypes.astro`
- `src/components/HomeTechnologyPreview.astro`
- `src/styles/features/hermes-connect-service.css`

Do not overwrite the repository-managed product files from a stale local prototype. `scripts/sync-product-demos.mjs` preserves them by default. An external import is allowed only when `HERMES_CONNECT_SOURCE_DIR` is explicitly set and the resulting diff is reviewed.

## Current categories

- Beauty & wellness
- Fitness & coaching
- Professional services
- Logistics & field services
- Education & events
- Home & local services

New categories should reuse the same catalog structure. Do not create thin or disconnected category landing pages before conversion evidence supports a separate route.

## Release path

The only current release path is:

- Hermes Connect Web App — controlled access from a modern desktop, tablet, or phone browser.

Do not mention or collect demand for mobile-store downloads in the current product funnel.

## Web access application contract

The page collects:

- name;
- work email;
- optional business/project name;
- role;
- approved category;
- optional team size;
- optional current booking/request method;
- one must-have workflow;
- consent.

The platform is always the public-safe value `web`; users do not choose a platform.

The request must not collect real client records, appointment details, payment details, credentials, private routes, medical information, or other sensitive operational data.

Applications use the exact-origin adapter at `/api/connect-lead`, which accepts only `https://connect.hermeslogisticsus.com`, rewrites the request into the protected Hermes inquiry contract, and preserves the fixed private delivery boundary. Foreign origins must fail before the private delivery service is called.

## Public product language

Approved framing:

- Hermes Connect Web App;
- controlled web access;
- works from a modern browser;
- category-aware service and request workflow;
- human review before access instructions;
- AI-assisted engineering workflow;
- Codex supports implementation;
- Hermes reviews privacy, tests, and release readiness.

Do not claim:

- an automatically created public account;
- confirmed booking or calendar integration;
- a live payment system;
- guaranteed acceptance or response time;
- a native mobile app or downloadable build;
- OpenAI endorsement or partnership;
- autonomous AI control of client or business actions.

## Codex implementation loop

1. Read the newest Hermes Connect issue and this handoff.
2. Confirm current `main`, open PR ownership, and the Connect deployment owner before editing.
3. Convert repeated applicant needs into one bounded issue with acceptance criteria.
4. Implement on a feature branch.
5. Keep the main-site overview, IT section, homepage bridge, and Web App copy aligned.
6. Add or update unit and Playwright coverage.
7. Run `npm run build`, `npm test`, and `npm run test:e2e` on the current head.
8. Confirm that preview commits do not replace `connect.hermeslogisticsus.com`.
9. Record the release commit and run the approved production smoke procedure before removing `noindex` from the Web App surface.

## Measurement boundary

Privacy-safe custom dimensions may include:

- category ID;
- fixed platform ID `web`;
- funnel event name;
- page path.

Do not place names, emails, business names, free-form workflow text, client data, addresses, or other personal/private details in analytics.

A category click is not an access request. A form start is not an access request. A successful receiver response is a delivered Web App access request, not an accepted account, booking, sale, subscription, or qualified commercial opportunity.

## Next bounded product tasks

After the web-only funnel and main-site bridge are green:

1. merge the reviewed release;
2. confirm the approved commit serves `connect.hermeslogisticsus.com`;
3. run one synthetic Web App access request through the approved production smoke procedure;
4. reconcile delivered requests with human review;
5. measure category demand for 7 and 28 days;
6. prioritize the first working product workflow from repeated applicant needs;
7. remove `noindex` from the Connect surface only after canonical ownership and discovery are explicitly approved.
