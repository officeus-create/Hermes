# Hermes Connect — Learning Loop: Option 02 surface coverage and visual evidence

Date: 2026-08-31
Domain: IT / Hermes Connect / Design / PWA / Visual QA
Status: LEARNED

## Observed

The approved Option 02 asset package could pass asset-level checks while still leaving product surfaces inconsistent or visually unsafe:

1. PNG 192/512 and Apple Touch files existed, but their entries had been accidentally removed from `manifest.webmanifest`.
2. The public Hermes Connect launcher used the new Option 02 asset, but the preserved workspace sidebar/mobile bar still rendered the historical inline SVG mark.
3. The first visual-evidence workflow captured a PR merge ref instead of the exact PR head and did not include the canonical `workspace.html` user surface.
4. Once exact-head workspace screenshots were added, the 390px screenshot exposed a real horizontal overflow: the closed fixed Hermes Intelligence drawer remained rendered off-canvas and widened the document.

## Root causes

- Asset review was treated as a proxy for surface review.
- The PWA contract verified that referenced icons existed, but did not require the complete install-icon set.
- Visual QA verified screenshot creation, not document geometry.
- GitHub pull-request checkout defaults were not made explicit, so visual evidence could describe a synthetic merge SHA.
- The closed drawer used transform-based off-canvas hiding while remaining `display:grid`, allowing the hidden fixed element to participate in scroll overflow.

## Changed

- Restore PNG 192/512 and Apple Touch entries in the manifest.
- Require PNG, Apple Touch, SVG, and maskable install icons in the PWA contract.
- Render Option 02 in workspace desktop/mobile chrome and retire the old inline mark visually.
- Add a dedicated Hermes Connect visual-evidence workflow.
- Checkout `github.event.pull_request.head.sha` explicitly and record that exact SHA in evidence.
- Add `/demos/hermes-connect/workspace.html` to desktop + 390px screenshot coverage.
- Remove the closed Hermes drawer from layout and constrain the open drawer to mobile viewport insets.
- Make the Chromium evidence gate measure `document.scrollWidth` and fail if the 390px workspace overflows before, during, or after drawer interaction.

## Rules for next time

### Asset-to-surface rule
`APPROVED ASSET → ALL REFERENCES → ALL USER SURFACES → INSTALL CONTRACT → VISUAL EVIDENCE`

Never assume that changing a source asset changes inline SVGs, manifests, browser chrome, PWA metadata, or preserved prototype surfaces.

### Visual-evidence rule
`EXACT HEAD → REAL USER ROUTE → DESKTOP + MOBILE → INTERACTION → GEOMETRY → SCREENSHOT → HASH`

A screenshot job is not sufficient evidence unless it also validates the relevant document and interaction geometry.

### GitHub evidence rule
For PR evidence, explicitly checkout the PR head SHA. Do not rely on the default pull-request merge ref when the claim is about exact-head behavior.

## Regression guards

- `hermes-connect-pwa-contract.test.mjs` requires the complete install icon set, Option 02 workspace chrome, and mobile drawer containment rules.
- `route-screenshot-contract.mjs` includes the canonical workspace route.
- `capture-route-screenshots.mjs` validates mobile workspace drawer closed/open/closed behavior and document width.
- `.github/workflows/hermes-connect-visual-evidence.yml` publishes 1440px + 390px exact-head artifacts.

## Promotion boundary

Do not promote Option 02 to DONE/LIVE until:

1. Website checks pass on the final branch state.
2. Hermes Connect custom-domain verification passes.
3. Exact-head visual evidence passes and the resulting desktop/mobile workspace screenshots are inspected.
4. Owner visual review is complete for the material design change.
5. Merge and production verification are separately completed.
