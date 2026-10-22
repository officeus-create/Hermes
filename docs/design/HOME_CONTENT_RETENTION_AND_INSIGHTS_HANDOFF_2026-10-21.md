# Hermes: keep useful content when changing the website

Decision recorded: 21 October 2026, Hermes Home v3. Source: owner direction in ChatGPT + approved Claude Design Home v3.1. This is the operating rule for future layouts, **not permission to invent company news**.

## Rule: reduce interface weight, preserve source truth

When a block is removed, abbreviated or moved, first determine what it actually contains: a link to public evidence, an evergreen explanation, a dated first-party change, obsolete presentation, an unverified claim or sensitive data. Do not automatically publish the entire old block as a new SEO URL. Separate **layout retirement** from **content deletion**.

| Kind | Destination | Publication conditions |
| --- | --- | --- |
| Evidence or case study still current | Existing canonical company, case, service or resource page + a short pointer in `/insights/#homepage-evidence-archive` | Source URL works; claims still supported; link does not compete with owner page |
| A real product/design release or process change | Dated Insights brief/digest; standalone only with distinct search purpose and sufficient evidence | Release actually merged and LIVE_VERIFIED; event date, source and status stated accurately |
| Evergreen instructions/checklists | Existing resource/owner page, cross-linked from Insights if useful | No duplicate articles, no false recency or claims |
| Older but informative historical version | Dated historical note (comparison and current-state link), not a current capability promise | Historical dates, status, owner, evidence and privacy review verified |
| Unsupported metrics, private figures, internal calls, client PII | Retain in authorized internal system; NEVER reframe into public news | Require separate owner authorization and privacy review |
| Decorative/noise-only UI | Repository/design history | No new article needed solely to inflate the number of pages |

Use the existing Insights editorial pipeline: `src/data/insights.generated.json`, `scripts/publish-insight.mjs`, `scripts/insights-pipeline.test.mjs`, `public/sitemap-insights.xml`, `src/pages/insights/index.astro` and its RSS feed. New factual claims must pass source/date/privacy controls. A digest/brief should link to an existing owner URL, **not fabricate a thin route**. Articles should not claim a deployment until Cloudflare/live SHA is verified.

For real URL changes: retain the canonical owner when possible, use 301 for removed URLs only after mapping exact relevance and ensuring no redirect loop, fix all internal links, sitemap and hreflang/canonical, then monitor URL inspection. Never reassign legal entity records or business identity to a news article.

## Specific Home v3 disposal map

1. `HomeProofDecision` on English corporate Home: removed from the entrance. **Component remains in code**, used on localized corporate pages. The four sources remain at:
   - Logistics: `/company-information/`
   - Technology: `/case/it-development/`
   - Academy: `/academy/resources/`
   - Marketing: `/case/appleton-vehicle-transport-seo/`
   The factual pointer is staged in `/insights/#homepage-evidence-archive` in the SAME #1988 deployment. The underlying case/legal/resource pages are NOT deleted or moved.
2. Logistics company-identity block on English Home: remove repeated promo copy, not the Wisconsin corporate identity or its Organization Schema; canonical company record remains at `/company-information/`.
3. `PublicTrafficCounter`: removed from public Home because historic page-view/browser-session numbers are not unique visitors or customers and should not be used as fabricated social proof. Component and consent-gated collection/internal dashboard remain in code. No new public marketing article that exposes figures.
4. Footer, contact, legal, search, Products and Connect routes: **retained**, not redistributed as news.
5. Video scenes/assets: independently verify ownership/licensing and visual approval; an experimental demo is NOT a production announcement.

## Required closeout ledger per future change

Record original path/section, destination URL, canonical owner, source and date, current verification, privacy/licensing review, user value, whether a sitemap/redirect/alternate changed, PR+SHA, CI receipt, Cloudflare/live confirmation, and what the update actually says. Put outcome and NEXT_ACTION in existing Completion Architect/One Brain; do not create a second task system.

**Core test:** a visitor can find the useful public evidence from the relevant direction or Insights, search engines have one canonical URL for each topic, and no old unsupported business claim becomes fake news.
