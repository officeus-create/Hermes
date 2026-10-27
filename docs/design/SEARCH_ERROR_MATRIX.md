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
| E3 | GSC | 130 discovered — not indexed (267 not indexed total, 149 indexed; GSC 23.10) | Measured 27.10: 290 sitemap URLs vs pages with any GSC impression in 6 months (OpenRush page breakdown, 123 URLs) → **171 sitemap URLs never shown once**. Clusters: London 42 (`/gb/london/*` + RU/UA), car-hauler city pages 25, Academy countries 12, Insights 28, Business directory 17, logistics resources 8. Template similarity of visible text (difflib, built HTML): car-hauler cities **86–92 % identical**, business listings 72–74 %, London industry pages ~50 % (346 words), Academy countries ~36 %. All these clusters were added 31 Aug–15 Sep, i.e. **after** the 29 Aug drop: they did not trigger it, but they are most of the unindexed backlog and a site-wide quality drag | Carrier geo (#7), London (#14), Academy (#10), Catalog (#17) | Consolidate near-duplicate templates: either real per-page evidence or `noindex,follow` + out of the sitemap (pages stay live, no URL deleted). Car-hauler cities first (most identical). **Owner decision needed** (de-indexing deliberately built pages) | — | OPEN (decision) | GSC 4 weeks after the change |
| E4 | GSC | 404 ×7, 403 ×1 | Validation started by owner earlier | — | none in code | — | FIXED_AWAITING_RECHECK | 2026-11-09 |
| E5 | GSC | Canonical alternates 61, noindex 60 (validation "failed") | Expected: variants and private routes | — | none | — | BY_DESIGN | — |
| E6 | GSC | `?lang=` / `?service=` / `?role=` URLs in Performance | Live 26.10: all canonical to the query-free owner | — | none | — | CLOSED | — |
| E7 | Bing | IndexNow "issue details" — 10 `/logistics/car-hauler-loads/*` + `/services/hermes-connect/repair-shops/` | Bing Insights 26.10: the row type is **"Индексированных — 11"** = indexed, not an error | Carrier geo (#7) | none | — | CLOSED | — |
| E8 | Bing | 5,843 IndexNow notifications → 49 indexed | Peaks = full-sitemap resubmits Sep; since 07.10 change-based (money-pages workflow) | — | keep full submit only after release batches | — | CLOSED | — |
| E9 | Bing | Recommendation: few quality inbound links; backlinks = staff.am, victra.careers, work.ua | Real authority gap; behind E1–E3 | all | Real partner/client/directory links (Client ↔ Catalog ↔ Case ↔ Website), no schemes | #368 | OWNER | monthly |
| E10 | Bing | Site Scan 04.10: 2 errors, 22 warnings | 22 days old, stale | — | owner starts a new scan; Claude classifies the export | — | OWNER | after new scan |
| E11 | Bing | Copilot citations 48 (17 days, 1–2 pages) | Positive GEO signal; cited URLs not exported | — | track in the own-search Insight readback | — | OPEN (metric) | next readback |
| E12 | Clarity | JS error `r["@context"].toLowerCase` (62 sessions) | JSON-LD array; one block per entity shipped | all | done | #2093 | FIXED_AWAITING_RECHECK | 2026-11-02 (7-day window) |
| E13 | Clarity | Dead clicks 10.45% (30 days) | Reproduced locally 26.10: cards that look clickable but only a small inner link works — `/insights/` 36 cards, `/businesses/` 38 cards + 40 non-linked state tiles, `/opportunities/` 8, `/paths/technology/` 20, direction hero windows | Insights, Catalog, Technology, Directions | Whole card becomes its existing link (stretched link, same href, no new URLs); Catalog pending state tiles left as is (not links) | #2109 LIVE (`tests/dead-click-cards.spec.ts`) | FIXED_AWAITING_RECHECK | Clarity 2026-11-09 |
| E14 | Clarity | Quick backs 28–33%, 88% of sessions from Ukraine (team + job seekers) | Internal traffic distorts behaviour metrics | — | exclude internal IPs in Clarity and GA4 | — | OWNER | after exclusion |
| E15 | Clarity | INP 200 ms (boundary) | Not yet attributed to a page | Home | attribute with field data before changing code | — | HOLD | — |
| E16 | GA4 | 0 key events | Funnel cannot be measured | all | owner marks `contact_request_delivered`, `carrier_handoff_ready`, `load_board_qualified_action`; Claude reuses existing hooks only | — | OWNER | after setup |
| E17 | GA4 | GA4 ↔ GSC not linked | — | — | owner links in GA4 admin | — | OWNER | — |
| E18 | External | Clutch: no reviews; Facebook: old description/phone in posts | Entity consistency feeds E2 | — | MZM reference (ChatGPT), owner edits Facebook | #368 | OWNER | — |
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
| Lost backlinks | only job-board links ever (E9) | no change to lose; authority gap is structural |

## Direct access (no manual clicks)

- GSC: the connected OpenRush Search Console connector (`get_search_performance`, page/query/date breakdowns)
  plus URL-parameter navigation of the signed-in console (compare windows, page/query filters) — both used 26.10.
- Clarity heatmaps/dead-click elements need clicks; the direct path is the Clarity Data Export API with a
  read-only token stored as an environment secret (`CLARITY_API_TOKEN`), never pasted in chat or committed.
- Bing: signed-in console pages read by URL (IndexNow insights, backlinks, site scan list).
