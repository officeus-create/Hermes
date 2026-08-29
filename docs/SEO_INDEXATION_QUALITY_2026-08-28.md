# Hermes SEO indexation quality — 2026-08-28

```yaml
ai_name: Codex
model: GPT-5.6 Sol
chat_or_thread: Hermes authenticated search verification continuation
role: SEO evidence reviewer and technical implementation owner
department: SEO / website
date: 2026-08-28
contribution_type: Implementation Report
confidence: 94
task_id: SEO-GSC-INDEXATION-2026-08-28
source_of_truth: authenticated GSC/Bing/GA4 inspection on 2026-08-28 plus current production and origin/main
authority_scope: Platform read / Branch write / Human approval required for merge deploy and Cloudflare
write_scope:
  - src/pages/paths/logistics/[...result].astro
  - public/sitemap.xml
  - public/sitemapindex.xml
  - scripts/logistics-path-indexability.test.mjs
  - scripts/production-seo-hygiene-contract.test.mjs
  - SEO indexation evidence and handoff documentation
reviewed:
  - GSC Page indexing examples
  - four priority URL inspections
  - Bing exact URL states
  - GA4 property stream and recent events
  - production response metadata for the 28 GSC examples
  - current logistics path source and sitemap ownership
not_reviewed:
  - Cloudflare DNS and custom-domain settings
  - GA4 DebugView synthetic event receipt
handoff_to: owner for Cloudflare and merge gates
```

## Evidence receipt

```yaml
evidence_class: PLATFORM_VERIFIED + PRODUCTION_VERIFIED + REPOSITORY_VERIFIED
source: GSC + Bing + GA4 + production + origin/main
observed_at: 2026-08-28
scope: hermeslogisticsus.com priority URLs, page-indexing examples, sitemap coverage, analytics stream and current route metadata
freshness: CURRENT
result: 28 GSC discovered-not-indexed examples identified; two www variants fail at production; nine low-evidence equipment path variants are near-template pages; priority canonical owners remain indexable
limitations: indexability and technical eligibility do not prove future indexation, rankings, qualified inquiries or revenue
```

## Current classification

### INDEX — preserve

These 19 GSC examples are public, HTTP 200, self-canonical, `index,follow`, useful to a distinct audience or business direction, and remain in the sitemap:

- `/es/`
- `/fr/`
- `/load-board/`
- `/logistics/broker/`
- `/logistics/shipper-dealer/`
- `/paths/academy/`
- `/paths/logistics/agency-partners/`
- `/paths/logistics/brokers/carrier-capacity/`
- `/paths/logistics/carriers/direct-freight-development/`
- `/paths/logistics/carriers/fleet-owners/`
- `/paths/logistics/carriers/new-authority/`
- `/paths/logistics/carriers/owner-operators/`
- `/paths/logistics/customers/luxury-classic-vehicle/`
- `/paths/logistics/customers/port-pickup/`
- `/paths/logistics/customers/vehicle-transport/`
- `/paths/logistics/drivers/`
- `/paths/logistics/find-your-path/`
- `/paths/marketing/`
- `/paths/technology/`

### EXCLUDE FROM SEARCH — preserve as user paths

These nine guided-selector results remain accessible and retain `follow`, but are removed from the sitemap and changed to `noindex,follow` until distinct demand and substantially distinct first-party value exist:

- `/paths/logistics/carriers/car-hauling/`
- `/paths/logistics/carriers/hotshot/`
- `/paths/logistics/carriers/box-truck/`
- `/paths/logistics/carriers/cargo-van/`
- `/paths/logistics/carriers/power-only/`
- `/paths/logistics/carriers/dry-van/`
- `/paths/logistics/carriers/reefer/`
- `/paths/logistics/carriers/flatbed/`
- `/paths/logistics/carriers/step-deck/`

The eight shared equipment-template variants have about 203–211 visible main-content words and 0.895–0.939 maximum pairwise word-set similarity in the production snapshot. Car Hauling has more distinct support content, but the canonical commercial intent owner is `/logistics/car-hauling-dispatch/`; the selector result must support that owner rather than compete with it.

### INTENTIONAL NOINDEX — no change

- `/services/hermes-connect/repair-shops/auth/?lang=ru` already renders `noindex,nofollow`. GSC's crawled-not-indexed result is expected for an authentication route.

### FIX OUTSIDE REPOSITORY

- `https://www.hermeslogisticsus.com/`
- `http://www.hermeslogisticsus.com/`

Both returned Cloudflare `520` during the current production check. They should redirect permanently to `https://hermeslogisticsus.com/` after the owner confirms the Cloudflare/DNS action. Do not start GSC validation before production returns the intended redirect.

## Success and rollback

- Immediate repository success: nine low-evidence variants render `noindex,follow`, are absent from the sitemap, and protected audience/commercial paths remain indexable.
- External success: `www` returns a permanent apex redirect; later GSC recrawl removes the blocked classification.
- Measurement success: compare GSC page indexing and query-by-page deltas after a crawl window; do not call this an SEO or revenue gain before external evidence.
- Rollback: revert the bounded branch commit. A route may return to the sitemap only after its robots directive is indexable and evidence supports distinct search ownership.
