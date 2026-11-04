# Definition of done — Hermes design × Search × funnel

## SLICE (one PR)

Report every slice as `CODED → CI → MERGED → DEPLOYED → LIVE`. A slice is done only at LIVE:

1. Gates on the exact head: `npm run build` (0 diagnostics), `npm test`, SEO hygiene, GSC triage, owner clarity,
   hreflang, internal links, performance budget, build-to-build comparison vs a freshly built current `main`
   (0 href / canonical / hreflang / title / description / H1 / JSON-LD / form-field changes unless the slice
   intends one and documents it), affected Playwright specs desktop + 390.
2. Visual proof = screenshots of the rendered page at 1440 and 390 plus computed style — never "the class exists".
3. CI green on the head, merged, deployed, and read back on hermeslogisticsus.com (canonical + rendered section).
4. `COVERAGE_MATRIX.md`, `TASK_QUEUE.md` and one `docs/AI_HANDOFF.md` entry updated ("next action — X, accept — Y").

## FAMILY (`ACCEPTED_LIVE`)

- Brand book: Pearl shell, family H-mark accent, light reading body, at most one bounded Focus Ink panel.
- Funnel order on the page: PERSON/INTENT → PROMISE → PROOF → MECHANISM → ONE primary action per screen →
  MEASUREMENT.
- Proof is a real, approved asset (case, dated readback, sample, verified fact). No new business claims.
- Measurement uses an existing approved hook (`commercial_cta_click`, `case_study_cta`, `contact_*`, delivered-
  request events). New analytics events or payload fields are outside design scope (DESIGN_INTEGRATION_CONTRACT).
- Verified live on 2–5 representative URLs at 1440 and 390.

## MACRO (the site)

- Every commercial/content family in `COVERAGE_MATRIX.md` is `ACCEPTED_LIVE`; product/private families classified.
- GA4 shows the key events (owner action) so a page view → inquiry path can be measured.
- At least three dated readbacks in the own-search Insight (baseline 2026-10-26 + two later windows).
- Never report "the whole design is done". Report: `MACRO: X of Y families ACCEPTED_LIVE, next — Z`.

## Session protocol

Start: read the matrix → queue → this file → latest handoff; `git fetch`; check 1–2 live URLs from the top task.
Finish: update the matrix and queue, one handoff entry, report in Russian in business terms (what the visitor sees,
what was fixed, what remains to 100%, what the owner must do).

One writer per branch. If commits from another agent appear on the working branch, stop and ask the owner who owns it.
