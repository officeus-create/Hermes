# Hermes Design × Search/GEO × Sales-Funnel Convergence Program (2026-10-26)

Status: ACTIVE program. Owner: Claude (design writer) under `docs/DESIGN_INTEGRATION_CONTRACT.md` (#2087).
Supersedes as *task definition* (not as brand rules): the "phase" lists in `DESIGN_GAP_ANALYSIS_2026-10-23.md`
and the release sequence in `HERMES_BRAND_MIGRATION_AUDIT.md`. Brand rules stay in
`HERMES_UNIFIED_BRAND_SYSTEM.md`; tokens stay in `src/styles/hermes-brand-system.css`.

## 0. Why this document exists (the mistake it corrects)

On 2026-10-26 the owner asked: *bring everything else in the design to the new brand book, the new Home and
the new structure, decide yourself and publish.* Claude narrowed that to "finish PR #2027" and reported
"done and live". #2027 was correct but was only the first layer (header/footer, Catalog nav, one commercial
template, Load Board hero, form labels). The rest of the site still ran on legacy templates, so visitors
moving from Home into inner pages saw "a different website".

**Rule from now on:** a design task is scoped by the *owner's outcome* ("every public page reads as one
Hermes"), not by the PR that happens to be open. "Done" is reported per wave with a page count, never as
"the design is finished" while the convergence matrix below has open rows.

## 1. Owner intent (collected from all owner messages, 2026-10-16 … 10-26)

1. One recognisable Hermes on every page, device and language (EN/RU/UA primary; ES/IT/FR overview pages).
   Recognisable even with the logo hidden.
2. Approved Claude Design + the new Home are the visual reference; the old site and the brand book are
   inputs ("design is one thought, the old site the second, the brand book the third — take only what helps
   SEO/GEO"). Do not copy blindly, do not redo everything.
3. Colours: the H-mark palette (owner choice 2026-10-23) — Logistics `#2F6BF6`, Technology `#38B6F5`,
   Academy `#12B886`, Marketing `#FF7A59`; Violet = Hermes Intelligence/Connect; product accents only inside
   their product. Colour psychology per direction (Brand System §3 "Four Visual Engines"): Logistics = movement
   through space, Marketing = movement of attention, Technology = movement of information, Academy =
   movement of capability. People should feel *live involvement*, not a brochure.
4. Design and SEO/GEO ship together; nothing may cost indexation, canonical owners, hreflang, internal links,
   schema, performance or consent.
5. The site must become a **sales funnel**: the large body of existing information is structured so each
   visitor type reaches the right next action (preview-first contact, carrier review, Academy application,
   project brief, Connect registration) — without inventing claims and without breaking current conversions.
6. Language: forms, Google sign-in and labels follow the site language; no mixed-language chrome.
7. Load Board: the current scheme is acceptable — do not redesign it further (owner 2026-10-26).
8. Owner works in Russian: all reports to the owner are in Russian.

## 2. Current state — measured, not remembered (crawl of 431 built pages, 2026-10-26)

| Signal | Value |
|---|---|
| H1 font | Manrope on 427/431 pages ✔ |
| H1 display tracking (−0.035…−0.065em) | 429/431 ✔ |
| Pill buttons | 198 pages pill; 93 pages still 12px-radius controls (forms/product UIs) |
| Palette | `--hermes-*` direction tokens already equal the H-mark palette; ~5 stray legacy hex left (Repair Shop showroom) |
| Hero surface | 246 Pearl/light, **185 dark** before wave A |

The 185 dark heroes split into:

- **Legacy, must migrate (≈120 pages):** car-hauler geo (26), logistics audience/path results (≈30),
  Academy public pages (≈10), logistics/resources + /resources (≈14), careers, case studies, legal,
  contracts/agreement/offer/onboarding/sign, transport request, dispatch start, Appleton/Green Bay, 404,
  localized ES/FR/IT/RU/UA overview + direction owner pages (23, photo-led).
- **Product accent, keep by brand rule (≈65 pages):** Insights hub + articles (indigo field), Load Board
  + its SEO equipment pages (night), Hermes Connect workspaces/internal/role previews and Obsidian product
  panels. These are *not* defects; do not "fix" them.

## 3. Convergence matrix (the definition of "done")

| Wave | Scope | Mechanism | Status |
|---|---|---|---|
| 0 | Header/footer, Catalog nav, commercial template, Load Board hero, form labels, locale chrome | #2025, #2027 | LIVE |
| A | All legacy dark heroes except photo-led locales (≈95 pages) | `src/styles/hermes-public-pearl-shell.css` (one shared layer, explicit template list, product accents excluded) | IN PROGRESS (this PR) |
| B | Localized ES/FR/IT/RU/UA overview + direction-owner heroes (23) | Rebuild hero as Home's Pearl + live-window (image becomes media window, not background) | NEXT |
| C | Body sections below the hero: legacy navy bands, violet/gold/teal eyebrows, lavender sections, 4-colour stripe bar, gold CTA on agreement pages | Shared section/card/eyebrow primitives; bounded Focus Ink bands stay allowed | NEXT |
| D | Logistics sub-navigation bar (dark navy product nav under header on `/paths/logistics/*`) → attached direction submenu like Catalog/directions | `SiteHeader`/direction product nav | NEXT |
| E | Funnel layer (section 5) per direction | Content structure + CTA hierarchy, no new claims | NEXT |
| F | Controls: remaining 12px-radius buttons on public (not product) surfaces; status chips by semantic state | `global.css` primitives | LATER |

A wave is done only when: the crawl in §2 shows 0 legacy-dark heroes in its scope, the Search gate passes,
the build-to-build comparison shows 0 href / canonical / hreflang / title / description / H1 / JSON-LD /
form-field changes (unless the wave intends one and documents it), and 390 + 1440 screenshots of one page
per template were reviewed.

## 4. Route per wave (always the same pipeline)

1. `git fetch` → branch from **current** `origin/main` (never continue a branch that is behind).
2. Re-run the hero crawl (`scratchpad audit/shell.mjs` pattern: per page hero luminance, H1 colour,
   template class) — work from the measured list, not from an old screenshot or doc.
3. Change shared primitives/templates, never page-by-page copies.
4. Gate: `npm run build` (0 errors) → `npm test` → SEO hygiene → GSC triage → owner clarity → hreflang →
   internal links → performance budget → build-to-build comparison vs main → affected Playwright specs
   (desktop + 390) → screenshots 1440/390 per template.
5. PR (draft → ready when CI green) → merge/deploy only with the owner's go-ahead for that wave → live
   readback (canonical, hero render, one page per template) → report in Russian with page counts.
6. Append `docs/AI_HANDOFF.md`; record any new failure class in `docs/ERROR_REGISTER.md`; update §3 table.

## 5. Funnel architecture (design serves conversion, within existing contracts)

Every public commercial page follows one order, so visitors learn the pattern once:

`HERO (who it is for + one primary action) → PROOF (real, labelled LIVE/DEMO/SAMPLE) → OFFER / PROCESS →
OBJECTIONS (FAQ, limits, "not guaranteed") → ONE PRIMARY CTA again → preview-first form → human qualification`

Per direction (primary action is the only ink-filled button on a screen; everything else is ghost):

| Direction | Primary visitor | Primary action (existing route) | Secondary |
|---|---|---|---|
| Logistics — carriers | owner-operator / new authority | carrier review (`/logistics/start-car-hauling-dispatch/`, apply) | agreement, RPM calculator, Load Board |
| Logistics — shippers/dealers | vehicle transport request | `/logistics/request-vehicle-transport/` | resources, case |
| Technology | business owner | structured project brief (website-development/IT) | Website Factory demo, case |
| Marketing | service business | growth audit / brief | Insights evidence, Catalog |
| Academy | learner | Academy application | how training works, programs |
| Connect | business operator | Connect access/registration | product hub, Repair Shops |

Rules: preview-first stays default (`DESIGN_INTEGRATION_CONTRACT.md`); no new phone; no unapproved claims
(`CANONICAL_COMPANY_FACTS_APPROVAL.md`); no new indexable thin pages for funnel steps; measure with the
existing consented events only (no new PII, no new analytics fields without the analytics owner).

## 6. Errors that must not repeat

| ID | Error | Guard |
|---|---|---|
| E1 | Narrowed "everything" to "the open PR", reported done | Scope by owner outcome; report per wave with counts; §3 table is the truth |
| E2 | Branch 132 commits behind main after a worker restart | Always start from fresh `origin/main`; replay only the delta |
| E3 | "Localizing" chrome changed hrefs (lost/added links on RU/UA pages) | Labels may follow path language; hrefs follow the template locale only; build-to-build href diff must be 0 |
| E4 | Treated product accents (Insights indigo, Load Board night, Connect) as defects | Classify before fixing: LEGACY vs PRODUCT ACCENT (Brand System §2) |
| E5 | Colour swap on photo-background heroes made text unreadable (localized pages) | Photo heroes need structural change (live window), not a colour layer; screenshot before commit |
| E6 | Old gap-analysis numbers repeated as current ("130 V4 usages") | Re-measure; mark stale doc sections STALE with date |
| E7 | Re-fixing provider dashboard items from old exports | CURRENT/REPRODUCED/PROVIDER_LAG/STALE/RETIRED_ROUTE classification first |
| E8 | (guard) Merge/deploy authority is per owner instruction, not implied by green CI | Merge/deploy only on an explicit owner instruction covering that wave; otherwise mark Ready and report |
| E9 | Committed the test-generated screenshot `docs/screenshots/intake02-marketing-desktop.png` | `git checkout -- docs/screenshots` before every commit |
| E10 | Reported to the owner in English | Owner reports in Russian |

## 7. Token discipline and self-learning (how Claude works this program cheaply)

- Measure once per wave with scripts (crawl JSON), then read only the files of the templates in scope.
  Do not read whole brand docs again; this file + §2/§3 of the Brand System are enough.
- Prefer one shared stylesheet layer or template edit over per-page edits; never open 400 pages.
- Screenshots: one page per template at 1440 and 390, not every page.
- Run the full Playwright suite once per wave in the background; targeted specs while iterating.
- Delegate: public research/SEO provider readback → ChatGPT/Codex/Claude Web; Claude Code keeps code, tests,
  PRs. Write a compact handoff instead of exhausting context.
- After each wave write back: (a) what the crawl showed before/after, (b) any new error class → E-table,
  (c) the next wave's measured list. That is the learning loop; lessons live here and in One Brain, not in
  chat history.

## 8. Ready-to-use task prompt for Claude (copy as the next session's first message)

> You are the Hermes design writer. Read `docs/design/HERMES_DESIGN_SEARCH_FUNNEL_PROGRAM_2026-10-26.md`
> (this file) and `docs/DESIGN_INTEGRATION_CONTRACT.md`. Take the first wave in §3 that is not LIVE.
> Branch from fresh `origin/main`. Re-measure the hero/section crawl for that wave's scope, change shared
> templates/primitives only, run the full gate in §4, compare builds against main (0 unintended
> href/canonical/hreflang/title/description/H1/JSON-LD/form changes), review 1440 + 390 screenshots per
> template, open the PR, and report to the owner in Russian with page counts and what remains in §3.
> Merge/deploy only when the owner says so for that wave. Do not touch Load Board design, SEO copy, H1s,
> analytics/consent, Load Board facts or other owners' active tasks. Classify before fixing (§6 E4/E7).
> Update §3, `docs/AI_HANDOFF.md` and, for new failure classes, `docs/ERROR_REGISTER.md`.
