# Hermes Primitive Consistency Audit — 2026-09-01

Status: COMPLETE

## Scope
Determine whether cards/buttons/pills should be globally normalized, or whether current differences are intentional art-direction/product-context variants.

## Shared system already present
`src/styles/hermes-brand-system.css` owns the reusable geometry/elevation language:
- `--hermes-radius-control`
- `--hermes-radius-card`
- `--hermes-radius-panel`
- `--hermes-radius-pill`
- `--hermes-shadow-card`
- `--hermes-shadow-card-hover`
- shared Pearl/Obsidian/line/glass semantics.

`src/styles/hermes-public-path-shell.css` already gives the four public direction pages a common card grammar for offerings, equipment, service groups, direct contacts, social links and FAQ items.

## Why multiple `.button-primary` overrides are not automatically duplication bugs
Repository search shows contextual button overrides in public paths, Academy, Logistics, resources, cases and Connect demo/product shells. Several of these live on deliberately different surfaces (Pearl, dark hero, Obsidian product, resource/case context). Making every `.button-primary` visually identical would reduce contrast or flatten intentional art direction.

## Decision
Do not perform a broad search/replace or introduce one universal button/card skin.

Normalize only these invariants:
- minimum usable touch height where interactive;
- shared radius tokens where the composition does not intentionally differ;
- visible focus;
- predictable disabled/loading states;
- no decorative heavy shadow where a calm Design OS token is sufficient.

Allow context to control:
- foreground/background contrast;
- dark vs Pearl treatment;
- restrained division accent;
- hero-specific emphasis.

## Current concrete conclusion
No additional high-confidence primitive rewrite is justified before route-level visual evidence. The current shared public-path card system is already the correct consolidation boundary.

## Rule learned
Consistency means shared behavior and geometry rules, not identical paint across every business direction and surface.
