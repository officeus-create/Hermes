# SEO15 — Revenue Measurement Baseline

Updated: 2026-08-30  
Owner: SEO / Issue #206  
Status: current sanitized measurement checkpoint  

## Purpose

Keep the repository measurement source aligned with the latest authenticated evidence while preserving the older SEO11/14 scorecard as historical provenance.

The operating chain remains:

`search platform -> public production -> analytics receipt -> receiver delivery -> human qualification -> opportunity / revenue`

Evidence from one stage must never be promoted into a later stage without separate proof.

`docs/SEO11_GSC_QUERY_PAGE_SCORECARD_2026-08-11.md` remains useful for methodology, prior checkpoints and query-classification rules. Current numeric status should use this checkpoint until a newer authenticated refresh is recorded.

## Google Search Console — PLATFORM_VERIFIED

### Comparable U.S. + Desktop windows

- **7d · Web · United States · Desktop · 2026-08-20 through 2026-08-26:** 2 clicks / 294 impressions / 0.7% CTR / average position 37.7.
- **28d · Web · United States · Desktop · 2026-07-30 through 2026-08-26:** 5 clicks / 800 impressions / 0.6% CTR / average position 45.6.
- The four priority URLs reviewed in the authenticated checkpoint were indexed in Google.

These rows are platform-filtered intersections. Do not manufacture a U.S.+Desktop row by joining independent country and device aggregates.

### All-Web checkpoint

For **2026-07-30 through 2026-08-26**:

- 31 clicks / 1,660 impressions / ~1.87% CTR across the 28-day all-Web chart;
- latest seven days in that series: 10 clicks / 610 impressions / ~1.64% CTR;
- preceding seven days: 6 clicks / 586 impressions / ~1.02% CTR.

Do not substitute these all-Web values for the U.S.+Desktop rows above.

### Current page opportunity checkpoint

| Canonical owner | Clicks | Impressions | Avg position | Current interpretation |
|---|---:|---:|---:|---|
| `/services/seo-for-logistics-companies/` | 0 | 610 | 57.48 | Existing demand owner; observation window remains active |
| `/services/seo/` | 0 | 171 | 73.87 | Supporting/general SEO owner; no speculative rewrite from aggregate data alone |
| `/logistics/car-hauling-dispatch/` | 0 | 50 | 37.52 | Existing commercial owner with ranking opportunity |
| `/logistics/resources/auction-vehicle-pickup-checklist/` | 1 | 27 | 14.48 | Early resource winner; protect and connect to commercial handoff |
| `/careers/car-hauling-dispatcher/` | 4 | 53 | 4.70 | Strong search visibility; keep JobPosting lifecycle truthful and current |

### Search decision

- Keep `/services/seo-for-logistics-companies/` as the canonical Logistics SEO owner.
- Do not repeat title/meta/H1/content rewriting merely because the page has zero clicks at position ~57.
- Prioritize query/page fit, authority, internal commercial paths and comparable observation windows.
- Do not unlock bulk city, lane, equipment or job-page generation from aggregate impressions alone.

## GA4 — production transport receipt verified

The shared consent-aware analytics path has a production network diagnostic with:

- one matching GA4 event receipt;
- result: `NETWORK_RECEIPT_EXACT_ONCE`;
- decision: `SHARED_GA4_TRANSPORT_VERIFIED / EXACT_ONCE / PRODUCTION_NETWORK_RECEIPT`.

This closes the shared transport defect. It does **not** prove:

- GA4 Key Event configuration;
- standard-report attribution;
- business conversion rate;
- human qualification;
- opportunity creation;
- won/lost state;
- revenue reconciliation.

Synthetic/test interactions must remain excluded from business KPI reporting.

## Bing Webmaster — authenticated priority URL states verified

Current sanitized page-level evidence for the four priority URLs:

| Priority URL | Bing state | Evidence boundary |
|---|---|---|
| `/logistics/resources/auction-vehicle-pickup-checklist/` | `INDEXED` | Page-level Bing status verified |
| `/logistics/resources/car-hauler-capacity-checklist/` | `INDEXED` | Page-level Bing status verified |
| `/services/seo-for-logistics-companies/` | `DISCOVERED_NOT_CRAWLED` | Discovery recorded 2026-08-06; live test remained indexable |
| `/logistics/car-hauling-dispatch/` | `DISCOVERED_NOT_CRAWLED` | Discovery recorded 2026-08-02; live test remained indexable |

Additional evidence:

- the existing Hermes Bing property is authenticated and should remain the only property used for this work;
- `https://hermeslogisticsus.com/sitemapindex.xml` is processed successfully;
- the older Bing UI value `7` is a child-sitemap count, not an indexed-URL count;
- both `DISCOVERED_NOT_CRAWLED` URLs are present in the correct child sitemaps and in the sitemap index;
- `robots.txt` permits crawling and no relevant `X-Robots-Tag`, sitemap, CSP or repository-side exclusion was found;
- an owner-approved attempt to use Bing Webmaster `Request indexing` could not be executed through the available browser connector because navigation to that authenticated domain was blocked.

Current classification: `2_INDEXED / 2_DISCOVERED_NOT_CRAWLED / NO_SITE_SIDE_TECHNICAL_EXCLUSION_FOUND / OWNER_SIDE_BING_ACTION_PENDING`.

Do not create a replacement Bing site/property and do not treat IndexNow HTTP acceptance as indexation proof.

## Commercial evidence chain — current status

| Stage | Current status | Boundary |
|---|---|---|
| Search demand / performance | `PLATFORM_VERIFIED` for the GSC windows above | Search performance is not revenue |
| Public production | `PRODUCTION_VERIFIED` through release/production checks where separately recorded | Live output is not analytics receipt |
| Analytics transport | `PRODUCTION_NETWORK_RECEIPT / EXACT_ONCE` for the verified shared path | Transport is not qualification |
| Receiver delivery | Keep separate evidence under the approved receiver workstream | Delivery is not human qualification |
| Human review / qualification | `PRIVATE_OPERATIONS_EVIDENCE_PENDING` | Missing evidence must not be converted to zero |
| Opportunity / won-lost / revenue | `PRIVATE_OPERATIONS_EVIDENCE_PENDING` | No revenue inference from clicks, events or delivered inquiries |

## Remaining P0 work for #206

1. Execute/recheck the two Bing `DISCOVERED_NOT_CRAWLED` owners through the existing authenticated Bing property when owner-side Webmaster access is available; no repository change is indicated by the current diagnostic.
2. Reconcile private-safe aggregate counts across `delivered -> human reviewed -> qualified/not qualified -> opportunity/no opportunity -> won/lost -> revenue reconciled`.
3. Combine the authenticated GSC windows, analytics receipt state, Bing page-level state and private commercial aggregates into the first complete weekly revenue-facing scorecard.
4. Keep synthetic/test traffic excluded from business KPIs and keep all raw leads, identities, routes, rates, account IDs and credentials out of GitHub.
5. Only after this baseline is complete, hand bounded search experiments back to the SEO execution router; do not restart bulk page generation.

## Completion boundary

Issue #206 should remain open until the pending Bing owner-side action/recheck and private commercial outcome reconciliation are complete. Repository code, CI, sitemap processing, IndexNow notification, analytics network transport and GSC impressions are important evidence classes, but none of them alone proves qualified opportunities or revenue.
