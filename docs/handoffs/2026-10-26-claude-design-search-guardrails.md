# Claude Design × Search/GEO handoff — 2026-10-26

Purpose: give the active Claude design writer the current Search/GEO boundary without dumping raw provider dashboards into the design task.

## What is already Claude Design in production

The approved Claude visual system is not a future mock only. Major design waves have already reached production through merged PRs:

- #1997 — Home v3 / directions / approved motion baseline.
- #2016 — unified header, Products page and Home polish.
- #2025 — H-mark palette / display rhythm / branded social card and related brand cleanup.

Production therefore remains the baseline. Do not restore an older export over newer `main`.

## Current Claude design branch

Open PR #2027 — `Language consistency (EN/RU/UA), light commercial hero, catalog submenu, header fixes`.

Its Search-sensitive surfaces include:

- `SiteHeader.astro` — product/direction navigation and localized labels.
- Catalog pages — removal of the detached `DirectionProductNav`.
- `LogisticsCommercialPage.astro` — dark → pearl/light hero redesign.
- `ContactCTA.astro` and `BusinessLeadForm.astro` — visible localization while keeping stable form values/hooks.
- `SiteFooter.astro` — locale-sensitive public boundary text.

Before #2027 or any successor design PR merges, prove:

1. replacement Catalog/header navigation still exposes required canonical owners in server-rendered HTML;
2. no canonical/hreflang/robots/sitemap owner changes are introduced accidentally;
3. no H1/semantic content is lost when simplifying visual copy;
4. commercial hero images keep stable dimensions and an LCP-safe loading policy;
5. localized visible labels do not change stable form values, contact hooks or canonical locale ownership;
6. desktop/mobile/keyboard/reduced-motion behavior remains green.

## Current Search/GEO evidence to respect

Do not convert every old provider warning into design work.

### Already closed / stale; do not re-fix

- Historical Bing Site Scan snapshot from 2026-10-04 (2 errors / 22 warnings) was later classified stale when current `main` no longer reproduced those classes through the repo Search gates.
- The old Google 403/www redirect case is live-fixed: canonical http/www variants resolve to the canonical HTTPS owner.
- #2076 retired broker-capacity redirect — LIVE_VERIFIED.
- #2077 Appleton false Dataset markup cleanup — LIVE_VERIFIED.
- #2078 London commercial sibling-link graph — LIVE_VERIFIED.
- Historical zero-inbound Ukraine/Kittle's cases were later verified live-fixed.

### Active / current owner work

- Academy localization/indexation quality: #1948 is the current bounded owner. Do not create a second design/localization writer on the same surface.
- Public Load Board truth mismatch: #2045 is the current bounded owner. Design must preserve truthful LIVE/PILOT/PREVIEW/SOURCE-GATED labels rather than make preview surfaces look live.
- Analytics withdrawal hard-stop: #2004 is queued. Do not weaken analytics consent/transport behavior during design work.
- Authority/backlinks: #368 remains the owner. Clutch correction is waiting on provider readback; do not create artificial links/directories or repeat outreach from the design workstream.

### Measurement interpretation

- Search demand already exists on current money owners. Do not rewrite or rename them solely because a redesign changes the visual hierarchy.
- Historic GSC discovered/not-indexed buckets include retired/non-current URLs; use the current exact owner triage before treating a bucket count as an active design defect.
- Bing/GSC/GA4 dashboards should be read for a specific decision, not mirrored wholesale into the repository or used to justify mass page creation.

## Claude implementation rule

Use current `main` + current production as visual/functional baseline, keep the design diff bounded, and run the Search-aware gate from `docs/DESIGN_INTEGRATION_CONTRACT.md`.

If a design decision conflicts with an active Search owner, preserve the design intent but hand off the conflicting route/file instead of overwriting the active writer.
