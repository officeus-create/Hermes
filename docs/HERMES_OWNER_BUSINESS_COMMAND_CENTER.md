# Hermes Owner Business Command Center — canonical contract

Status: IMPLEMENTATION DRAFT in PR #2096.
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
→ safe owner approval gate when required
→ work item reconciles to done or blocked.

Multiple owner work items may exist. The current Internal AI invariant remains one active AI task at a time.

## Voice

Browser speech recognition is only an input helper:
- speech is transcribed locally by browser capability where available;
- transcript is visible/editable before saving;
- no work is dispatched by voice alone;
- OS/browser keyboard dictation remains the fallback;
- Command Center does not create a microphone recording archive.

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
