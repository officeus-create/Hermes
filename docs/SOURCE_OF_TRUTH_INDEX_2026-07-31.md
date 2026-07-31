# Hermes Source-of-Truth Index — 2026-07-31

Purpose: define where product facts, service claims, pricing, contacts, analytics facts, operational data, and publication decisions must come from before code or public copy changes.

## Priority order

When sources disagree, use this order:

1. current `main` source and generated output;
2. latest successful GitHub Actions run for the exact commit;
3. merged PRs and approved review decisions;
4. owner-approved contracts, policies, pricing sheets, and contact records;
5. current connected analytics/Search Console data retrieved at decision time;
6. owner-approved sanitized operational exports with provenance;
7. dated official external sources;
8. historical reports, AI notes, chats, and old branches as research leads only.

No historical note or AI-generated document overrides current code, current CI, signed terms, or owner-approved facts.

## Product and service facts

| Fact family | Authoritative source | Current repository reference | Publication rule |
|---|---|---|---|
| Hermes logistics audiences and service boundaries | approved service scope/contract plus current application source | `src/data/logistics-audiences.ts`; `docs/LOGISTICS_CARRIER_GROWTH_SYSTEM.md`; `docs/LOGISTICS_DEMAND_GROWTH_SYSTEM.md` | Do not imply guaranteed loads, rates, approvals, capacity, customers, income, insurance, financing, or outcomes. |
| Website, SEO, Local SEO, CRM, and automation scope | owner-approved commercial scope plus working product evidence | `docs/WEBSITE_SEO_US_GROWTH_SYSTEM.md`; approved public service pages | Label prototypes honestly. Do not promise rankings, leads, traffic, sales, or delivery outside approved scope. |
| Academy programs | written syllabus, schedule, mentor capacity, terms, and owner approval | `docs/ACADEMY_PROGRAM_AND_MARKET_GATES.md` | Public scope currently limited to U.S. logistics and marketing. |
| Careers and vacancies | current hiring decision, approved role facts, application path, and privacy terms | `docs/CAREERS_RECRUITMENT_GOVERNANCE.md`; `src/pages/careers/index.astro` | JobPosting schema only for a verified, currently open, fully specified role. |
| Lane and location claims | sanitized completed-history source, provenance, demand, competition, service fit, privacy review | `src/data/lane-opportunity.ts`; `src/data/logistics-growth-registry.ts` | No automatic publishing. Minimum 7/10 score and explicit `published` state. |

## Pricing and compensation

Pricing, fees, salaries, commissions, discounts, refunds, payment schedules, and corporate packages require a dated owner-approved written source.

The discussed Academy concepts `$999 for three months`, `$400 monthly`, and `from $600 monthly` remain blocked from publication. Informal chats, old drafts, AI recommendations, or remembered numbers are not publication authority.

No public compensation or earnings claim may be inferred from internal targets, percentage splits, candidate discussions, or historical performance.

## Contact information

Public phone numbers, email addresses, physical addresses, legal entity names, and application recipients require one owner-approved contact register.

Before editing contact values:

- compare the current source, generated output, legal pages, forms, structured data, footer, and localized pages;
- confirm whether the value is public, internal, role-specific, or temporary;
- never copy a contact value from chat memory directly into production;
- never expose credentials, personal inboxes, private mobile numbers, or unapproved addresses.

Until a formal contact register is approved, current `main` remains the implementation baseline and conflicting values are blockers rather than opportunities to guess.

## Analytics and Search Console

Current connected data retrieved at decision time is authoritative for impressions, clicks, indexing, events, and traffic. Historical screenshots and reports are time-bound leads only.

Analytics events may contain page, language, service, action, and campaign classifications. They must not contain names, email addresses, phone numbers, exact addresses, free text, MC/DOT, shipment IDs, resumes, rates, or other operational identifiers.

## Operational logistics data

Allowed research inputs:

- synthetic fixtures;
- owner-approved sanitized CSV exports;
- manually prepared samples without PII or confidential commercial data.

Required fields for a retained lane record include provenance, approved geographic resolution, lifecycle state, date/freshness, equipment when available, privacy review, and publication status.

Observed offers, booked loads, completed moves, verified records, and published facts are separate states. No state automatically becomes public.

## External research

Laws, provider APIs, platform requirements, sanctions/payment eligibility, market demand, competition, and software behavior require current official or primary sources with retrieval dates.

Do not rely on legacy API recommendations, scraped dashboards, unofficial API-key repositories, or provider-protection bypasses.

## AI and historical documents

Use `docs/AI_RECOMMENDATION_REGISTER.md` to classify AI suggestions as safe, evidence-required, duplicate, obsolete, or rejected.

Use `docs/LEGACY_PR_6_9_RECONCILIATION_2026-07-31.md` for the disposition of PRs #6 and #9. Old execution prompts and status files are not active authorization.

## Owner-only gates

Separate explicit owner approval is required for:

- merge to `main`;
- production deployment;
- DNS, Cloudflare account, billing, or paid service changes;
- secrets and API keys;
- destructive deletion or force updates;
- connecting real operational systems or exports;
- sending external communications;
- publishing unapproved pricing, compensation, hiring, route, location, language-market, customer, result, or capacity claims.

## Maintenance rule

Update this index whenever a new approved contract, pricing source, contact register, data source, provider integration, or publication policy becomes authoritative. Record the source owner, approval date, scope, and superseded document. Never silently replace a fact source.
