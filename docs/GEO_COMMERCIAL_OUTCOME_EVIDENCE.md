# Hermes GEO Commercial Outcome Evidence

Status: `IMPLEMENTED_CONTRACT — PRIVATE EVIDENCE GATED`

Backlog: #703 tasks 146–160  
Measurement source of truth: #206  
Design contract: #665

## Objective

Represent the private-safe commercial chain as stage-level aggregate evidence rather than one opaque lead total:

`receiver delivery → human review → qualified → opportunity → won/lost → revenue-reconciled win`

No lead row, contact, company name, email, phone, revenue amount, opportunity ID, CRM ID, account ID or message content belongs in this contract.

## Version

`geo_commercial_outcome_evidence_v1`

Each receipt contains only:

- opaque reference ID;
- canonical owner;
- one controlled stage;
- exact start/end dates;
- observed timestamp;
- aggregate count;
- evidence class;
- optional explicit supersession reference.

## Evidence classes

For a fully verified chain:

- `delivered` requires `production_receiver_verified`;
- `reviewed`, `qualified`, `opportunity`, `won`, `lost`, and `revenue_reconciled_win` require `private_operations_verified`.

`owner_provided_handoff` and `unverified` remain valid provenance states but do not make the chain eligible for verified qualified-demand prioritization.

## Missing upstream evidence

Downstream counts never create an implied upstream count.

Examples:

- qualified without reviewed evidence → `qualified_without_reviewed_evidence`;
- reviewed without delivery evidence → `reviewed_without_delivery_evidence`;
- won/lost without opportunity evidence → `won_lost_without_opportunity_evidence`.

Conversion is `null` whenever the required upstream or downstream aggregate is missing. Missing evidence is not converted to zero.

## Count integrity

The chain detects:

- reviewed > delivered;
- qualified > reviewed;
- opportunity > qualified;
- won + lost > opportunity;
- revenue-reconciled wins > wins.

A structurally complete chain with any inversion is not complete.

## Complete vs verified complete

`chainComplete` means:

- all seven aggregate stages are present;
- no count-integrity violation exists.

`verifiedChainComplete` additionally means every stage has the evidence class appropriate to that stage.

This distinction prevents an owner-provided handoff from being presented as receiver/private-operations verification.

## Qualified-demand prioritization

Owners enter the prioritization only when:

- the chain is `verifiedChainComplete`;
- the exact period is 7 or 28 days.

Ranking uses aggregate qualified leads, opportunities and wins. It does not contain revenue values and does not rank incomplete/unverified owners as if they had zero results.

## Comparable trends

Trend comparison is allowed only when:

- canonical owner matches;
- both periods have equal exact duration of 7 or 28 days;
- periods are adjacent and non-overlapping;
- both chains are complete and verified.

Otherwise the result is `not_comparable` with an explicit reason rather than a misleading delta.

## Revenue reconciliation

Only the **count of wins whose commercial outcome was reconciled** is represented. No dollar revenue, invoice, contract value or payment amount is stored.

## Verification

Tests cover:

- a complete verified 7-day chain;
- conversion rates across all stages;
- owner-provided delivery evidence excluded from verified prioritization;
- missing upstream evidence;
- stage inversions;
- revenue-reconciled-win coverage;
- explicit supersession;
- adjacent comparable 7-day trends;
- overlapping-window rejection as non-comparable;
- privacy/unsupported-field rejection.

Tests are chained into `npm test`. Full exact-head repository CI is required before tasks 146–160 are marked complete.
