# Route screenshot evidence

## Purpose

Create reproducible desktop and mobile screenshots from a reviewed local Hermes build for visual QA, release comparison, and dated design discussion.

This workflow is not production-domain verification and must not be cited as evidence that Cloudflare, DNS, SSL, receiver delivery, analytics, indexing, ranking, traffic, conversion, or live integrations are correct.

## Controlled routes

- homepage;
- Car Hauling Dispatch;
- Dealer Vehicle Transportation;
- Load Board;
- Logistics SEO;
- Hermes Connect overview;
- repository-managed Hermes Connect Web App path.

The route list is intentionally small and reviewed in `scripts/route-screenshot-contract.mjs`. Do not expand it into bulk location capture without a separate issue and measurement justification.

## Safety contract

- loopback preview is required by default;
- remote capture requires explicit `ALLOW_REMOTE_SCREENSHOTS=true`;
- credentials in the base URL are rejected;
- external requests are blocked during capture;
- no account, form submission, cookie import, authentication state, private lead, carrier, customer, route, rate, VIN, or operational record is used;
- reduced motion and fixed viewport sizes improve reproducibility;
- output is stored only as a workflow artifact and is not committed;
- the generated manifest labels the source `local-reviewed-build` and `productionEvidence: false`.

## Manual local run

```bash
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

In a second terminal:

```bash
npx playwright install chromium
npm run capture:screenshots
```

Output:

```text
artifacts/route-screenshots/
```

Each PNG is paired with `manifest.json`, containing route, viewport, HTTP status, page title, final path, SHA-256, generation time, and source commit when available.

## GitHub workflow

Run **Capture local route screenshot evidence** manually from the reviewed branch or `main`. The workflow:

1. builds the selected repository ref;
2. starts a loopback Astro preview;
3. installs Chromium;
4. captures the controlled route set;
5. uploads one artifact with 14-day retention.

Screenshots must be reviewed by a person before they are reused in a deck, case, issue, website, social post, or external presentation. A screenshot does not grant permission to publish logos, identities, metrics, messages, or third-party content visible within it.
