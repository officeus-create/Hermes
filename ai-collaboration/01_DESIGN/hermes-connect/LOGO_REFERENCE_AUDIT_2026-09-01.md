# Hermes Connect Logo Reference Audit — 2026-09-01

Status: COMPLETE
Baseline: `main` at `06e0d52446a74e454d1e42da83cbc2d77341553c`

## Result
No active production reference to the pre-Option-02 mint-node / intelligent-knot geometry was found in the checked default-branch code search.

## Verified current canonical assets
- `public/demos/hermes-connect/icon.svg` explicitly describes the approved Option 02 continuous connected-flow mark and uses the Option 02 loop geometry.
- `public/demos/hermes-connect/icon-192.svg` uses the same continuous-loop geometry inside the Obsidian app tile.
- PWA manifest/service-worker references to `icon-192.svg`, `icon-512.svg`, maskable and Apple Touch assets are asset-family references, not evidence of the retired logo.

## Public launcher references
`src/components/HermesConnectLauncher.astro` currently points all launcher variants at `/demos/hermes-connect/icon-192.svg`. Because that asset itself is now Option 02, this is not a stale-logo bug. A future refinement may separate the standalone horizontal brand mark from the square install/app tile, but that is an application-quality improvement rather than a legacy-logo cleanup.

`src/components/HomeRecoveryFinish.astro` also references `/demos/hermes-connect/icon-192.svg`; the same classification applies.

## Legacy naming debt
Names such as `hermes-connect-knot-core.css` and `.hermes-knot-mark` remain in the codebase. They are historical compatibility names, not current visual geometry. They should not be renamed in a broad sweep because selector/file renaming adds regression risk without visual benefit. Rename only as part of a bounded component refactor with tests.

## Rule learned
Audit by rendered asset content, not by historical filenames/classes. A legacy filename is not automatically a legacy visual; conversely, a newly named wrapper can still render an outdated asset.
