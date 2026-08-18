# Hermes SEO Performance Hygiene — 2026-08-18

Scope: non-visual performance warning cleanup only.

Current performance audit warnings:

- `demos/hermes-connect/workspace.html`: `./apple-touch-icon.png` is missing explicit width/height on an actual `<img>` occurrence.
- `demos/hermes-connect/workspace.html`: the same image has no explicit loading policy.
- homepage `index.html`: `/demos/hermes-connect/icon-192.svg` has no explicit loading policy.

Rules:

- do not change layout, imagery choice, dimensions, or visual hierarchy;
- add only semantically valid image loading/decoding/dimension metadata;
- do not silence a real warning by weakening the audit;
- report unique review warnings accurately;
- run build + static output + performance budget before merge.
