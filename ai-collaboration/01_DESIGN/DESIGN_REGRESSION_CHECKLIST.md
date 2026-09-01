# Hermes Visual Regression Checklist

Status: REQUIRED FOR VISUAL PRs

Use this checklist for every PR that changes layout, typography, color, imagery, brand application, navigation, forms, cards, drawers, modals or responsive behavior.

## 1. Baseline
- Record the route/component and the exact visual problem before editing.
- Classify the existing block: `KEEP`, `FIX`, or `REPLACE`.
- If `KEEP`, do not redesign it incidentally while touching adjacent code.

## 2. Required viewport evidence
Minimum for every visual PR:
- Desktop: 1440px wide.
- Mobile: 390px wide.

Add when relevant:
- 430px large mobile.
- 768px tablet.
- 1024px compact desktop/tablet landscape.
- Wide desktop when a composition uses max-width or split-column layouts.

## 3. Layout checks
- No horizontal document/body overflow.
- No clipped text, buttons, cards, drawers or menus.
- Long labels wrap without covering adjacent controls.
- Content density matches container scale; avoid large premium containers holding tiny utility lists unless intentional.
- Section spacing forms a consistent rhythm with adjacent sections.
- Sticky/fixed headers do not cover anchored content.

## 4. Brand checks
- Hermes Connect uses approved Option 02 geometry only.
- Public marketing remains Pearl-first unless the approved composition says otherwise.
- Operational/private surfaces preserve the approved Pearl/Obsidian context.
- Division accents are contextual signals, not uncontrolled full-page recoloring.
- Strong Technology / Academy / Connect reference sections are not flattened by generic normalization.

## 5. Interaction checks
- Keyboard focus is clearly visible on interactive controls.
- Hover is not the only way information is exposed.
- Touch targets remain usable on mobile.
- Drawers/modals can be closed without precision tapping.
- Forms have visible labels/help/error/success states.

## 6. Accessibility preferences
- Verify `prefers-reduced-motion` behavior for touched motion/transition code.
- Verify `prefers-reduced-transparency` where glass/blur is important to legibility.
- Confirm text/background contrast remains readable in the touched component.

## 7. Localization resilience
When a component appears in localized/private flows:
- Test long Russian labels or equivalent long-copy case.
- Preserve `?lang=` / localized route behavior.
- Do not hardcode English in a previously localized control.

## 8. Product/SEO safety
Unless explicitly in scope, visual work must not change:
- canonical URLs;
- SEO/meta behavior;
- auth/session behavior;
- booking/CRM/D1/API logic;
- factual capability claims.

## 9. Evidence and lesson
Before merge, record:
- before state;
- after state;
- desktop evidence;
- mobile evidence;
- tests/CI result;
- one sentence explaining the systemic lesson so the same defect is not recreated elsewhere.

## Stop condition
A visual change is not `DONE` merely because code was committed. `DONE` means the intended appearance is evidenced at the required widths and the relevant automated checks are green.
