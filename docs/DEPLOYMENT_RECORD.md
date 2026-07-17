# Hermes Production Deployment Record

## Current Production

- Date: 2026-07-17
- Domain: `https://hermeslogisticsus.com`
- Cloudflare Pages project: `hermes`
- Deployment preview: `https://33a3f69c.hermes-eu4.pages.dev`
- Build mode: Astro static output from `dist`
- Contact mode: preview only; no external form submission

## Verified

- Homepage and all four direction pages return HTTP 200.
- Contacts and privacy pages return HTTP 200.
- Invalid routes return the custom HTTP 404 response.
- Self-hosted Manrope, Source Sans 3, and IBM Plex Mono fonts load successfully.
- Desktop and mobile have no horizontal overflow or broken images.
- Portal hover and selection work in production.
- Production browser console has no CSP, script, font, or page errors.

## Rollback

Use the previous successful Cloudflare Pages production deployment if a regression is found. Keep the contact workflow in preview mode until a separately reviewed receiver is approved.
