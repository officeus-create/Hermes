# Search / analytics error matrix — one list, one owner per row

Every provider signal (GSC, Bing, Clarity, GA4, external profiles) lives here ONCE, mapped to the page family
(`COVERAGE_MATRIX.md`) and the slice that closes it together with design and funnel work. Read with the coverage
matrix at session start; update at session end. Provider dashboards are evidence, not to-do lists: a row is a
code task only when it reproduces on the current site.

Status: `OPEN` · `IN_SLICE` (fix in a named PR) · `FIXED_AWAITING_RECHECK` · `CLOSED` (verified) ·
`BY_DESIGN` · `OWNER` (account action, not code) · `HOLD` (evidence missing).

Last updated: 2026-10-27 (Claude Code). Evidence: Drive "SEARCH PROVIDER EVIDENCE — CLAUDE" docs 03/04,
GSC compare read directly in the signed-in console 26.10, Bing IndexNow insights read 26.10.

| # | Source | Signal (measured) | Live check / root cause | Family | Fix (same slice as design/funnel) | PR | Status | Recheck |
|---|---|---|---|---|---|---|---|---|
| E1 | GSC | Non-brand "logistics/trucking SEO" queries: `/services/*` 951 impressions (9–28 Aug) → 40 (29 Aug–23 Oct); queries like "seo for logistics companies" 99 → 0 | Page indexed (`site:` 26.10), 200, index/follow, self-canonical; page source unchanged since 21 Aug; no Google core update in Aug 2026 (spam update 18–21 Aug, drop 8 days later). Avg position was 55–70: page was being tested on competitive queries and dropped out | Marketing services (#3) | Proof above the fold (real case, audit sample, own readback), one primary CTA, reviewer/date signal; no URL/H1 change. Authority via #368 | #2111 LIVE 26.10 | FIXED_AWAITING_RECHECK | GSC compare 2026-11-23 |
| E2 | GSC | Brand "hermes*" queries: secondary pages (about 69, company-information 64, contacts 43, /paths/logistics/ 41 impressions) → 0; brand avg position 29.5 → 59, CTR 3.1% → 0.6% | Google stopped showing our trust pages for the brand: entity confidence fell (many same-name "Hermes Logistics" entities) | Brand-intent trust (#4) | Trust pages route to the four directions (#2109). Next: entity hub check — Organization `sameAs`, company facts consistency with Clutch/Facebook profiles | #2109 LIVE + TASK 4 | IN_SLICE | GSC brand filter 2026-11-23 |
| E3 | GSC | 130 discovered — not indexed (267 not indexed total, 149 indexed; GSC report last updated 23.10; authenticated UI readback 27.10 still 130 / 267 / 149 and validation = "Started") | Measured 27.10: 290 sitemap URLs vs pages with any GSC impression in 6 months (OpenRush page breakdown, 123 URLs) → **171 sitemap URLs never shown once**. Clusters: London 42 (`/gb/london/*` + RU/UA), car-hauler city pages 25, Academy countries 12, Insights 28, Business directory 17, logistics resources 8. Template similarity of visible text (difflib, built HTML): car-hauler cities **86–92 % identical**, business listings 72–74 %, London industry pages ~50 % (346 words), Academy countries ~36 %. All these clusters were added 31 Aug–15 Sep, i.e. **after** the 29 Aug drop: they did not trigger it, but they are most of the unindexed backlog and a site-wide quality drag | Carrier geo (#7), London (#14), Academy (#10), Catalog (#17) | Consolidate near-duplicate templates: either real per-page evidence or `noindex,follow` + out of the sitemap (pages stay live, no URL deleted). Car-hauler cities first (most identical). **Owner decision needed** (de-indexing deliberately built pages) | — | OPEN (decision) | GSC 4 weeks after the change |
| E4 | GSC | 404 ×7, 403 ×1, 401 ×1 (authenticated UI readback 27.10: validation for 404 and 403 already = "Started") | 27.10: every page Google ever showed (133, OpenRush 16 months) returns 200; every internal link (515) resolves; every route removed in git history checked live → **4 real 404s: `/ru/paths/{logistics,marketing,technology,academy}/`** (removed 6 Sep without redirects). Older crawl artifacts (`/dashboard`, `/month` …) already answer 410. 401/403 = Access-protected internal/contract URLs, not linked, noindex | Localized owners (#13) | 301 to `/ru/{direction}/` (+ no-slash variants), regression in `gsc-indexing-triage.test.mjs` | this PR | FIXED_AWAITING_RECHECK | GSC 404 validation 2026-11-10 |
| E5 | GSC | Canonical alternates 61, noindex 60 (validation "failed") | Expected: variants and private routes | — | none | — | BY_DESIGN | — |
| E6 | GSC | `?lang=` / `?service=` / `?role=` URLs in Performance | Live 26.10: all canonical to the query-free owner | — | none | — | CLOSED | — |
| E7 | Bing | IndexNow "issue details" — 10 `/logistics/car-hauler-loads/*` + `/services/hermes-connect/repair-shops/` | Bing Insights 26.10: the row type is **"Индексированных — 11"** = indexed, not an error | Carrier geo (#7) | none | — | CLOSED | — |
| E8 | Bing | 5,843 IndexNow notifications → 49 indexed | Peaks = full-sitemap resubmits Sep; since 07.10 change-based (money-pages workflow) | — | keep full submit only after release batches | — | CLOSED | — |
| E9 | Bing | Recommendation: few quality inbound links; backlinks = staff.am, victra.careers, work.ua | Real authority gap; behind E1–E3 | all | Real partner/client/directory links (Client ↔ Catalog ↔ Case ↔ Website), no schemes | #368 | OWNER | monthly |
| E10 | Bing | Site Scan 04.10 (owner export, Drive doc 01): missing meta description 2 (error), image alt missing 20, title too long 2, more than one H1 2; Site Explorer 26.10: 238 indexed, 0 errors, 51 warnings | 27.10 audit of all 291 indexable built pages with the same rules: missing description 0, alt missing 0, title >70 0, multiple H1 0 (fixed by earlier slices). **Meta description >160: 111 pages** (shared limit was 170) → the likely bulk of the 51 warnings | all | Shared limit 160 in `BaseLayout`; the 8 highest-traffic truncated descriptions rewritten as complete sentences (entities kept) | this PR | FIXED_AWAITING_RECHECK | Bing Site Explorer warnings after recrawl; new Site Scan (owner button) |
| E11 | Bing | Copilot citations 48 (17 days, 1–2 pages) | Positive GEO signal; cited URLs not exported | — | track in the own-search Insight readback | — | OPEN (metric) | next readback |
| E12 | Clarity | JS error `r["@context"].toLowerCase` (62 sessions) | JSON-LD array; one block per entity shipped | all | done | #2093 | FIXED_AWAITING_RECHECK | 2026-11-02 (7-day window) |
| E13 | Clarity | Dead clicks 10.45% (30 days) | Reproduced locally 26.10: cards that look clickable but only a small inner link works — `/insights/` 36 cards, `/businesses/` 38 cards + 40 non-linked state tiles, `/opportunities/` 8, `/paths/technology/` 20, direction hero windows | Insights, Catalog, Technology, Directions | Whole card becomes its existing link (stretched link, same href, no new URLs); Catalog pending state tiles left as is (not links) | #2109 LIVE (`tests/dead-click-cards.spec.ts`) | FIXED_AWAITING_RECHECK | Clarity 2026-11-09 |
| E14 | Clarity | Quick backs 28–33%, 88% of sessions from Ukraine (team + job seekers) | Internal traffic distorts behaviour metrics | — | exclude internal IPs in Clarity and GA4 | — | OWNER | after exclusion |
| E15 | Clarity | INP 200 ms (boundary) | Not yet attributed to a page | Home | attribute with field data before changing code | — | HOLD | — |
| E16 | GA4 | 0 key events | Funnel cannot be measured | all | owner marks `contact_request_delivered`, `carrier_handoff_ready`, `load_board_qualified_action`; Claude reuses existing hooks only | — | OWNER | after setup |
| E17 | GA4 | GA4 ↔ GSC not linked | — | — | owner links in GA4 admin | — | OWNER | — |
| E18 | External | Clutch: no reviews; Facebook: old description/phone in posts | Entity consistency feeds E2 | — | MZM reference (ChatGPT), owner edits Facebook | #368 | OWNER | — |
| E20 | Bing | IndexNow "ContentQuality" 4 (05.10): robots.txt, icon svg, font woff2, car-hauling-dispatch | `scripts/indexnow-submit.mjs` already submits only HTML pages from sitemaps (robots/svg/woff excluded); dispatch page reworked since | — | none | — | CLOSED | — |
| E21 | Bing | Parameter URLs indexed (`/load-board?role=carrier`, `?role=private_party&origin=…`) | Live: canonical `/load-board/` | Load Board | none (canonical) | — | BY_DESIGN | — |
| E22 | GSC | Redirect ×4 | No-slash variants (`/es`, `/download` …) 308 → slash owner | — | none | — | BY_DESIGN | — |
| E23 | Backlinks | 2,739 referring domains, 3 real (staff.am, work.ua, 100hires.com); auto-generated "SEO checker" spam since 17 Aug, mass wave from 19 Sep (spam score 45–60) | Not the 29 Aug trigger (wave started after); drags authority | all | Owner uploaded disavow file (2,732 domains) to the URL-prefix property 2026-10-27 08:48 | — | FIXED_AWAITING_RECHECK | monthly backlink check; refresh file when new spam appears |
| E24 | Entity | Google SERP "hermes logistics" (75 results, 27.10): site absent; own Instagram #3, Facebook #6 (old "telecommunication" intro), Clutch #9 | Live readback 27.10: homepage HTML contains the owner-confirmed Clutch and Facebook URLs; `/contacts/` contains the approved Logistics desk phone `+1 (351) 777-5337`; self-canonicals intact. GBP remains owner/account-state work, not a code defect | Brand (#4) | Owner-approved Logistics desk phone on site + schema (#2134 LIVE); Clutch + Facebook in the published entity graph. External profile text/GBP remain separate owner actions | #2134, #2139 | FIXED_AWAITING_RECHECK | GSC brand query 2026-11-23 |
| E19 | External | Telegram shows old link preview | Telegram cache; site serves the new card | — | owner refreshes via @WebpageBot | — | OWNER | — |

## E1 drop — hypotheses checked (27.10)

| Hypothesis | Evidence | Verdict |
|---|---|---|
| robots.txt blocked Google | 22 Aug commit removed Cloudflare-managed AI-bot blocks only; `User-agent: * Allow: /` before and after | excluded |
| noindex / canonical change on money pages | live 26.10: index,follow, self-canonical; page source unchanged since 21 Aug | excluded |
| `?lang=` / parameter duplicates | all canonical to the query-free owner (E6) | excluded |
| Google core update | none in Aug 2026; spam update 18–21 Aug, drop 29 Aug | possible, not provable |
| Ranking test ended | `/services/*` sat at avg position 55–70 on competitive queries, then dropped out | most likely for non-brand |
| Entity confusion (brand) | many same-name "Hermes Logistics" entities; brand position 29.5 → 59 | likely for brand (E2) |
| Site-wide quality drag from templates | 171 of 290 sitemap URLs never shown; car-hauler cities 86–92 % identical (E3) | contributes now; added after the drop |
| Lost backlinks | GSC Links export 26.10: the same job-board sources (staff.am, work.ua), latest crawl 07.10 — nothing lost | excluded |
| Manual action / security | GSC "Manual actions" read 27.10: no issues | excluded |
| hreflang | `scripts/hreflang-audit.test.mjs` green on every build | excluded |

### GSC compare read 27.10 (9–28 Aug = 20 days vs 29 Aug–23 Oct = 56 days)

Totals: clicks 24 → 9 (1.2/day → 0.16/day), impressions 1,640 → 383 (82/day → 6.8/day, −92 %), avg position 41.4 → 39.

| Page | Impressions before → after | Avg position before → after |
|---|---|---|
| `/services/*` (SEO pages, E1) | 951 → 40 | 55–70 → out of results |
| `/company-information/` | 126 → 24 | 9.9 → 9.6 |
| `/about/` | 112 → 35 | 32.3 → 6.8 |
| `/contacts/` | 106 → 31 | 24.3 → 3.5 |
| `/paths/logistics/` | 87 → 20 | 38.1 → 20.2 |
| `/` | 93 → 219 | 42.4 → 45.6 |

Reading: the loss is impressions at deep positions (results pages 3–7) on non-brand SEO queries and broad brand-like queries. Where pages are still shown, they rank *higher*. This is not a penalty or a technical block (both excluded above); Google stopped testing the site on competitive queries it never earned clicks for. The levers are authority (#368) and proof/entity strength (E1/E2 slices), not more technical fixes. The 130 "discovered — not indexed" URLs (E3) are a separate problem: those pages were never shown, so they cannot explain the drop.

## Direct access (no manual clicks)

- GSC: the connected OpenRush Search Console connector (`get_search_performance`, page/query/date breakdowns)
  plus URL-parameter navigation of the signed-in console (compare windows, page/query filters) — both used 26.10.
- Clarity heatmaps/dead-click elements need clicks; the direct path is the Clarity Data Export API with a
  read-only token stored as an environment secret (`CLARITY_API_TOKEN`), never pasted in chat or committed.
- Bing: signed-in console pages read by URL (IndexNow insights, backlinks, site scan list).
