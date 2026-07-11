# Hermes Website

Production-ready static Astro website for `hermeslogisticus.com`.

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
```

## Publication

The recommended zero-cost path is a private GitHub repository connected to Cloudflare Pages. See `docs/PUBLISHING_RUNBOOK.md` for the exact approval-gated sequence.
