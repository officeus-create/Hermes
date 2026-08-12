# SEO 11 — GSC Query-to-Page Opportunity Scorecard

Date: 2026-08-11  
Owner: SEO 11 / Issue #206  
Evidence class: authenticated platform facts where stated; all missing values remain `DATA_PENDING`.

## Purpose

Turn search-platform evidence into a revenue-first execution queue:

`query -> canonical page -> index state -> impressions -> clicks -> CTR -> position -> issue class -> experiment -> qualified action`

This scorecard must not be used to invent traffic, ranking, revenue, or conversion claims.

## Current authenticated property checkpoint

Latest verified handoff evidence:

- Google Search Console access: `ACCESS_CONFIRMED`.
- Google sitemap latest verified read: successful on 2026-08-10.
- Discovered pages on that verified GSC read: 48.
- Homepage URL Inspection: `URL is on Google`.
- Appleton canonical page: previously recorded as indexed in the authenticated GSC checkpoint.
- Current three-month GSC property snapshot: 10 clicks / 217 impressions / 4.6% CTR / average position 32.
- Bing Webmaster access: `ACCESS_CONFIRMED` from owner-provided authenticated platform evidence on 2026-08-11.
- Bing site `hermeslogisticsus.com`: verified in the existing Webmaster property; do not create a replacement site.
- Bing sitemap index `https://hermeslogisticsus.com/sitemapindex.xml`: **successfully processed**; latest owner checkpoint records last processed `2026-08-11`.
- Bing authenticated execution owner at that checkpoint: Codex. Other agents should consume sanitized index/performance evidence from that lane rather than repeating setup work.
- IndexNow current sitemap-backed release notification: 107 canonical URLs accepted with HTTP 200 in the latest SEO11 release submission. This is release notification evidence, not proof that every URL is indexed or ranking.
- GA4 existing Hermes resource/stream in the current environment: `ACCESS_MISSING`.

The property snapshot is not a per-page baseline and must not be copied into page rows. Bing sitemap processing and IndexNow acceptance are discovery/submission evidence, not substitutes for page-level index/performance evidence.

## Priority canonical money-page set

| Cluster | Canonical page | Index status | 7d clicks | 7d impressions | 7d CTR | 7d position | 28d clicks | 28d impressions | 28d CTR | 28d position | Next evidence action |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Ecosystem / brand router | `/` | ON_GOOGLE | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull page + query dimensions |
| Carrier dispatch | `/logistics/car-hauling-dispatch/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | URL Inspection + page/query export |
| Dealer transport | `/logistics/dealer-vehicle-transportation/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | URL Inspection + page/query export |
| Auction pickup | `/logistics/auction-vehicle-pickup/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | URL Inspection + page/query export |
| Local vehicle transport | `/logistics/appleton-wi-vehicle-transport/` | ON_GOOGLE | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull page + query dimensions |
| SEO services | `/services/seo/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | URL Inspection + page/query export |
| Website development | `/services/website-development/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | URL Inspection + page/query export |
| Academy logistics | `/academy/us-logistics-operations/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | URL Inspection + page/query export |

## Query-to-page classification

Every commercially relevant row should receive exactly one primary issue class:

- `KEEP_OWNER` — correct canonical owner, no material issue identified.
- `CTR_PROBLEM` — page already ranks visibly but click-through is weak for the query intent.
- `POSITION_OPPORTUNITY` — meaningful impressions in a realistic improvement band, typically positions 8–30.
- `INTENT_MISMATCH` — Google/Bing is surfacing a page that is not the best answer for the query.
- `CONTENT_GAP` — correct page exists but does not answer a commercially important sub-intent strongly enough.
- `INTERNAL_LINK_GAP` — correct owner exists but site architecture does not reinforce it adequately.
- `CANONICAL_INDEX_ISSUE` — indexing/canonical/redirect state is blocking the intended owner.
- `NEW_PAGE_JUSTIFIED` — distinct search intent cannot be served cleanly by an existing canonical owner.
- `NEW_PAGE_NOT_JUSTIFIED` — query can be satisfied by improving an existing page; do not create another URL.
- `LOW_PRIORITY` — insufficient demand or weak commercial relevance for the current sprint.

## Opportunity rules

Use evidence, not arbitrary score chasing.

1. Existing impressions come before speculative new URLs.
2. Position 1–7 + weak CTR: test title/meta/snippet alignment and above-the-fold intent clarity before adding content volume.
3. Position 8–20 + meaningful impressions: inspect intent coverage, internal links, proof, FAQs, and supporting resources.
4. Position 21–50 + growing impressions: decide whether the page is the correct owner before investing heavily.
5. Multiple pages earning impressions for the same commercial query: inspect cannibalization and canonical ownership.
6. A query with no impressions is not evidence for a new production page by itself.
7. City/country/equipment pages require distinct buyer intent and unique useful content; no thin permutations.

## Query row schema

Normalized evidence rows should use:

`date_range, platform, cluster, query, page, clicks, impressions, ctr, avg_position, country, device, branded, commercial_intent, canonical_owner, issue_class, next_action, experiment_id, evidence_class`

Allowed evidence classes:

- `PLATFORM_VERIFIED`
- `REPOSITORY_VERIFIED`
- `PRODUCTION_RECEIVER_VERIFIED`
- `PRIVATE_OPERATIONS_VERIFIED`
- `UNVERIFIED`

## First experiment queue after data arrives

Prioritize in this order:

1. Queries with existing impressions on carrier / owner-operator dispatch pages.
2. Queries with existing impressions on dealer / auction / vehicle transport pages.
3. Queries with existing impressions on SEO / website / marketing-system pages.
4. Academy demand only after the first three commercial clusters are classified.
5. New city/country expansion only after current owner pages show indexation and qualified-action evidence.

For each experiment record:

- exact query family;
- current page owner;
- platform/source;
- hypothesis;
- one bounded change set (title/meta, section, FAQ, internal links, proof, CTA alignment);
- pre-change 7d/28d metrics;
- deployment date;
- post-change comparable metrics;
- qualified-action evidence when available.

## Index hygiene queue

Track separately from ranking experiments:

- `Crawled - currently not indexed`;
- `Discovered - currently not indexed`;
- duplicate / search-selected canonical mismatch;
- redirect / redirect chain;
- soft 404;
- 404;
- 5xx;
- sitemap discovery drift;
- broken external links on money pages.

Do not manufacture redirects for URLs with no historical value.

## Platform boundaries

### Google

Use Search Console Sitemaps, URL Inspection, Performance, Page Indexing, Links, Core Web Vitals and Achievements. Search Console Achievements are click-growth milestones, not ranking-system scores.

### Bing / Copilot

Use the existing verified Hermes Bing Webmaster site from the latest authenticated owner-provided platform evidence. Do not create a replacement property or repeat verification. The sitemap index is already successfully processed; the remaining #206 work is to consume sanitized Bing URL Inspection, index-state and search-performance evidence for the same canonical money pages when available. Use IndexNow only for genuinely new/updated/deleted canonical URLs and treat HTTP acceptance as submission evidence, not indexation proof.

### GA4

Do not create a new Hermes property/stream/tag merely to satisfy the checklist. Existing ownership must be resolved first. Until authenticated event receipt is verified, keep repository event contracts separate from analytics-platform proof.

## Completion definition for #206 slice

This slice is complete only when:

- the priority money pages have current index status;
- 7-day and 28-day page/query evidence is recorded for commercially relevant rows where the platform exposes it;
- each relevant query is assigned a canonical owner and issue class;
- the first experiment queue is ranked by existing demand;
- Bing evidence is consumed from the existing authenticated property rather than rebuilding access;
- the remaining GA4 access gap stays truthfully classified rather than bypassed;
- no private identifiers, raw leads, names, emails, phones, routes, rates, VINs, account IDs, tokens, cookies or user-level exports are committed.