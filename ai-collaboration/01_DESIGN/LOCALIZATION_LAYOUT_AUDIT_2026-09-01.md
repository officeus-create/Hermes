# Hermes Localization Layout Audit — 2026-09-01

Status: COMPLETE FOR SHARED ACCOUNT SWITCHER

## Risk reviewed
Shared account/workspace UI receives both localized labels and real account/business data. Long values include:
- RU `Ваши пространства`, `Общее пространство Hermes`, `Настройка пространства`, `Пространство готовится`;
- equivalent long UK/ES/IT/FR labels;
- arbitrary account names, emails and business names returned by the account API.

## Existing protections retained
- Account name and email sit inside `min-width:0` containers and ellipsize safely.
- Workspace business/title text sits in `minmax(0,1fr)` and ellipsizes safely.
- The compact header account menu has a bounded 230px summary and ellipsized identity text.
- Popover width is bounded by `min(420px, calc(100vw - 2rem))`.
- At <=860px the panel/workspace grid collapses to one column.

## Fix added
The right-side workspace state (`Open`, `Current`, `Пространство готовится`, etc.) was the remaining weak point because the third grid column was unconstrained.

The branch now:
- changes the third track to `minmax(0,auto)`;
- gives the state label `min-width:0`;
- caps it at `9.5rem`;
- allows emergency wrapping with `overflow-wrap:anywhere`;
- uses compact line height and right alignment.

This preserves short labels while preventing a long localized state from forcing the entire workspace card wider than the mobile viewport.

## Rule learned
Dynamic identity/business text may ellipsize; action/state text should remain readable and wrap inside a bounded track. Do not solve localization overflow by shrinking the whole interface font.
