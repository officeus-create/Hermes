# Codex task list — SEO/GEO platform work outside the repository (2026-10-23)

Prepared by Claude Code after the site-wide responsive/SEO pass (PRs #2024, #2025).
The website code is done; these items live in Google, Facebook and directories, where
Codex has connected access. Each item needs owner confirmation at the moment of action
per `CLAUDE.md` (account/settings changes, publishing on the owner's behalf).

## Baseline (OpenRush, 2026-10-23)

> Evidence classification (added 2026-10-26 per `docs/DESIGN_INTEGRATION_CONTRACT.md` / #2087):
> every line below is a dated third-party provider observation, **not** a code task. Classify it
> against current `main` + live before acting (`CURRENT / REPRODUCED / PROVIDER_LAG / STALE /
> RETIRED_ROUTE`); only `CURRENT + REPRODUCED` becomes repository work. Current owners: #1948,
> #2045, #2004, #368 (authority/backlinks, Clutch WAIT_PROVIDER_READBACK) — the backlink and
> directory items below belong to #368, not to a new writer.
>
> | Observation | Class (2026-10-26) | Owner |
> |---|---|---|
> | Low indexed-keyword count / no top-30 for core terms | PROVIDER observation, not reproducible in code | #368 / Search owner |
> | 0 Google AI Overview citations | PROVIDER observation | #368 |
> | Local pack on dispatch queries | CURRENT (off-repo: Business Profile) | owner / Codex |
> | ~2,370 spam referring domains | PROVIDER observation; no manual action seen → no code task | #368 |

- 8 keywords indexed for hermeslogisticsus.com; no top-30 position for core terms
  ("car hauling dispatch services", "car hauler dispatch", "owner operator dispatch services",
  "new authority dispatch", "car hauling load board", "how to start a trucking company").
- 0 citations in Google AI Overviews.
- Top results for "car hauling dispatch services" include a local pack (Dispatch Ray,
  Dispatch Dudes, Ninja Dispatch) — a Google Business Profile is the entry ticket.
- ~2,370 spam referring domains appeared this week (anchor "Premium Link Building Experts
  for Better Rankings hermeslogisticsus.com"). Negative-SEO noise; no action unless Search
  Console shows a manual action.

## Tasks

1. **Google Search Console**
   - Verify the `hermeslogisticsus.com` domain property (DNS TXT via Cloudflare — owner confirms the DNS change).
   - Submit `https://hermeslogisticsus.com/sitemap.xml` (sitemap index).
   - Request indexing for: `/`, `/paths/logistics/`, `/logistics/car-hauling-dispatch/`,
     `/logistics/start-trucking-company/`, `/logistics/owner-operator-dispatch-support/`,
     `/logistics/new-authority-car-hauler-support/`, `/load-board/`, `/services/hermes-connect/`,
     `/insights/technology/hermes-automatic-engineer-business-automation/`.
   - Check Manual actions and Security issues; report results.
   - Connect GSC to OpenRush so Claude can read real positions and clicks.
2. **Bing Webmaster Tools**: import the site from GSC and submit the same sitemap (feeds Copilot/ChatGPT search).
3. **Google Business Profile** for Hermes Logistics LLC (service-area business, no street
   address if none is approved). Use only facts approved in `docs/CANONICAL_COMPANY_FACTS_APPROVAL.md`:
   name, website, `officeus@hermeslogisticsus.com`, categories (logistics / transportation
   service), service area. **No phone** — none is approved.
4. **Facebook page** (`facebook.com/profile.php?id=61558767681287`): owner to approve new
   "About" text matching the site. It currently says "established in 2018, providing
   high-quality information and telecommunication services", which conflicts with the site.
   Old posts show the retired phone `(351) 777-5337`. Owner decides whether to edit or hide them.
5. **Entity consistency**: same name, description, website and email on Instagram
   (`@hermes.logistics`), Threads, LinkedIn company page (create if missing), staff.am, work.ua.
6. **Honest citations**: list the company in relevant directories (Google Business Profile,
   Bing Places, Apple Business Connect, BBB if eligible, relevant trucking/dispatch directories)
   with identical facts. No purchased links, no review gating.
7. **Reviews**: ask real carriers, shippers and clients for Google reviews once the profile exists.
8. **Gmail connector**: reconnect the Claude Gmail connector to `officeus@hermeslogisticsus.com`
   (currently `volkogon.v@gmail.com`). Owner will do this later; it is not blocking.

## Not to do

- Do not publish internal logistics arrangements (DOT/MC plans, CDL, leasing, percentages) — owner instruction.
- Do not publish agency names, counts, fleet or authority numbers without evidence in the canonical facts doc.
- Do not disavow links unless Search Console reports a manual action.
