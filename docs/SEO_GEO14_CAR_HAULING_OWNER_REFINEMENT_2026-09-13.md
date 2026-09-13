# SEO / GEO 14 — Car Hauling canonical-owner refinement

Date: 2026-09-13
Scope: existing canonical owners only

## Decision

Keep the existing owner split:
- `/logistics/car-hauling-dispatch/` owns **car hauler dispatch service / dispatcher** commercial intent.
- `/load-board/` owns **car hauler / car carrier / auto transport load board** discovery intent.

No new generic load-board or dispatch URL is justified. No canonical, sitemap, robots, indexability, or 25-market GEO expansion is part of this change.

## Fresh Search Console evidence

Settled U.S. Search Console data for 2026-08-14 through 2026-09-10 already attributes the two intent families to the intended owners:
- `car hauler dispatch`: 9 impressions, average position about 44.6 on `/logistics/car-hauling-dispatch/`.
- `car hauler dispatch service`: 3 impressions, average position about 38.7 on the same owner.
- `auto transport load board`: 15 impressions, average position about 76.7 on `/load-board/`.
- `car hauler load board`: 8 impressions, average position about 80.4 on `/load-board/`.
- `car carrier load board`: 2 impressions, average position 79 on `/load-board/`.

This is evidence to improve query-to-first-screen fit, not to change ownership.

## Fresh U.S. demand evidence

Independent keyword research on 2026-09-13 estimates:
- `car hauler load board`: ~590 monthly searches, difficulty ~11.
- `car carrier load board`: ~590, difficulty ~18.
- `auto transport load board`: ~390, difficulty ~17.
- `car hauler dispatch`: ~140, difficulty ~10.
- `car hauler dispatcher`: ~140, difficulty ~11.
- `car hauling dispatch service`: ~70, difficulty ~11.

Keyword-tool estimates are directional market evidence and are not Hermes Search Console impressions.

## SERP evidence

A fresh U.S. desktop SERP review on 2026-09-13 shows:
- load-board winners use direct language such as **Car Hauler Load Board**, **Find & Book Loads**, route search, equipment fit, and carrier access;
- dispatch-service winners repeatedly use the exact commercial phrase **Car Hauler Dispatch Service** and explain load search, broker/rate communication, paperwork, and carrier support;
- unsupported claims such as guaranteed best rates, guaranteed loads, 24/7 support, or a dedicated dispatcher are not imported into Hermes copy.

## Bounded implementation

### Dispatch owner
Refine title/H1/lead language around `Car Hauler Dispatch Service`, while preserving the existing direct commercial intake and carrier-control/compliance language.

### Load Board owner
Refine title/H1/hero language around `Car Hauler Load Board` + `Search Auto Transport Loads`, while preserving the source-gated live + clearly labeled demo split and the rule that a request is not an automatic booking.

### Truth correction
The dispatch page no longer describes the public Load Board as only an illustrative preview. Current product truth is a separate **source-gated live + demo discovery product**.

## Stop rules

- Do not merge dispatch and load-board intent into one page.
- Do not create a second generic load-board owner.
- Do not create a second generic dispatch owner.
- Do not expand city/state pages from these generic keywords.
- Do not add claims about guaranteed loads, rates, revenue, source access, live inventory, 24/7 staffing, or dedicated dispatchers without verified product/operations truth.
- Measure the existing owners after deployment before another rewrite.

## Measurement after release

Track separately:
1. impressions and average position for the two query clusters;
2. organic clicks and CTR;
3. Load Board carrier-access starts/submits;
4. Dispatch commercial-intake starts/submits;
5. qualified carrier leads and downstream revenue attribution.
