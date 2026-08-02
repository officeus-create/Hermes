# Hermes Marketing SEO Revenue Scorecard

## Objective

Create one operational view that connects every indexable landing page to commercial outcomes:

`published URL -> indexed -> impressions -> clicks -> landing sessions -> CTA interactions -> qualified inquiry review`

The scorecard is designed to prioritize work that can produce qualified demand and revenue. It must never invent traffic, lead or revenue data.

## Primary KPI hierarchy

1. Qualified inquiry count
2. CTA-to-qualified-inquiry rate
3. Landing-session-to-CTA rate
4. Organic clicks
5. Search CTR
6. Indexed URL coverage
7. Impressions

Traffic without a measurable commercial action is diagnostic, not success.

## Required page groups

- logistics_local
- logistics_service
- digital_service
- case_study
- academy
- marketing
- technology
- resource

## Required statuses

- VERIFIED
- PARTIAL
- PENDING_CONNECTION
- NOT_AVAILABLE
- NEEDS_REVIEW

## Weekly operating view

The weekly review must show:

- newly published URLs not yet inspected;
- inspected URLs not indexed;
- indexed URLs with zero impressions after the configured review window;
- pages with impressions but weak or declining CTR;
- pages with clicks but no measurable landing sessions;
- pages with sessions but no CTA activity;
- CTA activity without an aggregate qualified-review process;
- stale source data;
- possible query cannibalization.

Each exception must include an owner, blocker, next action and due date.

## Monthly management view

The monthly view ranks:

- pages producing qualified inquiries;
- pages producing CTA activity;
- pages gaining or losing clicks;
- pages with improving or declining CTR;
- page groups with the strongest session-to-CTA rate;
- pages requiring title, content, internal-link or CTA changes;
- pages that should not receive further investment.

## Revenue decision rules

- Increase internal-link and content support for pages with verified CTA or qualified-inquiry activity.
- Improve CTA clarity before adding more traffic to pages with sessions but no actions.
- Improve titles and descriptions where impressions exist but CTR is weak.
- Fix indexation and canonical problems before creating adjacent pages.
- Do not create another city page when an existing page has no distinct intent, no conversion path or unresolved cannibalization.
- Do not treat rankings, impressions or sessions as revenue.

## Data integrity

- Null means unknown or unavailable; it is not zero.
- Zero may be recorded only when the source explicitly reports zero.
- Every imported metric requires a source, source property, extraction timestamp and timezone.
- Search Console URL Inspection state is separate from Search Console performance data.
- GA4 CTA events are separate from reviewed qualified inquiries.
- Historical periods are append-only snapshots.
- No names, emails, phones, MC/DOT, exact addresses, shipment IDs, rates, messages or other PII may enter the scorecard.

## Recommended initial commercial focus

Until production parity is confirmed, prioritize the already released Logistics pages with the clearest buyer intent:

1. Appleton vehicle transport
2. Wisconsin vehicle transport and city cluster
3. Dealer vehicle transportation
4. Car hauling dispatch service
5. Auction vehicle pickup and supporting checklists
6. SEO for logistics companies
7. SEO for independent auto dealers

This list is a measurement priority, not a performance claim.

## Review cadence

- Weekly: exceptions, owners, next actions and release blockers.
- Monthly: winners, losers, conversion gaps, cannibalization and next content investment.
- 7/30/90 days: compare only when complete source windows exist.

## Release gate

A new indexable page is not operationally complete until it has:

- verified production URL;
- canonical and sitemap ownership;
- crawl path from an approved hub;
- Search Console inspection state;
- defined CTA type;
- privacy-safe analytics event contract;
- scorecard row with owner and next review date.
