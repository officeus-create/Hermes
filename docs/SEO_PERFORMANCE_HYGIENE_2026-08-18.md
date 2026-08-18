# Hermes SEO Performance Hygiene — 2026-08-18

Scope: non-visual performance warning cleanup only.

Post-rule performance warnings that still require source-level review:

- `demos/hermes-connect/workspace.html`: `./apple-touch-icon.png` is missing explicit width/height on an actual `<img>` occurrence.
- `demos/hermes-connect/workspace.html`: the same image has no explicit loading policy.

The homepage `/demos/hermes-connect/icon-192.svg` occurrence is a fixed 28×28 decorative icon with explicit dimensions and `aria-hidden="true"`; the audit no longer treats the absence of an explicit `loading=` attribute on that tiny icon as a meaningful performance warning.

Rules:

- do not change layout, imagery choice, dimensions, or visual hierarchy merely to silence an audit;
- add only semantically valid image loading/decoding/dimension metadata when the source occurrence is a normal content image;
- do not silence a real warning by weakening the audit;
- report unique review warnings accurately;
- run build + static output + performance budget before merge.
