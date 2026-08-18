# GEO Funnel & Outcome Health

Status: `STACKED_PREVIEW — NON-VISUAL`

Backlog: Issue #693 tasks 71–80  
Measurement source of truth: Issue #206  
Parent site-graph slice: PR #699

## Purpose

Audit whether search/GEO demand actually moves through a trustworthy commercial chain without leaking private lead data or inventing receiver/revenue evidence.

## Funnel matrix

For each canonical owner × 7/28/90 window the health layer records aggregate counts for:

CTA → intake → preview → handoff → receiver-confirmed delivery.

It reports evidence classes, stage presence, missing funnel evidence, and stage-order integrity.

## Nested-window diagnostics

The 7/28/90 windows are nested aggregate windows. The diagnostic checks only whether aggregate counts follow the expected nested ordering (`7 <= 28 <= 90`). An inversion is surfaced for investigation.

This is **not** cohort analysis and does not infer that the same lead moved between windows or stages.

## Delivery → reviewed integrity

Private reviewed inquiries cannot exceed receiver-confirmed deliveries in a reconciled owner/window record. When reviewed evidence exists without sufficient delivery evidence, the health record fails that integrity check.

## Outcome completeness

The private-safe aggregate chain remains:

reviewed → qualified → opportunity → won/lost → revenue-reconciled win.

The report includes unresolved opportunities and verifies the aggregate stage ordering already enforced by the import boundary.

## Revenue reconciliation

Only a coverage ratio is calculated:

`revenueReconciledWins / wins`

No revenue dollar values are stored or ranked.

## Qualified-demand ranking

The owner ranking includes only records whose reconciliation status is `complete`, whose funnel and outcome evidence are present, and whose relevant evidence does not contain `unverified`.

Ranking order is qualified leads → opportunities → wins → canonical owner. It is an internal prioritization of reconciled demand, not a public performance claim.

## SEO / website delivery event remediation

Two missing canonical delivery signals are documented as **proposal-only** event contracts:

- `seo_delivery_confirmed`
- `website_project_delivery_confirmed`

They are not added to the runtime registry and do not change GA4. Instrumentation is blocked until:

1. the real receiver-side delivery boundary is confirmed;
2. the existing Hermes GA4 property is proven to receive current canonical events exactly once;
3. the event can be emitted without PII/private payloads or duplicate client/server receipts;
4. receiver-side evidence can support the delivery claim.

## Private outcome import versioning

`geo_private_outcome_aggregate_v1` is a strict snapshot contract with one `observed_at` and aggregate owner/window rows only. Raw leads, names, contacts, revenue values and undeclared fields are rejected.

## Visual boundary

No production UI or visible design changes are included.
