# Hermes Public GEO + Design OS Current State

Date: 2026-08-22

## Ownership boundary

This execution stream owns the **public Hermes website** for:

- GEO / AI-answer readiness;
- public truth, entity and evidence clarity;
- public brand consistency;
- convergence to the approved Hermes Design OS;
- desktop + 390px public-page QA;
- public duplicate / legacy / demo-surface classification.

This stream does **not** own Hermes Connect application internals. Auth/session, Repair Shop workspaces, booking/CRM, Academy authenticated learner/reviewer flows, Beauty private product, D1, shared product contexts and private product logic remain excluded.

Public Hermes Connect landing/reference pages may be audited for truthful public representation. That permission does not extend into the product runtime.

SEO remains a separate execution stream. GEO/public truth changes must preserve existing SEO evidence boundaries and must not start parallel keyword/title experiments without the required search evidence.

## Design canon

- Hermes = master brand.
- MOVE = Hermes Logistics.
- GROW = Hermes Marketing.
- LEARN = Hermes Academy.
- BUILD = Hermes Technology.
- Pearl Outside for the public system.
- Obsidian primarily for authenticated/product interiors.
- Violet/Ocean/Cyan are controlled intelligence/action accents.
- One header, typography, spacing, card/button/form/status, breadcrumb, language and footer grammar.
- Mobile is a deliberate composition, with 390px as the minimum review viewport.

Home keeps the approved Four Directions / Choose yours / Hermes spectrum baseline. This stream must converge other public families toward that system rather than invent another Home concept.

## Definition of public-page done

A canonical public family is not complete until:

1. its route ownership and indexability are classified;
2. the user can identify who Hermes is, what is offered, for whom, where, how it works, what is provable and the next action;
3. visible claims do not exceed available evidence;
4. entity relationships do not leak held/unverified legal relationships;
5. production UI does not depend on demo assets without an explicit compatibility reason;
6. legacy palettes/logo/header/footer generations are removed or classified;
7. desktop and 390px composition are checked;
8. focus, contrast, overflow and readability are checked;
9. duplicate/compatibility/demo surfaces are classified;
10. material visual changes have a clickable Preview and CEO visual approval before merge;
11. exact-head CI is green.

Search/analytics/AI visibility itself is never inferred from engineering completion.

## Execution order

1. Home
2. Four Directions shared path system
3. Logistics
4. Marketing
5. Academy public
6. Technology
7. Services
8. Resources
9. Cases
10. Trust / legal / company / contact
11. Careers
12. Localized public families
13. Public Hermes Connect representation
14. Demo / compatibility classification and final sweep

## Existing visual release candidates — do not duplicate

The current repository already has separate Draft visual release candidates for several families, including Digital Services, calculators, Cases, Logistics commercial pages, Trust, Contact and Carrier Entry. GEO work should reuse or layer around those candidates rather than create competing CSS generations.

## First audit findings

### Home

- Approved Four Directions structure is present.
- Home still contains public presentation dependencies on `/demos/hermes-connect/icon-192.svg`; production-facing assets must be separated from the demo tree without changing the approved visual mark.
- Four Directions labels are visually distinct, but the overall public convergence review must ensure direction accents remain controlled rather than becoming four unrelated brand systems.

### Public Hermes Connect representation

- Public reference capability pages are separate from authenticated/private Connect routes.
- Several public strings still use `current live pilot` language for Repair Shops. The approved public truth boundary is more conservative: Repair Shops is the most mature/leading vertical; Academy is developing as an authenticated learning vertical; Beauty is B1/preview-stage. Public copy must not imply universal availability or verified production state without evidence.

### Connect exclusion

Authenticated/private Connect routes under Repair Shops and Academy are explicitly classified `connect_private_excluded` by `src/data/public-geo-design-inventory.ts`. They must never enter this stream's page-mutation queue.

## Current checkpoint

Phase 1 inventory contract: **started / implemented at rule level**.

Next checkpoint: generate family-by-family route coverage from current source/sitemap, fix Home public-only demo-asset dependency, then perform Home + Four Directions GEO/truth/design QA before moving into Logistics.
