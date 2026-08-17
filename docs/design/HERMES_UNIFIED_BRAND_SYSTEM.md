# Hermes Unified Brand System

Status: canonical design direction for incremental migration

## One Hermes brand

**Pearl Outside. Obsidian Inside. Violet Intelligence.**

Hermes must read as one company and one product ecosystem even when the business context changes. Logistics, Marketing, Academy, IT Development, Hermes Connect, Repair Shops, SEO, legal/localized pages, and future verified verticals share one visual language. Business-specific accents may support meaning; they must not create separate design systems.

## 1. Surface model

### Pearl outside
Public discovery, marketing, education, explanation, onboarding, customer booking, pricing/activation, and product landing surfaces use Pearl as the dominant canvas.

- Pearl: `#F7F6F3`
- Paper: `#FFFFFF`
- Primary text / Obsidian: `#0B0D12`
- Muted text: `#666C79`
- Light border: `rgba(11,13,18,.10)`

Public pages should feel bright, calm, spacious, precise, and premium. Dark sections are deliberate transitions, not the default page background. Owner login/registration, customer booking, and public purchase-intent forms remain part of the public Pearl journey even though they can lead into an Obsidian operational workspace.

### Obsidian inside
Operational workspaces, dashboards, CRM, load boards, AI command surfaces, analytics, and dense work panels use Obsidian.

- Obsidian: `#0B0D12`
- Graphite: `#20232C`
- Raised dark surface: `#151922`
- Dark muted text: `#AEB7C7`
- Dark border: `rgba(255,255,255,.09)`

Darkness communicates: **the user has entered the operating environment**.

A deliberate Obsidian conversion card may appear inside a Pearl public page when it marks a focused plan/decision checkpoint, but it should not turn the entire acquisition or onboarding flow dark.

### Violet intelligence
Violet is the canonical AI/intelligence accent. Ocean may support it. Neither should become a full-page decorative wash.

- Intelligence Violet: `#7C5CFF`
- Ocean: `#5AC8FA`
- Intelligence gradient: Violet -> Ocean

Use the intelligence gradient for the Hermes intelligence object, rare AI-specific CTA/state moments, and restrained highlights. Do not use it as a generic fill on every card or button.

Approximate visual balance for normal public pages: **70% neutral light / 25% Obsidian or imagery / 5% intelligence accent**. This is a composition guide, not a mechanical quota.

## 2. Functional colors

Functional state colors communicate state, not department branding.

- Success / live: `#28B487`
- Brand Sage: `#7FD1B6`
- Attention: `#D99A25`
- Error / destructive: `#D84B5F`

Never assign a new permanent brand color simply because a new department or card needs differentiation.

## 3. Typography

Keep the current self-hosted font stack to avoid unnecessary asset and performance churn:

- Display: Manrope
- Body: Source Sans 3
- Metadata / technical labels: IBM Plex Mono

Display headings:

- weight: 700–800
- tracking: normally `-0.04em` to `-0.06em`
- line-height: normally `.94` to `1.02`
- generous surrounding whitespace

Body copy keeps normal tracking and comfortable line-height. Do **not** apply extreme tight tracking to paragraphs, controls, legal text, or small labels.

## 4. Shape and elevation

Default geometry:

- compact controls: 10–12px radius
- public cards: 22px radius
- large product/workspace panels: 28–30px radius
- primary/secondary CTA: pill where appropriate

Elevation is subtle and directional. Cards should separate from Pearl without looking inflated or glossy by default.

Canonical levels:

1. Hairline only — flat informational surfaces.
2. Soft card — `0 18px 50px rgba(20,20,31,.06)`.
3. Hero/workspace — `0 30px 90px rgba(11,13,18,.16)`.

Do not stack multiple heavy shadows.

## 5. Glass

Glass is a signature material, not a universal component style.

Allowed:

- Hermes Intelligence Knot / Core
- selected floating overlays
- small premium secondary controls on Pearl
- carefully bounded hero composition

Avoid by default:

- long-form copy containers
- every Bento card
- forms requiring high contrast
- dense workspace tables
- mobile surfaces where blur hurts performance

Glass must preserve readable contrast. Provide a non-transparent fallback for reduced-transparency contexts.

## 6. Hermes Intelligence Knot

Hermes uses **one ownable intelligence geometry**, not unrelated decorative 3D objects.

The same Knot/Core may change material and scale:

- Pearl glass in public hero
- darker metallic/iridescent material in Obsidian sections
- small micro-core for AI processing/status

It may rotate slowly, drift slightly, and respond gently to scroll/cursor where performance permits. It must respect `prefers-reduced-motion`.

Do not use generic stock-style 3D trucks, graduation hats, laptops, folders, spheres, cubes, or unrelated clipart as the primary Hermes identity. Real product imagery, editorial photography, functional icons, and meaningful data visuals remain allowed.

## 7. Motion

Motion should make Hermes feel alive, not restless.

- hover feedback: about 160–220ms
- normal UI transition: about 300–400ms
- ambient branded motion: slow and continuous
- no fast perpetual spins
- no simultaneous unrelated animations competing for attention
- `prefers-reduced-motion` must produce a stable usable experience

The Knot may represent genuine application states only when backed by real state. Do not fake live activity.

## 8. Cards and Bento layouts

Bento is a layout tool, not the brand itself.

Good Hermes cards have:

- one clear information hierarchy
- enough breathing room
- thin boundary or subtle elevation
- restrained intelligence accent
- meaningful copy
- consistent radii and typography

Avoid:

- arbitrary rainbow card colors
- stock 3D illustration per card
- decorative spheres with no meaning
- excessive pills and badges
- fake metrics or unlabeled sample data

## 9. Copy and product truth

No Lorem Ipsum, generated gibberish, leaked design-token strings, or internal variable names may ship in customer-facing UI.

Sample/demo content must be explicitly labeled. UI existence must never imply a live integration, successful payment, customer result, autonomous action, inventory, or production capability without evidence.

## 10. Header, footer, and navigation

Public header:

- Pearl / light or restrained translucent treatment
- simplified hierarchy
- one obvious primary action
- no engineering/status clutter in primary navigation

Workspace header/navigation:

- Obsidian/Graphite
- compact operational hierarchy

Footer:

- one shared Obsidian family treatment across public Hermes properties unless a documented accessibility or product requirement demands otherwise.

## 11. Business-family accents

Hermes remains visually dominant. A department may use a small supporting accent for orientation, but it may not redefine typography, shell geometry, navigation, card system, or primary CTA language.

Legacy navy/magenta/gold/teal department palettes are migration inputs, not equal master brand colors.

## 12. Accessibility and performance

- preserve readable contrast on Pearl and Obsidian
- touch targets should remain at least 44px where applicable
- keyboard focus must remain visible
- glass/blur must have fallbacks
- branded motion must be reducible
- mobile must not depend on heavy continuous 3D rendering
- design migration must not regress canonical, hreflang, schema, forms, auth, routing, analytics consent, or product workflows

## 13. Migration rule

Do **not** redesign the entire repository in one PR.

Migrate template families in evidence-backed slices:

1. master tokens + Hermes Connect public Product Hub
2. Repair Shops public landing + auth + customer booking + Founding Plan
3. Repair Shops operational workspace + main Hermes homepage/shared primitives
4. Logistics public family
5. Marketing public family
6. Academy public family
7. IT Development public family
8. SEO / contact / legal / localized secondary templates
9. operational workspaces aligned to Obsidian primitives without forcing public surfaces into Obsidian

Each slice requires desktop + mobile visual review and existing functional/SEO contract checks.

## 14. AI-design audit disposition

Useful guidance adopted from external design reviews:

- remove generic decorative 3D clipart as primary identity
- make the Hermes object meaningful and ownable
- strengthen display typography and hierarchy
- use restrained spatial depth
- enforce copy/token hygiene

Guidance explicitly **not** adopted as blanket rules:

- Liquid Glass on every surface
- heavy deep shadows on every card
- saturated gradients as a universal accent treatment
- extreme letter-spacing on all text
- replacing every 3D/rendered treatment with SVG regardless of purpose/performance

Any alleged typo, leaked token, or broken text from generated mockups must be verified against current production code or live output before being classified as a production defect.

## Canonical implementation source

Semantic tokens live in `src/styles/hermes-brand-system.css`.

Legacy `--color-*` variables remain temporarily for compatibility and must be migrated incrementally rather than redefined globally in a single risky change.