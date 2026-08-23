# Hermes AI Collaboration Hub

This directory is the shared decision and knowledge system for all AI assistants and human contributors working on Hermes Logistics, Hermes Connect, ProgressoPro, SEO, design, engineering, sales, recruiting, academy, finance, and operations.

## One local workspace

Every local AI tool must open the same physical repository root: `/Users/progressopro/Hermes` (`~/Hermes`).

Do not treat `hermes-connect-next`, an old Documents checkout, a copied folder, or an agent-specific clone as a second source of truth. Read `00_READ_FIRST/LOCAL_AI_WORKSPACE.md` for the normalization contract and safe Mac migration procedure.

The six active AI conversations are routed through `workstreams/`:

- `01_HERMES_CORE`
- `02_WEB`
- `03_HERMES_CONNECT`
- `04_SEO`
- `05_GEO`
- `06_AUDIT`

They are workstreams inside one repository, not separate projects.

## Start here

1. Read `00_READ_FIRST/LOCAL_AI_WORKSPACE.md`.
2. Read `00_READ_FIRST/AI_COLLABORATION_PROTOCOL.md`.
3. Read `00_READ_FIRST/CURRENT_STATE.md`.
4. Read `workstreams/README.md` and the relevant workstream route.
5. Read the relevant department `CURRENT_STATE.md` and `DECISIONS.md` when present.
6. Create or update a proposal using `templates/PROPOSAL_TEMPLATE.md`.
7. Identify yourself using `templates/AI_IDENTITY_TEMPLATE.md`.
8. Do not delete prior proposals or decisions. Add a review, superseding proposal, or deprecation decision.

## Departments

- `01_DESIGN` — brand identity, logos, color systems, typography, website and app UI/UX.
- `02_SEO` — technical SEO, commercial pages, locations, content, links, schema and analytics.
- `03_PRODUCT_CRM` — Hermes Connect, CRM, portals, AI modules and product architecture.
- `04_LOGISTICS_OPERATIONS` — dispatch, brokerage, carriers, loads, finance and operating procedures.
- `05_MARKETING_SALES` — positioning, offers, funnels, content and sales systems.
- `06_AI_ENGINEERING` — agents, automation, data, integrations and infrastructure.
- `07_ACADEMY_HR` — recruiting, training, assessment and people operations.
- `99_ARCHIVE` — superseded or historical materials retained for traceability.

Department folders store durable domain knowledge. `workstreams/` routes the current execution threads shown in AI applications.

## Status vocabulary

`Draft` → `Under Review` → `Approved` → `Implemented` → `Measured`.

Alternative terminal states: `Rejected`, `Superseded`, `Deprecated`.

## ID vocabulary

Use stable IDs such as `LOGO-001`, `DESIGN-001`, `SEO-001`, `CRM-001`, `OPS-001`, `MKT-001`, `AI-001`, `HR-001`, `DEC-001`.

## Core rule

One repository, one canonical project state, visible assumptions, measurable outcomes, preserved history, and no agent-specific duplicate source of truth.
