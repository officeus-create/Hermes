# Legacy PR #6 and PR #9 Reconciliation — 2026-07-31

Purpose: complete queue items 12–13 by classifying the remaining useful work in stale Academy and commercial-logistics branches without merging either branch wholesale.

## Decision summary

- PR #6 is documentation-only and contains a historical Academy baseline. It is useful as an audit lead, not as current production truth.
- PR #9 mixes useful strategy documents with application code that is now largely superseded by merged PR #13 and later current-main work.
- Neither PR should be merged wholesale.
- Current `main`, current CI, approved business facts, and current external evidence override historical branch statements.

## PR #6 — Academy baseline

Changed path: `docs/SEO_ACADEMY_PHASE0_BASELINE.md`.

### Retain as historical leads

- verify Academy, Careers, Logistics, Marketing, and localized route inventory;
- maintain an existing-versus-missing route matrix;
- check duplicate and cannibalizing intent before new Academy routes;
- define internal-link requirements;
- require verified curriculum, mentor capacity, schedule, language, duration, pricing, practice, and outcome boundaries before publication;
- preserve the rule that DNS or production changes require owner approval.

### Stale or unverified statements

The following claims must not be treated as current facts without a new dated check:

- GA4 active on production;
- homepage and `/ru/` console status;
- 46 sitemap URLs returning HTTP 200;
- absence of Cloudflare email-protection leakage;
- Path Engine and Load Board runtime behavior;
- Search Console ownership status;
- the old `uk` localization wording, because the current required public path convention is `/ua/`.

### Obsolete scope

The proposed broad Academy route family included programs outside the current approved sprint scope. The current policy limits Academy publication to:

1. U.S. Logistics Program;
2. Marketing Program.

COO, operations, sales, negotiation, role-specific, and careers program pages remain blocked until separately approved with real curriculum and delivery capacity.

## PR #9 — commercial logistics and SEO branch

### Application files: superseded or conflicting

The following runtime files overlap work already merged through PR #13 or subsequently changed on `main`. They must not be ported wholesale:

- `public/sitemap.xml`;
- `src/components/ContactLinkEnhancer.astro`;
- `src/components/HeroEditorial.astro`;
- `src/components/LocalizedOverviewPage.astro`;
- `src/components/LogisticsCommercialPage.astro`;
- `src/layouts/BaseLayout.astro`;
- `src/pages/index.astro`;
- `src/pages/logistics/car-hauling-dispatch/index.astro`;
- `src/pages/logistics/dealer-vehicle-transportation/index.astro`.

Required treatment: current `main` wins. Only a demonstrably unique, tested, claim-safe fragment may be ported through a new focused change after file-level review.

### Documentation: useful as research inputs

These documents may remain useful as planning or evidence templates, subject to current-source revalidation:

- `SEO_CAR_HAULING_DEMAND_AND_CARRIER_MAP.md`;
- `SEO_CAR_HAULING_PAGE_PRIORITY_AND_EVIDENCE_PLAN.md`;
- `SEO_CLAIMS_EVIDENCE_MATRIX.md`;
- `SEO_CONTENT_BRIEF_CAR_HAULING_DISPATCH.md`;
- `SEO_CONTENT_BRIEF_DEALER_VEHICLE_TRANSPORTATION.md`;
- `SEO_DATA_LOCATOR_TASK.md`;
- `SEO_KEYWORD_PAGE_MAP.md`;
- `SEO_MEASUREMENT_SNAPSHOT_TEMPLATE.md`;
- `SEO_OPPORTUNITY_MAP_TEMPLATE.md`;
- `SEO_SOURCE_REGISTRY_TEMPLATE.md`;
- `TECHNICAL_SEO_COPYWRITELY_FINDINGS.md`;
- `TECHNICAL_SEO_IMPLEMENTATION_NOTES.md`.

Use them only as inputs to the current evidence-first registries. Historical demand, competition, page priority, Search Console, analytics, route, or business assertions require dated verification.

### Documentation: duplicate or superseded coordination

The following are superseded by Issue #20, PR #19, the current handoff, current branch-conflict matrix, and the canonical 200-task queue:

- `CLAUDE_OPERATING_AUTHORIZATION.md`;
- `SEO_AGENT_NEXT_ACTION.md`;
- `SEO_AGENT_PROMPT.md`;
- `SEO_AGENT_STATUS.md`;
- `SEO_GLOBAL_STRATEGY_INDEX.md`;
- `SEO_IMPLEMENTATION_QUEUE.md`;
- `SEO_ISSUE_ROUTING.md`;
- `SEO_OWNER_DIRECTIVE_2026-07-30.md`;
- `SEO_PILOT_EXECUTION_ORDER.md`;
- `SEO_README.md`;
- `SEO_STRATEGY_CHANGELOG.md`;
- `SEO_TASK_OWNER_MAP.md`.

Do not copy their execution status or authorization language forward.

### Documentation: requires business evidence before use

The following contain program, audience, competitor, editorial, or global-expansion concepts that cannot become public claims or routes without current evidence and owner-approved scope:

- `SEO_ACADEMY_AUDIENCE_ROADMAP.md`;
- `SEO_COMPETITOR_INTELLIGENCE_ACADEMY.md`;
- `SEO_CONTENT_BRIEF_ACADEMY_HUB.md`;
- `SEO_EDITORIAL_PLAN_FIRST_30.md`;
- `SEO_PROGRAM_CONTENT_BRIEFS.md`;
- `SEO_ZERO_COMPETITION_GLOBAL_STRATEGY.md`;
- `SEO_COPYWRITELY_IMPLEMENTATION_RESULT.md`.

Required gates include real search demand, dated competition research, service capacity, compliance/payment eligibility, unique value, approved program facts, and publication score at least 7/10.

## Queue result

- Task 12: completed — PR #9 classified; wholesale merge rejected.
- Task 13: completed — PR #6 useful baseline notes retained with stale and obsolete assumptions identified.
- Task 14 remains represented by `docs/BRANCH_CONFLICT_MATRIX_2026-07-31.md`; its branch counts must be refreshed after every new commit or main-branch movement.

## Next independent tasks

Proceed with source-of-truth cleanup tasks 15–20, then perform non-runtime audits from section B while branch synchronization remains blocked. Runtime changes still require current-main reconciliation and complete CI on the latest PR head.
