# Hermes Private Workspace Navigation Audit — 2026-09-01

Status: COMPLETE

## Shared account switcher
The account/business switcher itself is consolidated in one component:
`src/components/HermesConnectAccountSwitcher.astro`.

It consumes the unified `/api/hermes-connect/account` payload and exposes the same Repair / Academy / AI / owned-business model rather than each workspace inventing its own account list.

## Placement by private surface
### Repair Shops
`SiteHeader.astro` recognizes Dashboard / Availability / Customers as private Repair routes and renders:
- compact account switcher in desktop header;
- account panel inside mobile navigation.

Repair Shop also has its separate contextual owner navigation for operational pages. That is role/navigation, not a duplicate account switcher.

### Academy
`SiteHeader.astro` recognizes dashboard/lesson/program/progression/reviewer/submissions/support private route families and renders the same shared account switcher in desktop/mobile navigation.

Academy-specific navigation remains product navigation and should not be merged into the account switcher.

### Internal AI
`internal/ai-connect` and `internal/ai-assistant` render the same `HermesConnectAccountSwitcher` directly inside the protected product page with `current="ai"`.

The global SiteHeader does not currently classify internal AI routes as `privateWorkspace`, so AI has page-level account context rather than the same header placement used by Repair/Academy.

## Decision
Do not remove product-specific navigation merely because an account switcher exists. The correct separation is:
- **account switcher** = which owned/shared Hermes workspace am I in?
- **product navigation** = where inside this workspace am I going?

There is no duplicated account-switcher implementation to delete.

## Follow-up candidate
Header placement for internal AI is an inconsistency worth testing, but not safe to change blindly because the owner-only AI header also communicates protected/internal status. Treat it as a visual QA item: compare current page-level switcher vs shared header-menu placement before changing hierarchy.

## Rule learned
Do not solve navigation duplication by merging different navigation jobs. Consolidate implementation only when the information architecture role is the same.
