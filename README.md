# Hermes Website

Static Astro website and controlled Cloudflare edge workflows for `hermeslogisticsus.com`.

## Current status

- The production domain is live on Cloudflare Pages. Do not assume every `main` commit is deployed until the production snapshot or immutable deployment is reconciled.
- The 2026-08-03 release-manifest baseline contains **104 generated HTML routes**, **95 indexable routes**, and **7 sitemap files**. See `docs/RELEASE_MANIFEST_2026-08-01.md` rather than maintaining a manual route count here.
- Public language entry points currently cover English, Spanish, French, Ukrainian, Italian, and Russian.
- Hermes Business Academy exposes exactly two public programs: **U.S. Logistics Operations** and **Marketing**.
- Local and non-production contact workflows remain preview-first unless explicitly configured. The approved production custom-domain build routes Logistics, Marketing, Academy, IT Development, and general inquiries through the protected same-origin receiver, and it must not display success unless the receiver confirms delivery.
- Production inquiry delivery was verified end to end on 2026-08-04: the fixed destination received approved synthetic preview and production requests, foreign-origin rejection and duplicate suppression were proven, and the emergency rollback remains `LEAD_DELIVERY_MODE=off`.
- Google route estimates remain default-off and preview-only until separately approved Google Cloud and Cloudflare configuration is proven.
- Hermes Connect is an approved web-only access-request product funnel in `main`, with an indexed main-site overview, homepage/Technology bridges, protected exact-origin intake, and desktop/mobile-browser regression coverage. The approved custom-domain release is not considered live until the controlled Cloudflare deployment verifier reports `LIVE_APPROVED_WEB_APP`; native iPhone/Android, app-store, account, booking, calendar, payment, and autonomous-AI capabilities are not claimed.
- The social-content pilot has 30 controlled slots. Two owner-supplied Instagram sources are registered on hold; neither is approved for an indexable page without transcript, date, evidence, and claim review.

## Architecture

- `src/pages/` — public routes, resources, service pages, Academy pages, case studies, and noindex demos.
- `src/data/` — public content contracts, entity records, route definitions, research registries, and release governance.
- `src/lib/` — content, lead, route, product-demo, publication, and validation logic.
- `src/components/` — reusable page, intake, demo, navigation, and conversion components.
- `src/styles/` and `public/styles/` — shared and route-owned CSS bundles.
- `public/scripts/` — page-scoped browser enhancements with explicit privacy and network boundaries.
- `functions/api/` — Cloudflare Pages Functions for protected same-origin server workflows.
- `workers/lead-email/` — private Cloudflare Worker responsible for the Email Service binding.
- `scripts/` — build validation, SEO, privacy, content, data, release, and integration regression tests.
- `tests/` — Playwright desktop/mobile workflow and rendered-page coverage.
- `docs/` — release evidence, implementation boundaries, activation runbooks, and owner gates.

## Public route groups

The site is no longer a five-page brochure. Current route ownership includes:

- ecosystem homepage and four direction hubs;
- Logistics audience, service, carrier, broker, careers, agency, Load Board, and Wisconsin vehicle-transport routes;
- Academy program, application, process, and resource routes;
- Website Development, SEO, Local SEO, marketing, CRM, automation, and technology routes;
- resources, case studies, privacy, accessibility, editorial, and trust pages;
- multilingual entry points;
- noindex product and operations demos.

Every indexable route must have one canonical URL and exactly one declared sitemap owner. The committed release-manifest regression test enforces this boundary.

## Contact and lead delivery

Preview mode remains the default for local and non-production environments. A valid preview prepares a reviewable request summary and approved manual contact route without claiming that data was sent or stored.

The approved production custom-domain build routes Logistics, Marketing, Academy, IT Development, and general inquiries through the same protected receiver contract. A browser success state is allowed only after the approved receiver confirms delivery.

The production-delivery path is:

`browser → same-origin Pages Function → Service Binding → private Email Worker → Cloudflare Email Service`

Relevant files:

- `functions/api/logistics-lead.ts`
- `workers/lead-email/src/index.mjs`
- `wrangler.jsonc.example`
- `workers/lead-email/wrangler.jsonc.example`
- `docs/CLOUDFLARE_LEAD_DELIVERY_ACTIVATION.md`
- `scripts/sales-lead-receiver.test.mjs`

Production activation was reconciled on 2026-08-04 using the approved zero-cost verified-destination path:

- separate preview and production KV namespaces;
- private Email Worker with no public route;
- Service Binding and matching encrypted shared token;
- fixed approved destination;
- successful synthetic preview and production delivery;
- foreign-origin rejection;
- idempotent duplicate suppression;
- custom-domain production smoke coverage;
- no Google Workspace MX/DNS change;
- immediate rollback through `LEAD_DELIVERY_MODE=off`.

The receiver remains fail-closed when the live mode, binding, KV, encrypted token, destination, or provider confirmation is unavailable. A later migration to full paid Cloudflare Email Sending onboarding is an optional optimization, not a blocker for the verified current production path.

## Load Board and route estimate

`/load-board/` contains separate preview-first paths for carriers/owner-operators and customers/shippers/dealers/brokers. Server-controlled sales tags distinguish carrier-access requests from posted-load requests.

The optional route-estimate foundation uses a server-only Google Routes API request, strict same-origin checks, a minimal field mask, KV quota controls, and explicit user interaction. It does not provide truck navigation, price, quote, availability, toll, or guaranteed pickup/delivery timing. It remains disabled until Issue #12 external activation requirements are completed.

## Content pipeline

The review-first pipeline converts selected owner-controlled source material into possible website assets only after rights, entity, evidence, privacy, freshness, canonical-owner, CTA, duplication, and thin-content gates pass.

- Pilot register: `docs/content-pipeline-pilot-register.csv`
- Core logic: `src/lib/content-pipeline.ts`
- Publication gate: `src/lib/content-publication-gate.ts`
- Regression coverage: `scripts/content-pipeline.test.mjs`

A public social URL is not enough to publish an article or `VideoObject`. A useful transcript or substantial explanation, source date, stable media/thumbnail evidence, factual review, and human approval remain required.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run test:e2e
```

The GitHub Actions workflow additionally runs dependency security checks, the complete static/unit suite, and Chromium desktop/mobile workflows.

## Release and safety rules

- Keep secrets, account IDs, tokens, real leads, shipment data, private operational records, and credentials out of GitHub, rendered HTML, analytics, fixtures, screenshots, and public logs.
- Do not publish bulk city pages, routes, rates, capacity, offices, reviews, partners, cases, or operational claims without dated evidence and an approved canonical owner.
- Keep demos synthetic, noindex, and disconnected from real providers unless a separate release gate explicitly authorizes integration.
- Keep Academy wording aligned with `src/data/academy-public.ts` and `scripts/academy-public-contract.test.mjs`.
- Preserve the contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md` during visual changes.
- Use `docs/PUBLISHING_RUNBOOK.md` and the release manifest for deployment, production verification, and rollback.
