# Hermes Website

Production-ready static Astro website for `hermeslogisticsus.com`.

## Status

- Production V1 is published at `https://hermeslogisticsus.com` through Cloudflare Pages.
- Five public routes plus a custom 404 page.
- No form submission or data storage.
- No unsupported numeric claims or partner logos.
- The contact workflow remains in preview mode and performs no external write.

## Structure

- `src/data/site.ts`: structured content and claim register.
- `src/components`: reusable homepage and direction-page sections.
- `src/styles/global.css`: design tokens and responsive system.
- `src/pages/index.astro`: ecosystem homepage.
- `src/pages/paths/[slug].astro`: four generated direction pages.
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

## Contact Workflow

The form uses `preview` mode by default and performs no network request. After a valid preview submission, the site shows a compact handoff panel with a plain-text request summary, a `Copy request` button, and the approved contact route for the selected business direction. Hermes Logistics may expose phone and email routes; Marketing, Academy, and IT Development use email only.

A future approved HTTPS receiver can be enabled with `PUBLIC_CONTACT_MODE=live` and `PUBLIC_CONTACT_ENDPOINT`; see `.env.example`. The receiving endpoint, privacy details, and `connect-src` policy must be reviewed before live activation.

The workflow includes native validation, length limits, consent, a honeypot, request IDs, idempotency headers, a ten-second timeout, and honest delivery-failure messaging.

Visual redesigns must preserve the contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md` and pass the build, static, and browser test suites.

## Homepage Entry Scene

The first direct homepage visit in a browser session opens an optional four-direction scene for Logistics, Marketing, Academy, and IT Development. Each direction receives a 3.2-second focus interval with a short audience statement and a direct route. The visitor can choose a direction, press Escape, skip immediately, or open the regular homepage. The scene does not run on hash links, repeat in the same session, or run when reduced motion is requested.

## Car Hauling Load Board Pilot

`/load-board/` is a local-first dry-run intake for car-hauling requests from private parties, dealers, shippers, brokers, and other businesses. It validates the request in the browser and returns an explainable `approved`, `needs_more_information`, `quarantine`, or `rejected` decision with proposed internal routing and carrier-match tags.

The pilot performs no network write, storage, email delivery, CRM update, load publication, or carrier notification. Standard operable vehicles can pass the preview rules; tractors, unusual commodities, inoperable vehicles, multi-unit loads, incomplete requests, and bot-like submissions are held or rejected by explicit rules.

## Logistics Visitor Paths

The Logistics page begins with a visitor router for shippers/dealers, brokers, carriers/owner-operators, remote-agency candidates, job candidates, and students. Each audience has a dedicated static page and next action. Shippers, dealers, and brokers can open the Load Board preview; carriers can reach the carrier intake; agency and career candidates can prepare a local application preview; training routes to Hermes Business Academy.

## Publication

The site is hosted in the Cloudflare Pages project `hermes` with the production domain `hermeslogisticsus.com`. See `docs/PUBLISHING_RUNBOOK.md` for release and rollback checks.
