# Hermes Section Density Audit — 2026-09-01

Status: CODE-LEVEL AUDIT COMPLETE
Visual route verification continues through the QA inventory.

## Question
Is the owner-reported `large premium container + little information + dead space` problem caused by a global section/min-height rule that should be reduced sitewide?

## Finding
No. The shared public-path shell does not impose a large minimum height on ordinary `.detail-page .section` blocks. The large `520px` minimum belongs to the editorial hero content stage and is deliberately removed at narrower breakpoints; it is not a generic section rule.

The two known low-density failures were local composition problems:
1. Logistics crawlable directories — already repaired with explicit grids and full-width route cards.
2. Marketing Official Channels — compact-card refinement is in PR #944 and still awaits visual evidence before DONE.

Other reviewed nearby structures do not justify a global spacing reduction:
- London entry cards are compact (`1.4rem` internal padding) and content-driven.
- Connect launcher banners are content-driven and have no large fixed height.
- Logistics directories use content-driven padding and responsive columns.

## Decision
Do **not** reduce global `.section` spacing to solve isolated density defects. Global compression would damage the strong Technology / Academy / Connect reference compositions.

## Rule learned
Classify whitespace as either intentional editorial breathing room or accidental unused capacity. Fix accidental capacity at the component/grid level; preserve intentional section rhythm globally.
