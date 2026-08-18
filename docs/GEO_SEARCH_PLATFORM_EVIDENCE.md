# Hermes GEO Search Platform Evidence

Status: `IMPLEMENTED_CONTRACT — AUTHENTICATED PLATFORM DATA GATED`

Backlog: #703 tasks 116–130  
Measurement source of truth: #206  
Design contract: #665

## Objective

Accept sanitized reviewed Google/Bing search evidence without turning repository state, sitemap submission, public search sampling or IndexNow transport acceptance into an indexing claim.

This layer sits above the existing privacy-safe query/page diagnostics and index evidence contracts. It does not replace them.

## Exact receipt

`geo_search_platform_receipt_v1` requires:

- opaque `reference_id`;
- source `google | bing`;
- exact `start_date` and `end_date`;
- timezone-explicit `observed_at`;
- evidence class `platform_verified | owner_provided_handoff`;
- sanitized query-group rows only.

Raw query text, account/property identifiers, PII and credentials are outside the contract.

The exact inclusive window is derived from the dates. A 16-day receipt remains a 16-day held checkpoint. It is never relabeled as 7, 28 or 90 days.

## Query-group anonymity hold

A repository/operator safety threshold can be supplied when building the receipt report. The default is 3 impressions per query group.

Rows below the threshold:

- are excluded from query-key diagnostics;
- remain represented only through aggregate owner/page/country/device counts;
- do not expose their opaque query key in the held output.

This threshold is a Hermes operational privacy guard, **not** a Google or Bing platform rule.

## Comparable search windows

Comparison is permitted only when:

- source matches;
- both windows are exact 7-day or exact 28-day windows;
- window length matches;
- periods are adjacent and non-overlapping.

The comparison reports impression, click and CTR-point deltas. It does not compare a 16-day checkpoint against a 28-day baseline.

## Priority-owner matrix

For each #206 priority commercial owner, readiness is tracked across four cells:

- Google 7d;
- Google 28d;
- Bing 7d;
- Bing 28d.

Missing cells remain missing evidence. They are not recorded as zero search demand.

## Selected canonical evidence

Authenticated selected-canonical evidence is a separate `platform_verified` record with:

- page path;
- checked timestamp;
- `MATCHES_DECLARED | DIFFERS | NOT_AVAILABLE`;
- selected canonical path when available.

This is platform evidence, not a repository inference.

## Job URL inspection

The job inspection contract carries:

- authenticated index state;
- selected canonical state;
- JobPosting enhancement state `VALID | WARNING | ERROR | NOT_DETECTED | UNKNOWN`.

The repository can validate and reconcile this evidence but cannot fabricate it. Until an authenticated receipt is supplied, #206 remains pending.

## Index freshness

Freshness is calculated against an operator-supplied freshness-day threshold. The threshold is not presented as a search-engine standard.

`current` means only that the authenticated check is within the chosen operating window. It does not mean ranking stability or guaranteed index persistence.

## IndexNow vs Bing

`IndexNow ACCEPTED` remains transport-notification evidence only.

Reconciliation states include:

- `accepted_and_indexed`;
- `accepted_not_indexed`;
- `no_accepted_notification`.

Only authenticated Bing state can support `INDEXED`.

## Google/Bing disagreement

When the latest authenticated Google and Bing states for one page disagree, the report emits:

`review_platform_evidence_no_automatic_winner`

No source is silently chosen as the universal truth because the engines maintain independent indexes.

## Verification

Tests cover:

- exact 7-day receipt;
- non-standard 16-day held receipt;
- low-volume query-group hold without query-key exposure;
- adjacent 7-day comparison and invalid comparison rejection;
- priority-owner evidence matrix;
- selected canonical evidence;
- job inspection and enhancement state;
- operator-defined index freshness;
- IndexNow/Bing separation;
- Google/Bing disagreement;
- raw/unsupported field rejection.

Tests are chained into `npm test`. Full exact-head repository CI is required before tasks 116–130 are marked complete.
