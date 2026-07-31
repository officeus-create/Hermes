# Codex Phase 1 Reconciliation

Date: 2026-07-31
Related: Issues #20 and #21

## Current-main verification

### `#journey` anchor

Current `main` still renders the section as `<section id="why">` and does not contain the frozen `#journey` anchor. PR #7 contains the right minimal application change but also changes `docs/AI_HANDOFF.md` with malformed nested list formatting. The safe action is to port only the additive anchor change onto a fresh current-main branch and leave the handoff-log edit behind.

### PR #9

PR #9 is based on the historical `seo/academy-audience-roadmap` branch. Its two commercial logistics pages and much of its SEO/schema work were superseded by merged PR #13. Do not merge PR #9 wholesale. Review only remaining unique patches before deciding whether to port or retire them.

### PR #19

PR #19 contains useful Careers, growth registries, lane scoring, evidence gates, and Codex handoff material, but it is behind current `main` and currently non-mergeable. Synchronize deliberately after the small current-main phase 1 fix is verified. Shared files must preserve merged PR #13 and PRs #15–#17.

## Phase 1 implementation

- add a visually hidden, aria-hidden `#journey` anchor immediately before the existing `#why` section;
- preserve `id="why"`, styling, copy, and analytics scope;
- do not import the PR #7 handoff-log formatting change;
- run the complete GitHub Actions workflow;
- keep the PR draft until owner review.

## Next checks

1. Verify current source paths for:
   - Appleton vehicle transport;
   - Auction Vehicle Pickup Checklist;
   - Car Hauler Capacity Checklist.
2. Verify sitemap and generated metadata/schema coverage.
3. Record live checks separately when current production access is available.
4. Continue Issue #22 only after Phase 1 CI is green.

## Owner gates

No merge, production deployment, DNS, billing, secrets, Cloudflare account change, or destructive action is authorized by this report.
