# GEO Search Intelligence

Status: `STACKED_PREVIEW — NON-VISUAL`

Backlog: Issue #693 tasks 16–30  
Measurement source of truth: Issue #206  
Parent evidence-health slice: PR #695

## Purpose

Convert authenticated Google/Bing aggregate evidence into privacy-safe search diagnostics without storing raw query text and without conflating transport submission with index state.

## Query-group boundary

The search layer accepts only opaque reviewed identifiers:

- `query_key` — opaque query-group ID;
- `intent_group_key` — opaque reviewed semantic-intent group;
- `page_path` — observed receiving page;
- `canonical_owner` — reviewed owner for that search intent.

Raw query text, search terms, keyword text, PII, private account IDs and credentials are explicitly forbidden by the importer.

## Reviewed discovery classification

`discovery_type` remains `branded | non_branded`, but it is always accompanied by:

`discovery_review_state = reviewed | pending_review`

Pending classifications remain visible in diagnostics and do not participate in reviewed owner-conflict detection. The system does not pretend a heuristic classification is final.

## Controlled dimensions

Country:

- `US`
- `WORLDWIDE`
- `OTHER`

Device:

- `DESKTOP`
- `MOBILE`
- `TABLET`
- `OTHER`

This prevents uncontrolled geography/device strings from becoming a pseudo-taxonomy.

## Ownership reconciliation

Each query-group row carries both observed `page_path` and reviewed `canonical_owner`.

Diagnostics surface:

- query groups reaching a non-owner page;
- query groups appearing on multiple pages;
- reviewed intent groups mapped to competing canonical owners;
- pending discovery classifications separately from reviewed conflicts.

These are diagnostics, not automatic redirect/canonical instructions.

## CTR and position bands

CTR and position bands are emitted only when the query group contains `platform_verified` evidence.

CTR bands are neutral ranges:

- `ctr_0`
- `ctr_under_2`
- `ctr_2_to_under_5`
- `ctr_5_plus`

Position bands:

- `position_1_to_3`
- `position_4_to_10`
- `position_11_to_20`
- `position_21_to_50`
- `position_51_plus`

Owner-provided or unverified rows may remain in aggregate diagnostics but never masquerade as authenticated CTR/position-band evidence.

## Opportunity diagnostics

The layer surfaces:

- impressions with zero clicks;
- clicks whose reviewed canonical owner is absent from an explicitly supplied repository-verified commercial-CTA owner set;
- recent discovery versus recent gap versus historical-only discovery using the existing 7/28/90 nested windows.

The 7/28/90 trend state does not calculate a false percentage delta between unequal windows.

## Index state

Authenticated index state is a separate contract with states:

- `DISCOVERED`
- `CRAWLED`
- `INDEXED`
- `NOT_FOUND`

Index-state rows require `platform_verified` evidence and an authenticated check timestamp.

## IndexNow separation

IndexNow submission receipt is tracked separately as:

- `ACCEPTED`
- `REJECTED`
- `UNKNOWN`

`ACCEPTED` means the submission transport was accepted. It never creates an `INDEXED` state.

This separation is permanent because IndexNow acknowledgement and search-engine index state are different evidence classes and different claims.

## Visual boundary

No UI, production-page layout, typography, color, animation or navigation changes are part of this slice. No CEO visual approval is required.
