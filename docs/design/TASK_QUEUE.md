# Hermes design × Search × funnel — task queue

Take the top open task. One family = one PR. Each family PR ships design AND funnel AND the measurement hook
together — the funnel is never "the next step". Update this file and `COVERAGE_MATRIX.md` at the end of every session.

Each task names the `SEARCH_ERROR_MATRIX.md` rows it closes. Order is by measured demand (GSC 28.07–23.10 impressions per family), not by habit. Change it only on owner
instruction or new provider evidence recorded in the matrix.

## Open

Estimate: tasks 1–4 ≈ 1 working day; 5–9 ≈ 1.5 days (one family per slice, ~2 h each incl. CI); 10–12 separate.
Ranking effects need 2–8 weeks after deploy; every slice records its recheck date in the error matrix.

1. ~~**#2109 → merge → live readback**~~ DONE 26.10 (body sections, brand-intent routing, service CTA order, honest self-case).
   Accept: CI green on head; live 1440/390 of `/logistics/car-hauler-loads/denver-co/`, `/es/`,
   `/services/seo-for-logistics-companies/`, `/company-information/`; matrix rows 3–13 updated.
2. ~~**Dead clicks (E13)**~~ DONE in #2109 — — whole cards become their existing link** on `/insights/`, `/businesses/`, `/opportunities/`,
   `/paths/technology/` and direction hero windows; non-linked Catalog state tiles stop looking clickable.
   Accept: same hrefs, no new URLs, keyboard focus unchanged, screenshots 1440/390, Clarity recheck in 14 days.
3. ~~**Marketing services funnel (E1)**~~ DONE #2111 LIVE 26.10 — proof rail beside the hero CTA on 5 SEO pages; — `/services/seo-for-logistics-companies/` (676 impressions), `/services/seo/` (189),
   `/services/local-seo/`. Shared `DigitalServicePage`.
   Accept: above the fold PERSON (who it is for) → PROMISE (one line, existing approved copy) → PROOF (one real
   asset: Appleton case, logistics SEO audit sample, own-search baseline — links only, no new claims) → ONE primary
   CTA; closing panel leads into the form; no URL/H1/title/canonical change; CTA uses the existing
   `commercial_cta_click`/`case_study_cta` hooks (no new analytics payload fields).
4. ~~**`/contacts/` + brand entity hub (E2)**~~ DONE #2117 LIVE 26.10 — primary request action + four directions (shared `DirectionRouter`); (138 impressions, pos 19). Accept: visitor sees the four directions + the form; one
   primary action per screen.
5. **Careers funnel** — BLOCKED on owner: the dispatcher vacancy is held closed ("awaiting fresh owner review"); reopening needs an owner hiring decision. (`/careers/car-hauling-dispatcher/` pos 6, real clicks; `/logistics/careers/`). Accept: role
   promise → requirements proof → one apply action.
6. ~~**Logistics commercial funnel**~~ DONE #2118 LIVE 26.10 (one primary hero action, brand ink headings, Logistics blue accents) — (car-hauling dispatch, Appleton/Wisconsin vehicle transport, dealer transport).
7. ~~**Technology services funnel**~~ DONE #2119 LIVE 26.10 — proof rail on website development / redesign / auto-repair design; (website development / redesign / auto-repair design).
8. ~~**Academy funnel**~~ DONE #2120 LIVE 26.10 — funnel structure already complete (hero CTA → audiences → curriculum → process → boundaries → FAQ → closing CTA); legacy violet boundary cards and consent links now follow the Academy accent; (`/academy/us-logistics-operations/`, apply).
9. **Direction owners proof block** (`/paths/*`) — only with existing approved proof.
10. ~~**Classify London cluster**~~ DONE #2122 — 45 pages; 23 pages had no direction family (violet eyebrows, navy headings): now tagged; hubs neutral, direction cards fully clickable.
11. **E3 near-duplicate templates (search impact first)** — car-hauler city pages are 86–92 % identical and 24 of 25 never got an impression; owner chooses: real per-city evidence, or `noindex,follow` + sitemap removal (pages stay live). Then London industry pages and business listings. Ranked above controls cleanup on 27.10: indexation is the bottleneck, not polish.
12. **Controls cleanup**: remaining 12px-radius public buttons; status chips by semantic state.
13. **RU/UA full-translation plan** (separate project; scope document first, no mass pages).

## Blocked on owner / ChatGPT (evidence receipts go to the Drive evidence folder)

- Clarity Data Export API token as environment secret `CLARITY_API_TOKEN` (direct dead-click data without clicks).
- GA4: mark `contact_request_delivered`, `carrier_handoff_ready`, `load_board_qualified_action` as key events; link GA4 ↔ GSC.
- Clarity + GA4: exclude internal traffic (team IPs).
- Bing: new Site Scan (last 04.10 is stale) — needs a button press in the console; this session can read console pages by URL but cannot click; AI Performance cited URLs. (IndexNow "issue" rows were read 26.10: they are indexed URLs — E7 closed.)
- MC/USDOT on a public page: `OWNER_APPROVAL_REQUIRED` + official source per `CANONICAL_COMPANY_FACTS_APPROVAL.md`
  (numbers alone are not enough).
- Old image deletion: explicit per-action "удаляй" from the owner.
- Authority (#368): real partner/client/directory links; no link schemes.

## Done (most recent first)

- 2026-10-26 #2122 London cluster classified + family accents.

- 2026-10-26 #2120 Academy accents (violet → family) — LIVE.

- 2026-10-26 #2119 Technology services proof rail — LIVE.

- 2026-10-26 #2118 Logistics commercial pages: one primary hero action, ink headings, blue accents — LIVE.
- 2026-10-26 #2117 /contacts/ primary request action + four directions (E2) — LIVE.

- 2026-10-26 #2111 SEO service proof rail (E1) — LIVE.

- 2026-10-26 #2109 body sections, brand-intent routing, service CTA order, dead-click cards (E13), matrices — LIVE.

- 2026-10-26 #2108 Technology/Academy/Marketing family accents — LIVE.
- 2026-10-26 #2104 Logistics accents + light product nav — LIVE.
- 2026-10-26 #2100 own-search baseline Insight — LIVE.
- 2026-10-26 #2093 one JSON-LD block per entity (Clarity error) — LIVE.
- 2026-10-26 #2091 waves A+B (~120 heroes Pearl / live window) — LIVE.
- 2026-10-26 #2027 locale mechanisms + Catalog subnav — LIVE.
