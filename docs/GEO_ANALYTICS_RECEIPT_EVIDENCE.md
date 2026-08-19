# Hermes GEO Analytics Receipt Evidence

Status: `IMPLEMENTED_CONTRACT — EXISTING GA4 AUTHENTICATED RECEIPT GATED`

Backlog: #703 tasks 131–145  
Measurement source of truth: #206  
Canonical implementation inventory: `docs/PRODUCTION_ANALYTICS_EVENT_REGISTRY.md`

## Objective

Reconcile the existing Hermes analytics taxonomy with reviewed production receipt evidence without creating a second GA4 property, second event taxonomy, or storing analytics identifiers/private values in GitHub.

## Ownership attestation

The sanitized attestation records only:

- review timestamp;
- `existing_property_confirmed | ownership_not_confirmed`;
- duplicate-tag state;
- evidence class.

Property ID, stream ID, container ID and account ID are deliberately absent.

## Receipt contract

`geo_analytics_receipt_v1` stores only:

- opaque evidence reference;
- canonical owner;
- event page path;
- canonical event name;
- observed timestamp;
- receipt state `observed_once | observed_multiple | not_observed`;
- synthetic flag;
- parameter **keys only**, never parameter values;
- evidence class;
- optional explicit supersession reference.

## Exact-once

An event is `exactOnceVerified` only when all conditions hold:

1. receipt is non-synthetic;
2. evidence class is `platform_verified`;
3. receipt state is `observed_once`;
4. no unexpected parameter key exists;
5. all required parameter keys for the canonical registry event are present.

Therefore:

- `not_observed` is not zero conversions;
- `observed_multiple` is not exact-once;
- owner-provided handoff is evidence but is not authenticated GA4 receipt proof;
- a DebugView/receipt record is still not a delivered or qualified inquiry.

## Parameter parity

Allowed/required parameter keys are derived from the current production analytics inventory for the priority commercial event families.

Unexpected keys are retained only as key-name diagnostics and make exact-once verification fail. Parameter values are not accepted by this contract.

This permits the review layer to flag an unexpected key such as `email` without storing an email address.

## Attribution

A reviewed attribution map binds:

`canonical owner → journey path → canonical event family`

`commercial_cta_click` belongs to the canonical owner route. Intake, preview, handoff and delivery receipts belong to the journey route. The mapping is explicit; it is not inferred from URLs or event names.

## Delivery boundary

Carrier and vehicle-transport families already have canonical delivery-confirmed event names in the implementation inventory.

SEO and website-project families do not. For those families the reconciliation state is:

`delivery_event_not_established_in_canonical_registry`

The system does not reinterpret `*_handoff_ready` as delivery.

## Freshness and supersession

Freshness uses an operator-supplied day threshold. Supersession must preserve canonical owner, event name and event page path and cannot move backwards in time.

Synthetic receipts are excluded from business evidence and must not replace real evidence.

## Verification

Contract tests cover:

- ownership/duplicate-tag attestation without IDs;
- exact-once receipt;
- missing and duplicate receipt states;
- unexpected parameter-key privacy diagnostic;
- required parameter parity;
- synthetic exclusion;
- supersession;
- freshness;
- owner → CTA/journey attribution completeness;
- carrier handoff → delivery reconciliation;
- SEO handoff without false delivery inference;
- rejection of uncontrolled event names and forbidden top-level fields.

Tests are chained into `npm test`. Full exact-head CI is required before tasks 131–145 are marked complete.
