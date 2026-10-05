# Hermes Marketing Capability Automation

Status: review-only foundation. No provider account is connected by this change. No external write, paid API call, production deployment, credential change, or customer communication is performed.

## Objective

Give Hermes Marketing one provider-neutral contract for recurring SEO, local SEO, GEO/AI visibility, GBP, review, competitor and attribution work without creating a second marketing platform or binding the company to one SaaS vendor.

The durable unit is a capability/job contract:

`business + location + timezone + capability + schedule/trigger + provider + permission class + cost ceiling + evidence + outcome`

Providers are adapters. Hermes evidence, client identity, scheduling policy, idempotency and outcome definitions remain stable when a provider changes.

## Source-of-truth boundary

This repository owns executable contracts, tests and release-safe adapters.

Durable department knowledge belongs in the existing Marketing / SEO / GEO One Brain. Do not copy account secrets, OAuth tokens, private client records, raw CRM rows or customer data into this repository.

Existing SEO/GEO and marketing owner lanes remain authoritative for their domains. This foundation must not create a second SEO backlog, analytics property, CRM, auth system, D1 database, social publisher or Cloudflare runtime.

## Files

- `config/marketing-automation-capabilities.json`
  - provider-neutral marketing job templates;
  - local-time schedules;
  - cost/write classifications;
  - provider preferences;
  - explicit done conditions.

- `scripts/marketing-automation-scheduler.mjs`
  - IANA-timezone local clock resolution;
  - daily/weekly/monthly due-job selection;
  - polling windows for non-round times such as 06:20 and 06:40;
  - stable per-location idempotency keys;
  - registry validation and public-write guard;
  - explicit UNKNOWN-vs-ZERO protection.

- `scripts/marketing-automation-scheduler.test.mjs`
  - DST behavior;
  - weekly/monthly cadence;
  - retry idempotency;
  - cross-location isolation;
  - unsafe public-write rejection;
  - invalid timezone rejection.

## Result states

- `SUCCESS`: valid source evidence exists.
- `NO_CHANGE`: valid source evidence exists and nothing material changed.
- `ZERO`: the source explicitly measured zero.
- `UNKNOWN`: evidence is unavailable or insufficient.
- `DEFERRED`: budget, rate limit or configured policy prevented the run.
- `BLOCKED_AUTH`: required authorization is missing or expired.
- `FAILED`: execution failed.
- `NEEDS_REVIEW`: evidence exists but a consequential interpretation/action is not safe to automate.

Never collapse UNKNOWN, DEFERRED, BLOCKED_AUTH, FAILED or NEEDS_REVIEW into ZERO.

## Permission classes

### READ_ONLY_AUTOMATIC

Automatic collection/measurement where the current source permits it. Examples: public page monitoring, authenticated analytics reads, technical crawl, existing-report readback.

### DRAFT_WRITE_AUTOMATIC

Automatic internal artifacts that do not change an external public system. Examples: client brief drafts, review-reply drafts, content briefs and internal tasks.

### LIVE_WRITE_GATED

Changes to public or customer-facing systems. Examples: GBP profile edits, published review replies, social posts, emails/SMS, ad changes and production website changes.

The registry rejects any `public_write: true` job that is not `LIVE_WRITE_GATED`. Repository/account owner gates still apply even when a job uses that class.

## Timezone model

Jobs use each business/location's IANA timezone, for example:

- `America/Chicago`
- `America/Los_Angeles`
- `Europe/Kyiv`

Do not hardcode numeric UTC offsets. `Intl.DateTimeFormat` resolves daylight-saving changes.

A scheduler/queue runner may poll every 15 minutes and pass UTC `now` into the selector. A configured local time such as 06:20 becomes due in the poll window that contains it. The generated idempotency key is tied to the configured local date/time slot so retries do not create a second logical job.

## Initial capability set

The registry currently models:

- public local-entity snapshot;
- GBP integrity/change readback;
- review ingestion;
- priority geo-grid measurement;
- GSC query/page deltas;
- governed AI visibility sampling;
- citation rotation;
- public competitor-change checks;
- attribution/receiver reconciliation;
- daily marketing brief;
- weekly keyword/competitor refresh;
- weekly action scorecard;
- monthly evidence/cost/freshness review.

This is not an instruction to run every provider every day. A client/location policy layer must narrow keyword/prompt sets, budgets and providers.

## Provider donor map

### Local Falcon

Useful public patterns from its official MCP/skills:

- SoLV for map visibility vs SAIV for AI visibility;
- ARP vs ATRP vs Found In;
- geo-grid scans and trend comparisons;
- competitor reports;
- review analysis;
- GBP Guard/change monitoring;
- recurring campaigns;
- connected GBP read/write tools;
- explicit MCP annotations for read-only/destructive/open-world effects;
- ChatGPT profile that withholds separately billable on-demand tools.

Hermes reuse rule: copy the safety/capability pattern, not proprietary implementation or account data.

### LeadSnap

Useful public patterns:

- local heatmaps;
- scheduled GBP posts/photos/review replies;
- citation management;
- profile-change protection;
- multi-location agency workflows;
- CRM/contact/call/form/pipeline automation;
- MCP/API adapters.

Hermes reuse rule: treat LeadSnap as a provider/feature donor, not as the canonical evidence or client data model.

### Repair Titans

Useful as a public local-business benchmark:

- explicit service taxonomy;
- wide service-area taxonomy;
- strong quote/call intent;
- same-day/emergency positioning;
- trust/social-proof placement.

Hermes reuse rule: decompose into `Service x Location x Intent x Evidence x CTA`, but publish only distinct, real, useful local pages. No doorway-page factory or unsupported availability claims.

## Open-source candidates

Candidates found for isolated evaluation include:

- OpenSEO: keyword research, rank tracking, competitors, backlinks, audits, AI visibility and MCP/skills.
- CrawlSEO: GSC, crawler, Core Web Vitals, rank history, SEO opportunity detection, alerts and MCP.
- SEOnaut: independent technical crawl/QA.
- LocalGrid / local-seo-heatmap: geo-grid rendering and DataForSEO-backed local rank measurement.
- legends-geogrid: lower-level geo-grid worker/cost-control pattern.
- Postiz: self-hosted social scheduling/automation with API and agent integrations.
- Mautic: mature self-hosted marketing automation.
- listmonk: self-hosted opt-in mailing/newsletter management.
- changedetection.io: public source/competitor change monitoring.
- Umami or Plausible CE: privacy-oriented analytics cross-checks.
- GrowthBook: experiments/feature flags when traffic is sufficient.
- Metabase: reporting over canonical structured data.

Before any adoption: verify current license, maintenance, security, deployment cost, data-provider cost, OAuth/API requirements and overlap with existing Hermes components.

## Recommended orchestration

Do not create a second scheduler.

1. Existing Hermes scheduling/runtime invokes a bounded selector.
2. Selector returns due job envelopes only.
3. Existing queue/idempotency patterns enqueue one logical job.
4. Provider adapter performs read/draft/write according to its current authorization.
5. Normalizer records source/time/cost/evidence.
6. Rules/AI create a bounded diagnosis/action.
7. External writes remain gated.
8. Reporting traces every KPI to observation evidence.

## Cost guard

A future provider adapter must carry:

- `estimated_cost`;
- `actual_cost`;
- `budget_ceiling`;
- `skipped_due_to_budget`;
- source/provider rate-limit state.

Exhausted credits or quota produce DEFERRED/UNKNOWN, never ZERO.

## Local Falcon / LeadSnap registration boundary

Account signup/sign-in, OAuth, API keys, billing/credits and provider permissions are not repository code. Do not create passwords or credentials in automation and never commit them. Connect an existing or owner-created account through the provider's supported OAuth/account flow, then bind only the minimum required scopes in approved secret storage.

## Verification

Focused contract test:

```bash
node scripts/marketing-automation-scheduler.test.mjs
```

Repository release gate remains:

```bash
npm run build
npm test
npm run test:e2e
```

A green focused test proves only this contract. It does not prove that any provider is connected, that a scheduled production job ran, or that a marketing outcome occurred.

## Next implementation slices

1. Connect the existing scheduler/queue to this selector in dry-run mode.
2. Pilot read-only technical/GSC collection with one approved internal property.
3. Pilot one geo-grid provider behind a strict per-client cost cap.
4. Add a normalized observation store/read model only by extending the existing canonical data layer.
5. Generate one daily internal brief.
6. Connect one live-write adapter only after its OAuth/credential/rollback/idempotency gates are proven.
7. Expand to multi-client operation after tenant-isolation and cost tests pass.
