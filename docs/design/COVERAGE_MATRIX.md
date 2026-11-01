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
| 2 | Direction owners | `/paths/{logistics,technology,academy,marketing}/` | 135 / 18 / 9 / 9 | approved skeleton | approved | shared `DirectionStory` proof/status block + contact preselect already present | CURRENT_BASELINE | #1998, #2091 | ✓ | verify proof facts/statuses; remove remaining off-family violet styling (Academy first) |
| 3 | Marketing services (money) | `/services/seo-for-logistics-companies/`, `/services/seo/`, `/services/local-seo/`, repair/dealer SEO | 676 / 189 / 9 | Pearl + Marketing coral | light | person → promise → proof rail (3 published assets) → one primary CTA → closing panel → form; `commercial_cta_click` | ACCEPTED_LIVE (E1 recheck 2026-11-23) | #2108, #2109, #2111 | ✓ 26.10 | GSC compare after recheck date |
| 4 | Brand-intent trust pages | `/company-information/`, `/about/`, `/contacts/` | 151 / 149 / 138 | Pearl (TrustPage) | light | four-direction router (shared `DirectionRouter`); contacts: one primary request action + form | ACCEPTED_LIVE (E2 recheck 2026-11-23) | #2109, #2117 | ✓ 26.10 | entity facts consistency with Clutch/Facebook (owner) |
| 5 | Logistics commercial | `/logistics/car-hauling-dispatch/`, `/logistics/appleton-wi-vehicle-transport/`, Wisconsin city pages | 62 / 75 / 28 | Pearl + Logistics blue, ink headings | light | one primary hero action (carrier link demoted), mechanism, FAQ, closing request | PARTIAL (no approved transport proof asset yet) | #2104, #2109, #2118 | ✓ 26.10 | add proof when an approved transport case exists |
| 6 | Logistics path results | `/paths/logistics/carriers/*`, `/customers/*` | ≤5 each | light product nav, blue | light (#2109) | recommendation → bounded panel | PARTIAL | #2104, #2109 | — | — |
| 7 | Carrier geo markets | `/logistics/car-hauler-loads/{city}/` (25) | ≤2 each | Pearl + blue | light | support list → CTA | PARTIAL (Bing E7 closed: indexed) | #2109 | ✓ | per-city evidence only with real data |
| 8 | Careers | `/careers/car-hauling-dispatcher/`, `/logistics/careers/` | 72 / 22 (pos 6 / 4.6) | Pearl (wave A) | light | apply suppressed while vacancy awaits owner review | BLOCKED (owner hiring decision) | #2091 | ✓ | reopen apply + JobPosting when owner confirms |
| 9 | Technology services | `/services/website-development/`, `/website-redesign/`, auto-repair design | 41 / 3 | Pearl + sky | light | proof rail (IT case, brief template, checklist) → one brief CTA → closing panel → form | ACCEPTED_LIVE | #2108, #2109, #2119 | ✓ 26.10 | — |
| 10 | Academy | `/academy/*`, `/academy/countries/*` | 31 / ≤9 | Pearl + green | light, family-accent boundaries | hero apply → audiences → curriculum → process → boundaries → FAQ → closing apply | CURRENT_BASELINE (no external proof asset) | #2108, #2109, #2120 | ✓ 26.10 | proof when a dated learner outcome is approved |
| 11 | Case studies | `/case/`, `/case/appleton-…/`, `/case/it-development/` | 32 / 8 / 19 | Pearl, per-route accent | light (#2109) | published evidence → existing commercial next step; `case_study_cta` on commercial case CTAs + `case_opened` on detail cases | PARTIAL (case funnel IN_SLICE; live readback required) | #2091, #2109, this PR | — | merge/deploy → 1440/390 live readback before `ACCEPTED_LIVE` |
| 12 | Resources / guides | `/resources/*`, `/logistics/resources/*` | ≤29 | Pearl | light (#2109) | resource CTA | PARTIAL | #2091, #2109 | — | — |
| 13 | Localized overviews + owners | `/{es,fr,it,ru,ua}/`, `/{locale}/{direction}/` | 74 RU / 68 UA / 37 IT | live window (wave B) | light (#2109) | localized contact panel | PARTIAL | #2091, #2109 | — | full RU/UA translation plan (separate project) |
| 14 | London cluster | `/gb/london/*`, `/{ru,ua}/gb/london/*` (45 pages) | ≤3 | Pearl; every service/industry/guide page follows its direction family (marketing / technology / academy); hubs neutral with direction-accent cards | light | hero CTA → scope → measurement → related → FAQ → `/business-growth/` request (UTM-tagged) | CURRENT_BASELINE (classified 26.10; no London proof asset) | #2122 | live audit 26.10 | proof only when a real London client result exists |
| 15 | Legal / policy | `/privacy/`, `/terms/`, `/legal-compliance/`, … | ≤36 | Pearl (TrustPage / legal hero) | light | policy contact | CURRENT_BASELINE | #2091 | ✓ | — |
| 16 | Insights | `/insights/*` | 49 sessions | indigo product accent | — | article CTA | INTENTIONAL_PRODUCT | #2100 | ✓ | dated readbacks |
| 17 | Catalog | `/businesses/*` | 9 | teal product accent | — | — | INTENTIONAL_PRODUCT | #2027 | ✓ | — |
| 18 | Load Board | `/load-board/` | 38 | night product | — | — | INTENTIONAL_PRODUCT (owner: do not redesign) | #2027 | ✓ | — |
| 19 | Hermes Connect public | `/services/hermes-connect/*` | 65 | Connect product | — | — | INTENTIONAL_PRODUCT | #2024 | ✓ | — |
| 20 | Agreements / sign / onboarding | `/contracts/*`, `/sign/*`, `/logistics/carrier-*` | — | Pearl (wave A) + Logistics blue accents (2026-10-29, was violet/pink) | — | — | PRIVATE | #2091 | ✓ | — |
| 21 | 404 | `/404.html` | — | Pearl | — | home links | CURRENT_BASELINE | #2091 | ✓ | — |

MACRO 2026-10-26 night (after London classification): 3 of 13 commercial/content families `ACCEPTED_LIVE` (Marketing services, brand-intent trust,
Technology services); 6 `CURRENT_BASELINE`; 3 `PARTIAL`; 1 `BLOCKED`; 0 `NOT_CLASSIFIED`. Product/private families (16–20) are out of the brand-shell migration by decision.

## Evidence anchors (do not re-derive)

- GSC 28.07–23.10: impressions peaked 9–28 Aug (60–110/day) and fell ~90% from 29 Aug. Compare read 26.10 and hypotheses checked 27.10 —
  see `SEARCH_ERROR_MATRIX.md` E1 (hypothesis table), E2, E3. Not a technical block; fixes shipped (#2111, #2117), recheck 2026-11-23.
- Clarity: 88% of sessions are internal/Ukraine; behaviour rates are not buyer behaviour. Field LCP 1.3 s, CLS 0.012.
- Backlinks: job boards only (staff.am, work.ua, victra.careers) — authority owner #368.
