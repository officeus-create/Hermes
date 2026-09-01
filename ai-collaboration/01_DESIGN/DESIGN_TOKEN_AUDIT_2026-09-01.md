# Hermes Design Token Audit — 2026-09-01

Status: COMPLETE
Baseline: `main` at `06e0d52446a74e454d1e42da83cbc2d77341553c`

## Canonical source
`src/styles/hermes-brand-system.css` is the canonical ownership layer for shared Hermes Design OS semantics.

### Core surfaces
- `--hermes-pearl`
- `--hermes-paper`
- `--hermes-obsidian`
- `--hermes-graphite`
- `--hermes-graphite-raised`

### Intelligence
- `--hermes-violet`
- `--hermes-ocean`
- `--hermes-intelligence-gradient`

### Division accents
- Logistics: `--hermes-logistics: #1e88ff`
- Marketing: `--hermes-marketing: #00c853`
- Academy: `--hermes-academy: #7c5cff`
- Technology / IT: `--hermes-technology: #ff7a00`

### Product aliases
- Repair Shops: `--hermes-repair: var(--hermes-logistics)`
- AI Product: `--hermes-ai-product: var(--hermes-technology)`
- Contextual vertical: `--hermes-vertical-accent`

Beauty intentionally has no canonical accent token yet.

## Duplication rule
A literal color is not automatically a bug. Keep literal values when they are local art-direction values or state colors. Replace literals when they represent an existing shared semantic such as Repair/Logistics, Academy, Marketing or Technology accent.

Fallbacks such as `var(--hermes-repair,#1e88ff)` are acceptable at component boundaries because they preserve rendering if a surface is embedded without the global Design OS import. The semantic variable remains the source of truth.

## Migration completed in this branch
`src/components/RepairPartnerOfferEnhancer.astro` previously repeated Repair blue through multiple `rgba(30,136,255,...)` and `#1e88ff` declarations. Those interactions now consume `var(--hermes-repair,#1e88ff)` through `color-mix(...)`, preserving the same intended visual while making future Repair accent changes flow from the canonical token.

## Do not do
- Do not globally search/replace every violet/blue/orange literal.
- Do not recolor strong public art direction merely to maximize token usage.
- Do not create a Beauty token before owner approval.
- Do not make division color dominate Pearl/Obsidian surfaces; use it as a contextual signal.
