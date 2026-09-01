# Hermes Visual QA Route Inventory — 2026-09-01

Status: ACTIVE QA MAP
Purpose: stop random screenshot checking and validate the product in an ordered route matrix.

## Viewport matrix
Core: 1440 and 390.
Escalation: 430, 768, 1024 and wide desktop when the layout requires it.

## Tier 0 — visual references to preserve
These are quality references. Audit them first to capture the visual rules, then avoid accidental flattening.
- `/paths/technology/`
- `/paths/academy/`
- `/services/hermes-connect/`
- strongest Connect product-family/banner compositions on public pages

Checks: hero balance, atmospheric color, typography scale, card density, CTA weight, image/object placement, mobile collapse.

## Tier 1 — public conversion surfaces
Highest priority because public design directly affects trust and conversion.
- `/paths/logistics/`
- `/paths/marketing/`
- `/paths/academy/`
- `/paths/technology/`
- `/services/hermes-connect/`
- `/services/hermes-connect/repair-shops/`
- `/load-board/`
- representative DigitalServicePage route(s)

Special checks:
- Marketing official-channels block.
- Logistics commercial and crawlable directory hierarchy.
- global header + Hermes Connect launcher.
- footer launcher.
- section rhythm immediately before/after Connect banners and contact CTA.

## Tier 2 — Repair Shops acquisition and first-use
- `/services/hermes-connect/repair-shops/auth`
- `/services/hermes-connect/repair-shops/booking`
- `/services/hermes-connect/repair-shops/plan`
- `/services/hermes-connect/repair-shops/forgot-password`
- `/services/hermes-connect/repair-shops/reset-password`

Checks: form width, labels/help text, equipment/service selection, validation, touch targets, mobile keyboard risk, CTA hierarchy, EN/RU long-copy resilience where available.

## Tier 3 — Repair Shops operating workspace
- `/services/hermes-connect/repair-shops/dashboard`
- `/services/hermes-connect/repair-shops/availability`
- `/services/hermes-connect/repair-shops/customers`

Checks: shared account switcher, contextual owner navigation, table/card density, empty/loading/error states, drawers, overflow, status readability, mobile operations.

## Tier 4 — Academy product/private shell
Public/product entry:
- `/services/hermes-connect/academy/`

Private families discovered in the current route tree:
- `/services/hermes-connect/academy/auth/...`
- `/services/hermes-connect/academy/dashboard/...`
- `/services/hermes-connect/academy/lesson/...`
- `/services/hermes-connect/academy/program/...`
- `/services/hermes-connect/academy/progression/...`
- `/services/hermes-connect/academy/reviewer/...`
- `/services/hermes-connect/academy/submissions/...`
- `/services/hermes-connect/academy/support/...`

Checks: Academy violet context, account switcher, Russian continuity, navigation duplication, learning-content density, mobile reading width, reviewer/submission controls.

## Tier 5 — Connect secondary/reference tools
Current route tree includes:
- `/services/hermes-connect/ai-command-center`
- `/services/hermes-connect/business-automation`
- `/services/hermes-connect/load-analyzer`
- `/services/hermes-connect/proposal-builder`
- `/services/hermes-connect/rate-negotiator`
- `/services/hermes-connect/roi-calculator`
- `/services/hermes-connect/unified-inbox`

These are lower than the live Repair Shops pilot. Verify that their presentation does not imply production capability beyond the current factual contract.

## Per-route evidence row
For every audited route record:
- route;
- viewport;
- KEEP/FIX/REPLACE classification;
- overflow status;
- header/launcher status;
- section rhythm;
- typography/wrapping;
- interaction/focus;
- localization resilience;
- screenshot/evidence reference;
- defect ID or DONE.

## Completion rule
The inventory is complete only when every Tier 0–3 route family has at least 1440 + 390 evidence and no unresolved P0/P1 visual defect. Tiers 4–5 follow after the main public and live-product surfaces are stable.
