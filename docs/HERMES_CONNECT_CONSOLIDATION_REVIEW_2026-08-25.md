# Hermes Connect Consolidation Review — Candidate Recovery Package

**Reviewed:** 2026-08-25
**Canonical target:** `officeus-create/Hermes` current `main` at `ff20f033945dd8b026513c95a31a98c8ef1641e9`
**Status:** `REVIEW_REQUIRED_BEFORE_PORT_OR_ARCHIVE`
**Evidence class:** `MIXED_REPOSITORY_VERIFIED_AND_LOCAL_READ_ONLY_INVENTORY`

## Decision boundary

This is a preservation and comparison package, not authorization to merge old
projects or remove local folders. The required order is:

`PRESERVE → COMPARE → CHATGPT EXPLICIT TASK → RECOVER (only named slice) → VERIFY → CONSOLIDATE → CHATGPT EXPLICIT TASK → ARCHIVE OR DELETE`

No source in this review may be deleted, moved, overwritten, deployed, or
treated as production solely because it contains a useful idea. A recovery port, source alteration, archive or deletion requires a separate explicit task from ChatGPT naming the candidate and action. No credentials,
local settings, Wrangler state, database exports, or private records were read
or copied during this review.

## Sources inventoried

| Source | Observed state | Classification | Safe treatment now |
| --- | --- | --- | --- |
| `~/Hermes` | Current canonical checkout at `ff20f033…` | `CANONICAL_SOURCE_OF_TRUTH` | All new code starts here on a bounded branch. |
| `~/Projects/hermes-connect-next` | Git head `279c417f…` (2026-08-22); substantial staged local work | `RECOVERY_AND_ACTIVE_LOCAL_WORK` | Do not alter or copy blindly. Review staged Connect changes against their active writer before any port. |
| `~/Projects/hermes-connect-mobile` | Git head `a0bac983…` (2026-08-14); local Android/iOS Capacitor material and old bundled assets | `MOBILE_RECOVERY_CANDIDATE` | Separate native source from generated/stale web bundle first. |
| `~/Projects/hermes-connect-prototype` | Non-Git standalone prototype | `RECOVERY_ONLY` | Use only as feature/reference evidence; no whole-project merge. |
| `~/Projects/hermes-connect-prototype-recovery-package` | Checksummed snapshot with a redacted-secret inventory | `PRESERVATION_COPY` | Retain unchanged until a later owner decision. |
| `~/Documents/hermeslogisticus.com` | Git head `70a5028f…` (2026-08-11) with local changes | `LEGACY_CHECKOUT` | Not a source of production truth; inspect only unique Connect deltas. |
| `origin/feature/brand-exploration-v2` | `60d0f2b8…` (2026-08-13), no common ancestor with `main` | `ANTIGRAVITY_EXPERIMENT` | Port a bounded approved component only; never force-merge unrelated history. |
| Nested `.git/worktrees` and `dist/` directories | Worktree/build-output artifacts | `DERIVED_NOT_INDEPENDENT` | Never treat as a separate product or recover generated output as source. |

## Current canonical coverage already verified

The canonical runtime already contains stronger or current equivalents for the
prototype's central flow:

- account/session handling, including Telegram auth and password recovery;
- Repair Shop profile, services/capabilities and weekly availability;
- capacity-aware public booking, booking history/status and cancel/rebook;
- customer CRM derived from booking history, vehicle context and follow-ups;
- owner feedback and owner-scoped access controls;
- PWA/service-worker support and a canonical responsive workspace;
- UI localization support for `en`, `uk`, `ru`, `es`, `it`, and `fr` on the
  applicable Repair Shop owner surfaces;
- Android Capacitor source in the canonical repository.

Exact source-byte evidence: the prototype/recovery `src/auth.mjs` is already
present in canonical `src/legacy-prototype/auth.mjs`. It must not be copied a
second time.

## Candidate delta matrix

| ID | Source feature | Current-main equivalent / gap | Classification | Recommendation before any implementation |
| --- | --- | --- | --- | --- |
| HC-CONS-001 | Prototype auth/session helpers | Exact canonical copy already exists; canonical auth has evolved around it | `ALREADY_IN_MAIN` | No port. Retain prototype only as recovery evidence. |
| HC-CONS-002 | Prototype profile, services, availability and test booking flow | Canonical Repair Shops implements a more specific, production-oriented profile/capabilities/availability/booking model | `SUPERSEDED` | No port of the old generic flow. |
| HC-CONS-003 | Prototype public booking link and token cancellation flow | Canonical public Repair Shop booking plus booking state/history/cancel-rebook contracts | `ALREADY_IN_MAIN_OR_SUPERSEDED` | Verify UX parity only; do not introduce a parallel booking engine. |
| HC-CONS-004 | Prototype six-locale static UI layer | Canonical secondary i18n layer covers owner-route UI; live `?lang=ru` audit remains a separate bounded task | `PARTIALLY_IN_MAIN` | Use as a copy-reference only if a verified UI leak is found. Do not create a second localization runtime. |
| HC-CONS-005 | Prototype PWA manifest/service worker | Canonical Connect service worker/workspace is current and responsive | `ALREADY_IN_MAIN` | No port. Audit cache/offline behavior only if a user problem is evidenced. |
| HC-CONS-006 | Prototype team/staff per-service availability and historical booking preservation | Canonical Repair Shops has owner/capacity contracts; Beauty has a separate team model, but no approved Repair Shop staff product contract is established | `UNIQUE_AND_POTENTIALLY_USEFUL` | **Review candidate:** create a product/DB/privacy proposal only after pilot evidence shows multi-technician demand. No code port now. |
| HC-CONS-007 | Prototype private customer notes | Canonical customer CRM, feedback and follow-ups exist, but not a general free-form per-customer note contract | `UNIQUE_AND_POTENTIALLY_USEFUL` | **Review candidate:** define retention, access, audit and deletion rules before any implementation. Avoid duplicating follow-ups. |
| HC-CONS-008 | Prototype owner-defined custom services | Canonical Repair Shop capabilities are controlled; generic custom-service behavior is not proved as a current need | `UNIQUE_BUT_OWNER_GATED` | **Review candidate:** validate against 5–10 permissioned shops, service taxonomy and booking rules before a minimal slice. |
| HC-CONS-009 | Prototype contact method/handle and meeting-mode bookings | No approved Repair Shop meeting workflow; may introduce PII and a second booking type | `UNIQUE_BUT_OUT_OF_SCOPE` | Keep as reference only. Requires product/privacy/communications decision. |
| HC-CONS-010 | Prototype owner analytics (booking/service/repeat-client aggregates) | Some operational data is present, but no verified dashboard KPI requirement or privacy-approved metric contract | `UNIQUE_AND_POTENTIALLY_USEFUL` | **Review candidate:** define aggregate-only metrics, decision owner and pilot KPI before implementation. |
| HC-CONS-011 | Mobile checkout Android source | Canonical repository already has Android Capacitor source; old checkout also contains stale bundled public assets/retired Brand V1 material | `PARTIALLY_IN_MAIN` | Do not import bundled assets. Reconcile only native configuration/source differences after an Android release-gate review. |
| HC-CONS-012 | Mobile checkout iOS Capacitor scaffold and store metadata | Canonical source inventory does not currently show an iOS tree | `UNIQUE_PENDING_TECHNICAL_REVIEW` | **Review candidate:** inspect only native scaffold/configuration; web-first and current Android release gates still apply. No App Store claim or binary release. |
| HC-CONS-013 | Antigravity adaptive onboarding modal | Current site has bounded early-access/onboarding, but this is a separate React mock component and needs a current user problem | `UNIQUE_DESIGN_REFERENCE` | **Review candidate:** turn only a proven flow step into an Astro/Repair Shop slice after UX review; do not port React app/state wholesale. |
| HC-CONS-014 | Antigravity mobile bottom dock | Current canonical product already has mobile navigation contracts; Antigravity component is a separate mock UI | `LIKELY_SUPERSEDED` | Keep as visual reference. Port only if browser audit proves a specific mobile navigation gap. |
| HC-CONS-015 | Antigravity Auto Repair workspace | Current Repair Shop workspace is the product runtime; Antigravity view is mock data and does not use canonical APIs/contracts | `CONFLICTING` | Do not port. Compare individual UX ideas only during a bounded UX review. |
| HC-CONS-016 | Antigravity marketplace / Cal.com / Telegram adapters | Mocked/external integration representations; payment, messaging, external APIs and credential boundaries are not approved or verified | `RECOVERY_REFERENCE_ONLY` | No port. Any future integration needs a separate owner-approved provider/security/data-flow task. |
| HC-CONS-017 | `hermes-connect-next` staged product-family truth/localization/brand work | Local staged work is recent and has an active unknown writer; it includes useful public maturity/preview boundaries and Connect identity assets | `ACTIVE_LOCAL_WORK_NOT_TAKEOVER_SAFE` | Do not copy. Request/receive a writer handoff or wait for its PR; then compare its changed files to `main`. |

## Security owner gate

`HC-CONS-SEC-001` — A historical Antigravity/legacy prototype source contains a
plaintext Telegram credential. Its value is deliberately not recorded here.

- **Status:** `P0 OWNER_ACTION_REQUIRED`.
- **Required action:** rotate/revoke the affected Telegram credential in the
  provider and verify whether it has any current production consumer.
- **Repository action:** never copy the legacy secret-bearing file, do not use
  the value, and exclude configuration/generated runtime artifacts from future
  recovery comparisons.
- **Closure evidence:** private owner/provider confirmation only; no secret,
  account identifier, or raw alert belongs in GitHub evidence.

## Recommended decision queue

### Consider first after review

1. **HC-CONS-006 — Repair Shop team/staff model**: product discovery with real
   pilot shops first; may become a bounded data-model/API/UI PR.
2. **HC-CONS-007 — private customer notes**: only if existing follow-ups do
   not solve the confirmed owner need and a retention/access contract is
   approved.
3. **HC-CONS-008 — custom services**: validate taxonomy and booking impact
   before allowing arbitrary catalog entries.
4. **HC-CONS-012 — iOS scaffold**: technical inventory only, separate from
   release/distribution.
5. **HC-CONS-013 — adaptive onboarding**: UX review/prototype based on a
   specific measured drop-off, not a full React port.

### Do not port

- legacy generic auth, booking, localization, PWA and Android bundle paths;
- mock integrations, payments, messaging and API adapters;
- generated `dist`, Capacitor bundled web assets, historical V1/V2 pages,
  debug binaries or local agent/provider state.

## Archive/delete decision status

| Proposed class | Sources | Status |
| --- | --- | --- |
| `KEEP` | Canonical `~/Hermes`, recovery package until all decisions close | Active. |
| `MERGE_COMPLETE` | Historical public V1/V2/mobile routes already reconciled in the canonical 2026-08-15 manifest | Repository evidence exists; local folders are not automatically affected. |
| `ARCHIVE_CANDIDATE` | Stale generated outputs and retired bundled assets inside legacy checkouts | Not ready: dependency/recovery-value checks remain. |
| `DELETE_CANDIDATE` | None | No local directory is eligible until unique-delta, dependency, preservation and owner/ChatGPT approval gates are all satisfied. |

## Required evidence for any approved port

Every approved candidate must use a fresh current-main branch and supply:

1. a written owner/ChatGPT decision naming the candidate ID;
2. a minimal code slice, not a history merge or copied runtime;
3. migration/privacy/security design when data or permissions change;
4. focused unit/contract and browser tests;
5. current-head `npm run build`, `npm test`, and `npm run test:e2e` receipts;
6. an explicit rollback path and production/owner gate where applicable.

## Next action

Review the five `Consider first` candidates and the P0 credential rotation
gate. Until ChatGPT supplies an explicit task naming the candidate and action, continue only read-only comparison and the separate existing execution workstreams; do not perform a recovery port, source alteration, archive, deletion, merge or deployment.
