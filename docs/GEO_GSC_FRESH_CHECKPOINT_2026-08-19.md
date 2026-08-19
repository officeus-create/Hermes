# Hermes GEO — Fresh GSC Exact Checkpoint (2026-08-19 handoff)

Status: `OWNER_PROVIDED_HANDOFF — EXACT 18-DAY CHECKPOINT`

Backlog: #730 tasks 201–210  
Measurement source of truth: #206

## Exact coverage

The supplied Search Console export contains daily evidence for:

`2026-07-30 through 2026-08-16` inclusive = **18 days**.

It must not be relabeled as 7, 28 or 90 days merely because the Search Console UI export was requested from a broader preset.

## Sanitized aggregate checkpoint

- clicks: **18**;
- impressions: **791**;
- CTR: **2.28%** (reconciled from 18 / 791);
- evidence class: `owner_provided_handoff`.

No raw query text is stored in this contract.

## Country evidence available from the supplied report

United States:
- 500 impressions;
- 2 clicks;
- 0.40% CTR;
- average position 46.06.

Ukraine:
- 53 impressions;
- 12 clicks;
- 22.64% CTR.

The operating target remains U.S. commercial demand. Non-U.S. clicks are not reclassified as U.S. commercial success.

## Priority page evidence

Only fields explicitly observed in the supplied report are populated. Unknown values remain `null`, not zero.

- `/services/seo-for-logistics-companies/` — 242 impressions;
- `/services/seo/` — 89 impressions;
- `/logistics/car-hauling-dispatch/` — 20 impressions;
- `/careers/car-hauling-dispatcher/` — average position 5.12.

## Search appearance

Google Jobs / Job listings:
- 7 impressions;
- average position 2.71.

This remains separate from ordinary blue-link page position.

## Country opportunity diagnostic

The code can prioritize reviewed country slices using:

- commercial target status;
- available impressions;
- CTR pressure;
- average-position pressure when the report provides it.

This is an internal remediation priority, not a Google ranking score or market-share claim.

For the current evidence, the United States correctly enters `ranking_and_ctr_review` because the report shows substantial impressions, low CTR and average position above 40.

## Exact-window guard

The 18-day checkpoint is classified as `exact_checkpoint_held`. Any attempt to insert it into a 7/28/90 comparable delta throws instead of silently normalizing the window.

## Truth boundary

- Unknown page clicks/CTR/position remain `null`.
- No query text, property/account identifiers, user-level data or credentials are stored.
- GSC handoff provenance stays `owner_provided_handoff`; repository validation does not upgrade it to a different evidence class.
- This checkpoint is demand evidence, not qualified-lead or revenue evidence.

Tests are chained into the GEO/AI visibility test path. Full exact-head Website checks are required before tasks 201–210 are marked complete.
