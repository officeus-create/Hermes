# Hermes Connect Launcher Application Audit — 2026-09-01

Status: COMPLETE
Baseline: `main` at `06e0d52446a74e454d1e42da83cbc2d77341553c`

## Current shared component
All primary public applications route through `src/components/HermesConnectLauncher.astro`, which is the correct consolidation point. SiteHeader uses `header` and `mobile`; SiteFooter uses `footer`; path and service pages reuse `banner`.

## Current mark scale contract
- Header: 22 × 22
- Mobile navigation: 30 × 30
- Footer brand: 24 × 24
- Footer/banner action: 20 × 20
- Banner badge: 20 × 20
- Inline launcher: 18 × 18

The scale is coherent: navigation contexts use a smaller mark, the mobile card gets a larger touch-friendly presentation, and supporting links remain subordinate.

## Spacing contract
- Header mark-to-label gap: compact pill spacing (`.42rem`).
- Mobile mark-to-copy gap: larger card spacing (`.75rem–1rem`).
- Footer brand gap: `.5rem`.
- Inline/banner action gap: `.35rem–.4rem`.

No isolated one-off size override was found in the audited launcher usage paths.

## Application-quality note
The launcher currently uses the square `icon-192.svg` app tile as its mark source. This is the approved Option 02 geometry, so it is not a stale-brand defect. A future refinement can add a transparent standalone mark asset for public-brand contexts while keeping the square tile for PWA/app-install contexts. That should be validated visually before replacement because it changes perceived density in the header/footer.

## Decision
Do not make a no-evidence visual change solely to remove the square tile. Keep the shared launcher size contract stable until a transparent-mark comparison is available.
