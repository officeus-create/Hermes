# Hermes SEO Indexation Policy

This policy decides which public routes should be eligible for search indexing. Technical implementation must keep `robots` metadata, sitemap membership, canonicals, internal links, and Search Console inspection consistent with the selected policy.

## Indexable page classes

The following pages may use `index,follow,max-image-preview:large` when their visible content is accurate, useful, and supported by evidence:

- ecosystem homepage and localized homepages;
- approved department hubs;
- real commercial service and audience landing pages;
- useful supporting resources and checklists;
- contact and application pages when the displayed workflow is honest and functional or clearly describes its current state;
- case studies with verified evidence and privacy approval.

Indexable pages must have a self-referencing canonical and appear in the primary sitemap.

## Noindex page classes

The following routes should use `noindex,follow` or `noindex,nofollow` depending on their link value:

- 404 and other error pages;
- local product demos and prototypes;
- QA reports and generated audit previews;
- internal test routes;
- pages that primarily contain fictional data;
- incomplete tools that could create misleading search snippets;
- duplicate or temporary campaign routes before canonical consolidation.

Noindex pages must not appear in the primary sitemap.

## `/load-board/` decision

**Decision: `/load-board/` is an `index,follow,max-image-preview:large` canonical search owner while its visible experience maintains the approved source-gated live + preview truth boundary.**

Reasons:

1. The page now serves distinct real search intent for car-hauler and auto-transport load discovery plus reviewed carrier access.
2. The Live marketplace may display only approved, active, unexpired, permission-safe records and may honestly show zero records.
3. Fictional or preview rows remain clearly separated from live inventory and are non-bookable, so illustrative data cannot be mistaken for current freight.
4. Customer, dealer, and shipper transport requests remain separate from carrier load-review workflows, and submission itself is not a booking or a guarantee of freight.
5. Search ownership is consolidated on this canonical URL; role, equipment, and query-state variants do not become separate canonical owners.

### Implementation requirements

- Keep the page robots value `index,follow,max-image-preview:large` while the approved truth boundary remains intact.
- Keep `https://hermeslogisticsus.com/load-board/` in the primary sitemap.
- Keep a self-referencing canonical on the pathname owner; role or equipment query-state variants must resolve to the same canonical owner.
- Keep the source-gated live + preview distinction visible to users.
- Keep fictional or preview rows clearly labeled and non-bookable, and never expose them in structured data as real offers, products, or available freight.
- Count or present a record as live only when source, permission, freshness, public-visibility, active-state, and expiry gates pass.
- Remove or suppress expired, covered, unauthorized, internal-only, or otherwise non-public records from the public live state.
- Do not promise `live loads available now`, guaranteed loads, a guaranteed rate, carrier match, or booking. The live marketplace may show zero approved records.
- Keep customer transport requests, carrier access, and any booking/request actions truthful, functional, monitored, and attributable.
- Monitor Search Console behavior and qualified-action/lead quality after material owner or product changes.

### Conditions to keep indexing

The Load Board remains eligible for indexing only while:

- its canonical owner is stable and materially useful for load-board search intent;
- public live records, when present, are current, authorized, permission-safe, and accurately labeled;
- availability and timestamps are accurate enough for the public state being shown;
- sensitive broker, shipper, carrier, rate, route, and contact details are protected according to their access rules;
- expired, covered, unauthorized, or unavailable records are removed or handled correctly;
- fictional preview data stays visibly separate from live inventory and cannot be booked;
- request and access actions are functional and monitored;
- spam, abuse, duplicate-content, and index-bloat controls remain active;
- the page provides durable search value beyond a thin list of temporary loads;
- legal, operations, privacy, and business-owner boundaries remain satisfied.

If the public owner regresses to demo-only or primarily fictional content, becomes misleading, loses its distinct search value, or its live/request controls become unsafe or broken, re-evaluate `noindex` status. Any such decision must update robots, sitemap membership, canonical ownership, internal links, release evidence, and Search Console follow-up together rather than changing one surface in isolation.

## Product demo routes

These remain `noindex,nofollow` unless converted into approved standalone product pages:

- `/demos/crm-validation/`
- `/demos/hermes-connect/`
- `/demos/website-audit/`

Approved technology landing pages may link to demos while clearly labeling them as previews or prototypes.

## Supporting articles and checklists

Supporting resources may remain indexable when they:

- answer a distinct operational question;
- contain substantive original guidance;
- link to an appropriate commercial or intake page;
- avoid private customer details and unsupported guarantees;
- do not exist solely to manipulate location or keyword rankings.

## Localization

A localized route should be indexable only when the page is meaningfully localized, has a same-language canonical, participates in a reciprocal hreflang cluster, and provides a useful experience in that language. Partial or machine-like placeholder translations should remain unpublished or noindex until reviewed.

## Sitemap rule

The primary sitemap must contain only canonical, indexable, successful public URLs. A route must be removed from the sitemap when it becomes noindex, redirected, deleted, duplicated, or intentionally excluded from organic search.

## Release check

For any indexation change:

1. Update page robots metadata.
2. Update sitemap membership.
3. Run build, SEO audit, link audit, and browser tests.
4. Confirm canonical and OpenGraph remain accurate.
5. Deploy only after owner approval.
6. Use Search Console URL Inspection on the deployed URL.
7. Record the change and monitor coverage and search behavior.
