# Codex 200-Task Stack Release Plan

Date: 2026-07-31  
Tracking: Issue #20 and draft PR #19

## Purpose

Release the completed small batches in dependency order without merging the stale PR #19 branch wholesale and without bypassing owner approval, CI, privacy, claims, or production gates.

## Source-of-truth order

1. Current `main`
2. Latest-head GitHub Actions
3. Current PR diff and mergeability
4. Approved public evidence and dated measurement
5. Owner-approved sanitized internal evidence
6. Historical handoff notes as revalidation leads only

## Stack order

### Research and governance foundation

1. PR #59 — lane opportunity score, tasks 121–126
2. PR #60 — carrier research registry, tasks 128–138
3. PR #61 — carrier language research, tasks 139–144
4. PR #62 — carrier content operations, tasks 145–150
5. PR #63 — vehicle-transport demand registry, tasks 151–160
6. PR #64 — demand publication and measurement gates, tasks 161–170
7. PR #65 — website service, proof, and U.S. market registry, tasks 171–180

### Indexable release batches

8. PR #66 — national website development, redesign, SEO, and Local SEO hubs, tasks 181–184
9. PR #67 — SEO for logistics companies and independent auto dealers, tasks 185–188

### Academy, Careers, and monitoring

10. PR #68 — Academy/Careers and release governance, tasks 191–200

## Required release procedure for each PR

1. Confirm the base PR below it has been owner-approved and merged.
2. Rebase or retarget without force-push only after the base merge is visible in `main`.
3. Confirm the diff contains only the intended isolated batch.
4. Run latest-head CI in repository order:
   - `npm run build`
   - `npm test`
   - `npm run test:e2e`
5. Repair failures without weakening privacy, claims, contact, schema, or release controls.
6. Obtain separate owner approval for merge.
7. Merge one PR only.
8. Confirm `main` CI.
9. Obtain separate owner approval for production deployment.
10. Verify live HTTP, canonical, metadata, schema, sitemap, internal links, contact fallback, privacy, and analytics boundaries.
11. Request Search Console inspection only after live verification.

## Current blocked items

### PR #68 static Academy contract

The current static validator still requires `COO / Multi-business leadership`, while the approved public Academy implementation contains only:

- U.S. Logistics Operations
- Marketing

The validator must be updated to require the two-program contract. Do not restore a third public track.

### Tasks 127, 189, and 190

- Task 127: blocked pending an owner-approved sanitized route export with no private identities, exact addresses, rates, shipment documents, credentials, or live positions.
- Tasks 189–190: Russian and Ukrainian marketing-service pages remain blocked pending measurable demand, natural human review, response capacity, unique content, canonical/hreflang QA, and owner-approved release evidence.

## Data boundary

No release may connect or copy `OFFICE 374 2026`, current private load-board observations, real Shipment History rows, names, phones, emails, companies, MC/DOT, exact addresses, VIN-linked private records, orders, invoices, BOL/POD, notes, rates, commissions, customer/broker/carrier identities, live truck positions, cookies, tokens, passwords, or credentials.

Current load-board offers remain private observations. They do not prove completed lanes, public capacity, future availability, accepted rates, recurring volume, or demand.

## Search Console sequence

After owner-approved merge, deployment, and live verification:

1. Submit the relevant sitemap.
2. Inspect each new canonical URL.
3. Record discovery and indexing state.
4. Record Day 7 metrics without inventing missing values.
5. Record Day 30 query/page, CTR, position, CTA, inquiry, and cannibalization findings.
6. Expand only clusters with verified service relevance, response capacity, useful search signals, and a clear conversion path.

## Completion definition

The queue is not considered released merely because code exists in draft PRs. Completion requires:

- latest-head green CI;
- owner-approved merge;
- green `main`;
- owner-approved production deployment;
- live verification;
- dated Search Console/analytics baseline;
- no unresolved privacy or claims defect.
