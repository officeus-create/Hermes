# Hermes Website

Production-ready static Astro website for `hermeslogisticsus.com`.

## Status

- Local V1 is complete and ready for publication approval.
- Five public routes plus a custom 404 page.
- No form submission or data storage.
- No unsupported numeric claims or partner logos.
- No production publishing or DNS changes have been made.

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

## Publication

The recommended zero-cost path is a private GitHub repository connected to Cloudflare Pages. See `docs/PUBLISHING_RUNBOOK.md` for the exact approval-gated sequence.
