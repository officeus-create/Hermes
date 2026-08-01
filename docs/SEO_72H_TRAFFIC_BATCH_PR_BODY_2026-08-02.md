# PR body source

## Scope

Reduce crawl depth and improve first-72-hour discovery for the highest-priority Logistics pages without touching PR #83 or PR #85 code.

## Visitor-facing changes

- links Appleton vehicle transport and both practical logistics checklists directly from the homepage;
- adds five Wisconsin service-intent links and twelve city-guide links to the main Logistics hub;
- restores the real `#logistics-resources` target used by resource navigation.

## Discovery controls

- adds a root IndexNow verification file;
- adds a manual-only, read-only IndexNow workflow for the five priority URLs after deployment;
- validates the IndexNow payload offline in normal CI;
- adds a 72-hour Search Console, distribution, and KPI protocol.

## Safety

- no merge, deployment, Search Console request, or live IndexNow submission;
- no automatic workflow trigger;
- no secret, billing, DNS, or Cloudflare change;
- no scraping, unsolicited outreach, or operational data.

## Required verification

Dependency audit, Astro check/build, static/SEO/performance/unit/registry tests, internal-link checks, offline IndexNow validation, and desktop/mobile Playwright.
