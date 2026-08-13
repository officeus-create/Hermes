# SEO13 — Load Board Canonical Search Owner — 2026-08-13

Status: BOUNDED CANONICAL CONTRACT
Parent: #461
Execution issue: #464
Measurement source: #206

## Decision

`/load-board/` is the single intended search-facing canonical owner for generic car-hauler / car-transport / auto-transport load-board intent.

Role and equipment query parameters may remain in internal links where they intentionally configure the interactive demo for a carrier, shipper/dealer, or broker. They are **UI/funnel state**, not separate SEO pages.

## Existing protection verified

`BaseLayout.astro` derives the canonical from `Astro.url.pathname`, not the query string. Therefore all role/equipment variants render:

`https://hermeslogisticsus.com/load-board/`

as their canonical owner.

The Load Board also has a visible fictional-demo boundary and does not represent its example loads as live, bookable freight.

## Change in this pass

A build-output regression test now locks two important properties:

1. the rendered Load Board exposes exactly `/load-board/` as the canonical search owner;
2. the fictional-demo boundary remains visible and the page does not imply `live freight available now`.

## Why role-state links are preserved

An earlier experimental pass removed `?role=` / `equipment=` parameters from internal links. Browser CI correctly showed that those parameters are part of the intended role-specific product experience. That experiment was rejected rather than weakening the UX to satisfy an SEO theory.

Canonicalization already solves the organic-owner problem without removing useful role state.

## What this pass intentionally does not do

- no new keyword-variant load-board pages;
- no redirects that destroy role-specific UI context;
- no claim of live freight;
- no attempt to make Load Board own dispatch-service intent;
- no doorway URLs for `car hauler load board`, `auto transport load board`, or similar wording variants.

## Follow-up measurement

After release, compare the canonical owner in authenticated GSC at the next comparable 7/28-day checkpoint:
- impressions;
- clicks;
- CTR;
- average position;
- query-to-page attribution;
- qualified carrier/customer actions separately.

A distinct new indexable page is justified only by a distinct real buyer job, useful non-duplicative content, and measured demand/outcome evidence.
