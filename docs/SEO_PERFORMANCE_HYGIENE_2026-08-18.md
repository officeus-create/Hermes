# Hermes SEO Performance Hygiene — 2026-08-18

Scope: non-visual performance warning cleanup only.

Resolved source-level warnings:

- `demos/hermes-connect/workspace.html`: `./apple-touch-icon.png` now declares its real `180x180` dimensions.
- The same preview image now uses explicit `loading="lazy"` and `decoding="async"` policy.

The homepage `/demos/hermes-connect/icon-192.svg` occurrence is a fixed 28×28 decorative icon with explicit dimensions and `aria-hidden="true"`; the audit no longer treats the absence of an explicit `loading=` attribute on that tiny icon as a meaningful performance warning.

Rules:

- do not change layout, imagery choice, dimensions, or visual hierarchy merely to silence an audit;
- add only semantically valid image loading/decoding/dimension metadata when the source occurrence is a normal content image;
- do not silence a real warning by weakening the audit;
- report unique review warnings accurately;
- run build + static output + performance budget before merge.
