# Threads Operating Model — Hermes / ProgressoPro
Date: 2026-10-27
Owner: Growth Bridge #1018 + hermes-marketing-growth
Status: CONSOLIDATED SOURCE / EXTERNAL WRITES OWNER-GATED

## Scope of this workstream
This workstream owns Threads infrastructure and operating quality:
- brand/account authorization and identity verification;
- owner-only research and public-signal review;
- Social Studio draft/review/composer flow;
- bounded owner-approved reply **handoff** for inbound comments under owned posts;
- HAE #2033 scheduling/execution as the only recurring/autonomous runtime;
- idempotency, provider receipts, readback and metrics;
- attribution into Hermes Connect only after a real consented/qualified action;
- post-mortem learning into Marketing Growth / One Brain.

It does NOT own website package prices, commercial website quotes, website price comparisons,
recurring SEO/Care pricing, sales-page pricing or the website quote-to-CRM object. Those remain
in the separate Website Pricing source of truth.

## Existing admin surfaces — do not duplicate
1. Internal Threads Connections — brand OAuth/identity/status/publish switches and Post Health.
2. Threads Research — official read-only discovery/conversation/mentions review plus one explicit bounded
   owner approval that hands the reply to HAE; the page never writes Meta directly.
3. Hermes Connect Social Studio — live channel overview, gated brand composer, destination fan-out,
   Drive/AI creative intake, Creative Review and explicit human publish confirmation.
4. HAE #2033 — the only recurring/autonomous scheduler/runtime.

## Canonical flow
RESEARCH -> SOURCE/RIGHTS REVIEW -> VIKTOR DRAFT/CLASSIFICATION -> CREATIVE/REPLY REVIEW -> APPROVAL ->
HAE JOB -> SHARED PROVIDER -> PROVIDER RECEIPT/READBACK -> METRICS ->
QUALIFIED OUTCOME -> VERIFIED LESSON.

## Brand boundaries
- **HERMES_LOGISTICS**: all logistics social work. Provider execution converges through HAE + one shared Meta implementation; no second logistics publisher.
- **PROGRESSOPRO**: marketing, IT/software/Hermes Connect and Academy/training. Existing ProgressoPro/Academy account keys are compatibility identities inside this one business lane.
- `office_test`: technical canary identity only; it is not a third commercial lane.

## Reply boundary
- No auto-reply loop, bulk commenting, unsolicited comments on outside discussions, DMs or follows.
- Reply target must provider-read as an inbound reply.
- Root post must provider-read as owned by the connected brand.
- Self-replies are rejected.
- Required scopes: threads_content_publish + threads_read_replies + threads_manage_replies.
- One explicit target + explicit owner confirmation + HAE idempotency before any provider action.
- The owner UI/API does not call the Threads reply provider directly.
- HAE `social.reply` is fail-closed until the capability is independently approved.
- Ambiguous provider outcomes are never blindly retried.
- Provider readback must prove the exact parent reply ID before status becomes published.

## Current live gates
- exact ProgressoPro Meta OAuth/scopes are not yet production-proven;
- browser sign-in is not provider/API authorization;
- production owner session / HERMES_INTERNAL_OWNER is a separate privileged gate;
- no public reply may be claimed without provider permalink + parent-ID receipt;
- Facebook writes remain on their existing separate authorization boundary.

## Acceptance
No stage advances from CODED to LIVE without exact-head CI, production deployment/readback,
exact account identity, provider receipt and the required human approval evidence.
UNKNOWN != 0; public signal != qualified lead; local/SQLite simulation != provider proof.


## 2026-10-29 supersession note
Current official Threads API verification uses `graph.threads.net` and includes read/manage replies, mentions and keyword-search capabilities subject to exact app/account permissions. Keyword search is opportunity discovery only; no mass auto-reply. Threads DMs are `MANUAL_PROVIDER_SURFACE` until an official API capability is independently proven.
