# Logistics SEO canonical-owner recovery release — 2026-08-22

## Purpose

Create a controlled, reviewable recovery step for the canonical Logistics SEO commercial owner without rewriting the page around an immature Search Console signal.

Canonical owner:

`/services/seo-for-logistics-companies/`

## Evidence baseline

Source: user-provided Google Search Console export reviewed in the 2026-08-19 evidence batch.

- Site export: 18 clicks / 791 impressions.
- United States: 2 clicks / 500 impressions / 0.4% CTR / average position approximately 46.06.
- `/services/seo-for-logistics-companies/`: 242 impressions / 0 clicks / average position approximately 62.65.

The page-level average position is too low to diagnose the primary problem as snippet CTR alone. Ranking, query ownership, internal authority, relevance and evidence remain the first recovery questions.

## Release variable

This release changes one ownership signal:

- add one contextual link from the existing Marketing engagement surface to the existing Logistics SEO canonical owner;
- preserve the already-live General SEO → Logistics SEO link;
- preserve the already-live Logistics SEO Audit Sample → Logistics SEO link;
- preserve the existing canonical URL, H1, title, description, schema, sitemap ownership and conversion destination.

No new SEO landing page is created.

## Why this is controlled

The Marketing hub is a natural parent for SEO service discovery. A contextual path from the parent commercial direction to the niche owner strengthens site architecture without creating another page that competes for logistics/trucking SEO intent.

This release intentionally does **not**:

- rewrite the title or H1 to chase zero CTR while average position is still low;
- create Texas, DFW, Houston or other location permutations;
- add invented volume, keyword difficulty, rankings, customers, cases or outcomes;
- change the active inquiry funnel or analytics contract;
- alter the general SEO page so it competes for the niche query family.

## Measurement freeze

Unless a technical or factual defect is discovered, do not materially rewrite the Logistics SEO owner during the first comparable observation window after production release.

Review:

1. **7-day operational view** — query × page, country, impressions, clicks, CTR and average position for the canonical owner.
2. **28-day decision view** — compare query families, canonical-owner visibility, U.S. visibility, CTR at comparable positions and qualified inquiry evidence where available.
3. Keep unknown platform or lead values unknown; do not convert missing data into zero.

A title/snippet experiment becomes appropriate only after the page is receiving enough impressions at a sufficiently competitive position to separate ranking weakness from snippet weakness.

## Decision outcomes

At the next review choose one:

- **HOLD** — signal is improving or sample remains too small;
- **STRENGTHEN** — add evidence-safe contextual authority/internal links from genuinely relevant existing owners;
- **SNIPPET TEST** — position has improved enough for CTR to become a meaningful diagnosis;
- **CONTENT REFINEMENT** — query × page data shows a material intent mismatch inside the canonical owner;
- **CONSOLIDATE** — another page is competing for the same query family;
- **EXPAND** — only if a distinct, evidence-backed intent family cannot be served by an existing owner.
