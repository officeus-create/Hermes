# Production Lighthouse baseline

## Purpose

Create a repeatable, privacy-safe laboratory baseline for the five production pages currently prioritized by the SEO-4 conversion roadmap:

1. homepage;
2. Car Hauling Dispatch;
3. Dealer Vehicle Transportation;
4. Load Board demo;
5. Logistics SEO.

The workflow is intentionally narrow. It does not submit forms, create leads, use credentials, change Cloudflare, access Search Console or GA4, or claim that a single Lighthouse run represents real-user Core Web Vitals.

## Workflow

File: `.github/workflows/production-lighthouse-baseline.yml`

Triggers:

- once when the workflow is merged to `main`;
- manually through `workflow_dispatch` when a new comparison is needed.

It is not scheduled by default, so it does not consume recurring GitHub Actions minutes before the baseline proves useful.

## Output

Each page receives a separate mobile Lighthouse JSON artifact retained for 30 days. The GitHub Actions summary records:

- Performance;
- Accessibility;
- Best Practices;
- SEO;
- First Contentful Paint;
- Largest Contentful Paint;
- Speed Index;
- Total Blocking Time;
- Cumulative Layout Shift.

No submitted values, lead data, credentials, customer/carrier identities, routes, VINs, rates, analytics identifiers, Cloudflare identifiers, or provider diagnostics are collected.

## Interpretation boundary

Treat the results as a controlled lab snapshot from GitHub-hosted infrastructure.

Do not describe them as:

- CrUX field data;
- Google Search Console data;
- GA4 conversion evidence;
- production traffic performance;
- ranking evidence;
- revenue or lead evidence.

The full production measurement package still requires separately reconciled Search Console, GA4, qualified-inquiry, and real-user Core Web Vitals evidence.

## Release rule

The first run establishes the timestamped lab baseline. Optimization work should compare the same URLs and the same workflow configuration. Threshold enforcement should be added only after reviewing the first baseline and identifying normal run-to-run variance.
