# Hermes Production Deployment Record

## Current Production

- Date: 2026-08-01
- Domain: `https://hermeslogisticsus.com`
- Cloudflare Pages project: `hermes`
- Deployment ID: `e29845f5-da6e-4d34-9d24-5d9bd561dac3`
- Deployment preview: `https://e29845f5.hermes-eu4.pages.dev`
- Deployed source commit: `7a8c56d`
- Build mode: Astro static output from `dist`
- Contact mode: preview only; no external form submission
- Bundle: 48 generated pages and 86 static files; no Pages Functions or
  internal Load Operations files included.

## Verified

- Homepage and all four direction pages return HTTP 200.
- Contacts and privacy pages return HTTP 200.
- Invalid routes return the custom HTTP 404 response.
- Self-hosted Manrope, Source Sans 3, and IBM Plex Mono fonts load successfully.
- Desktop and mobile have no horizontal overflow or broken images.
- Portal hover and selection work in production.
- Production browser console has no CSP, script, font, or page errors.
- The verified upload was an isolated static bundle; Pages Functions and the closed P0 Load Operations module were excluded.
- `/academy/casablanca-courses/` returns HTTP 200 on the production domain and
  immutable deployment. It remains `noindex,nofollow`, outside the sitemap,
  without schema or a form delivery action until course facts are approved.

## Rollback

Use the previous successful Cloudflare Pages production deployment if a regression is found. Keep the contact workflow in preview mode until a separately reviewed receiver is approved.
