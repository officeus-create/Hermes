# Hermes public site — coverage matrix (design × Search × funnel)

READ FIRST, UPDATE LAST. Every design/funnel session starts by reading this file, `TASK_QUEUE.md`,
`DEFINITION_OF_DONE.md` and the latest `docs/AI_HANDOFF.md` entry, and ends by updating this table.

Last updated: 2026-10-26 evening (Claude Code). #2109 LIVE (merged c85004a4, readback 26.10). Live state verified on hermeslogisticsus.com for rows marked `live ✓`.

## Status vocabulary

`NOT_CLASSIFIED` → `LEGACY` → `PARTIAL` → `CURRENT_BASELINE` (brand-book shell, not yet funnel-complete) →
`ACCEPTED_LIVE` (brand book + funnel + measurement hook, verified on the live site at 1440 and 390).
Special: `INTENTIONAL_PRODUCT` (own product accent, outside the brand-shell migration), `PRIVATE` (noindex /
signed-in / agreements), `HOLD` (waiting for evidence or the owner).

A family is `ACCEPTED_LIVE` only when the live page (not a CSS class, not CI) shows: Pearl shell + family accent,
light reading body with at most one bounded Focus Ink panel, the funnel order PERSON → PROMISE → PROOF →
MECHANISM → ONE primary action → measurement on an existing approved event, and unchanged URL/H1/canonical/hreflang.

## Matrix

| # | Family | Representative URLs | GSC 3-mo impressions (to 23.10) | Shell / accent | Body sections | Funnel | Status | Last PR | Live ✓ | Next |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Home | `/` | 385 | Claude Design v3 | approved | role router + contact | CURRENT_BASELINE | #1997–#2016 | ✓ | mobile lab LCP check (field LCP 1.3 s is good) |
| 2 | Direction owners | `/paths/{logistics,technology,academy,marketing}/` | 135 / 18 / 9 / 9 | approved skeleton | approved | contact preselect | CURRENT_BASELINE | #1998, #2091 | ✓ | proof block per direction |
| 3 | Marketing services (money) | `/services/seo-for-logistics-companies/`, `/services/seo/`, `/services/local-seo/` | 676 / 189 / 9 | Pearl + Marketing coral | light (#2109) | hero CTA + closing panel → form | PARTIAL (proof rail coded) | #2108, #2109, next | #2109 ✓ | proof rail live → recheck E1 |
| 4 | Brand-intent trust pages | `/company-information/`, `/about/`, `/contacts/` | 151 / 149 / 138 | Pearl (TrustPage) | light | directions router on two pages; contacts form | PARTIAL | #2109 | ✓ 26.10 | `/contacts/` + entity hub (E2) |
| 5 | Logistics commercial | `/logistics/car-hauling-dispatch/`, `/logistics/appleton-wi-vehicle-transport/`, `/logistics/wisconsin-vehicle-transport/` | 62 / 75 / 28 | Pearl + Logistics blue | light (#2109) | commercial CTA, dispatch intake | PARTIAL | #2104, #2109 | — | funnel pass |
| 6 | Logistics path results | `/paths/logistics/carriers/*`, `/customers/*` | ≤5 each | light product nav, blue | light (#2109) | recommendation → bounded panel | PARTIAL | #2104, #2109 | — | — |
| 7 | Carrier geo markets | `/logistics/car-hauler-loads/{city}/` (25) | ≤2 each | Pearl + blue | light (#2109) | support list → CTA | HOLD (Bing IndexNow issue label) | #2109 | — | per-city evidence only if Bing label confirms quality |
| 8 | Careers | `/careers/car-hauling-dispatcher/`, `/logistics/careers/` | 72 / 22 (pos 6 / 4.6) | Pearl (wave A) | mixed | apply link | PARTIAL | #2091 | ✓ | funnel pass (real clicks) |
| 9 | Technology services | `/services/website-development/`, `/website-redesign/`, auto-repair design | 41 / 3 | Pearl + sky | light (#2109) | brief intake | PARTIAL | #2108, #2109 | — | funnel pass |
| 10 | Academy | `/academy/*`, `/academy/countries/*` | 31 / ≤9 | Pearl + green | light (#2109) | apply | PARTIAL | #2108, #2109 | — | funnel pass |
| 11 | Case studies | `/case/`, `/case/appleton-…/`, `/case/it-development/` | 32 / 8 / 19 | Pearl, per-route accent | light (#2109) | case CTA | PARTIAL | #2091, #2109 | — | — |
| 12 | Resources / guides | `/resources/*`, `/logistics/resources/*` | ≤29 | Pearl | light (#2109) | resource CTA | PARTIAL | #2091, #2109 | — | — |
| 13 | Localized overviews + owners | `/{es,fr,it,ru,ua}/`, `/{locale}/{direction}/` | 74 RU / 68 UA / 37 IT | live window (wave B) | light (#2109) | localized contact panel | PARTIAL | #2091, #2109 | — | full RU/UA translation plan (separate project) |
| 14 | London cluster | `/gb/london/*` | ≤3 | not audited this cycle | — | — | NOT_CLASSIFIED | #1185 era | — | classify |
| 15 | Legal / policy | `/privacy/`, `/terms/`, `/legal-compliance/`, … | ≤36 | Pearl (TrustPage / legal hero) | light | policy contact | CURRENT_BASELINE | #2091 | ✓ | — |
| 16 | Insights | `/insights/*` | 49 sessions | indigo product accent | — | article CTA | INTENTIONAL_PRODUCT | #2100 | ✓ | dated readbacks |
| 17 | Catalog | `/businesses/*` | 9 | teal product accent | — | — | INTENTIONAL_PRODUCT | #2027 | ✓ | — |
| 18 | Load Board | `/load-board/` | 38 | night product | — | — | INTENTIONAL_PRODUCT (owner: do not redesign) | #2027 | ✓ | — |
| 19 | Hermes Connect public | `/services/hermes-connect/*` | 65 | Connect product | — | — | INTENTIONAL_PRODUCT | #2024 | ✓ | — |
| 20 | Agreements / sign / onboarding | `/contracts/*`, `/sign/*` | — | Pearl (wave A) | — | — | PRIVATE | #2091 | ✓ | — |
| 21 | 404 | `/404.html` | — | Pearl | — | home links | CURRENT_BASELINE | #2091 | ✓ | — |

MACRO today: 0 of 13 commercial/content families `ACCEPTED_LIVE`; 4 `CURRENT_BASELINE`; 8 `PARTIAL`; 1 `HOLD`;
1 `NOT_CLASSIFIED`. Product/private families (16–20) are out of the brand-shell migration by decision.

## Evidence anchors (do not re-derive)

- GSC 28.07–23.10: impressions peaked 9–28 Aug (60–110/day) and fell ~90% from 29 Aug. Root cause not determined —
  program doc §10.2, Drive "SEARCH PROVIDER EVIDENCE — CLAUDE" doc 04. HOLD on SEO code until the GSC Compare export.
- Clarity: 88% of sessions are internal/Ukraine; behaviour rates are not buyer behaviour. Field LCP 1.3 s, CLS 0.012.
- Backlinks: job boards only (staff.am, work.ua, victra.careers) — authority owner #368.
