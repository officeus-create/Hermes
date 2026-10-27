# Threads Operating Model — Hermes / ProgressoPro
Date: 2026-10-27
Owner: Growth Bridge #1018 + hermes-marketing-growth
Status: CONSOLIDATED SOURCE / EXTERNAL WRITES OWNER-GATED

## Scope of this workstream
This workstream owns Threads infrastructure and operating quality:
- brand/account authorization and identity verification;
- owner-only research and public-signal review;
- Social Studio draft/review/composer flow;
- bounded owner-approved replies to inbound comments under owned posts;
- canonical Social Publisher scheduling;
- idempotency, provider receipts, readback and metrics;
- attribution into Hermes Connect only after a real consented/qualified action;
- post-mortem learning into Marketing Growth / One Brain.

It does NOT own website package prices, commercial website quotes, website price comparisons,
recurring SEO/Care pricing, sales-page pricing or the website quote-to-CRM object. Those remain
in the separate Website Pricing source of truth.

## Existing admin surfaces — do not duplicate
1. Internal Threads Connections — brand OAuth/identity/status/publish switches and Post Health.
2. Threads Research — official read-only discovery/conversation review plus one explicit bounded
   reply action when exact OAuth scopes and owned-root proof are present.
3. Hermes Connect Social Studio — live channel overview, gated brand composer, Smart Mirror,
   Drive/AI creative intake, Creative Review and explicit human publish confirmation.
4. Hermes Social Publisher / HAE — the only recurring scheduler/runtime.

## Canonical flow
RESEARCH -> SOURCE/RIGHTS REVIEW -> DRAFT -> CREATIVE REVIEW -> HUMAN APPROVAL ->
CANONICAL PUBLISHER/BOUNDED REPLY -> PROVIDER RECEIPT/READBACK -> METRICS ->
QUALIFIED OUTCOME -> VERIFIED LESSON.

## Brand boundaries
- Hermes Logistics: existing Windsor transport + canonical Hermes Social Publisher only; no duplicate Meta publisher.
- ProgressoPro: primary Threads research/testing lane after exact owner OAuth and scope readback.
- Business Academy: secondary lane after exact identity authorization.
- office_test: canary lane for new provider-write behavior. A secondary brand is unlocked only by
  a successfully read-back Office AUTHORED_POST canary, never by an Office reply.

## Reply boundary
- No auto-reply loop, bulk commenting, unsolicited comments on outside discussions, DMs or follows.
- Reply target must provider-read as an inbound reply.
- Root post must provider-read as owned by the connected brand.
- Self-replies are rejected.
- Required scopes: threads_content_publish + threads_read_replies + threads_manage_replies.
- One explicit target + explicit owner confirmation + idempotency reservation before write.
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
