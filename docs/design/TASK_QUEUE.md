# Hermes design × Search × funnel — task queue

Take the top open task. One family = one PR. Each family PR ships design AND funnel AND the measurement hook
together — the funnel is never "the next step". Update this file and `COVERAGE_MATRIX.md` at the end of every session.

Each task names the `SEARCH_ERROR_MATRIX.md` rows it closes. Order is by measured demand (GSC 28.07–23.10 impressions per family), not by habit. Change it only on owner
instruction or new provider evidence recorded in the matrix.

## Open

Estimate: tasks 1–4 ≈ 1 working day; 5–9 ≈ 1.5 days (one family per slice, ~2 h each incl. CI); 10–12 separate.
Ranking effects need 2–8 weeks after deploy; every slice records its recheck date in the error matrix.

1. **#2109 → merge → live readback** (body sections, brand-intent routing, service CTA order, honest self-case).
   Accept: CI green on head; live 1440/390 of `/logistics/car-hauler-loads/denver-co/`, `/es/`,
   `/services/seo-for-logistics-companies/`, `/company-information/`; matrix rows 3–13 updated.
2. **Dead clicks (E13) — whole cards become their existing link** on `/insights/`, `/businesses/`, `/opportunities/`,
   `/paths/technology/` and direction hero windows; non-linked Catalog state tiles stop looking clickable.
   Accept: same hrefs, no new URLs, keyboard focus unchanged, screenshots 1440/390, Clarity recheck in 14 days.
3. **Marketing services funnel (E1)** — `/services/seo-for-logistics-companies/` (676 impressions), `/services/seo/` (189),
   `/services/local-seo/`. Shared `DigitalServicePage`.
   Accept: above the fold PERSON (who it is for) → PROMISE (one line, existing approved copy) → PROOF (one real
   asset: Appleton case, logistics SEO audit sample, own-search baseline — links only, no new claims) → ONE primary
   CTA; closing panel leads into the form; no URL/H1/title/canonical change; CTA uses the existing
   `commercial_cta_click`/`case_study_cta` hooks (no new analytics payload fields).
4. **`/contacts/` + brand entity hub (E2)** (138 impressions, pos 19). Accept: visitor sees the four directions + the form; one
   primary action per screen.
5. **Careers funnel** (`/careers/car-hauling-dispatcher/` pos 6, real clicks; `/logistics/careers/`). Accept: role
   promise → requirements proof → one apply action.
6. **Logistics commercial funnel** (car-hauling dispatch, Appleton/Wisconsin vehicle transport, dealer transport).
7. **Technology services funnel** (website development / redesign / auto-repair design).
8. **Academy funnel** (`/academy/us-logistics-operations/`, apply).
9. **Direction owners proof block** (`/paths/*`) — only with existing approved proof.
10. **Classify London cluster** (`/gb/london/*`) into the matrix.
11. **Controls cleanup**: remaining 12px-radius public buttons; status chips by semantic state.
12. **RU/UA full-translation plan** (separate project; scope document first, no mass pages).

## Blocked on owner / ChatGPT (evidence receipts go to the Drive evidence folder)

- Clarity Data Export API token as environment secret `CLARITY_API_TOKEN` (direct dead-click data without clicks).
- GA4: mark `contact_request_delivered`, `carrier_handoff_ready`, `load_board_qualified_action` as key events; link GA4 ↔ GSC.
- Clarity + GA4: exclude internal traffic (team IPs).
- Bing: new Site Scan (last 04.10 is stale); AI Performance cited URLs. (IndexNow "issue" rows were read 26.10: they are indexed URLs — E7 closed.)
- MC/USDOT on a public page: `OWNER_APPROVAL_REQUIRED` + official source per `CANONICAL_COMPANY_FACTS_APPROVAL.md`
  (numbers alone are not enough).
- Old image deletion: explicit per-action "удаляй" from the owner.
- Authority (#368): real partner/client/directory links; no link schemes.

## Done (most recent first)

- 2026-10-26 #2108 Technology/Academy/Marketing family accents — LIVE.
- 2026-10-26 #2104 Logistics accents + light product nav — LIVE.
- 2026-10-26 #2100 own-search baseline Insight — LIVE.
- 2026-10-26 #2093 one JSON-LD block per entity (Clarity error) — LIVE.
- 2026-10-26 #2091 waves A+B (~120 heroes Pearl / live window) — LIVE.
- 2026-10-26 #2027 locale mechanisms + Catalog subnav — LIVE.
