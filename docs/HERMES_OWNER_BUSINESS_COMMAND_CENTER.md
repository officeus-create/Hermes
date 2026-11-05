# Hermes Owner Business Command Center — canonical contract

Status: CURRENT CANONICAL SOURCE TRAIN; private foundation originated in merged PR #2107. The former stacked completion train #2159 → #2170 → #2219 → #2221 → #2222 → #2232 → #2234 has been reconciled into the single current release candidate #2236 tracked by #2106. Those parent/replay PRs are provenance only; #2096, #2105 and other historical competing implementations remain superseded.
Private route: /services/hermes-connect/internal/command-center/
Public route: /services/hermes-connect/command-center/
Private access: server-verified HERMES_INTERNAL_OWNER only; edge middleware must verify capability before serving the static owner workspace asset.
Private discovery: noindex, nofollow, noarchive. Public Business Command Center is indexable and uses sample/sanitized data only.

## Purpose

One owner-facing CRM/admin surface for Hermes business management. The Command Center must reduce chat/app hopping without becoming a second system of record.

It presents one Hermes operating layer with two access modes.

Public mode explains the product through sample data and never exposes owner records. Private mode organizes daily owner work into:
- Today — decisions, running work, blockers and the next owner action;
- Projects — project portfolio plus the four Hermes business pillars: Logistics, Marketing, Technology and Academy;
- Tasks — the durable owner backlog;
- CRM — a router to existing Hermes Connect vertical/company workspaces; never a second CRM database;
- Social Acquisition — read-only HAE/social queue, provider/OAuth health, publication receipts and links to the existing Unified Inbox / social connection surfaces; no second publisher;
- Automations — owner-managed HAE processes;
- Agents — local/cloud execution state and fallbacks;
- Plugins — current role/version capability registry; registered/selected never means executed;
- Executions — the existing task → executor → capability → evidence map, provider health, department KPIs and GitHub/human-work enrichment;
- Evidence — task-linked results, PRs and owner acceptance;
- Reports — Command Center-only HAE receipts for bounded recurring $0 reports;
- Knowledge — reviewed One Brain source registry and lesson-governance state without copying Drive content into D1;
- Investor — event-triggered investor-readiness state; no continuous polling or invented finance facts;
- Access — connected workspaces and owner permission management.

Plugins and Executions are separate owner navigation views for clarity, but they still reuse the same owner-only execution read model and canonical HAE/plugin registry. They do not create another plugin store, execution database or runtime. Provider errors/health and department KPI evidence remain projections inside the execution read model. Client View is a separate membership-scoped Hermes Connect surface derived from authenticated active company membership and never exposes owner-only Command Center state.

Sales, Finance and Operations remain operating functions inside the system. They are not additional Hermes business pillars or sub-brands.

## Data ownership

The Command Center is a router and orchestration surface.

It does not replace existing Hermes Connect vertical CRM records, Unified Inbox / lead records, Load Board / logistics records, Academy learner/business records, Internal AI task/event/runner records, canonical GitHub / One Brain evidence owners, or connected provider data.

The only new durable owner-domain record is hermes_owner_work_items: a private planning backlog that links, when dispatched, to the existing hermes_internal_ai_tasks queue. Owner-created projects extend the same Command Center D1 through `hermes_owner_projects`; they do not form another project system. Client View reuses `hermes_company_memberships` and existing Hermes session identity rather than creating another tenant/auth model.

Owner-configured recurring execution remains inside the same canonical HAE data plane. `hermes_automation_processes` stores bounded process definitions and `hermes_automation_process_events` stores their immutable activation, pause, dispatch and error receipts. These tables reuse the existing Hermes Connect production D1 and the existing HAE Queue; they are not another scheduler or task registry.

## Local executor / outage behavior

Cloudflare Pages + D1 own command-center state. Hermes AI local execution is outbound-only: Windows YuraValentyuk is the assigned primary executor when connected, while Mac is a cold fallback/reference. Neither local host is the database, web server, scheduler or canonical HAE control plane.

If the assigned local executor is offline:
1. the private web Command Center can remain reachable;
2. owner work items remain durable in D1;
3. owner may continue capturing/planning work;
4. no new runner work is falsely reported as online;
5. one existing active AI task remains canonical;
6. when an assigned local executor returns, it reconnects through the existing runner heartbeat/claim flow and must prove canonical WORK_ID → lease → execution → durable receipt before being called HAE-integrated.

Do not create a second scheduler just to compensate for a disconnected local executor.

## Task flow

OWNER IDEA / DICTATION
→ review text
→ D1 work item (planned)
→ optional ready
→ owner presses Run
→ existing Internal AI task (queued)
→ outbound Hermes AI runner (Windows assigned primary; Mac fallback/reference)
→ isolated Codex task branch
→ sanitized result / PR / evidence
→ work item enters `awaiting_acceptance`
→ owner reviews the result and evidence
→ explicit Accept records `accepted_by`, `accepted_at`, and completion time
→ work item becomes done; Needs rework returns it to blocked with a reason.

Multiple owner work items may exist. The current Internal AI invariant remains one active AI task at a time.

`hermes_internal_ai_tasks.status = completed` proves that execution ended. It does not prove that the requested business result was accepted. Linked AI work cannot use the generic manual-completion action to bypass this boundary.

## Autonomous HAE processes

The first owner-configurable 24/7 slice is deliberately read-only and zero-cost-first:

OWNER SELECTS VERIFIED CAPABILITY
→ process is created paused
→ owner explicitly activates it
→ absolute UTC `next_run_at` is stored in D1
→ the existing hourly HAE Cron claims the due process with a lease
→ the existing HAE generic-job executor writes one idempotent Queue job
→ job/runtime receipts update the existing HAE tables
→ Command Center shows next run, last run, last job state and error class
→ owner may pause future runs without deleting evidence.

One owner-managed process controls one job type. When configured, it replaces that capability's built-in schedule instead of creating a duplicate run.

Current allowed process templates are bounded deterministic/read-only role contracts for Logistics source freshness, AI gateway readiness, HAE self-improvement audit, Marketing content duplicate audit, Search snapshot and Academy work-English practice. Each template has an allowlisted cadence. Arbitrary prompts, arbitrary payloads, semantic/paid jobs and provider writes cannot be configured through this API.

Activation means "due for the next HAE hourly tick"; it is not a promise of instant execution. The process stays useful without an open ChatGPT/Codex/browser session. Paid AI fallback remains disabled and the automatic paid cost ceiling is `$0`.

External communications, publishing, CRM/customer mutations, billing and other consequential jobs require separate versioned runtime contracts and their existing owner gates before they can appear in this catalog.

### Recurring owner reports

Recurring owner reports use the same HAE Worker, Queue and `hermes_automation_jobs` receipt model; there is no report scheduler or report database alongside HAE.

The reviewed source schedule is:
- HR-tech Radar — Monday 10:00 `Europe/Kyiv`;
- Catalog Monday reminder — Monday 12:00 `Europe/Kyiv`;
- Catalog weekly report — Friday 12:00 `Europe/Kyiv`.

The Worker keeps the existing `:17` hourly wake for ordinary HAE maintenance and adds a `:00` wake reserved for exact-local-time Command Center reports. The report wake returns before normal maintenance so it cannot duplicate health/content/process work.

Both report contracts are deterministic, `READ_ONLY`, `semantic_required=false`, `max_cost_usd=0`, `external_send=false`, and deliver only through the Command Center read model. The legacy scheduled Catalog weekly email path is superseded. Catalog inquiry email remains a separate explicit opt-in feature.

HR-tech Radar reads a bounded allowlist of public official source pages, retains only minimized metadata plus SHA-256-style content fingerprints, and treats the first observation as a baseline rather than a change. Source errors/rate limits remain `UNKNOWN`. Catalog reporting preserves `UNKNOWN` for SEO duplicate risk and for open Catalog work counts until project/work mapping is exhaustively verified.


The Command Center also provides a loopback-only link to the existing Hermes AI Agents interface at `127.0.0.1:8765`. It opens in a separate tab, so a phone or another computer can return to the unchanged Command Center and use the canonical cloud AI status/queue fallback. The online page does not probe localhost, weaken CSP, expose port 8765 through a tunnel, or make the local Cockpit the HAE runtime.

## Project portfolio and public/private product boundary

The owner-only project portfolio is a projection inside this same Command Center. Its canonical bounded registry is returned only by `/api/internal-command-center/projects` after `HERMES_INTERNAL_OWNER` verification; real project names, relationships, agents, plugin roles, blockers and GitHub evidence are never embedded in the public static HTML.

Every project record states its department, purpose, accountable role, execution agent, plugin roles, parent, dependencies, related projects, blockers and dated evidence. Progress is derived only from completed milestones divided by total milestones. It is not a subjective confidence score. ETA remains `UNKNOWN` until comparable completed work provides an auditable basis; the UI must label any future ETA as an estimate and show that basis.

The canonical public page is `/services/hermes-connect/command-center/`. It is a synthetic, read-only product demonstration using sample projects/tasks only. It exposes no internal project, customer, credential or authorization data. The historical `/services/hermes-connect/ai-command-center/` identity is retired as a competing product name and redirects/transitions to Business Command Center; Hermes Intelligence is a layer inside the product, not a second Command Center.

The historical AI Operations collision is resolved: #2125 is superseded, and #2159 plus its stacked completion children were reconciled into #2236. Do not reopen those old branches as competing writers; current release review occurs on #2236.

## Voice

Browser speech recognition is only an input helper:
- speech recognition is handled by the browser/OS/provider available on that device; Hermes does not assume it is on-device;
- transcript is visible/editable before saving;
- no work is dispatched by voice alone;
- OS/browser keyboard dictation remains the fallback;
- Hermes stores only the reviewed submitted text; Command Center does not create an audio recording archive.

## Owner access

Owner access is a capability, never an email-role inference.

Grant/revoke rules:
- current user must already hold HERMES_INTERNAL_OWNER;
- target must already exist in specialists;
- exact email is used only to look up that existing account;
- grant/revoke is written to hermes_internal_owner_access_audit;
- current owner cannot revoke itself;
- the last active internal owner cannot be removed;
- no personal email is hardcoded in repository authorization policy.

## Consequential action boundaries

Command Center must not bypass existing approval gates for merge/deploy, external communications, credentials/secrets, billing/permissions, legal/commercial commitments, destructive database actions, material scope expansion, or unresolved evidence.

A work-item prompt cannot manufacture approval.

## Product UX

The private default view is **Today**, not a long configuration page. The owner should answer immediately:
- What needs my decision?
- What is running now?
- What is blocked?
- What should I do next?

Configuration is progressively disclosed through Projects, Tasks, CRM, Social, Automations, Agents, Plugins, Executions, Evidence, Reports, Knowledge, Investor and Access. Task capture opens on demand instead of permanently occupying the main page. HAE configuration is not mixed into the daily decision layer. On compact screens the shared shell keeps the primary four actions visible and moves secondary views into the existing More menu instead of adding a second mobile navigation system.

The public and private surfaces share one Command Center shell and the canonical Hermes brand system so they cannot drift into separate products. Pearl/Paper/Ink are the base; violet is Intelligence; the four business-pillar colors are orientation cues only. Primary controls keep 44px touch targets. Large workspace panels use the canonical panel radius.

Anonymous requests to the private route must be intercepted at the edge. They receive only a minimal secure sign-in/access shell; internal operational markup must not be served before server-side owner verification.


## Historical owner-task recovery

The private Command Center is also the convergence surface for owner work recovered from prior operating sources. It does not create a second task registry.

The bounded importer in `functions/api/_lib/command-center-history-backlog.mjs` idempotently seeds high-confidence recovered work into the existing `hermes_owner_work_items` D1 table. Imported rows preserve:

- source class and human-readable source label;
- a bounded source reference when available;
- current reconciled status;
- blocker/reason when applicable;
- concrete next action;
- canonical project/workstream assignment when known.

Current recovery scope begins with the owner work period 2026-08-05 through 2026-11-05 and includes ChatGPT work history, GitHub issues/PRs, One Brain/Drive handoffs, plugin work, Audit & Order evidence and local Windows/Mac handoff records. Old historical checkboxes are not automatically treated as active work: stale items stay blocked until current main/runtime evidence confirms they still survive.

Owner edits and execution continue through the normal Command Center APIs. The importer never auto-dispatches AI, never creates another scheduler/queue/database, and never overwrites an existing row with the same deterministic imported ID.
