# Hermes SEO — Current State

Last updated: 2026-08-28

## Objective

Prioritize search and conversion work that can produce qualified inquiries while preserving evidence, privacy, crawl quality, canonical ownership and operational truth.

## Current measurement baseline

Latest sanitized SEO14 owner-provided Codex handoff dated 2026-08-14 reports the following authenticated-platform observations:

- GSC date window: 2026-07-28 through 2026-08-12;
- 17 clicks;
- 487 impressions;
- 3.5% CTR;
- average position 40.8;
- United States: 306 impressions and 2 clicks;
- `/services/seo-for-logistics-companies/`: 119 impressions and 0 clicks;
- GSC external links: 4, all reported from work.ua;
- GSC internal links: 28;
- production sitemap coverage: 108 indexable URLs;
- Google sitemap: Success;
- Bing sitemap: Success; the seven count represents child sitemap files, not seven indexed URLs;
- `robots.txt`: reported to contain all eight sitemap references;
- `BingSiteAuth.xml`: reported HTTP 200;
- Bing Search Performance: still processing in the handoff;
- GA4: current Hermes property/stream receipt remains unconfirmed; the inspected environment showed the start-measuring state.

Evidence class in this file: `OWNER_PROVIDED_HANDOFF`. The owner supplied the Codex SEO14 result from an authenticated run; this file may use it for prioritization, but a different agent must not claim it independently opened those platform views unless it actually did.

## Historical authenticated measurement — 2026-08-28 (do not use as the current recovery baseline)

This newer `PLATFORM_VERIFIED` evidence supersedes the older access classifications above while preserving the older window as historical context:

- GSC 7 days, Web, United States, Desktop (`2026-08-20`–`2026-08-26`): 2 clicks, 294 impressions, 0.7% CTR and average position 37.7.
- GSC 28 days, Web, United States, Desktop (`2026-07-30`–`2026-08-26`): 5 clicks, 800 impressions, 0.6% CTR and average position 45.6.
- All four priority URLs were indexed in Google.
- GSC Page indexing last updated `2026-08-20`: 87 indexed and 92 not indexed. The 28 discovered-not-indexed examples and both blocked `www` variants are identified in `docs/SEO_INDEXATION_QUALITY_2026-08-28.md`.
- Bing's existing Hermes site and sitemap index were accessible. The sitemap index reported success, 110 discovered URLs and zero errors/warnings. Both checklists and Car Hauling Dispatch were indexed; only Logistics SEO remained discovered but not crawled among the four priorities.
- The existing GA4 property and single web stream were accessible and collecting. No obvious duplicate-tag configuration was visible, but the commercial exact-once receipt is not yet proven in DebugView and the visible seven-day report showed zero key events.

Evidence limitation: authenticated access, sitemap success, index state and analytics receipt are separate claims. None proves a qualified lead or revenue.

### Current operating override — 2026-10-06

The August measurements above remain provenance only. They must not trigger a fresh generic GSC/Bing/GA4 baseline run. Search Recovery now starts from the existing evidence plus current `docs/ERROR_REGISTER.md` and `docs/SEARCH_GROWTH_GUARDRAIL.md`. Merged #1696 consolidated low-evidence search owners and hardened Bing public-page hygiene; merged #1699 hardened same-origin internal-link and sitemap freshness release gates. Pull a newer bounded search-platform window only when a specific post-release decision cannot be made from existing evidence.

## Repository-complete foundation

- commercial pages exist for priority Logistics, SEO, Local SEO, auto-dealer SEO, website development and redesign intentions;
- Wisconsin vehicle-transport cluster has direct mobile paths to the real transport intake;
- carrier dispatch pages route to direct qualification rather than the fictional Load Board;
- carrier proposal, agreement-review and onboarding flow is available through the short private `/carrier/` path;
- SEO case and audit-sample proof links align with SEO search intent;
- canonical, robots, sitemap, hreflang, internal-link, schema, privacy and release-manifest tests are automated;
- controlled CTA analytics events exclude submitted identity, company, authority, vehicle, route, message, budget and contact values;
- full desktop/mobile browser tests are required before merge.

## Logistics SEO canonical owner

Issue #462 is complete. Authenticated GSC demand evidence showed the query cluster `seo for logistics companies`, `logistics seo agency`, `trucking seo company`, `logistics seo consultants`, `seo for transportation companies`, `seo for warehousing companies` and adjacent variants.

`/services/seo-for-logistics-companies/` remains the canonical owner for that niche commercial cluster. `/services/seo/` remains the general SEO owner and should support the niche page rather than compete with it.

SEO13 changed the Logistics SEO title/H1/description/content on 2026-08-13. Do not immediately rewrite the snippet again solely because the current handoff still reports 119 impressions / 0 clicks. Preserve a clean 7-day and 28-day measurement window unless a fresh crawl, Search Console query-page export or production defect provides a specific reason to intervene sooner.

## Current priority order

1. Protect canonical query ownership and avoid same-intent page multiplication.
2. Strengthen relevant internal links from strong hubs, cases and resources into existing money-page owners.
3. Preserve the current internal-link and same-origin release gates. Do not treat the historical GSC `28` internal-link count as a current defect unless a newer bounded query/page decision requires fresh evidence.
4. Improve legitimate external entity consistency and authority; do not manufacture links or directory spam.
5. Resolve authenticated GA4 ownership/receipt and prove controlled events arrive exactly once before changing the analytics runtime.
6. Bing performance was captured in the 2026-10-05/06 owner evidence. The next Bing check is only a settled post-release comparison when it can change a concrete decision; do not recreate the site/account or repeatedly resubmit healthy discovery paths.
7. Keep technical SEO contracts, sitemaps, robots, canonicals, schema and privacy guards green.
8. Compare current priority money owners after the planned 7-day and 28-day settlement windows using the same query/page scope; do not rewrite owners from an unsettled release window.
9. Expand pages only when measurements show distinct intent and useful first-party value.

## External authority / entity state

The current handoff reports only four GSC external links, all from work.ua. Public search sampling on 2026-08-14 still surfaces third-party Hermes/older employment-directory results more readily than the owned domain in a Bing-backed public search sample.

Interpretation: this is a discovery/entity-authority signal, not proof that Google has deindexed the site. GSC already supplies a separate authenticated search-performance signal. Prioritize legitimate owned/claimable business profiles, consistent company references and useful editorial citations rather than bulk backlink submissions.

## Platform actions that are already correct

Do not repeat actions simply to show activity:

- Google sitemap has already been submitted successfully;
- Bing sitemap index has already been submitted successfully;
- `robots.txt` reportedly declares the controlled sitemap set;
- `BingSiteAuth.xml` is present and responding;
- production sitemap coverage is already 108 indexable URLs in the latest handoff.

Repeated sitemap submission is not the next bottleneck.

## External evidence gates

The following still require direct authenticated or owner-controlled evidence:

- ON-DEMAND only: a newer bounded query × page export when a concrete post-release decision requires a settled comparison; this is not a standing recovery task;
- ON-DEMAND only: a settled Bing performance/recrawl check after a relevant released change; do not repeatedly resubmit or repoll healthy sitemap/IndexNow paths;
- GA4 commercial-event DebugView receipt exactly once, key-event configuration and internal/test/bot traffic separation;
- human-qualified inquiry counts and sales dispositions;
- CrUX or Search Console field Core Web Vitals;
- permissioned real customer/carrier cases;
- authoritative external-profile corrections and ownership where needed.

Issue #206 is closed historical measurement provenance, not the current execution router. Current Search Recovery routes through `docs/SEARCH_GROWTH_GUARDRAIL.md`, `docs/ERROR_REGISTER.md`, and the current One Brain Search/AI Visibility state. Pull newer bounded platform evidence only when a concrete post-release decision requires it.

## Expansion rule

Do not publish bulk city, state, equipment, lane or thin semantic pages merely to increase URL count. New pages require distinct search intent, real service capability, useful first-party information, an owned conversion path, internal links, canonical/sitemap ownership, regression coverage and a measurement plan.

## Evidence rule

Never convert illustrative examples, private operational records, modelled directory data, unverified claims or AI-generated estimates into public proof. Label evidence class, source, date, scope and limitations.

## Agent routing

Use `SEO_AGENT_ROUTING_2026-08-14.md` for SEO task ownership and handoff rules.

Core lanes:

- ChatGPT: strategy, commercial intent, prioritization, orchestration and contradiction resolution;
- Codex: implementation, tests, repository verification and authenticated measurement coordination where available;
- Antigravity: crawl/browser/UI verification and bounded page-level inspection;
- Claude: independent SEO/QA challenge and evidence-gap review;
- Gemini: read-only Google evidence when authenticated Google access exists;
- owner: destructive account/security/ownership gates and business decisions outside delegated scope.

Agents do not exchange passwords, PATs, OAuth tokens, cookies or session exports. Each agent uses its own authorized environment.

## Success hierarchy

1. confirmed delivered inquiry;
2. human-qualified inquiry;
3. money-page CTA rate;
4. intake start-to-completion rate;
5. fallback and delivery-failure rate;
6. indexed canonical money pages;
7. non-branded impressions and clicks;
8. CTR and average position for existing-impression commercial clusters;
9. field Core Web Vitals;
10. permissioned proof and legitimate external-authority coverage;
11. correct AI/search entity description and linked citation.

## Bing current owner evidence — 2026-10-05/06

Fresh owner-provided Bing exports supersede the 2026-08-28 Bing snapshot:

- Search Performance through 2026-10-03: **5 clicks / 107 impressions**; latest 14 days = **3/54** versus prior 14 days = **2/25**. Bing visibility is currently small but rising, not collapsed.
- Bing sitemap index: **Success / 302 discovered URLs** on 2026-10-04.
- AI Performance: **29 citation events** in the exported window.
- Site Scan: **581 pages / 2 errors / 22 warnings**; supplied aggregate does not expose affected URLs, so metadata/alt/title/H1 changes require URL-level evidence or repository reproduction first.
- Bing authority recommendation flags insufficient high-quality inbound domains. This is a real authority constraint, not permission for bulk directory/PBN/link schemes.
- IndexNow: **5,286 submitted events / 32 indexed events / 38 crawled events** over the exported dates. Non-HTML coverage examples are present even though the repository submitter now rejects assets.
- Authenticated Cloudflare Caching > Configuration readback shows **Crawler Hints ON**. Treat the combination as IndexNow notification noise. Current remediation is changed-cluster-only repository submission plus Crawler Hints disablement when Cloudflare write capability is available.

P0 remains qualified Car Hauling carrier acquisition. Bing already shows relevant signals around `auto transport load board`, dispatch/self-dispatch, RPM/deadhead and carrier setup-packet intent. Strengthen those existing owners and conversion paths; do not multiply URL owners from the low-volume query set.
