# Hermes Academy SEO Phase 0 Baseline

## Status

This document records the Phase 0 and early Phase 1 findings reported from the live-site audit conducted after PR #3 was merged.

## Production health

- PR #3 was reported merged.
- GA4 was reported active on production.
- The homepage console was checked with no reported errors.
- `/ru/` was checked with no reported console errors.
- All 46 sitemap URLs were reported returning HTTP 200.
- No `/cdn-cgi/l/email-protection` leakage was reported.
- No suspiciously short pages were reported.
- The Path Engine was tested through Logistics → Car Hauling and completed successfully.
- Load Board behavior was checked and reported to use clearly labeled demo / dry-run / fictional data.

## Localization

The current `uk` and `ru` architecture was reviewed and reported as structurally healthy. No immediate localization bug was identified.

## Search Console

Search Console was reported as not yet added under the currently checked Google account.

This remains a business-account setup item. Verification options to evaluate later:

1. GA4-linked verification
2. DNS verification
3. HTML file or tag verification

No production or DNS change should be made without explicit owner approval.

## Current Academy information architecture gap

The current site does not yet have the complete Academy program structure required by the roadmap.

Recommended route family:

- `/academy/`
- `/academy/logistics-training/`
- `/academy/marketing-smm-training/`
- `/academy/coo-operations-training/`
- `/academy/sales-negotiation-training/`
- `/academy/careers/`

Role pages should be created only when the role is actively supported by real hiring demand, curriculum, mentor capacity, and a credible practice path.

## Before Phase 2 implementation

The following business facts must be confirmed before publishing program pages:

- which roles are actively recruiting now;
- current training format;
- current duration;
- language expectations;
- schedule expectations;
- whether the offer is free, paid, promotional, or mixed;
- mentor and practice availability;
- realistic next steps after demonstrated results.

Until confirmed, implementation should use claim-safe placeholders in documentation only, not public production claims.

## Recommended next safe work

1. Audit existing Academy, Careers, Logistics, Marketing, and localized routes against the route map.
2. Produce a final existing-vs-missing route matrix.
3. Identify duplicate or cannibalizing intent.
4. Finalize internal linking requirements.
5. Prepare implementation-ready page specifications using only verified business facts.

## Source note

This file preserves the findings reported by the live browser audit. It does not independently re-run those browser checks and should be revalidated before production decisions.
