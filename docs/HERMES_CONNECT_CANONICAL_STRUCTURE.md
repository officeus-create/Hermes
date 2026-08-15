# Hermes Connect canonical structure

Current implementation rule after consolidation:

- `src/pages/services/hermes-connect/repair-shops*` - production-track Repair Shop web product.
- `public/demos/hermes-connect/` - the single canonical generic Connect preview/tool asset tree used by `connect.hermeslogisticsus.com`.
- `public/demos/hermes-connect/workspace.html` - one responsive desktop/mobile preview workspace.
- `public/demos/hermes-connect/index.html` - controlled request-access/discovery document.
- `public/demos/hermes-connect/<tool>/` - bounded browser tools.
- `src/legacy-prototype/` - retained reference code only; not a second public app.

Removed duplicate implementation surfaces:

- `public/demos/hermes-connect-brand-v1/` - superseded by the canonical tree.
- separate `mobile.html` implementation - superseded by the responsive workspace; the public `/mobile.html` alias remains only for backward compatibility.
- `workspace-v2.html`, `workspace-v2.js`, `workspace-v2-injected.css` - superseded visual-review layer.
- duplicate Brand V1 `index.html`, `app.js`, `styles.css` - superseded by canonical discovery/request-access files.
- versioned `hermes-connect-web-product-v1` test contract - replaced by the canonical workspace contract.

Release acceptance:

- full repository build and tests must pass;
- the same workspace must pass desktop and mobile Playwright projects without horizontal overflow;
- Connect routing, manifest, service worker, review hub, request access, and bounded tools must resolve from the canonical tree;
- no active workspace, launcher, PWA, or routing dependency may require `hermes-connect-brand-v1`, `workspace-v2`, or `workspace-launch-v2` files;
- retired public Brand V1 URLs must redirect to the canonical Connect host;
- after merge, the custom-domain production smoke must pass before the cleanup is considered done.

Backward compatibility is handled by middleware redirects. Historical release/audit documents may still mention retired paths because they describe past states.
