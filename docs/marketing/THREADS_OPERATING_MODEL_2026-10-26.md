# Threads Operating Model — Hermes / ProgressoPro
Date: 2026-10-26
Owner: Growth Bridge #1018 + hermes-marketing-growth
Status: CURRENT-MAIN RECONCILIATION / EXTERNAL WRITES REMAIN OWNER-GATED

## Scope of this workstream
This workstream owns Threads infrastructure and operating quality:
- brand/account authorization and identity verification;
- owner-only research and public-signal review;
- Social Studio draft/review/composer flow;
- canonical Social Publisher scheduling;
- idempotency, provider receipts, readback and metrics;
- attribution into Hermes Connect only after a real consented/qualified action;
- post-mortem learning into Marketing Growth / One Brain.

It does NOT own website package prices, commercial website quotes, website price comparisons, recurring SEO/Care pricing, sales-page pricing or the website quote-to-CRM object. Those remain in the separate Website Pricing source of truth.

## Existing admin surfaces — do not duplicate
1. Internal Threads Connections — brand OAuth/identity/status/publish switches.
2. Threads Research — read-only discovery and bounded conversations.
3. Hermes Connect Social Studio — live channel overview, unified composer, Smart Mirror, Drive/AI creative intake, Creative Review and explicit human publish confirmation.
4. Hermes Social Publisher / HAE — the only recurring scheduler/runtime.

## Canonical flow
RESEARCH -> SOURCE/RIGHTS REVIEW -> DRAFT -> CREATIVE REVIEW -> HUMAN APPROVAL -> CANONICAL PUBLISHER -> PROVIDER RECEIPT/READBACK -> METRICS -> QUALIFIED OUTCOME -> VERIFIED LESSON.

## Brand boundaries
- Hermes Logistics: existing Windsor transport + canonical Hermes Social Publisher only; no duplicate Meta publisher.
- ProgressoPro: primary Threads research/testing lane after exact owner OAuth and scope readback.
- Business Academy: secondary lane after exact identity authorization.
- office_test: canary lane for new provider-write behavior.

## Current engineering gaps
- merge current-main read-only Threads Research with release-manifest/CI correctness;
- prove exact ProgressoPro Meta OAuth/scopes before official API search/conversation claims;
- add provider quota/error/auth-health normalization to the existing connector only when tests prove a real missing behavior;
- connect research observations to the existing Social Studio as drafts, never as auto-replies;
- consolidate post health in existing admin: last publish receipt, readback state, metrics freshness, auth state, and unresolved provider errors;
- keep Facebook writes on their existing separate authorization boundary.

## Acceptance
No stage advances from CODED to LIVE without exact-head CI, production deployment/readback, exact account identity, provider receipt and the required human approval evidence. UNKNOWN != 0 and public signal != qualified lead.
