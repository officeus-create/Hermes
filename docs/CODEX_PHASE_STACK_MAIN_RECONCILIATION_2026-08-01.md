# Codex phase-stack reconciliation against current main

Date: 2026-08-01
Tracker: Issue #20
Branch: `codex/phase-stack-main-reconciliation-2026-08-01`

## Current source of truth

- Base branch: current `main` after merged PR #72.
- PR #72 merge commit: `cbdf498dd1e44825f53ac1e36af081e9606e6991`.
- PR #72 head `f1c326ebbcd2209aa5f6b1de27a197698fe2953f` passed `Website checks` run #359.
- PR #7 is merged historically; the `#journey` contract must not be ported again independently.
- PR #9 remains stale and must not be merged wholesale.
- PR #19 was closed without merge at `696e7ab0f90e2e05136e2d66d4b4595db8b080d5`; it is historical provenance, not an active implementation branch.

## Phase stack already verified in CI

The following isolated phase heads previously passed the complete repository workflow:

- Phase 1 / PR #25: `7918e042ab1d5da8532fa18f5aaed2b668bd93dc`, run #230.
- Official-provider research / PR #39: `778886cb2eaff09cbfffa10c1b31081e8365df94`, run #233.
- Disabled-by-default provider registry / PR #40: `b9e25ca0eb77bae7c8289305ff4eafda978531e3`, run #235.
- Gated sanitized CSV adapter / PR #41: `4f5c1744c5d410c92cfe71420d6dfaac349f92c8`, run #236.

These historical green results do not prove compatibility with the latest `main`. Any port must be performed file by file on a fresh branch and rerun the complete workflow.

## Reconciliation rules

1. Never reopen PR #19 as the implementation lane.
2. Never replace shared files such as `package.json`, sitemap files, CI configuration, common layouts, or validators wholesale.
3. Preserve the stricter all-sitemap ownership and crawl-path checks merged through PR #72.
4. Port only modules absent from current `main` and only when their imports, tests, and privacy boundaries remain valid.
5. Keep Shipment History preview-only and synthetic/sanitized.
6. Keep `observed`, `booked`, `completed`, `verified`, and `published` separate; no automatic publication.
7. Keep provider adapters disabled by default and perform no external requests.
8. Keep the private dispatcher/carrier interface read-only, synthetic, noindex, and without public export.
9. Do not use or connect `OFFICE 374 2026`, real shipment rows, PII, company identities, MC/DOT, exact addresses, orders, invoices, BOL/POD, notes, rates, commissions, live positions, or credentials.

## Next isolated implementation batch

Perform an exact current-main inventory for these module families:

- Shipment History preview, lifecycle, dedupe, provenance, freshness, quarantine, and privacy tests;
- private synthetic dispatcher/carrier workspace and default-deny authorization boundary;
- official-only integration research, disabled registry, and gated sanitized CSV adapter.

Classify each file as:

- already present in current `main`;
- safe isolated port;
- superseded by newer code;
- shared-file conflict requiring deliberate edit;
- blocked by owner approval or real-data requirements.

Only after this inventory should a code-port PR be created. The code-port branch must run, in order:

```bash
npm run build
npm test
npm run test:e2e
```

## Owner-only gates

No merge to `main`, production deployment, DNS or Cloudflare account change, billing, provider contact, credentials, real-data connection, public export, destructive change, or force-push is authorized by this document.
