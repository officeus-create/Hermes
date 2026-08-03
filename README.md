# Hermes Website

Production Astro website for `hermeslogisticsus.com`, deployed through Cloudflare Pages.

## Current status

- The current build contains 104 generated HTML routes, including 95 indexable URLs across seven sitemap files.
- Public directions include Hermes Logistics, Marketing, Hermes Business Academy, and Technology / IT.
- The public Academy contract contains exactly two programs: U.S. Logistics Operations and Marketing.
- Contact and Logistics workflows remain preview-first unless all approved production bindings and environment gates are present.
- Route estimation is repository-complete but disabled by default until Google Cloud and Cloudflare activation is verified.
- Hermes Connect remains product discovery / concept work; it is not represented as a live booking, payment, calendar, account, or autonomous AI product.

Route counts are enforced by the build and release-manifest tests. Do not maintain a handwritten list of every public URL in this file.

## Main architecture

- `src/pages/`: public pages, resources, cases, local clusters, Academy, demos, and product workspaces.
- `src/data/`: public content contracts, route ownership, entity records, release governance, and structured page data.
- `src/components/`: reusable public and preview-only interfaces.
- `src/lib/`: content, load-board, carrier, route, entity, measurement, and publication-gate logic.
- `functions/api/`: same-origin Cloudflare Pages Functions for approved server-side intake and route-estimate boundaries.
- `workers/lead-email/`: private Cloudflare Email Worker used behind a Pages Service Binding.
- `scripts/`: static, SEO, privacy, content, release, integration, and regression checks.
- `tests/`: desktop and mobile Playwright coverage.
- `docs/`: release manifests, activation gates, decision registers, and operating runbooks.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run test:e2e
```

The GitHub Actions workflow runs dependency security review, Astro build/check, the complete static suite, and Chromium workflow tests.

## Contact and lead delivery

General contact and Logistics intake are preview-first by default. Preview mode performs no automatic email, CRM write, load publication, carrier notification, payment, or external account action.

The Logistics production receiver is implemented in `functions/api/logistics-lead.ts`. It enforces:

- exact same-origin requests;
- JSON and body-size limits;
- allowlisted lead categories and server-built subjects;
- request ID and idempotency checks;
- KV-backed duplicate prevention and hashed-IP rate limiting;
- privacy-safe browser responses;
- explicit default-off delivery mode.

The supported production architecture is:

`browser → same-origin Pages Function → Service Binding → private Email Worker → Cloudflare Email Service`

The private Worker is implemented in `workers/lead-email/src/index.mjs`. It has fixed sender and destination configuration, no public route, a shared encrypted service-token boundary, and normalized provider errors.

Repository configuration examples:

- `wrangler.jsonc.example` — Pages Function, KV, Service Binding, and default-off delivery mode;
- `workers/lead-email/wrangler.jsonc.example` — private Worker and Email Service binding;
- `docs/CLOUDFLARE_LEAD_DELIVERY.md` — activation, verification, privacy, and rollback checklist.

Do not describe delivery as live until the Cloudflare account proves sender-domain authentication, fixed sender/destination restrictions, preview and production KV bindings, matching encrypted tokens, and reconciled synthetic deliveries.

## Load Board and route planning

`/load-board/` provides controlled preview workflows for carrier access and posted-load inquiries. It does not represent a connected public marketplace or automatic dispatch system.

The optional route-estimate foundation uses a server-only Google Routes request, strict same-origin validation, KV quota controls, explicit user interaction, and planning-only wording. It remains disabled unless the approved Google key, KV binding, origin, and live feature gates are configured. Route estimates are not quotes, truck routing, toll calculations, guaranteed ETAs, availability promises, or lead payload fields.

## Content and social pipeline

The review-first content pipeline reserves exactly 30 pilot slots:

- 10 Hermes Logistics;
- 10 ProgressoPro Marketing;
- 5 Hermes Business Academy;
- 5 Hermes IT / AI / automation.

Owner-supplied public sources can be registered without scraping. A source URL alone does not make a page publishable: transcript or substantial source text, date, rights, evidence, privacy, entity ownership, canonical owner, CTA, and manual approval are still required.

No infinite social feed, automatic social publishing, mass-generated thin pages, private-message ingestion, or unreviewed sitemap inclusion is allowed.

## Publication and rollback

The production domain is `hermeslogisticsus.com`. See:

- `docs/PUBLISHING_RUNBOOK.md` for release and rollback;
- `docs/RELEASE_MANIFEST_2026-08-01.md` for route reconciliation;
- `docs/GROK_SITE_AUDIT_REVIEW_2026-08-03.md` for the reviewed external audit;
- `docs/DESIGN_INTEGRATION_CONTRACT.md` for redesign boundaries.

Every production-facing change must pass build, static, privacy/SEO, and desktop/mobile browser checks. External account activation, billing, secrets, DNS, Search Console, CRM, email-sender verification, and real-user data remain separately authenticated actions.