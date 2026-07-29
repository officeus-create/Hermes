# Hermes Website Publishing Runbook

This runbook publishes the verified Astro release to the existing Cloudflare
Pages project `hermes`. It must not create a second Pages project, change DNS,
or activate live lead delivery.

## Release contract

- Existing Pages project: `hermes`
- Existing production domain: `hermeslogisticsus.com`
- Build output: `dist`
- Current release inventory: 58 generated Astro routes and 61 HTML pages
- Lead workflow: preview only
- Disabled production bindings: `LEAD_LIMITS` and `LEAD_EMAIL`

Stop if the authenticated account does not expose exactly the intended
`hermes` project or if its production domain does not match
`hermeslogisticsus.com`.

## 1. Authenticate and identify the existing project

```bash
npm run cf:whoami
npx wrangler pages project list --json
npx wrangler pages deployment list --project-name hermes --environment production --json
```

Record the current production deployment ID, URL, creation time, and the
project's confirmed production branch before uploading anything. Do not run
`wrangler pages project create`.

## 2. Reproduce the verified release

```bash
npm ci
npm run cf:types
npm run cf:validate
npm test
npm run test:e2e
```

Required results:

- Astro diagnostics: 0 errors, 0 warnings, 0 hints
- Static inventory: 61 HTML pages
- Broken internal links: 0
- Pages Function: compiled successfully
- Playwright: 112 passed, 2 intentionally skipped, 0 failed

Do not deploy if the generated route count, sitemap, canonical URLs, schema
metadata, or test totals differ unexpectedly.

## 3. Create and verify a preview deployment

```bash
npm run cf:deploy:staging
npx wrangler pages deployment list --project-name hermes --environment preview --json
```

Open the new staging deployment and verify:

1. `/`, `/paths/logistics/`, `/paths/marketing/`, `/paths/academy/`, and
   `/paths/technology/`
2. `/load-board/` and the audience routes under `/logistics/`
3. Appleton plus all 13 approved vehicle-transport market routes
4. Desktop and mobile navigation, forms, CTA routing, language pages, and 404
5. `/sitemap.xml`, canonical links, FAQ schema, breadcrumb schema, `_headers`,
   and the `/it-development` redirect
6. No local-office, terminal, yard, storage, guaranteed-capacity, fixed-rate,
   or guaranteed-result claims
7. Contact and Load Board workflows remain in preview mode and perform no
   external delivery

The protected `/api/logistics-lead` endpoint must remain unconfigured until the
approved KV and Email Sending bindings exist. A GET request should return
`405 method_not_allowed`; the public forms must not call the endpoint in
preview mode.

## 4. Publish to production

Read the production branch recorded in step 1. Use it explicitly:

```bash
npx wrangler pages deploy dist \
  --project-name hermes \
  --branch <CONFIRMED_PRODUCTION_BRANCH> \
  --commit-message "Hermes logistics locations release 2026-07-29"
```

Do not substitute `main` or another branch name without confirming the current
Pages project configuration. Do not add bindings, secrets, or environment
variables during this release.

## 5. Production smoke test

After deployment:

1. Confirm the newest production deployment is healthy in Cloudflare.
2. Check `https://hermeslogisticsus.com/`, the five primary direction pages,
   `/load-board/`, one audience page, Appleton, and at least three new market
   pages.
3. Confirm the canonical domain is `https://hermeslogisticsus.com`.
4. Confirm response headers, redirect behavior, sitemap, and 404.
5. Submit only a local preview form flow; verify that no network delivery,
   storage, CRM update, or email occurs.
6. Re-run the browser smoke suite against the production domain if a
   production-base-URL test profile is available.

## 6. Rollback

If a production defect appears, open Cloudflare:

`Workers & Pages` → `hermes` → `Deployments` → select the previously recorded
healthy production deployment → `Rollback to this deployment`.

Only successful production deployments are valid rollback targets; preview
deployments cannot be selected. After rollback, repeat the production smoke
test and document the failed deployment ID and symptom before attempting a new
release.

## Live lead delivery remains a separate release

Do not enable `LEAD_LIMITS`, `LEAD_EMAIL`, `PUBLIC_CONTACT_MODE=live`, or a live
contact endpoint as part of this website release. Activation requires the
verified sender and destination, restricted KV namespace, staging delivery
test, privacy review, and endpoint/security review described in
`CLOUDFLARE_READINESS.md`.
