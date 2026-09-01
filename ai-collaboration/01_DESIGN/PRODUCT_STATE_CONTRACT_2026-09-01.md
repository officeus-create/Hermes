# Hermes Product State Contract — 2026-09-01

Status: DESIGN CONTRACT COMPLETE / ONE AI SEMANTIC FOLLOW-UP OPEN

## Goal
Loading, empty, success, warning/blocked and error states should feel like one Hermes system without forcing Repair Shops, Academy and AI onto identical card paint.

## Shared semantic rules
### Loading
- neutral presentation;
- say what is loading when useful;
- never look like an error;
- do not show fake progress percentages;
- preserve layout enough to prevent disorienting jumps where practical.

### Empty
An empty state is not an error.
It should contain:
1. what is empty;
2. why that can be normal;
3. the next useful action when one exists.

### Success
- use success semantic color, not division accent;
- state the completed action;
- disappear only when the result remains obvious elsewhere or after enough time to read.

### Error
- use danger semantic color;
- explain what failed in user language;
- provide the next recovery action when possible;
- do not expose raw backend errors as the primary copy.

### Blocked / permission
Permission/access states are not generic errors.
They should explain:
- what access is required;
- whether sign-in, owner capability or another action is needed;
- what the user can do next.

## Current Repair Shops alignment
Live Repair workspaces already use:
- `state-card` for loading and empty lists;
- `alert error/success` for operational feedback;
- Pearl late-cascade state styling in `hermes-repair-public-shell.css`;
- real next-step copy in known empty states such as Services and Bookings.

This is aligned with the contract. Do not replace it with Academy styling.

## Current Academy alignment
Academy private routes share `hermes-academy-app.css`:
- a neutral loading hero/card;
- one `academy-app-alert` pattern;
- explicit `error` and `success` classes;
- shared Pearl surface.

This is also aligned at the system level. Visual details may remain Academy-specific.

## Current AI alignment and gap
AI Connect uses one `ai-connect-state` for:
- initial access check;
- sign-in required;
- internal-owner capability required;
- runtime unavailable.

The copy is appropriately specific, but the component does not currently expose a semantic visual state that differentiates neutral **checking** from **blocked/error**.

### Follow-up implementation
Add explicit state semantics such as:
- `data-state="loading"` initially;
- `data-state="blocked"` for 401/403;
- `data-state="error"` for runtime failure;
- hide the state on successful access as today.

Then use semantic border/icon treatment while preserving the Technology/AI orange contextual accent elsewhere.

## Accessibility
- existing `role="status"` is appropriate for non-destructive async updates;
- do not use color alone;
- errors that require immediate correction should use appropriate error semantics and focus management when tied to a form;
- avoid repeatedly announcing polling updates when no meaningful state changed.

## Rule learned
Normalize state *meaning and recovery behavior* first. Product-specific visual material can differ as long as the semantic hierarchy remains predictable.
