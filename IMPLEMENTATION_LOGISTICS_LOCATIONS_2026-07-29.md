# Hermes Website — Logistics Location Layer

## Implemented

- Preserved the existing `/logistics/[audience]/` URL architecture and extended the same Astro SSG router instead of creating a duplicate `/locations/logistics/` tree.
- Preserved the published Appleton URL.
- Added 13 reviewed city/state market pages: Pueblo, Colorado Springs, Springfield, Puyallup, University Park, Saint Paul, Royal Oak, Evanston, Englewood, Chicago, Austin, Milwaukee, and Littleton.
- Added audience-aware dealer and commercial-shipper content, plus private-customer and qualified-carrier paths.
- Added route-specific planning context, request checklist, five-step route-first review, equipment guidance, FAQs, and clear request-review boundaries.
- Added Service, BreadcrumbList, and FAQPage structured data.
- Added a Logistics market hub so location pages are not orphaned.
- Replaced the hand-maintained sitemap with a static Astro endpoint generated from the same audience, Path Engine, and location datasets.

## Publication controls

- No address from the Gemini conversation is published.
- No ZIP is presented as a Hermes facility or hub.
- Address or ZIP rendering requires an explicit `HERMES_VERIFIED` public-location object; the current public dataset has none.
- No fixed fee percentage, weekly gross, “high-paying,” 24/7, guaranteed capacity, or guaranteed-result claim is published.
- A market page is not represented as a local office, terminal, storage yard, live quote, booking confirmation, or proof of current capacity.
- Merriam, San Martin, and Watsonville remain in a non-public HOLD list until completed-shipment or other approved operating evidence is available.

## Verification contracts

- `astro check` must report zero diagnostics.
- Static validation checks every location route, canonical, robots directive, schema JSON, sitemap membership, address-block suppression, unsupported draft claims, and all internal links.
- Unit checks enforce 14 approved public pages, unique slugs, substantive planning/FAQ content, metadata length, verified-location controls, and separation of pending signals.
- Playwright checks the market hub, Appleton multi-audience CTAs and schemas, and the shipper-only audience branch on desktop and mobile.

## Validation result

- Astro diagnostics: 0 errors, 0 warnings, 0 hints.
- Static Astro build: 58 generated routes.
- Final HTML inventory: 61 pages, including local product demos.
- Broken internal links: 0.
- Static/unit suites: all passed.
- Cloudflare Pages Function compilation: passed.
- Playwright regression: 112 passed, 2 intentionally skipped, 0 failed across desktop and mobile.
- Visual review: Appleton desktop/mobile and the Logistics market hub passed responsive inspection.

## Deployment boundary

The implementation is ready for a staging deployment after the production Cloudflare account and GitHub repository are connected. Do not create a second Pages project or replace the existing domain architecture to bypass those access controls.
