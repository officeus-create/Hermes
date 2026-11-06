# Hermes investor + partnership portfolio: one source, four surfaces

Date: 2026-11-06. Status: SOURCE PR / NOT LIVE / NOT AUTOPUBLISHING.
Master WORK_ID: W-20261024-103. Command Center mapping issue: #2224.
Investor frontend: existing #2055 (DRAFT / separate Search and legal gates).
Canonical Drive: HERMES INVESTMENT INTELLIGENCE — MASTER PROMPT & CONTROL CONTRACT — CURRENT.
Do not replace One Brain Ledger, the existing Insights pipeline, or the canonical HAE runtime.

## Changes in this branch
- `src/data/hermes-projects-public.mjs`: 23 public-safe, stage-labeled project records. This is a bounded reviewed portfolio slice, NOT certified exhaustiveness. It covers operating services, pilots, development, concepts and long-term strategic hypotheses.
- `src/pages/products/index.astro`: new `/products/#projects` section, using this registry rather than a second list; no new route or sitemap expansion needed.
- `functions/api/_lib/command-center-projects.mjs`: projects not already present among the twelve specialized technical registry entries appear in owner-only Command Center; original technical milestones and blockers remain unchanged. Project stage labels are not earned commercial completion or percent of engineering work.
- `data/insights/project-portfolio-editorial-rotation-2026-11-06.json`: 23 consecutive proposed daily slots, **all** VERIFY_AND_DRAFT. No scheduled publication or actual distribution is asserted.
- Regression assertions in `scripts/internal-command-center-project-portfolio.test.mjs`.

## Editorial workflow — use existing HAE/Insights, no ChatGPT scheduler

1. Existing HAE/owner-led signal or human editor selects the next unused candidate for America/Chicago daily slot. Idempotency key is `project_id + slot_date + canonical story angle`. Existing Insights source-registry, candidate scoring, privacy, stage and duplicate gates apply.
2. Research the **new dated development/update** on the project. A record describing only the project is an evergreen portfolio card, not a fabricated daily news event. Do not backdate or relabel an old concept as a new launch.
3. Produce a genuinely distinct answer: user/partner problem, what actually exists, evidence and observation date, missing gates, practical implication, internal owner link, and next action. At least one dated first-party source and original analysis; public external sources when current-market claims are made. Prior article collision check including `/insights/technology/i-am-vision/`.
4. Apply `scripts/publish-insight.mjs` only to complete source-verified candidates and run existing Insights tests. Existing `.github/workflows/insights-content-pr.yml` opens a **draft PR**, never a silent merge. Source code/CI is not proof of publication.
5. Human editor and appropriate Legal/Search/Privacy reviewer approve exact PR head. Merge through existing protected release path; verify live URL, sitemap/RSS/indexability and page content with a dated production receipt. Then update a real published_url, not before.
6. Update One Brain W-20261024-103 and Command Center work receipts. Publish platform-specific social summaries only through existing approved connectors, with UTM attribution and source rights; no mass blast.
7. Stop a daily slot if no qualifying new evidence exists. NEVER generate thin pages merely to meet a count.

## Investment / funding routing
- Seven investable directions in #2055 are not the complete public project inventory.
- Public `/products/#projects` is an informational overview, not an open securities offering. Private investor rooms remain guarded and on hold.
- Current program priorities from C080: Cloudflare Tier 3 official form first (provider says bootstrapped can be eligible), Together AI official form, Databricks, OVHcloud US form; the exact eligibility and current provider state must be rechecked. Do not equate emails with application receipts.
- Volvo CampX track selection remains on factual gates; corporate PoV is a proposal template, not a secured paid pilot. Realized value means activated credits, real signed pilot/revenue or completed evidence-backed result.

## Post-mortem / what improves
Prior weakness: scattered investor directions, concepts, products and Command Center technical objects were described as if one comprehensive registry already existed. The public project family was absent from the owner registry; individual PRs could be mistaken for shipped website releases. This branch adds a source-linked projection, with staged claims, no duplicate task authority, and draft-only publish queue.
Better benchmark: editorial release trains use one content registry, separation of evidence from promotional claims, source/date transparency, structured internal links, no synthetic news, and human acceptance of exact content. Measure `index impressions -> qualified actions -> partner inquiry -> paid PoV/activated credit`, not count of pages or proposed projects.

## Gates and receipts
- [x] Public-safe source registry, 23 records created on feature branch
- [x] Existing Products page source updated on feature branch
- [x] Existing Command Center source projection added on feature branch
- [x] Twenty-three proposed daily candidate slots (not automatic publication)
- [ ] Exact-head Node/build/CI and current-owner source readback
- [ ] Independent privacy, stage truth, UX, Search and business-owner review
- [ ] Protected merge, deploy, production readback, GSC search verification
- [ ] Existing HAE scheduling integration and one real end-to-end daily-run receipt
- [ ] First daily approved Insight and qualified site-action measurement
- [ ] Google Drive/One Brain ledger source-to-current issue notes synchronized

## Next action
Review exact-head CI of this branch; resolve defects without disturbing existing #2055 and Command Center #2236 release line. After approval, take the first dated project with new evidence and exercise the existing draft Insight path; only then route owner-accepted HAE daily intake. Never turn on a parallel autonomous publisher or a paid model loop.
