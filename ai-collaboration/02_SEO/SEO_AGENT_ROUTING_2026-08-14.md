# SEO14 — AI Agent Routing and Evidence Contract — 2026-08-14

```yaml
ai_name: ChatGPT
model: GPT-5.6 Sol
chat_or_thread: SEO 14 tasks and Codex analytics
role: SEO orchestrator / contradiction resolver
department: SEO / AI collaboration
date: 2026-08-14
contribution_type: Implementation Report
confidence: 95
task_id: SEO14-ORCHESTRATION
source_of_truth: issue #206 + issue #462 + owner-provided Codex SEO14 handoff
authority_scope: Branch write / issue write / authenticated connector actions where explicitly available
write_scope:
  - ai-collaboration SEO/current-state documentation
  - SEO task routing and evidence coordination
  - reversible repository changes through branch/PR
specialization:
  - cross-source synthesis
  - commercial intent and prioritization
  - agent routing and contradiction resolution
not_specialized_in:
  - claiming authenticated platform observations not directly inspected in this environment
reviewed:
  - issue #206
  - issue #462
  - SEO13 logistics demand pass
  - Logistics SEO source page
  - collaboration protocol and current-state files
  - owner-provided SEO14 Codex report
not_reviewed:
  - direct authenticated GA4 property/stream view in this environment
  - completed current Bing Search Performance report
handoff_to: Codex / Antigravity / Claude / Gemini by lane below
```

## Purpose

Stop SEO work from becoming five parallel audits. Each agent receives one lane, one source of truth, one evidence standard and one handoff target. The goal is not to maximize the number of AI outputs; it is to increase the rate of verified SEO improvements and measurement without duplicating work or leaking credentials.

## Current shared facts

Use these facts unless fresher evidence supersedes them:

1. Issue #206 is the single source of truth for production search/analytics measurement.
2. Issue #462 completed the first authenticated GSC-driven Logistics SEO demand optimization.
3. `/services/seo-for-logistics-companies/` is the current canonical owner for the logistics/trucking/transportation SEO commercial cluster.
4. SEO13 changed that page on 2026-08-13. Preserve the planned 7-day/28-day measurement window unless a concrete defect is found.
5. Latest owner-provided Codex SEO14 handoff reports GSC 2026-07-28 through 2026-08-12: 17 clicks, 487 impressions, 3.5% CTR, average position 40.8; US 306 impressions / 2 clicks; Logistics SEO page 119 impressions / 0 clicks.
6. Latest handoff reports 108 indexable sitemap URLs, successful Google/Bing sitemap status, eight sitemap references in robots and `BingSiteAuth.xml` HTTP 200.
7. GA4 receipt/ownership remains unresolved in the latest handoff. Do not create a replacement property merely to satisfy a checklist.
8. GSC external links are reported as only four, all from work.ua; this makes legitimate entity/authority work a meaningful lane, but not a license for spam link building.

## Ownership matrix

| Agent | Primary lane | May do | Must not do | Required output |
|---|---|---|---|---|
| ChatGPT | Orchestration, intent, prioritization | choose next smallest revenue/search slice; reconcile conflicting evidence; define KPI; update routing/current state; coordinate PR/issue sequence | invent platform evidence; create duplicate keyword pages; expose secrets | prioritized decision + source/evidence receipt + next owner |
| Codex | Technical implementation + evidence coordinator | edit repo; add/fix tests; inspect implementation; run/interpret CI; collect sanitized authenticated GSC/Bing/GA4 evidence when its environment has access; update #206 | change analytics runtime before receipt diagnosis; create replacement search/analytics accounts just to pass a checklist | implementation/evidence report with exact files, tests, date ranges and rollback |
| Antigravity | Crawl/browser/UI verifier | crawl canonical routes; inspect rendered title/meta/H1/schema/links/CTA; mobile/desktop checks; identify broken/competing links; draft bounded metadata suggestions | make unsupported ranking claims; own measurement source of truth; receive raw credentials from another agent | route-by-route defect list with reproduction evidence and severity |
| Claude | Independent reviewer / red team | challenge canonical ownership, thin/duplicate content, claims, schema, internal-link logic, measurement interpretation and PR risk | duplicate implementation already owned by Codex; treat opinions as evidence | pass/partial/fail review tied to exact evidence and smallest fix |
| Gemini | Google evidence reader | read authenticated Google data when available; compare GSC/GA4/Google-side observations; return sanitized aggregate evidence | create or replace properties/accounts without explicit task need; pass cookies/tokens to other agents | sanitized Google evidence receipt with scope/date/limitations |
| Human owner | Authority / exception gate | approve destructive changes, account ownership/billing/security changes, legal/business exceptions; delegate bounded autonomy | — | explicit decision when a human gate is reached |

## Access model

Access is capability-based, not secret-sharing-based.

- Repository access: use each agent's own GitHub integration/session. Do not pass PATs.
- GSC/GA4/Google access: use each agent's own authorized Google environment. Do not pass OAuth tokens, cookies, property/account identifiers into public repo text.
- Bing access: use the existing Hermes site/account through the agent's own authenticated environment. Do not create a replacement property because another agent cannot see the existing one.
- Cloudflare/DNS: only the agent with its own authorized connector/session may act. Credentials never enter handoff files.
- Private operations/CRM: summarize aggregate disposition evidence only; never hand off raw lead rows or private carrier/customer data through GitHub.

## Handoff envelope

Every SEO handoff should use this minimum structure:

```yaml
task_id: stable ID / issue / PR
owner: current agent
status: NOT_STARTED | IN_PROGRESS | BLOCKED | READY_FOR_REVIEW | COMPLETE
source_of_truth: issue / decision / current-state file
changes:
  - exact files/routes/platform settings changed
tests:
  - exact tests/checks and results
evidence:
  - evidence_class
  - source
  - observed_at/date_range
  - scope
  - sanitized result
unknowns:
  - what remains unverified
rollback:
  - branch/commit/reversal path when applicable
next_smallest_step: one concrete action
next_owner: one agent or human owner
```

A handoff without `unknowns` is assumed incomplete unless the task is trivially closed. A handoff that says only “done”, “all green” or “SEO improved” is not sufficient evidence.

## Anti-duplication rules

1. Search #206, open SEO issues and current-state files before opening a new measurement task.
2. If a route was changed less than the defined observation window ago, measure before rewriting it again unless a real defect is found.
3. If Codex owns implementation, Claude reviews it; Claude does not create a competing implementation unless explicitly handed ownership.
4. If Antigravity finds a UI/crawl defect, it hands the reproducible defect to Codex; it does not silently alter canonical strategy.
5. If Gemini/Codex disagree on a Google metric, normalize property, date range, search type, country/device filters and evidence freshness before choosing a winner.
6. Do not let one AI's inability to authenticate cause another AI to create duplicate accounts or properties.

## Current queue

### P0 — Measurement integrity

Owner: Codex, with Gemini as Google-side reviewer when authenticated.

- Resolve existing GA4 ownership/access.
- Confirm one production tag/config/dataLayer path remains active; repository already guards duplicate installations.
- Verify priority controlled events in DebugView/Realtime/network exactly once with synthetic non-private interactions.
- Keep synthetic interactions excluded from business KPIs.
- Update #206 with sanitized evidence only.

Success: `PLATFORM_VERIFIED` event receipt + no prohibited values + no duplicate event transport.

### P0 — Logistics SEO observation window

Owner: ChatGPT strategy; Codex measurement.

- Preserve the 2026-08-13 canonical-page changes.
- Around day 7, compare the same query × page cluster for impressions, clicks, CTR and average position.
- Around day 28, repeat with the same scope and record directional movement.
- Do not create wording-variant pages unless the data shows a distinct intent gap.

Success: comparable before/after evidence, not simply more URLs.

### P1 — Internal support graph

Owner: Antigravity discovery → ChatGPT intent review → Codex implementation.

- Crawl/index the internal links into the Logistics SEO canonical page.
- Distinguish actual repository links from GSC's lagging/aggregated internal-links report.
- Identify relevant high-authority hubs/resources/cases that discuss SEO/logistics and currently fail to support the canonical owner.
- Add only natural contextually justified links; avoid sitewide keyword stuffing.

Success: stronger contextual discovery path with no same-intent cannibalization and green link tests.

### P1 — External entity and authority consistency

Owner: ChatGPT prioritization; agent with authenticated profile access performs each platform action.

Prioritize legitimate sources where Hermes can accurately control or earn a reference:

- official owned business/social/company profiles;
- existing employment/company profiles already ranking for the brand;
- relevant logistics/industry profiles or associations where Hermes is genuinely eligible;
- consistent website/company reference on owned profiles;
- permissioned editorial citations, partnerships, cases or useful resources.

Do not bulk-submit to low-quality directories, buy links, exchange links at scale or create fabricated locations/reviews.

Success: more accurate branded entity coverage and legitimate referring domains over time, not a raw submission count.

### P1 — Bing completion

Owner: Codex or other agent with authenticated Bing access.

- Wait for the existing Search Performance processing to complete.
- Capture index/query/click/impression baseline for the existing site.
- Keep the seven-child-sitemap interpretation separate from URL count.
- Do not resubmit the sitemap without an actual sitemap error or material change that warrants action.

Success: sanitized Bing baseline attached to the same measurement source of truth.

## Escalation rules

Escalate to the owner only when:

- account ownership/billing/security must change;
- a destructive action is required;
- an external profile requires legal/entity proof the agent cannot validate;
- two authenticated sources remain irreconcilable after scope/date normalization;
- a proposed public claim relies on private or legally sensitive evidence;
- a canonical/consolidation change would remove or redirect a revenue-producing route without sufficient evidence.

Everything else should continue through the assigned agent lane without asking the owner to repeat context already present in the source-of-truth system.

## Bridge health definition

The bridge is healthy only when all four conditions hold:

1. transport/document self-tests pass;
2. current-state files reflect newer approved decisions and measurements;
3. each active slice has one owner/source of truth and a valid handoff;
4. secrets remain outside the collaboration documents.

A 16/16 bridge test with stale `CURRENT_STATE.md` is transport-green but context-stale. SEO14 fixes that distinction explicitly.
