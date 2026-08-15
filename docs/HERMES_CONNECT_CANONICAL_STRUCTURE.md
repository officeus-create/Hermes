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
- separate `mobile.html` - superseded by the responsive workspace.
- `workspace-v2.html`, `workspace-v2.js`, `workspace-v2-injected.css` - superseded visual-review layer.
- duplicate Brand V1 `index.html`, `app.js`, `styles.css` - superseded by canonical discovery/request-access files.

Backward compatibility is handled by middleware redirects. Historical release/audit documents may still mention retired paths because they describe past states.
