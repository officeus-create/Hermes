# DAT certification operator runbook — 2026-09-14

## Owner decision

Do **not** submit the DAT partnership request yet. Submit only after the Hermes Load Board readiness checklist below is green. This runbook does not authorize DAT API calls, scraping, posting, BookNow, Tracking, or public redistribution.

## A. Hermes work that can be completed before DAT approval

- [x] Canonical `/load-board/` production product exists.
- [x] Company/auth unlock and protected carrier workspace exist.
- [x] LOAD and CAPACITY are separate inventory types.
- [x] D1 ingestion normalizes source records with expiry, dedupe, source provenance and visibility controls.
- [x] Hegelmann permissioned CAPACITY feed is operating.
- [x] Provider registry marks DAT `contract_required` and certification-gated.
- [x] DAT runtime is fail-closed and performs zero provider requests before approval.
- [x] DAT search intent is user-scoped, not bulk analytics.
- [x] Hermes enforces a local policy ceiling matching the published DAT freight-matching search budget: 60 searches/user/hour and 1000 searches/user/month.
- [x] Pagination is represented as an opaque cursor contract; no undocumented DAT page schema or endpoint is guessed.
- [x] Raw DAT responses must first be mapped to a Hermes intermediate opportunity shape before D1 ingestion.
- [x] DAT records default to `carrier_only`; `public` requires a separate explicit approval flag.
- [x] Freshness is fail-closed: the mapper must receive an explicit DAT expiry or an approved TTL configuration. Hermes does not invent a DAT TTL.
- [x] Rights/certification/credential loss can disable DAT source ingestion and expire active DAT inventory in D1.
- [x] Local fixture tests exercise search, budget, mapping, visibility and revocation without network calls.

## B. Product readiness gate before partnership form submission

The form should be submitted only when all of the following are true in production:

1. `/load-board/` is deployed from current `main` with exact-SHA release evidence.
2. Company registration/login/unlock E2E is green.
3. At least one real permissioned source is being ingested through the production pipeline.
4. Real source rows demonstrate freshness, dedupe, covered/expired removal and protected `Request details` behavior.
5. The board clearly distinguishes LIVE from preview/historical evidence.
6. Contact data stays private unless the source agreement explicitly allows display.
7. Provider disable/revocation can remove active provider inventory without deleting audit evidence.
8. Source counts and UI readback agree with D1.
9. No provider writes, booking or automated outbound are enabled by the DAT preparation work.
10. A current architecture screenshot/package is ready for DAT certification review.

## C. What to request from DAT

Initial certification request should stay narrow:

- Developer Portal/API access for the Hermes Logistics TMS / Load Board integration.
- Freight matching **search loads** capability first.
- Search trucks only if required for the approved workflow.
- Organization service account setup plus named user authentication requirements.
- Exact non-production base URL, auth contract, API version and load-search request/response schema.
- Exact pagination/cursor rules.
- Exact freshness/expiry semantics or approved client-side TTL requirements.
- Exact data-use rights: authenticated display, caching/storage, retention, deletion, audit storage, aggregation and whether any public display is permitted.
- Certification test cases and required DAT branding/location rules.
- Confirmed rate-limit behavior for the approved account/product tier.

Do not request BookNow, Tracking, RateView or load/truck posting in the first certification unless there is a current business need and the owner explicitly expands scope.

## D. After DAT grants Developer Portal access

1. Read only the current portal documentation attached to the approved Hermes account.
2. Record API version and certification scope in the repository. Do not copy secrets into GitHub.
3. Map the exact DAT raw response into `normalizeDatMappedOpportunity(...)`; do not make that helper understand guessed DAT field names.
4. Implement auth using DAT's approved organization service account + named user flow.
5. Implement opaque pagination according to the portal contract.
6. Implement a persistent per-user request budget at or below DAT's published limits.
7. Run sandbox/non-production certification fixtures and DAT's required test cases.
8. Keep visibility `carrier_only` unless DAT explicitly grants broader display rights.
9. Complete DAT certification before production requests.
10. Release behind exact-head CI, exact-main production deployment and D1/UI readback.

## E. Production activation checklist

Before setting `HERMES_DAT_CERTIFIED=true`:

- DAT partnership/API access approved.
- Exact data rights approved internally and documented.
- DAT certification confirmation received.
- Current API version recorded.
- Service-account credential stored only in Cloudflare secret/config scope.
- Named DAT user has required Connexion + Load Board services/seats.
- Search-rate budget persistence tested.
- Revocation drill tested: DAT source disabled and active DAT rows expire immediately.
- No DAT contacts or restricted fields exposed by public APIs.
- Zero guessed endpoint paths remain.
- Exact production search returns permitted records and D1/UI counts agree.

## F. Stop conditions

Immediately stop DAT requests and expire active DAT inventory if any of these occur:

- partnership/API access revoked;
- data-rights scope becomes unclear or is revoked;
- certification is no longer valid for the current integration version;
- service account/user authentication is disabled or compromised;
- DAT requires recertification after a material integration change;
- the current API version falls outside DAT's supported/current-version window;
- rate limits or product terms would be exceeded.

Audit evidence may be retained only within the rights/retention scope DAT approves. Active marketplace inventory must not remain visible after provider access or rights are revoked.
