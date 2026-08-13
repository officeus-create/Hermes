# SEO13 — Load Board Canonical Search Owner — 2026-08-13

Status: BOUNDED CANONICAL / INTERNAL-LINK CLEANUP
Parent: #461
Execution issue: #464
Measurement source: #206

## Evidence context

Recorded GSC demand includes early impressions for car-hauler/load-board language and query-state URLs such as `/load-board/?role=dealer` and `/load-board/?role=broker`.

The product also legitimately uses role states to change the on-page conversion context. Those role states are useful for people, but they should not become competing organic search owners.

## Decision

`/load-board/` is the single intended search-facing canonical owner for generic car-hauler / car-transport / auto-transport load-board intent.

Role and equipment parameters are funnel/UI state, not separate SEO pages.

## Existing technical protection verified

`BaseLayout.astro` derives canonical URLs from `Astro.url.pathname`, not the query string. Therefore query variants of the Load Board render a canonical pointing to:

`https://hermeslogisticsus.com/load-board/`

The Load Board also keeps a visible fictional-demo boundary and does not claim that displayed loads are live, bookable freight.

## Changes in this pass

1. Added a build-output regression assertion locking `/load-board/` as the canonical search owner.
2. Preserved the visible fictional-demo boundary in the regression contract.
3. Removed role/equipment query parameters from key internal links that exist only to open the demo:
   - carrier/owner-operator audience → `/load-board/#available-loads`;
   - shipper/dealer audience → `/load-board/#post-load`;
   - broker audience → `/load-board/#post-load`;
   - car-hauling dispatch related link → `/load-board/#available-loads`.
4. Kept query parameters on genuine intake/form routes where they represent useful form context; this decision is specifically about the Load Board search owner.

## What this pass intentionally does not do

- no new load-board keyword pages;
- no separate `car hauler load board`, `auto transport load board`, or `car transport load board` doorway URLs;
- no claim that demo loads are live freight;
- no attempt to make the Load Board own dispatch-service intent;
- no redirect of role-state URLs that could break legitimate interactive context before the UI-state migration is reviewed.

## Follow-up measurement

After production release, compare the generic canonical owner in authenticated GSC at approximately 7 and 28 days:
- impressions;
- clicks;
- CTR;
- average position;
- query-to-page attribution;
- qualified carrier/customer actions separately.

If a distinct buyer job later earns meaningful query evidence, evaluate it as a separate intent before creating another indexable URL.
