# Hermes GEO — Current Contracts and AI Observation Ledger

Date: 2026-08-22
Owner scope: public AI visibility / entity / evidence only
Source baseline: current `main` + current contracts extracted from #756. Historical #756 commit stack is intentionally not merged.

## Hard boundary

- Do not mass-generate pages.
- Do not change SEO title/meta as part of GEO execution.
- Do not modify Hermes Connect auth/session, D1, booking, CRM, authenticated Repair Shop workspaces, or private product logic.
- Public Hermes Connect surfaces may be reviewed only for truthful public representation.
- Material visual changes require clickable Preview, desktop QA, 390px QA, and CEO visual approval before production merge.

## Current GEO truth contracts extracted from #756

1. `implemented` is not `CI verified`.
2. `CI verified` is not Google/Bing/GA4/private-operations proof.
3. Owner-provided evidence remains owner-provided until independently/platform verified.
4. Unknown metrics remain unknown/null; never convert missing evidence to zero.
5. Do not store full AI conversations, credentials, user-level analytics, lead PII, deal amounts, or revenue amounts in public GEO evidence.
6. No location/equipment/lane page factory without distinct demand, distinct first-party evidence, and a non-conflicting canonical owner.
7. No material visual production change without CEO preview approval.
8. Held entity/profile relationships must not leak into `sameAs`, provider identity, or other production schema relationships.
9. Four Directions remain distinct public business directions while GEO and SEO measurement remain separate evidence streams.
10. Engineering completion must explicitly preserve external evidence gaps rather than fabricate a performance conclusion.

## Current public entity contract

Master brand: Hermes.

Public business directions:

- Logistics → `/paths/logistics/`
- Marketing → `/paths/marketing/`
- Academy → `/paths/academy/`
- Technology → `/paths/technology/`

Current naming contract used by #785:

- MOVE = Hermes Logistics
- GROW = Hermes Marketing
- LEARN = Hermes Academy
- BUILD = Hermes Technology

Schema/publication state inherited as contract evidence from #756:

- approved: `hermes_ecosystem`
- approved: `hermes_academy`
- held: `hermes_logistics`
- held: `progressopro_marketing`
- held: `hermes_it`

Held relationships are not evidence of legal ownership, production-provider identity, affiliation, or an approved `sameAs` relationship.

## Proven AI-citation pattern: Auction Vehicle Pickup Checklist

Current proven pattern to study and reuse structurally, not clone mechanically:

1. One canonical owner page with a narrow user question/problem.
2. Clear Article identity and canonical URL.
3. Breadcrumb schema that anchors the page inside Hermes → Logistics → Resources.
4. Direct answer in the first screen before long-form detail.
5. Numbered, self-contained sections with explicit factual steps.
6. Safety and non-affiliation boundaries close to the relevant claim.
7. Concrete inputs the user must prepare.
8. No-guarantee language for price, pickup date, capacity, assignment, or outcome.
9. Structured direct intake as the action surface.
10. Related-owner graph linking to adjacent authoritative Hermes pages rather than creating duplicate pages for every variant.
11. Human-review boundary is explicit; submission is not represented as booking or capacity confirmation.

This pattern should inform answer/entity/evidence surfaces elsewhere only when the destination page has a distinct canonical purpose and real evidence.

## First real 48 × 5 observation wave contract

The first production observation wave must contain 48 fixed prompts evaluated independently across 5 AI providers/answer engines. Do not replace provider observations with synthetic fixtures or web-search snippets.

For every prompt/provider observation record:

- `wave_id`
- `observed_at`
- `provider`
- `prompt_id`
- `prompt_family`
- `prompt_text_hash` (store exact text only where governance allows)
- `hermes_mentioned`
- `hermes_recommended`
- `citation_present`
- `citation_url`
- `citation_owner`
- `entity_name_returned`
- `entity_correct`
- `canonical_url_returned`
- `canonical_correct`
- `factual_error`
- `factual_error_class`
- `competitors_returned`
- `source_domains`
- `notes_redacted`

## Entity / citation / error / source ledger

Each external observation should append one normalized ledger row. Missing values stay null.

### Ledger dimensions

**Entity**
- expected master brand
- expected direction
- returned entity/name
- entity correct yes/no/null
- incorrect affiliation or ownership claim

**Citation**
- citation present yes/no/null
- cited URL
- canonical owner URL
- citation canonical correct yes/no/null
- Hermes-owned vs third-party source

**Error**
- factual error yes/no/null
- error class: identity / service / geography / availability / affiliation / maturity / pricing / guarantee / legal / other
- corrected fact source

**Source**
- source domain
- source type: Hermes canonical / Hermes supporting / third-party authoritative / third-party weak / unknown
- source freshness when observable

**Competition**
- competitor names returned
- competitor count
- Hermes position/order when observable

## KPI reporting contract

Report only what the current evidence supports:

- `AI_MENTIONS` = Hermes mention observations / valid observations
- `AI_RECOMMENDATIONS` = Hermes recommendation observations / valid observations
- `CITATIONS` = observations with a visible Hermes citation / valid observations
- `CORRECT_ENTITY` = correct Hermes entity observations / Hermes-mentioned observations
- `CORRECT_CANONICAL` = correct canonical URL citations / Hermes citation observations
- `FACTUAL_ERRORS` = observations containing at least one factual error / valid observations
- `COMPETITOR_SHARE` = competitor recommendation/mention share using the same fixed observation universe
- `AI_REFERRALS` = externally attributed AI-origin sessions/leads only when measured
- `AI_BOOKINGS` = externally attributed AI-origin bookings only when attribution becomes available

If attribution is unavailable, `AI_REFERRALS` and `AI_BOOKINGS` remain null/not available, never zero.

## Completion gate for this layer

This contract/ledger layer is engineering documentation only. It does not claim that the first 48 × 5 observation wave has run. Completion of the wave requires real provider observations and ledger rows, followed by aggregate KPI calculation.