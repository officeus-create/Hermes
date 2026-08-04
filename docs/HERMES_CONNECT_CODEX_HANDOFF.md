# Hermes Connect — Codex Product Handoff

Status: `ACTIVE PRODUCT FUNNEL — CONTROLLED EARLY ACCESS`

## Owner intent

Hermes Connect should become an attractive, category-aware product entry point that converts service businesses into reviewed early-access and future download applications.

The page must help a visitor answer four questions quickly:

1. Is Hermes Connect relevant to my business category?
2. What client workflow will it improve?
3. Which release path can I request: Web, iPhone, or Android?
4. What happens after I submit an application?

## Repository source of truth

The reviewed product funnel lives in:

- `public/demos/hermes-connect/index.html`
- `public/demos/hermes-connect/styles.css`
- `public/demos/hermes-connect/app.mjs`
- `public/demos/hermes-connect/profile-workspace.mjs`
- `functions/api/connect-lead.ts`
- `tests/hermes-connect-early-access.spec.ts`
- `scripts/connect-lead-receiver.test.mjs`

Do not overwrite these files from a stale local prototype. `scripts/sync-product-demos.mjs` now preserves the repository-managed funnel by default. An external import is allowed only when `HERMES_CONNECT_SOURCE_DIR` is explicitly set and the resulting diff is reviewed.

## Current categories

- Beauty & wellness
- Fitness & coaching
- Professional services
- Logistics & field services
- Education & events
- Home & local services

New categories should reuse the same catalog structure. Do not create disconnected landing pages before conversion evidence shows that a separate route is needed.

## Release paths

- Web app — first controlled release
- iPhone — download waitlist
- Android — download waitlist

Do not state that an App Store, TestFlight, Google Play, APK, native app, or downloadable build exists until the exact artifact and distribution process have been approved and verified.

## Application contract

The page collects:

- name;
- work email;
- optional business/project name;
- role;
- approved category;
- approved platform;
- optional team size;
- optional current booking/request method;
- one must-have workflow;
- consent.

It must not collect real client records, appointment details, payment details, credentials, private routes, medical information, or other sensitive operational data.

Applications use the exact-origin adapter at `/api/connect-lead`, which accepts only `https://connect.hermeslogisticsus.com`, rewrites the request into the existing protected Hermes inquiry contract, and preserves the fixed private delivery boundary. Foreign origins must fail before the private delivery service is called.

## Public product language

Approved framing:

- controlled early access;
- web-first release;
- iPhone and Android download waitlist;
- human review before access instructions;
- AI-assisted engineering workflow;
- Codex supports implementation;
- Hermes reviews privacy, tests and release readiness.

Do not claim:

- an active public account system;
- confirmed booking or calendar integration;
- a live payment system;
- guaranteed acceptance or response time;
- a downloadable mobile app before verification;
- OpenAI endorsement or partnership;
- autonomous AI control of client or business actions.

## Codex implementation loop

1. Read the newest Hermes Connect issue and this handoff.
2. Confirm current `main` and open PR ownership before editing.
3. Convert repeated applicant needs into one bounded issue with acceptance criteria.
4. Implement on a feature branch.
5. Add or update unit and Playwright coverage.
6. Run `npm run build`, `npm test`, and `npm run test:e2e` on the current head.
7. Keep the PR draft until Cloudflare preview/production isolation under Issue #226 is verified.
8. Record screenshots and a concise handoff before requesting merge approval.

## Measurement boundary

Privacy-safe custom dimensions may include:

- category ID;
- platform ID;
- funnel event name;
- page path.

Do not place names, emails, business names, free-form workflow text, client data, addresses, or other personal/private details in analytics.

A category click is not an application. A form start is not an application. A successful receiver response is a delivered application, not an accepted participant, account, download, booking, sale, or qualified commercial opportunity.

## Next bounded product tasks

After this funnel is green and deployment isolation is verified:

1. confirm the subdomain serves the reviewed commit;
2. run one synthetic application through the approved production smoke procedure;
3. reconcile delivered applications with human review;
4. measure category and platform demand for 7 and 28 days;
5. prioritize the first product workflow from repeated applicant needs;
6. create a controlled invitation and release artifact process;
7. remove `noindex` only after the owner approves public discovery and canonical ownership for the subdomain.
