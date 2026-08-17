# Hermes Brand Migration Audit

Status: active migration ledger

Purpose: converge the public website, Hermes Connect, Repair Shops, and operational surfaces onto one visual system without a one-shot rewrite or product regressions.

Canonical system: `docs/design/HERMES_UNIFIED_BRAND_SYSTEM.md`
Canonical tokens: `src/styles/hermes-brand-system.css`

## Evidence classes

- **VERIFIED** — observed in current repository source on the branch baseline.
- **MIGRATED IN THIS SLICE** — changed in the current design branch.
- **NEXT** — validated target for the next incremental PR.
- **DO NOT INFER** — mockup/AI-review claim not yet confirmed in current code or live output.

## Current design-system findings

### Foundation

| Area | Current finding | Status | Target |
|---|---|---|---|
| `src/styles/global.css` | Legacy root palette still defines navy, violet, magenta, gold, teal and legacy gradients. Many existing templates depend on it. | VERIFIED | Keep for compatibility, migrate consumers family-by-family to semantic Hermes tokens. Do not redefine globally in one change. |
| `src/styles/hermes-brand-system.css` | New additive master tokens: Pearl, Paper, Obsidian, Graphite, Violet, Ocean, semantic states, elevation, radii and motion. | MIGRATED IN THIS SLICE | Single source for new/migrated design work. |
| `src/layouts/BaseLayout.astro` | Shared layout previously loaded only legacy global/shared styles. Theme-color remains legacy navy. | PARTLY MIGRATED | Master tokens are now globally available. Change theme-color only when public shell migration proves safe across dark legacy templates. |
| `src/styles/homepage-performance.css` | Previously declared a second Hermes token set with different Violet/Blue values and a conflicting control radius. | MIGRATED IN THIS SLICE | Consume master tokens; no second homepage palette. |
| `src/styles/hermes-connect-safe-polish.css` | Repair Shops had a useful Pearl override but auth/booking and product-context still exposed older dark styling. | MIGRATED IN THIS SLICE | Public Connect, Repair landing, owner onboarding, and customer booking consume master Pearl/Obsidian semantics. |
| `src/styles/hermes-connect-knot-core.css` | Shared Knot geometry/motion contract exists. | VERIFIED | Keep one ownable Hermes intelligence geometry; converge materials and usage rather than creating unrelated 3D objects. |

## Template-family matrix

| Family | Representative source | Current design risk | Target mode | Priority |
|---|---|---|---|---|
| Hermes Connect Product Hub | `src/pages/services/hermes-connect/index.astro` | Prior product-hub presentation drifted between local light and dark shells; stale draft also existed. | Pearl public hero + one Knot + Obsidian workspace preview + explicit product truth. | P0 — MIGRATED IN THIS SLICE |
| Repair Shops public landing | `src/pages/services/hermes-connect/repair-shops.astro` + Connect safe polish | Previously depended on a local Pearl override above an older dark page stylesheet. | Pearl public shell, shared typography/buttons/cards/Knot; product functionality untouched. | P1 — MIGRATED IN THIS SLICE |
| Repair Shops auth/booking/public customer flow | `src/pages/services/hermes-connect/repair-shops/auth.astro`, `booking.astro`, `plan.astro` | These routes were still full-dark surfaces with gradient primary actions, visually breaking the public journey. | Pearl onboarding/booking/activation surfaces, Obsidian primary actions, one intentional Obsidian price/conversion anchor; locale/auth/booking/payment-intent behavior preserved. | P1 — MIGRATED IN THIS SLICE |
| Repair Shops dashboard/owner operations | Repair Shop dashboard/availability/customers routes | Must not be forced into light marketing design. | Obsidian Inside: dense operational hierarchy, shared states and controls. | P2 — NEXT |
| Main Hermes homepage | `src/pages/index.astro` + homepage components | Hero/editorial language and downstream cards are not yet fully converged; page-specific tokens previously conflicted with master tokens. | Pearl-dominant corporate ecosystem shell, selective Obsidian intelligence/product sections, one Knot language. | P2 — NEXT |
| Shared business-direction pages | `src/pages/paths/[slug].astro` + `PathDetailPage.astro` | Shared route currently chooses dark header for Logistics/Marketing/Academy and light only for Technology; detail hero is photo/dark-led. | One public Pearl shell and common component grammar; department distinction becomes secondary accent/content, not a separate UI system. | P3 |
| Logistics family | shared path + logistics-specific components/routes | Largest legacy navy/department-style exposure and many commercial/SEO surfaces. | Pearl public family with restrained logistics imagery; Obsidian only for operational product demonstrations. | P3 |
| Marketing family | shared path + marketing-specific components | Risk of magenta/gradient identity becoming a second top-level brand system. | Hermes master shell; marketing accent remains subordinate. | P4 |
| Academy family | shared path + Academy components/routes | Additional nav/program surfaces can develop separate typography/card rules. | Hermes master shell; restrained warm/Sand orientation accent only where useful. | P4 |
| IT Development / Technology | shared path + technology components | Already closer to light/AI language but contains many specialized prototype/showcase components. | Pearl + Obsidian + Violet Intelligence; prototype truth labels preserved. | P4 |
| Hermes Connect Labs/capability pages | `HermesConnectCapabilityPage.astro` + capability routes | Reference modules may look like separate products if each receives custom design. | One subordinate Labs presentation; shared Connect components; clearly marked reference/non-live. | P2 |
| SEO/service landing pages | service/location route families | Large route volume means local overrides can multiply inconsistency. | Migrate shared landing-page primitives first; keep SEO content/canonical/schema/hreflang unchanged. | P5 |
| Carrier/onboarding/contracts | carrier, contracts, logistics onboarding families | Functional/commercial surfaces must remain readable and trustworthy during migration. | Shared Pearl controls/forms for public steps; Obsidian only for operational tools. | P5 |
| Contact/about/company/legal/accessibility/security | top-level secondary pages | Often visually forgotten after hero redesigns. | Quiet Pearl information template + shared header/footer/type/form primitives. | P6 |
| Localized routes | EN/RU/UK/ES/IT/FR equivalents | Same-route localization and translated copy can diverge visually if per-locale overrides are introduced. | Same canonical layout/tokens at every locale; text expansion tested. | P6 |
| Historical demos/reference assets | `public/demos/hermes-connect/*` and demo routes | Could be mistaken for current product if visually promoted. | Preserve explicit demo/reference boundaries; do not redesign them into apparent production runtimes. | Guardrail |

## Shared components to migrate before page-by-page overrides

1. `SiteHeader.astro`
2. `SiteFooter.astro`
3. common buttons/links and focus states
4. section headings / eyebrow / display typography
5. public card primitive
6. forms and field controls
7. status chips based on semantic state, not department color
8. Hermes Intelligence Knot placement/material contract
9. public Pearl shell and Obsidian workspace shell
10. responsive spacing/container rules

A shared-component change must be visually checked against representative routes before broad rollout.

## Visual QA coverage added in this slice

The route screenshot contract now includes the current Repair Shop public journey in addition to the older generic routes:

- `/services/hermes-connect/repair-shops/`
- `/services/hermes-connect/repair-shops/auth/`
- `/services/hermes-connect/repair-shops/plan/`

Each controlled route is captured at the standard desktop and mobile viewports when the screenshot-evidence workflow runs. Public booking is not added to the static route list without a real shop identifier; that route remains protected by browser-flow tests instead of fabricating a customer/shop state for screenshots.

The design PR remains **draft** until current-head build/static/browser checks are green and representative visual evidence is reviewed. A successful source-level migration is not called visually verified before that gate.

## External AI design review: accepted vs rejected

### Accepted

- reject generic stock-style 3D clipart as Hermes primary identity
- keep one meaningful, ownable intelligence object
- improve display heading hierarchy with tighter tracking at large sizes
- give light cards restrained physical separation from Pearl
- prohibit generated gibberish, leaked design tokens, placeholder copy, and unlabeled sample data

### Rejected as blanket rules

- Liquid Glass on every card/surface
- deep heavy shadows everywhere
- saturated gradients on normal controls
- extreme tight tracking on body text or small UI
- replacing every rendered/3D treatment with SVG regardless of purpose
- treating a model's `100% confidence` as evidence

## Unverified claims from generated/mockup review

The following are **not production defects until verified in current source or live output**:

- alleged `Дистемно` typo
- alleged visible `#E11D48` token
- alleged visible `#7C3AED` token
- alleged generated gibberish in Bento cards

If any appears in live output or current source, promote it to VERIFIED and fix it in the smallest appropriate slice.

## Release sequence

1. **P0 Foundation + Connect Hub** — migrated in current draft PR.
2. **P1 Repair Shops public/auth/booking/plan shell** — migrated in current draft PR; backend unchanged.
3. **P2 Repair operational workspace + homepage/shared public primitives + Connect Labs** — next after current-head QA.
4. **P3 Logistics public family**.
5. **P4 Marketing + Academy + IT Development**.
6. **P5 SEO/service/carrier/contract route families** through shared templates.
7. **P6 secondary/legal/localized completeness pass**.
8. **Obsidian workspace convergence** where operational density warrants it.
9. **Full visual QA**: representative desktop + mobile per template family, contrast, overflow, reduced-motion, localization expansion, canonical/schema/hreflang, functional flows.

## Definition of visual convergence

A route is not considered migrated merely because it uses Pearl or Violet. It must use the same:

- typography hierarchy
- spacing rhythm
- surface/elevation logic
- radii
- button/control grammar
- header/footer family
- semantic state colors
- Knot/motion vocabulary where appropriate
- truth-label rules
- mobile/accessibility behavior

The intended result is recognizable as Hermes even with the logo hidden.
