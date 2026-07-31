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

**Decision: `/load-board/` should become `noindex,follow` while it remains a preview with fictional loads and dry-run workflows.**

Reasons:

1. The page currently presents fictional load examples that cannot be booked.
2. Its primary purpose is product and workflow demonstration, not a live searchable inventory.
3. Indexing could attract visitors expecting real available loads and reduce trust or create poor search engagement.
4. Commercial search demand should be served by accurate carrier, shipper, dealer, broker, dispatch, onboarding, and vehicle-transport landing pages.
5. `follow` allows search crawlers to continue discovering the approved commercial routes linked from the preview.

### Implementation requirements

- Set the page robots value to `noindex,follow`.
- Remove `https://hermeslogisticsus.com/load-board/` from `sitemap.xml`.
- Keep a self-referencing canonical while the route remains public.
- Keep truthful `Preview`, `Dry-run`, and fictional-data language visible.
- Do not place demo loads in structured data as real offers, products, or available freight.
- Preserve direct carrier, shipper, dealer, and broker links to indexable commercial pages.
- Inspect the URL in Search Console after deployment and confirm the noindex state is recognized.

### Conditions for future indexing

The Load Board may be reconsidered for indexing only when:

- public inventory is real, current, authorized, and safe to expose;
- availability and timestamps are accurate;
- sensitive broker, shipper, carrier, rate, and route details are protected;
- expired or unavailable loads are removed or handled correctly;
- booking/request actions are functional and monitored;
- spam, abuse, duplicate content, and index bloat controls exist;
- the page provides durable search value beyond a thin list of temporary loads;
- legal, operations, privacy, and business-owner reviews are complete.

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
