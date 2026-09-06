# Hermes vertical reel v1 — frame direction

## Canvas

- 1080x1920 portrait
- 30 fps
- 15 seconds
- mobile-safe inset: 92px left/right, 164px top, 148px bottom

## Beat 1 — hook / Pearl (0.0–5.4s)

Brand mark and label establish Hermes quietly. Eyebrow precedes a large Manrope hook, followed by one violet rule and supporting body copy. The frame is mostly Pearl; intelligence color is an accent only.

## Transition 1 (4.6–5.42s)

Obsidian scene reveals upward as a full-frame directional wipe. The outgoing Pearl scene remains intact beneath it; no pre-transition exit tween.

## Beat 2 — proof / Obsidian (5.1–10.27s)

One restrained Raised proof card. `metric_value` is deliberately a string rather than an assumed number so safe labels such as `PROOF` or `8 LANES` work without fabricating a KPI. Any current claim must already have `governance.evidenceRef` before rendering.

## Transition 2 (9.45–10.27s)

Final Pearl scene reveals left-to-right. The dark proof scene remains visible until covered by the transition.

## Beat 3 — next action / Pearl (10.0–15.0s)

Headline states the reusable-template principle, body names the shared operating lanes, CTA is a single Obsidian pill, and the footer is understated mono text. Final state holds for reading; no perpetual motion.

## Motion constraints

- every visible scene element has an explicit entrance tween;
- no jump-cut scene changes;
- no exit tween before a scene transition;
- no `Date.now()`, `Math.random()`, infinite repeats, CSS transitions, or render-time network dependencies;
- no fake live pulses or fake operational states.
