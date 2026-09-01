# Logistics Directory / Utility Layout Audit — 2026-09-01

Status: COMPLETE
Baseline: `main` at `06e0d52446a74e454d1e42da83cbc2d77341553c`

## Scope
Audit the owner-reported failure pattern: large premium container, tiny utility list aligned to one side, excessive unused space, weak hierarchy.

## Current canonical implementation
The active public directory implementation is concentrated in `src/components/LogisticsCommercialLinks.astro` and `src/styles/hermes-logistics-commercial-polish.css`.

The current CSS already contains the systemic repair introduced with the Option 02 rollout:
- 3-column commercial card grid on desktop;
- explicit 3-part directory heading layout;
- explicit 2-column directory content layout;
- full-width 48px minimum-height route cards;
- responsive collapse to one column below 900px;
- mobile padding and CTA handling below 620px;
- forced-colors border fallback.

## Result
The original collapsed-directory defect is no longer represented by the current canonical component structure. Code search did not reveal a second active production component implementing the same crawlable Logistics directory pattern independently.

## Remaining design debt
The current Logistics directory polish still uses `--hermes-violet` for some icons/hover accents. This is not a spacing/hierarchy defect and should be handled in the later division-color application phase, where Logistics can move deliberately to its canonical semantic accent without mixing concerns.

## Rule learned
When a utility directory contains many destinations, use explicit layout primitives and scannable route cards. Do not rely on inherited global grid declarations; a missing `display:grid` can collapse an otherwise correct template into a narrow technical list.
