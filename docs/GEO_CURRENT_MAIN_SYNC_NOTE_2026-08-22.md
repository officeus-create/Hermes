# GEO current-main sync note

As of 2026-08-22, `main` advanced from `71590e1a786eddbdd855f2bc7a27d8c8d14e140f` to `37eecc753f72fcaf44f1cfd6851e8008e08a1001` through the SEO/Bing hygiene release.

The delta changes `package.json`, `public/_headers`, `public/robots.txt`, one public contract artifact, `scripts/bing-webmaster-hygiene.test.mjs`, and `src/pages/logistics/car-hauling-dispatch/index.astro`.

None of those paths overlap the current #785 GEO mutation set at this checkpoint. A maintenance-only merge of current `main` into the #785 feature branch is therefore the approved reconciliation path. This note does not authorize merging #785 into production and does not import the historical #756 GEO stack.