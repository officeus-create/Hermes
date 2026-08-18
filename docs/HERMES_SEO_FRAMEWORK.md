# Hermes SEO Framework

Canonical execution framework for Hermes Logistics / Hermes Connect search growth.

Updated: 2026-08-18

## Objective

Build one measurable search system that connects:

`crawl/index -> query ownership -> useful page -> qualified action -> delivered inquiry -> reviewed outcome -> evidence -> stronger SEO/GEO`

The framework is revenue-first and evidence-first. More URLs are not a success metric.

## Non-negotiable rules

1. Do not create city, state, equipment, job, niche, or keyword-permutation pages only to increase URL count.
2. Every indexable URL needs a distinct purpose, enough useful main content, one canonical owner, and a valid internal path.
3. Priority commercial pages need an explicit next action and a measurable handoff path.
4. Unknown platform values stay unknown/null; never convert missing evidence to zero.
5. IndexNow submission, sitemap presence, and crawl discovery are not proof of indexation or ranking.
6. Do not manufacture reviews, customers, statistics, operational capacity, rates, locations, affiliations, expert identities, or case results.
7. Do not expose private customer, carrier, shipment, lead, account, credential, VIN, rate, invoice, document, or live-position data for SEO.
8. External links must be legitimate and entity-relevant. No spam-link volume programs.
9. Do not rewrite an active search experiment before its planned comparable observation window unless a production defect requires it.
10. Every framework change must preserve build, regression tests, canonical ownership, privacy, and conversion delivery.

## P0 — release and measurement foundation

### P0.1 Indexation integrity

Required:
- one HTTPS canonical owner per indexable page;
- sitemap URLs resolve to generated HTML;
- no `noindex` URL in sitemap;
- no duplicate sitemap ownership;
- robots declarations stay aligned with generated sitemap files;
- redirect/error/demo surfaces do not become accidental commercial index inventory.

Repository enforcement:
- `scripts/production-seo-hygiene-contract.test.mjs`
- `scripts/seo-growth-audit.test.mjs`
- sitemap/robots build contracts

External evidence gate:
- Google Search Console and Bing index state remain authenticated platform facts tracked under the existing measurement workflow.

### P0.2 Thin-page guard

Required:
- no indexable sitemap page below the hard useful-content floor;
- thin pages are reviewed before any cluster expands;
- exact normalized duplicate main content is blocked;
- mass locality/equipment/job/niche expansion is evidence-gated.

Repository enforcement:
- `scripts/hermes-seo-framework-p0-gate.test.mjs`

### P0.3 Conversion SEO

Required for priority money pages:
- sufficient decision content;
- clear section structure;
- a detectable inquiry/action path;
- structured semantics;
- conversion handoff remains compatible with privacy-safe analytics and delivery contracts.

Current priority money-page set:
- `/logistics/appleton-wi-vehicle-transport/`
- `/logistics/dealer-vehicle-transportation/`
- `/logistics/car-hauling-dispatch/`
- `/logistics/auction-vehicle-pickup/`
- `/services/seo-for-logistics-companies/`
- `/services/seo-for-independent-auto-dealers/`
- `/services/seo/`
- `/services/local-seo/`
- `/services/website-development/`
- `/services/website-redesign/`

Repository enforcement:
- `scripts/hermes-seo-framework-p0-gate.test.mjs`
- `scripts/seo-revenue-commercial-url-audit.test.mjs`
- receiver/contact-handoff contracts

### P0.4 Technical foundation

Required:
- unique title/description/H1/canonical ownership;
- canonical Open Graph URL;
- valid JSON-LD;
- sitemap and robots consistency;
- HTTPS identifiers;
- no accidental duplicate canonical claims;
- performance and release checks remain green.

Repository enforcement already spans the existing SEO growth, schema, localization, performance, and production contract suites.

### P0.5 Measurement gate

Required per priority URL where the platform exposes the data:
- production status;
- index state;
- impressions;
- clicks;
- CTR;
- average position;
- landing/engaged sessions where authenticated analytics ownership is confirmed;
- CTA activity;
- delivered inquiry evidence where a receiver can prove it;
- qualified inquiry evidence only after approved human/private review;
- next experiment/action and owner.

Current authority:
- `docs/SEO11_GSC_QUERY_PAGE_SCORECARD_2026-08-11.md`
- `docs/SEO_REVENUE_PRIORITY_BACKLOG.md`

Do not create replacement search/analytics properties simply to fill missing fields.

### P0.6 Clean-link policy

Required:
- no paid/spam directory blasts or synthetic backlink volume;
- prioritize truthful entity citations, relevant industry profiles, editorial/resource links, partnerships, and real public proof;
- measure useful referring domains and qualified referral actions rather than backlink count alone.

## P1 — GEO / AEO / entity reinforcement

### P1.1 GEO / AEO / LLM readability

Required:
- `llms.txt` / `llms-full.txt` remain factual and current;
- important services/entities are stated clearly in crawlable text;
- question-based content answers real buyer/operator questions directly;
- claims are supported by visible evidence or explicit boundaries;
- structured data matches visible page content;
- useful definitions, process explanations, FAQs, and original first-party analysis are preferred over keyword padding.

Repository references:
- `public/llms-full.txt`
- LLM public contract tests
- FAQ/schema contracts

### P1.2 Internal linking

Required:
- one canonical owner per intent family;
- descriptive internal links reinforce real parent/child and commercial/resource relationships;
- do not add links merely to increase counts;
- orphan commercial URLs are release defects.

Repository enforcement:
- `scripts/internal-link-audit.test.mjs`
- cluster/regression audits

### P1.3 Entity / authority consistency

Required:
- Hermes entities must stay disambiguated;
- business names, canonical URLs, public contact facts, service descriptions, and legitimate profile references must remain consistent;
- `sameAs` is evidence-driven, not decorative;
- third-party profiles must represent the real business/entity.

Repository enforcement/reference:
- entity schema audits;
- public entity registry;
- external-profile/entity workstreams.

### P1.4 Evidence-rich content

Prefer:
- permissioned case/proof assets;
- named reviewer/expert only when real and approved;
- dated methodology;
- original tools/calculators where useful;
- first-party operational lessons that can be published safely;
- source and limitation notes for metrics.

Never turn internal/private operational data directly into public SEO content.

### P1.5 Localization

Required:
- localized pages must be materially localized, not mechanically duplicated;
- self-canonical and hreflang relationships must be valid;
- locale/service combinations require real audience and content value;
- translation does not by itself justify a new indexable page.

Repository enforcement:
- `scripts/hreflang-audit.test.mjs`
- `scripts/localization-content-audit.test.mjs`

## Growth lanes after gates are satisfied

1. Existing commercial pages with authenticated impressions.
2. Customer/dealer/vehicle-transport demand.
3. Local SEO only where distinct intent and real service coverage exist.
4. Resources that support a known commercial owner.
5. Useful tools/calculators with a clear search and business purpose.
6. GEO/LLM answer surfaces.
7. Legitimate authority/entity profiles and referrals.
8. Permissioned cases/proof.
9. Recruiting SEO after verified role/operations/index evidence.
10. International Academy pages after audience and localization gates.
11. CRO on pages already receiving qualified traffic.
12. Sales-enabled SEO: connect search demand to explicit qualification and follow-up.

## Current execution order

`P0 indexation -> P0 thin-page guard -> P0 conversion SEO -> P0 technical foundation -> P0 measurement -> P1 GEO/AEO -> P1 internal links -> P1 entity/authority -> P1 evidence -> P1 localization -> evidence-backed growth lanes`

## Active implementation

PR created 2026-08-18:
- branch `seo/hermes-framework-p0-gate-2026-08-18`;
- adds the first framework-specific P0 CI gate;
- intentionally does not re-edit the 2026-08-13 Logistics SEO snippet experiment before comparable search evidence is available.

## Definition of done for each SEO change

A change is not complete because code was merged. It is complete only when the applicable chain is recorded:

`repository verified -> production verified -> index/search evidence -> user action evidence -> delivered/qualified evidence where available -> next decision`
