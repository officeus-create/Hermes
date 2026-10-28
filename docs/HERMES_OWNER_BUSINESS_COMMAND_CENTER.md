# Hermes Owner Business Command Center — canonical contract

Status: RELEASE CANDIDATE in canonical PR #2107; #2096 and #2105 are superseded historical implementations.
Route: /services/hermes-connect/internal/command-center/
Access: server-verified HERMES_INTERNAL_OWNER only.
Public discovery: noindex, nofollow, noarchive.

## Purpose

One owner-facing CRM/admin surface for Hermes business management. The Command Center must reduce chat/app hopping without becoming a second system of record.

It presents:
- Marketing;
- Logistics;
- Sales;
- Technology / Hermes Connect;
- Academy;
- Finance / project economics;
- Agents / Internal AI;
- the owner's cross-direction work backlog.

## Data ownership

The Command Center is a router and orchestration surface.

It does not replace existing Hermes Connect vertical CRM records, Unified Inbox / lead records, Load Board / logistics records, Academy learner/business records, Internal AI task/event/runner records, canonical GitHub / One Brain evidence owners, or connected provider data.

The only new durable owner-domain record is hermes_owner_work_items: a private planning backlog that links, when dispatched, to the existing hermes_internal_ai_tasks queue.

Owner-configured recurring execution remains inside the same canonical HAE data plane. `hermes_automation_processes` stores bounded process definitions and `hermes_automation_process_events` stores their immutable activation, pause, dispatch and error receipts. These tables reuse the existing Hermes Connect production D1 and the existing HAE Queue; they are not another scheduler or task registry.

## Mac / outage behavior

Cloudflare Pages + D1 own command-center state. The Mac is an outbound AI runner, not the database and not the web server.

If the Mac loses power:
1. the private web Command Center can remain reachable;
2. owner work items remain durable in D1;
3. owner may continue capturing/planning work;
4. no new runner work is falsely reported as online;
5. one existing active AI task remains canonical;
6. when the Mac returns, it reconnects through the existing runner heartbeat/claim flow.

Do not create a second scheduler just to compensate for a disconnected Mac.

## Task flow

OWNER IDEA / DICTATION
→ review text
→ D1 work item (planned)
→ optional ready
→ owner presses Run
→ existing Internal AI task (queued)
→ outbound Mac runner
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

The Command Center also provides a loopback-only link to the existing Hermes AI Agents interface at `127.0.0.1:8765`. It opens in a separate tab, so a phone or another computer can return to the unchanged Command Center and use the canonical cloud AI status/queue fallback. The online page does not probe localhost, weaken CSP, expose port 8765 through a tunnel, or make the local Cockpit the HAE runtime.

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

The owner should answer, from one page:
- Is the agent online?
- What is running?
- What needs my approval?
- What are my open tasks by business direction?
- What is the next task to execute?
- Which canonical workspace do I open for Marketing / Logistics / Sales / Technology / Academy / Finance?
- Who currently has owner access?

The page should stay light-first, mobile-usable, fast-scanning, and compatible with the Hermes Connect product-native interface system.
