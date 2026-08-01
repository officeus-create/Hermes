# Wisconsin SEO Measurement System

## Purpose

Measure the Wisconsin vehicle-transport cluster by indexation, impressions, clicks, qualified CTA activity, and page-to-query fit without storing personal information in analytics events.

## GA4 event contract

### `logistics_cta_click`

Automatically emitted for internal links to `/load-board/`.

Parameters:

- `cta_type`: `carrier_capacity`, `dealer_transport_request`, `shipper_transport_request`, `private_transport_request`, or `load_board_entry`;
- `audience_role`: non-PII role value from the destination URL;
- `page_cluster`: `wisconsin_local_seo`, `logistics_service`, `logistics_path`, or `other`;
- `page_path`: current pathname only;
- `destination_path`: `/load-board/` only.

Never send names, phone numbers, emails, VINs, MC/DOT values, addresses, shipment notes, rates, order IDs, or free-form form values.

### `contact_click`

Parameters:

- `contact_method`: `phone` or `email`;
- `page_cluster`;
- `page_path`.

The event records the method, not the phone number or email address.

## Search Console tracking sheet

One row per canonical URL and review date.

Required columns:

1. Review date
2. Canonical URL
3. Page type: state hub, city page, dealer page, auction page, equipment page, carrier-support page
4. Publication date
5. Index status
6. Sitemap source
7. Primary query family
8. Secondary query families
9. Impressions — last 7 days
10. Clicks — last 7 days
11. CTR — last 7 days
12. Average position — last 7 days
13. Impressions — last 28 days
14. Clicks — last 28 days
15. CTR — last 28 days
16. Average position — last 28 days
17. Top five queries
18. Top competing Hermes URLs for the same query
19. GA4 logistics CTA clicks
20. GA4 contact clicks
21. Content action
22. Technical action
23. Owner
24. Next review date

## Seven-day indexation review

For each new URL:

- confirm HTTP 200 on the canonical URL;
- confirm self-referencing canonical;
- confirm the URL appears in the intended sitemap;
- confirm robots.txt exposes that sitemap;
- confirm no `noindex` directive;
- confirm exactly one title, description, and H1;
- confirm visible breadcrumb navigation;
- confirm Service, BreadcrumbList, and FAQPage schema;
- confirm at least two crawlable internal links into the page;
- record Search Console discovery and index status;
- do not rewrite content only because impressions have not appeared during the first seven days.

## Thirty-day performance review

Review:

- indexed/not indexed status;
- total impressions and clicks;
- query families that triggered the page;
- CTR relative to average position;
- competing Hermes pages for the same query;
- local versus service-intent mismatch;
- CTA clicks by audience role;
- contact clicks;
- pages with impressions but no clicks;
- pages with position improvement but weak conversion paths;
- pages with no impressions after confirmed indexation.

Actions:

- improve title and description when impressions exist but CTR is weak;
- strengthen internal links when discovery or depth is weak;
- add useful local or operational content when queries reveal an unmet need;
- merge or reposition pages when two URLs compete for the same primary query;
- retain pages with low traffic when they support a clear conversion or cluster-navigation role;
- never add unsupported prices, availability, customer claims, routes, or guarantees to chase rankings.

## Query-to-page map

### State and city intent

- `wisconsin vehicle transport` → `/logistics/wisconsin-vehicle-transport/`
- `milwaukee vehicle transport`, `milwaukee car shipping`, `auto transport milwaukee wi` → `/logistics/milwaukee-wi-vehicle-transport/`
- equivalent city-modified transport queries → the matching city page

### Dealer intent

- `dealer vehicle transportation` → `/logistics/dealer-vehicle-transportation/`
- `wisconsin dealer vehicle transport` → `/logistics/wisconsin-dealer-vehicle-transport/`
- `multi car transport` → `/logistics/multi-car-transport/`
- `wisconsin multi vehicle dealer transport` → `/logistics/wisconsin-multi-vehicle-dealer-transport/`

### Auction and equipment intent

- `auction vehicle pickup` → `/logistics/auction-vehicle-pickup/`
- `wisconsin auction vehicle pickup` → `/logistics/wisconsin-auction-vehicle-pickup/`
- `open vehicle transport` → `/logistics/open-vehicle-transport/`
- `enclosed vehicle transport` → `/logistics/enclosed-vehicle-transport/`
- `wisconsin enclosed vehicle transport` → `/logistics/wisconsin-enclosed-vehicle-transport/`
- `inoperable vehicle transport` → `/logistics/inoperable-vehicle-transport/`

### Carrier intent

- `car hauling dispatch services` → `/logistics/car-hauling-dispatch/`
- `owner operator dispatch support` → `/logistics/owner-operator-dispatch-support/`
- `new authority car hauler support` → `/logistics/new-authority-car-hauler-support/`
- `fleet owner dispatch support` → `/logistics/fleet-owner-dispatch-support/`

## Cannibalization review rules

1. One primary query family must have one preferred canonical page.
2. City pages target city-modified intent; the state hub targets statewide intent.
3. National service pages target general service intent; Wisconsin service pages target state-modified intent.
4. Supporting pages may mention related queries but should link to the preferred page using descriptive anchor text.
5. Compare Search Console page filters when the same query appears for more than one Hermes URL.
6. Reposition headings, titles, internal anchors, and copy before considering deletion.
7. Consolidate only when two pages provide substantially the same intent and no unique conversion value.

## Public SEO case-study dashboard specification

The future public dashboard may show aggregated, non-sensitive information only:

- number of published pages;
- number indexed;
- total impressions;
- total clicks;
- non-branded query share;
- average CTR;
- number of tracked CTA interactions;
- publishing and review timeline;
- selected before/after examples using percentage or indexed aggregate data.

Do not publish:

- individual customer information;
- individual shipment information;
- exact private rates or revenue;
- carrier MC/DOT values;
- private conversion values;
- internal Search Console account identifiers;
- unverified ranking claims;
- guarantees of future results.

## Review cadence

- Day 0: publish, sitemap, crawl-path, schema, analytics event verification.
- Day 7: discovery and indexation review.
- Day 30: first performance and cannibalization review.
- Monthly: refresh priorities based on impressions, clicks, CTR, average position, CTA activity, and business relevance.
