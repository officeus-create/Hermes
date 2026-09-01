# Hermes Connect Launcher Route Coverage Audit — 2026-09-01

Status: COMPLETE
Baseline: `main` at `06e0d52446a74e454d1e42da83cbc2d77341553c`

## Shared entry points
The public Hermes Connect presentation is consolidated rather than copied manually.

### Global navigation
`src/components/SiteHeader.astro`
- desktop header: `HermesConnectLauncher variant="header"`
- mobile navigation: `HermesConnectLauncher variant="mobile"`

`src/components/SiteFooter.astro`
- global footer: `HermesConnectLauncher variant="footer"`

### Four public business paths
`src/pages/paths/[slug].astro` generates the public Logistics / Marketing / Academy / Technology path pages from one route template and renders:
- `HermesConnectLauncher variant="banner" context={path.id}`

This is the correct architecture: all four directions inherit one launcher implementation while passing context only.

### Additional public service surfaces found
- `src/components/DigitalServicePage.astro` uses the shared banner launcher.
- `src/pages/load-board.astro` uses the shared banner launcher with Logistics context.

## Result
No separate hand-coded Hermes Connect banner implementation was found in the audited high-value public route families. The current architecture already gives one place to change sizing, copy rules, localization behavior and Option 02 asset application.

## Rule
Do not add new standalone Hermes Connect promo/banner markup to a page. Extend `HermesConnectLauncher` with a bounded variant/context only when the existing variants cannot express the required composition.
