# Hermes Brand V1 + PWA Release Audit — 2026-08-13

Status: **AUDIT COMPLETE / RELEASE GATE OPEN**

This audit separates three concerns that must not be conflated: (1) repository contracts, (2) real PWA/browser behavior, and (3) production brand consistency.

## 1. Antigravity PWA claim — verdict

The reported `npm run build && npm test` result is useful repository evidence, but it is not sufficient evidence that Hermes Connect is installable and production-ready on iPhone.

Current facts:

- `feature/hermes-connect-brand-funnel-unification` contains a manifest, service worker, PWA icons, Apple mobile-web-app tags and service-worker registration on the Brand V1 index page.
- The branch is diverged from `main` and must not be merged wholesale as a PWA hotfix.
- The latest workspace PWA commit also removes the existing workspace `<title>`, meta description and theme-color metadata; that regression must be corrected before release.
- The branch's Hermes Connect brand/funnel contract checks launcher integration and demo honesty, but it does not test manifest validity, service-worker registration, installability, standalone launch, iOS home-screen icon rendering, offline behavior or cache update behavior.
- `npm test` does not run the repository's Playwright `test:e2e` command.
- The branch head currently has no GitHub combined-status evidence attached to it.
- `main` does not contain the new Brand V1 manifest, so the latest branch changes must not be described as production-released solely because the feature branch was pushed.

### Required PWA release gate

Before calling the PWA production-ready:

1. Rebase/cherry-pick the minimal PWA slice onto current `main`; do not merge the full diverged feature branch.
2. Restore workspace title, description and theme-color metadata while adding the PWA tags.
3. Add a dedicated PWA contract that verifies:
   - manifest link and required fields;
   - service-worker registration;
   - every pre-cache asset exists;
   - same-origin scope/start URL;
   - standalone metadata;
   - icon assets and fallbacks;
   - cache version/change behavior.
4. Run build + repository tests + full browser e2e.
5. Run an actual mobile-device/browser acceptance check for Add to Home Screen, standalone launch and offline/reload behavior.
6. Record production deployment evidence only after the merged `main` commit is deployed.

## 2. Brand source of truth

For Hermes Connect, the authoritative system is:

- `ai-collaboration/01_DESIGN/hermes-connect/APPROVED_BRAND_SYSTEM_V1.md`
- `ai-collaboration/01_DESIGN/hermes-connect/MASTER_AI_BRAND_PROMPT.md`
- `docs/HERMES_CONNECT_VISUAL_MOTION_DIRECTIVE_V1.md`

Core locked direction:

- Hermes Connect = **AI Operating System for Business**;
- Pearl marketing environment + Obsidian operating environment;
- Iris / Ocean / Sage controlled accents;
- compact interconnected Hermes knot;
- Hermes Flow / wave field;
- one user-facing **Hermes Intelligence**;
- premium clarity, larger readable UI typography and restrained motion;
- demo/simulated status must remain explicit until real connectors are verified.

Older Hermes website visual references that use the previous navy/magenta/lavender system remain useful historical references, but must not override the approved Hermes Connect V1 system.

## 3. Current website consistency gap

The current shared website layer still contains the older Hermes palette and visual vocabulary in `src/styles/global.css` and `BaseLayout.astro`, including the legacy navy theme-color and magenta/violet primary gradient. Hermes Connect Brand V1 already uses the newer Pearl/Obsidian/Iris/Ocean language in its product surfaces.

This creates two overlapping design generations.

### Correct unification approach

Do **not** repaint every public business page as if it were a Hermes Connect product screen. Preserve context:

- Root brand: Hermes ecosystem;
- Logistics: Hermes Logistics / logistics service context;
- Marketing: ProgressoPro / Marketing direction context;
- Academy: Hermes Business Academy program context;
- Technology: Hermes IT Development / Technology service context;
- Product: Hermes Connect.

Unify the visual grammar instead:

- typography scale and spacing;
- Pearl/Graphite/Obsidian neutrals;
- Iris/Ocean/Sage token bridge;
- button and card geometry;
- focus/hover/motion behavior;
- Hermes knot usage where the Connect/Intelligence product is represented;
- wave/flow motif in controlled product/AI moments;
- accessibility and reduced-motion behavior;
- consistent mobile interaction targets.

## 4. Site-wide rollout order

1. Shared tokens / BaseLayout / shared header-footer primitives.
2. Homepage and Hermes Connect service entry.
3. Logistics money pages and Load Board.
4. Marketing / SEO service pages.
5. Academy pages.
6. Technology / website / automation pages.
7. Forms, onboarding, contract and noindex workspaces.
8. Localized routes.
9. Demo/product surfaces.
10. Final desktop/mobile visual regression pass and screenshot evidence.

## 5. Release rule

A green repository contract suite is necessary but not sufficient for a visual/PWA release. Future release notes must state separately:

- `REPOSITORY_VERIFIED`;
- `BROWSER_VERIFIED`;
- `DEVICE_VERIFIED` where applicable;
- `PRODUCTION_VERIFIED`.

Do not collapse these into "everything is live" until each required evidence class exists.
