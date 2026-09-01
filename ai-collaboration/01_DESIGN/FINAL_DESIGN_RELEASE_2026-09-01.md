# Hermes Final Design Release — 2026-09-01

Status: **IMPLEMENTED ON FINAL INTEGRATION BRANCH — VALIDATION / MERGE / PRODUCTION VERIFICATION REQUIRED**

Branch: `design/final-design-integration-2026-09-01`

This document is the final release checklist for the design work discussed and approved through 2026-09-01. Do not call this design release complete until every production gate at the end of this file passes.

## Locked owner decisions

- Hermes Connect master mark: **Option 02 continuous connected-flow loop**. Geometry is locked.
- Public/private visual architecture: **Pearl outside; Obsidian/Anthracite where operational density requires it; restrained Intelligence accents**.
- Semantic direction accents:
  - Logistics `#1E88FF`
  - Marketing `#00C853`
  - Academy `#7C5CFF`
  - Technology `#FF7A00`
- Semantic colors are navigation/context signals. They must not repaint strong page art direction or become low-contrast body copy.
- Beauty has **no owner-approved canonical brand color yet**. Beauty B1 remains neutral/Pearl and must not invent a permanent identity token.

## Final integration scope

### Public Hermes
- Preserve strong Technology, Academy, Marketing atmosphere and Hermes Connect compositions.
- Keep repaired Logistics directory/commercial hierarchy from current main.
- Replace the weak Marketing official-channel rows with compact editorial cards.
- Apply restrained division context to the shared Hermes Connect launcher on the four `/paths/*` routes.
- Do not globally compress whitespace to fix local layout defects.

### Hermes Connect identity
- Preserve current approved square PWA/app icon family.
- Add transparent Option 02 master export.
- Add dark/inverse mono exports.
- Add restrained Logistics / Marketing / Academy / Technology preview variants using the exact same locked geometry.
- Keep the contextual variants out of production logo application until visual evidence/owner choice justifies a specific use.
- Maintain a noindex QA stand for 16/24/32/64px, Pearl, Obsidian and app-tile comparison.

### Private workspaces
- Preserve shared Hermes identity and account switcher.
- Protect long localized workspace-state labels from widening cards.
- Repair Shop actions/time inputs use minimum 44px mobile ergonomics and safe wrapping.
- Repair color interactions consume the canonical `--hermes-repair` token rather than duplicate hardcoded blue values.
- AI Connect visually and semantically distinguishes loading / authentication / owner-blocked / runtime-error states.
- Beauty B1 remains Pearl/neutral, gets 44px controls, visible focus and safe long-row wrapping without inventing a Beauty brand color.

### Localization and accessibility
- Preserve Hermes Connect locale continuity across internal routes.
- Academy and Repair private Russian runtimes remain protected by CI contracts.
- Keyboard focus must remain visible.
- Reduced-motion and forced-colors behavior must remain supported.
- Bright semantic division colors are not approved as arbitrary small body-text colors on Pearl.

## Automated visual evidence contract

The final design PR must capture these widths for every route in the screenshot inventory:

- 390
- 430
- 768
- 1024
- 1440

Current final inventory includes 19 routes, including:
- all four public Hermes directions;
- Hermes Connect overview;
- Repair Shops public/auth/plan;
- Beauty private workspace;
- canonical Hermes Connect demo/workspace;
- Option 02 QA stand.

Expected matrix: **19 routes × 5 widths = 95 route/viewport observations**.

The visual workflow must fail if the generated layout evidence reports horizontal overflow.

## Production completion gates

This release is **not DONE** until all of these are true:

1. Final integration branch is reconciled with the latest `main` without overwriting newer product work.
2. Exact-head Website checks are green.
3. Exact-head Hermes Connect visual evidence is green.
4. Option 02 geometry contract is green.
5. Academy Russian private contract is green.
6. Repair Russian private contract is green.
7. Five-width screenshot artifacts are generated and inspected for the major public/private design targets.
8. PR is mergeable and merged to `main`.
9. Controlled production deployment succeeds.
10. Live production is checked after deploy on desktop and mobile public routes.

Only after gate 10 may an agent tell the owner that the discussed autonomous design work is ready for final visual review.

## Owner / external follow-up that does not block autonomous design release

- Decide a canonical Beauty identity/color if and when Beauty branding is opened.
- Compare square app tile vs transparent Option 02 for selected public-header contexts before changing current production application.
- Physical iPhone Safari/PWA smoke test.
- Physical Android install/touch/safe-area smoke test.
- Optional professional trademark/similarity review of Option 02.
- External-account branding changes (for example Telegram names/avatars) require authenticated admin access.

## Conflict rule

If another document disagrees with this release scope, use this precedence:
1. later explicit owner decision;
2. verified current production implementation/evidence;
3. this final release file + `HERMES_BRAND_SYSTEM_2_0.md`;
4. current audits/contracts;
5. historical documents and experiments.
