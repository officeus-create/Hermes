# Hermes Website

Production-ready static Astro website for `hermeslogisticsus.com`.

## Status

- Production V1 is published at `https://hermeslogisticsus.com` through Cloudflare Pages.
- Data-driven Astro SSG with four business directions, Path Engine routes, audience routes, and vehicle-transport market pages.
- No form submission or data storage.
- No unsupported numeric claims or partner logos.
- The contact workflow remains in preview mode and performs no external write.

## Structure

- `src/data/site.ts`: structured content and claim register.
- `src/components`: reusable homepage and direction-page sections.
- `src/styles/global.css`: design tokens and responsive system.
- `src/pages/index.astro`: ecosystem homepage.
- `src/pages/paths/[slug].astro`: four generated direction pages.
- `src/data/logistics-locations.ts`: approved city/state market content and publication boundaries.
- `src/pages/logistics/[audience].astro`: shared SSG router for audience and market pages.
- `src/pages/sitemap.xml.ts`: sitemap generated from the same route data.
- `scripts/validate-build.mjs`: route, content, asset, form, and sitemap checks.

## Routes

- `/`
- `/paths/logistics/`
- `/paths/marketing/`
- `/paths/academy/`
- `/paths/technology/`

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run test:e2e
```

## Cloudflare and Wrangler

The repository uses Wrangler 4 and `wrangler.jsonc` as the local Cloudflare
configuration source. The current production target remains the existing
Cloudflare Pages project `hermes`; this setup does not migrate the site to a
new Worker and does not activate live lead delivery.

```bash
# Confirm Cloudflare authorization.
npm run cf:whoami

# Generate Cloudflare binding types without replacing Astro browser types.
npm run cf:types

# Build Astro and compile Pages Functions without deploying.
npm run cf:validate

# Build and run Pages locally.
npm run cf:dev

# Deploy a non-production staging branch after authorization.
npm run cf:deploy:staging
```

The `LEAD_LIMITS` KV namespace and `LEAD_EMAIL` binding are intentionally absent
from `wrangler.jsonc`. Enable them only after the Cloudflare account is
connected, Email Sending has verified `hermeslogisticsus.com`, a restricted KV
namespace is available, and the staging receiver test passes. Never place API
tokens or other secrets in this repository.

## Contact Workflow

The form uses `preview` mode by default and performs no network request. After a valid preview submission, the site shows a compact handoff panel with a plain-text request summary, a `Copy request` button, and the approved contact route for the selected business direction. Hermes Logistics may expose phone and email routes; Marketing, Academy, and IT Development use email only.

A future approved HTTPS receiver can be enabled with `PUBLIC_CONTACT_MODE=live` and `PUBLIC_CONTACT_ENDPOINT`; see `.env.example`. The receiving endpoint, privacy details, and `connect-src` policy must be reviewed before live activation.

The workflow includes native validation, length limits, consent, a honeypot, request IDs, idempotency headers, a ten-second timeout, and honest delivery-failure messaging.

Visual redesigns must preserve the contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md` and pass the build, static, and browser test suites.

## Homepage Entry Scene

The first direct homepage visit in a browser session opens an optional four-direction scene for Logistics, Marketing, Academy, and IT Development. Each direction receives a 3.2-second focus interval with a short audience statement and a direct route. The visitor can choose a direction, press Escape, skip immediately, or open the regular homepage. The scene does not run on hash links, repeat in the same session, or run when reduced motion is requested.

## Car Hauling Load Board Pilot

`/load-board/` has two local-first sales intake paths. Carriers and owner-operators can prepare a request for free Load Board access or identify a demo load they want to discuss. Customers, shippers, dealers, and brokers can prepare a posted-load request with route, vehicle, timing, condition, price, and contact details. The generated email subjects use clear Logistics Sales tags so the receiving team can distinguish `LOAD BOARD ACCESS / CARRIER` from `POSTED LOAD / CUSTOMER`, `SHIPPER`, `DEALER`, or `BROKER`.

Preview mode performs no network write, storage, automatic email delivery, CRM update, load publication, or carrier notification. It prepares a addressed email that the visitor can review and send from their email application. Automatic HTTPS delivery remains controlled by `PUBLIC_CONTACT_MODE=live` and an approved `PUBLIC_CONTACT_ENDPOINT`. Standard operable vehicles can pass the preview rules; tractors, unusual commodities, inoperable vehicles, multi-unit loads, incomplete requests, and bot-like submissions are held or rejected by explicit rules.

The protected same-origin receiver is implemented in
`functions/api/logistics-lead.ts` and covered by
`scripts/sales-lead-receiver.test.mjs`. It uses a fixed sales recipient and
server-built subjects, validates lead categories, rejects oversized or
cross-origin requests, and requires KV-backed deduplication/rate limiting.
Keep preview mode active until Cloudflare Email Sending, the verified sender,
and the restricted bindings from `wrangler.toml.example` are available and a
real delivery test has passed.

## Logistics Visitor Paths

The Logistics page begins with a visitor router for shippers/dealers, brokers, carriers/owner-operators, remote-agency candidates, job candidates, and students. Each audience has a dedicated static page and next action. Shippers, dealers, and brokers can open the Load Board preview; carriers can reach the carrier intake; agency and career candidates can prepare a local application preview; training routes to Hermes Business Academy.

## Vehicle Transport Markets

The Logistics page also exposes 14 substantial market guides: the existing Appleton route plus 13 reviewed city/state signals. Each page is generated from `src/data/logistics-locations.ts`, includes dealer/shipper/private-customer/carrier paths where applicable, route-specific planning context, request requirements, FAQ schema, breadcrumb schema, canonical metadata, and clear non-guarantee language.

City/state pages are request-intake guides. They do not claim that Hermes owns a local office, terminal, yard, or storage facility. Exact addresses and ZIP data render only from an explicitly `HERMES_VERIFIED` public-location object; the current dataset contains none. Merriam, San Martin, and Watsonville remain unpublished until completed-shipment or other approved operating evidence is available.

## Publication

The site is hosted in the Cloudflare Pages project `hermes` with the production domain `hermeslogisticsus.com`. See `docs/PUBLISHING_RUNBOOK.md` for release and rollback checks.
