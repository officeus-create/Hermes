# Hermes Website Design Integration Contract

STATUS: FUNCTIONAL_CORE_FROZEN_AT_V1_1

The design workstream may change layout, typography, colors, imagery, spacing, motion, and visual composition. It should preserve the functional contracts below.

## Routes To Preserve

- `/`
- `/paths/logistics/`
- `/paths/marketing/`
- `/paths/academy/`
- `/paths/technology/`
- `/privacy/`
- `/404.html`

## Functional Contracts

- Keep `#main-content`, `#paths`, `#journey`, `#about`, and `#contact` targets.
- Keep all four `/paths/{slug}/` links discoverable from the homepage.
- Keep the mobile menu button, `aria-expanded`, controlled menu, and Escape behavior.
- Keep contact field names: `name`, `email`, `path`, `message`, `website`, and `consent`.
- Keep `data-contact-form`, `data-contact-mode`, `data-contact-endpoint`, `data-form-alert`, and `data-form-status` hooks.
- Keep preview mode as the default and do not add a form `action`.
- Keep live delivery controlled only by `PUBLIC_CONTACT_MODE` and `PUBLIC_CONTACT_ENDPOINT`.
- Keep direction pages preselecting the matching contact option.
- Keep canonical, Open Graph, favicon, sitemap, robots, 404, security headers, and privacy route.
- Keep reduced-motion behavior and avoid horizontal overflow.

## Search / GEO non-regression contract

Design changes may improve presentation, hierarchy, navigation and conversion, but they must not silently redefine search ownership.

Before changing shared headers, sub-navigation, hero templates, locale chrome, Catalog/Insights discovery surfaces, or money-page layouts:

- Read `docs/SEARCH_GROWTH_GUARDRAIL.md`, `docs/ERROR_REGISTER.md`, and the freshest dated Search/Design handoff.
- Treat authenticated GSC/Bing/GA4 data as evidence, not as a bulk to-do list. A provider warning is actionable only when it still maps to a current canonical owner and is reproduced in current code/live behavior.
- Preserve existing canonical URL ownership. Do not create a second indexable route for the same intent, rename a public route, remove it from navigation, change its canonical, robots, sitemap or hreflang behavior, or convert it to a JS-only discovery path without an explicit migration plan and regression coverage.
- Shared navigation changes must preserve server-rendered links to the same canonical owners. Removing an old submenu is safe only when the replacement header/navigation exposes the required destinations in rendered HTML on desktop and mobile.
- Keep one useful, visible H1 and semantic heading order. Do not move search-critical copy into hidden-only, canvas/video-only, client-rendered-only, or inaccessible UI.
- Preserve schema, breadcrumbs, canonical tags, hreflang, Open Graph, robots, sitemap membership and internal-link context unless the bounded task explicitly owns those contracts.
- Hero/media redesigns must protect Core Web Vitals: stable dimensions/aspect ratio, no avoidable CLS, no eager-loading every visual, reduced-motion support, and an LCP-aware loading policy for the actual above-the-fold asset.
- Localized UI may translate visible labels, but stable field names, event hooks, canonical routes, locale ownership and approved hrefs must not drift. Do not create query-string locale duplicates when a canonical locale route already exists.
- Keep analytics/consent behavior intact. Design work must not add new analytics payload fields, send PII to analytics, bypass consent, duplicate page_view delivery, or remove the existing GA kill/withdrawal boundaries.
- Do not publish unsupported business, product-status, location, ranking, traffic, customer, revenue, availability or office claims as decorative copy.
- Do not add mass indexable pages, doorway variants, hidden SEO text, keyword stuffing, synthetic reviews, or artificial backlink surfaces as part of a redesign.

### Design PR search preflight

Use the narrow checks first when the touched surface overlaps Search, then run the full repository gate:

```bash
npm run build
npm run test:production-seo-hygiene-contract
npm run test:gsc-indexing-triage
npm run test:seo-owner-clarity
node scripts/hreflang-audit.test.mjs
node scripts/internal-link-audit.test.mjs
node scripts/performance-budget.test.mjs
npm test
npm run test:e2e
```

A design PR is not Search-safe because screenshots look correct. The current head must preserve the generated HTML/search contracts and desktop/mobile behavior.

## Required Checks After Design Changes

```bash
npm run build
npm test
npm run test:e2e
```

Expected result: zero Astro diagnostics and a fully green current-head validation/browser suite. Do not rely on historical pass counts because the test inventory changes over time.

## Out Of Scope For The Design Workstream

- production deployment;
- domain or DNS changes;
- contact endpoint selection;
- CRM, Google Sheets, email, Telegram, or analytics integration;
- changing business claims without source approval.
