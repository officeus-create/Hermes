# Hermes GEO Operating Readiness & Handoff

Status: `IMPLEMENTED_GOVERNANCE — EVIDENCE CLASSES PRESERVED`

Backlog: #703 tasks 196–200  
Measurement source of truth: #206  
CEO material visual queue: #694

## Objective

Produce one operational summary that tells the team what can be fixed autonomously, what still requires authenticated external evidence, and what genuinely needs CEO visual approval — without collapsing those states into one generic “not done” list.

## Evidence classes remain separate

Every canonical owner preserves the evidence classes actually present:

- `repository_verified`;
- `production_verified`;
- `platform_verified`;
- `production_receiver_verified`;
- `private_operations_verified`;
- `owner_provided_handoff`;
- `unverified`.

A recent owner-provided handoff does not become platform verification, and engineering completion does not become proof of Google, Bing, GA4 or private commercial outcomes.

## Autonomous technical queue

Technical gaps are ordered by operational risk:

1. truth/evidence;
2. privacy/security;
3. canonical owner;
4. answer evidence;
5. funnel contract;
6. internal graph;
7. schema parity;
8. multilingual consistency.

These are autonomous engineering/remediation actions unless a specific fix materially changes visible design.

## Authenticated external action queue

External evidence remains a separate queue:

- GSC index state;
- exact GSC 7d/28d search evidence;
- Bing index state;
- GA4 ownership receipt;
- GA4 exact-once event receipt;
- receiver delivery;
- human qualification;
- commercial outcome.

Each external action is explicitly marked as requiring authenticated external evidence. Missing evidence is never converted to zero performance or a synthetic receipt.

## CEO visual queue

A canonical owner may reference #694 only when `material_visual_change_required=true`. Conversely, a material visual change must carry at least one `V-###` queue reference.

This keeps small spacing, test, schema, privacy and backend changes out of the CEO queue while ensuring material composition/UX changes cannot bypass visual review.

## Readiness

- `engineeringReady`: no technical gaps.
- `externallyComplete`: no authenticated external evidence gaps.
- `fullyReady`: both are true.

Therefore a green engineering PR can remain externally gated without being mislabeled as unfinished engineering, and externally observed demand cannot hide a technical contract gap.

## Completion report

The completion report keeps four sections separate:

1. verified engineering ranges;
2. engineering still in progress / explicitly gated ranges;
3. authenticated external evidence actions;
4. autonomous technical actions;
5. CEO material visual decisions.

The report references backlog #703, measurement source #206 and visual queue #694 explicitly.

## Privacy

No raw leads, private messages, account/property/container identifiers, credentials, cookies/tokens, user-level analytics exports or revenue amounts are accepted by this operating handoff.

Tests are chained into `npm test`. Full exact-head Website checks are required before tasks 196–200 are marked complete.
