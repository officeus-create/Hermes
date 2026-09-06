# Hermes Video Factory — DESIGN

Source of truth: `docs/design/HERMES_UNIFIED_BRAND_SYSTEM.md`.

## Style Prompt

Hermes video should feel premium, operational, calm, precise, and intelligent. Public-facing scenes use Pearl as the dominant canvas with Obsidian typography and rare Violet→Ocean intelligence accents. Operational/data scenes may move into Obsidian with restrained Graphite/Raised surfaces. Motion supports hierarchy and meaning; it must never imply live activity, performance, inventory, demand, pricing, or autonomous actions that are not backed by evidence.

## Colors

- Pearl / public canvas: `#F7F6F3`
- Paper: `#FFFFFF`
- Obsidian / primary text and workspace canvas: `#0B0D12`
- Graphite: `#20232C`
- Raised dark surface: `#151922`
- Muted light-surface text: `#666C79`
- Muted dark-surface text: `#AEB7C7`
- Intelligence Violet: `#7C5CFF`
- Ocean: `#5AC8FA`
- Success / live: `#28B487`
- Attention: `#D99A25`
- Error / destructive: `#D84B5F`

Approximate public composition balance: 70% neutral light / 25% Obsidian or imagery / 5% intelligence accent.

## Typography

- Display: Manrope, weight 700–800, tracking `-0.04em` to `-0.06em`
- Body: Source Sans 3
- Metadata / technical labels: IBM Plex Mono

Rendered-video minimums:
- headline: 60px+
- body: 20px+
- data labels: 16px+

## Geometry

- Compact controls: 10–12px radius
- Public cards: 22px radius
- Large product/workspace panels: 28–30px radius
- CTA: pill where appropriate
- Use one subtle shadow level at a time; no stacked glossy elevation.

## Motion

- Entrance animations must support reading order.
- Normal UI-derived motion: approximately 300–400ms.
- Ambient branded motion: slow, bounded, and never distracting.
- No fast perpetual spins.
- No unrelated simultaneous animations competing for attention.
- Respect reduced-motion in interactive preview surfaces.
- Never fake “live” states with animated pulses unless the underlying state is real.

## What NOT to Do

- No generic decorative 3D trucks, laptops, cubes, spheres, graduation hats, or unrelated clipart as the primary identity.
- No arbitrary rainbow cards or department-specific mini design systems.
- No saturated full-canvas gradients as a default.
- No fake metrics, fake load counts, fake customer results, or unlabeled sample data.
- No provider-specific visual identity leaking into the business schema.
- No leaked variable names, prompt syntax, internal IDs, or placeholder copy in customer-facing output.
- No AI-avatar or cloned-voice scene without a recorded consent reference in the `VideoJob` governance block.
