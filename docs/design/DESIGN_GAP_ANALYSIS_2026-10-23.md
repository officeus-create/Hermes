# Design gap analysis — Claude Design (approved) vs the rest of the site

Date: 2026-10-23 · Author: Claude Code · Evidence: live screenshots at 1440px of `/`,
`/paths/logistics/`, `/paths/academy/` (approved Claude Design) against `/logistics/car-hauling-dispatch/`,
`/products/`, `/insights/`, `/load-board/`, `/contacts/`, `/services/hermes-connect/`, `/businesses/`,
plus computed styles and a colour inventory of `src/` and `public/*.css`.

Owner instruction: analysis first, no wholesale redesign. Items marked **Fixed** were small and done
in this pass; everything else is a proposal.

## 1. Two direction palettes are live at the same time (main finding)

| Direction | Brand System V4 doc + most pages (`--hermes-*`) | Claude Design / H mark v1.1 (`--dir-*`) |
|---|---|---|
| Logistics | `#1E88FF` blue | `#2F6BF6` blue (tile of the mark) |
| Technology | `#FF7A00` orange | `#38B6F5` sky (left upright) |
| Academy | `#7C5CFF` violet | `#12B886` green (crossbar) |
| Marketing | `#00C853` green | `#FF7A59` coral (right upright) |

- `src/styles/hermes-direction-colors.css` says "single source — change here only" and carries the
  Claude Design palette, but only Home, the four direction pages and the approved header use it.
- `docs/design/HERMES_UNIFIED_BRAND_SYSTEM.md` §2 still lists the V4 palette. Every other page, the
  Hermes Connect product header and many components use it. Occurrences in source: V4 colours ≈130,
  Claude Design colours ≈17.
- Effect: Academy is green in the main menu and violet inside Connect. Technology is sky in the menu
  and orange in Connect's "IT" item. Marketing is coral in the menu and green elsewhere.
- My earlier site-wide colour clean-up (magenta → violet `#6446e6`) aligned the inner pages to the
  **V4** violet, so it widened rather than closed this gap.
- **Fixed:** the new social preview card now uses the Claude Design palette and menu order.

**Proposal (phase 1):** update Brand System §2 to the H mark palette. Then point `--hermes-logistics/
-technology/-academy/-marketing` at `var(--dir-*)` so ~130 usages follow automatically. Keep
`--hermes-violet` as the Hermes Intelligence / product accent, not as the Academy colour.

## 2. Typography: approved display style is missing on inner pages

| | Approved (Home, directions) | Inner pages (commercial, contacts, catalog) |
|---|---|---|
| H1 tracking | −0.05em (≈ −3.8px at 76px) | normal (0) |
| H1 colour | ink `#111318` on pearl | white on navy, or `#111324` |
| Eyebrow | mono, letter-spaced, **4px direction bar** before it | mono, violet text, no bar |
| Primary button | ink pill (999px radius) | 4px-radius rectangle |
| Media | 32px-radius "live window" card with caption | square-cornered photo |

The tight display tracking and the pill buttons are most of why the approved pages "look more
aesthetic". The token already exists (`--hermes-display-tracking: -0.05em`), but most templates don't use it.

**Done in this pass (site-wide):**
- base h1 tracking is −0.04em and h2 tracking −0.03em, with tighter leading;
- `.button` is a pill;
- `h1 + p` gets breathing space;
- commercial template:
  - 28px live-window media;
  - rounded cards and final card;
  - balanced h1 (17ch);
  - legacy purple `#6A20D9` replaced by `--hermes-violet-text`;
  - lavender section replaced by pearl.

Approved pages keep their own explicit values. 142 design specs pass.

**Remaining proposal (phase 2):** apply to the shared templates (`LogisticsCommercialPage`, `DigitalServicePage`,
`ResourcePage`, contacts, catalog, insights hero):
1. display tracking on h1/h2;
2. pill primary buttons;
3. direction-bar eyebrows;
4. rounded live-window media.

This is template-level work (~6 components), not 400 pages.

## 3. Hero surfaces

- **Approved:** light pearl `#F7F6F3` hero, photo in a live window, a calm amount of copy.
- **Commercial pages** (`/logistics/car-hauling-dispatch/` and its siblings):
  - full navy `#071038` hero;
  - a 6-line h1 and a 7-line lead paragraph above the fold;
  - the breadcrumb wraps under the header.
- **Proposal:** move commercial heroes to the pearl + live-window pattern and cap the lead at ~3 lines.
  The remaining copy moves into the body, so SEO text is kept.

## 4. Sub-navigation consistency

- **Directions:** the submenu is attached under the header pill (approved).
- **Catalog:** full-width detached bar with a different left block.
- **Load Board and Connect:** a second "product family" panel with its own title row, search and
  language, plus an old-palette nav ("IT" orange, Academy violet, Marketing green) and a plain "H Hermes" wordmark.
- **Proposal:**
  - Catalog adopts the attached direction submenu.
  - Connect/Load Board keep their product header (contract), but take the H mark palette for the four
    direction stripes and use the label "Technology" instead of "IT".

## 5. Colours worth adding to the brand book (per product)

These are already in use and look good; formalise them as product accents (not direction colours):

| Product | Colour | Where seen | Suggested token |
|---|---|---|---|
| Hermes Connect | deep teal field `#0B3B3A → #071C22` with Intelligence gradient `#7C5CFF → #5AC8FA` | Connect hub hero, "with AI." | `--product-connect-field`, `--hermes-intelligence-gradient` (exists) |
| Load Board | mint `#67E8C5` on night `#0B1018` | Load Board CTAs and eyebrows | `--product-loadboard-accent` |
| Insights | indigo `#071034 → #1D2357` with violet glow `rgba(100,76,213,.28)` | Insights hero | `--product-insights-field` |
| Hermes Connect mark | loop gradient `#5AC8FA → #2563EB → #7C5CFF` | Connect mark everywhere | `--product-connect-mark` |
| Catalog | teal bar `#22A39F` | Catalog submenu | `--product-catalog-accent` (exists as `--nav-catalog`) |

Rule to keep: product accents live inside their product surfaces. Directions use the H mark palette.
Semantic states (success/warning/danger) stay separate.

## 6. Smaller defects found

- **Fixed:** `/contacts/` rendered "start withWork With Hermes". Astro HTML compression dropped the
  line-break space before a link. This was the only occurrence site-wide.
- `/logistics/car-hauling-dispatch/` "Who this is for": check icons are inconsistent in size and
  alignment (one is faint).
- `--hermes-ink` is defined twice: `#0B0D12` (brand system) and `#0A164F` (direction colours). Pick
  one, recommended `#0A164F` action ink for buttons and `#0B0D12` for text, and rename accordingly.

## 7. Suggested order

1. **Palette unification (phase 1):** one token change plus a Brand System doc update. Highest visual consistency per line of code.
2. **Shared template typography, buttons, eyebrows and media (phase 2).**
3. **Commercial hero pattern (phase 3)** on the highest-traffic SEO pages first: car-hauling dispatch, owner-operator, new authority, start-trucking-company.
4. **Sub-navigation alignment (phase 4):** Catalog, plus the Connect stripes and label.
5. **Brand book additions** for the product accents (§5).

Each phase is one PR with screenshots before and after at 390 / 1024 / 1440px and the existing contract tests.
