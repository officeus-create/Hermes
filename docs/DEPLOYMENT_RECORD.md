# Hermes Production Deployment Record

## Current public production

- Last independently confirmed deployment date: 2026-07-17
- Main domain: `https://hermeslogisticsus.com`
- Connect domain: `https://connect.hermeslogisticsus.com`
- Cloudflare Pages project expected to own the main release: `hermes`
- Last recorded deployment preview: `https://33a3f69c.hermes-eu4.pages.dev`
- Build mode: Astro static output from `dist`

## Approved repository release — 2026-08-05

The web-only Hermes Connect product and its main-site integration are complete in reviewed `main`:

- PR #234 merged as `c8a00e09649573ad8b229c495dc9b1045cb0a073`;
- PR #236 merged as `017c57930eb4afe35f83f2a96bf6a536e25b3143`;
- indexed overview: `/services/hermes-connect/`;
- homepage and Technology-section bridges;
- protected Web App access intake;
- six category-aware product paths;
- no iPhone, Android, App Store, Google Play, APK, TestFlight, native-download, or mobile-waitlist path;
- build, static contracts, SEO/schema/sitemap checks, receiver tests, release manifest, and desktop/mobile-browser tests passed.

## Current production classification

`REPOSITORY_RELEASE_COMPLETE / CUSTOM_DOMAIN_DEPLOYMENT_STALE`

Fresh public verification after the approved merges still observed the previous Connect title `Hermes Connect · Profile & Availability v0.3`, and the new main-domain overview was not yet available. Do not claim the Web App is live and do not submit a real access request until the controlled verifier reports `LIVE_APPROVED_WEB_APP`.

## Authoritative controlled deployment path

Workflow: `.github/workflows/cloudflare-pages-production-v2.yml`

The workflow always checks out reviewed `main`, builds `dist`, runs the static release suite, deploys to Cloudflare Pages project `hermes`, and verifies:

1. `https://hermeslogisticsus.com/services/hermes-connect/`;
2. the Hermes Connect Web App bridge on the homepage;
3. `https://connect.hermeslogisticsus.com/`.

The previous queued workflow and its temporary schedule were retired. The v2 workflow uses an isolated concurrency group with `cancel-in-progress: true`.

## Confirmed deployment blocker

The v2 workflow ran successfully through its credential preflight and confirmed that these GitHub Actions repository secrets are missing:

- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`.

No secret value was printed, stored in source control, or added to an issue.

### Secure activation

1. In Cloudflare, create a scoped API token for the account that owns Pages project `hermes`.
2. Grant only the permissions required to edit Cloudflare Pages deployments.
3. In GitHub repository settings, add the token as Actions secret `CLOUDFLARE_API_TOKEN`.
4. Add the account identifier as Actions secret `CLOUDFLARE_ACCOUNT_ID`.
5. Run the workflow **Deploy approved main to Cloudflare Pages v2**.
6. Keep Issue #232 open until the workflow confirms both the main domain and Connect custom domain.
7. Keep Issue #226 open until Pages/Workers ownership, production branch rules, bindings, and duplicate integrations are reconciled.

Do not paste the token or account identifier into an issue, pull request, commit, workflow input, chat message, or public documentation.

## Rollback

Use the previous successful Cloudflare Pages production deployment if the controlled release creates a regression. Keep the Hermes Connect surface `noindex,nofollow` until the approved Web App is confirmed on the custom domain and canonical ownership is explicitly approved.
