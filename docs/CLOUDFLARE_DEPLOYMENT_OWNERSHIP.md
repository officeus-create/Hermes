# Cloudflare deployment ownership

Status: current authenticated topology reconciled on 2026-09-17. Issue #226 is completed. This document records the surviving ownership contract and the remaining Pages runtime source-of-truth gap; it must not revive historical duplicate-deployment work without fresh evidence.

## Evidence precedence

For Cloudflare ownership questions, use this order:

1. authenticated current Cloudflare dashboard/API evidence;
2. current GitHub `main` plus exact-SHA deployment/workflow evidence;
3. this document and the current Cloudflare remediation tracker (#1349);
4. historical Cloudflare bot comments/issues only as provenance.

A historical bot deployment comment or Security Center recommendation is not current topology evidence by itself.

## Approved public deployment architecture

### Main Hermes Pages project

- Cloudflare Pages project: `hermes`.
- Repository: `officeus-create/Hermes`.
- Approved production branch: `main`.
- Build command: `npm run build`.
- Build output: `dist`.
- Automatic production deployment from reviewed `main` is enabled through the existing Cloudflare Git integration.
- The canonical production workflow verifies the exact approved main SHA and reads the public domains back; a generic catch-all Cloudflare API token is not required merely to release Pages.
- Public domains owned by this project:
  - `hermeslogisticsus.com`;
  - `connect.hermeslogisticsus.com`.
- Pull requests may receive isolated Pages preview URLs.
- `connect.hermeslogisticsus.com` is served by the governed repository implementation; the main hostname continues to serve the main Hermes site.

Do not create a second Pages project, generic Worker, or second deployer for the same public website merely because an optional Wrangler upload credential is absent.

### Booking prototype Pages project

- Cloudflare Pages project: `hermes-connect-prototype`.
- Public domain: `app.hermeslogisticsus.com`.
- Purpose: preserve the previous profile/availability prototype independently from the current main Hermes Connect surface.
- Keep it until an explicit product retirement decision has live-user evidence; do not delete it as generic Cloudflare cleanup.

### Private email-delivery Worker

- Worker name: `hermes-lead-email`.
- Repository source: `workers/lead-email/src/index.mjs`.
- Production deployment config: `workers/lead-email/wrangler.production.jsonc`.
- `workers.dev` is OFF in current authenticated production.
- Worker Preview URLs are OFF.
- Custom domains/routes = 0.
- The Worker is intended to be called privately through the Pages Service Binding `LEAD_EMAIL_SERVICE`.
- Production Pages currently binds `LEAD_EMAIL_SERVICE -> hermes-lead-email`.
- Production lead-delivery architecture is active and separately guarded by token/idempotency contracts; Preview remains delivery-off.
- Repository CI from #1348 guards private-only Worker exposure and reviewed runtime baseline.

Do not make this Worker public to solve delivery/debugging problems. Do not create a second email Worker for account password reset.

## Current production versus Preview binding boundary

### Production `hermes`

Authenticated current settings show:

- `LEAD_DELIVERY_MODE=live`;
- production `LEAD_LIMITS` KV;
- canonical D1 binding `DB`;
- encrypted production secret names, including `LEAD_SERVICE_TOKEN`;
- private `LEAD_EMAIL_SERVICE -> hermes-lead-email`.

### Generic Preview

Authenticated current settings show:

- `LEAD_DELIVERY_MODE=off`;
- dedicated Preview KV namespace;
- **no Production D1 `DB` binding**;
- **no `LEAD_EMAIL_SERVICE` binding**;
- non-production branches remain Preview deployments.

This is the intentional safety boundary. Historical state in which generic Preview could reach Production D1 has been removed and #687 is closed as `NOT_PLANNED / SUPERSEDED BY SAFER PREVIEW ISOLATION`.

Permanent rule:

`GENERIC PREVIEW = DELIVERY OFF + PREVIEW KV + NO PRODUCTION D1 + NO PRODUCTION EMAIL SERVICE`

Do not restore Production D1 to arbitrary PR Preview merely to eliminate `database_not_configured` or satisfy a QA checklist. D1-backed release acceptance belongs to bounded exact-main production synthetic/operator proof with cleanup and evidence (#961/#960). If a true staging database is required later, open a new current-state architecture task with an explicit trust/data/auth/secrets boundary.

## Historical duplicate generic Worker — CLOSED

Issue #226 is completed from authenticated current-state evidence.

Current Workers & Pages inventory distinguishes the intentional resources:

1. Pages project `hermes` — authoritative current website/Connect deployment owner;
2. Worker `hermes-lead-email` — intentional private mail-delivery service;
3. Pages project `hermes-connect-prototype` — preserved `app.` prototype.

The previously observed separate generic Workers deployment named `hermes` is no longer present in current authenticated inventory. Do not reopen the duplicate-Worker incident from old pull-request bot comments unless a fresh current PR/runtime reproduces a separate Workers deployment again.

## Repository enforcement

Repository Cloudflare contracts enforce the code-controlled part of the boundary:

- `scripts/cloudflare-deployment-contract.test.mjs` validates deployment ownership assumptions;
- `scripts/cloudflare-production-hardening-contract.test.mjs` requires the private email Worker to keep `workers_dev:false`, `preview_urls:false`, no public routes and observability enabled;
- reviewed example/runtime baselines remain explicit;
- generic repository-controlled `wrangler deploy` for a second full-site Worker is not an approved website deployment path;
- current Pages release verification is exact-SHA and must not be considered complete from a bot `deploy successful` comment alone.

Release state remains:

`CODED != CI_VERIFIED != MERGED != CLOUDFLARE_DEPLOYED != CUSTOM_DOMAIN_READBACK != RUNTIME_HEALTHY != REAL_USER_VALUE`.

## Pages Wrangler source-of-truth gap — CURRENT P1

This is the surviving deployment-ownership ambiguity.

Authenticated Production settings currently show:

- Production compatibility date: `2026-07-12`;
- Preview compatibility date: `2026-08-04`;
- private email Worker compatibility date: `2026-08-04`;
- Pages binding controls report that bindings are being managed through Wrangler configuration.

Current repository truth now includes `config/cloudflare-pages-runtime-baseline.json`, added through #1353. It records the authenticated Production/Preview runtime **shape** (variable names, secret-name presence, binding roles and compatibility-date intent) without storing secret values. `scripts/cloudflare-pages-runtime-baseline.test.mjs` enforces Preview isolation and production binding ownership in the main `npm test` chain.

This baseline is evidence and an anti-regression contract, not an active Pages deploy configuration. The root still intentionally has no committed active `wrangler.jsonc` / `wrangler.toml`, so this must **not** be treated as a one-click compatibility-date change.

Before changing Production runtime configuration:

1. re-read authenticated Production and Preview settings immediately before mutation and compare them to `config/cloudflare-pages-runtime-baseline.json`;
2. require exact variable/binding/secret-name parity with the versioned baseline;
3. preserve the existing single Pages release owner and rollback path rather than introducing a second editable control plane;
4. only then align Production compatibility date to the reviewed `2026-08-04` baseline;
5. perform exact-main deployment/readback plus product/API smoke after the change;
6. update the runtime baseline only if authenticated post-change truth intentionally differs.

Do not deploy a partial downloaded config just to change the date. Do not commit secret values. Do not keep two independently editable configuration authorities.

## Credential ownership boundary

Cloudflare credentials are capability-specific. They must not be reused as a generic master key.

Current audit classification:

- `Cloudflare Agent Token - 2026-09-16`: broad, All zones, no expiry, recently used during the audit. Keep only while required; after MFA and audit completion replace/reduce scope and add expiry.
- `hermes build token`: broad, All zones, no expiry, last used 2026-08-10. It is not recorded as a canonical consumer in the Access Registry and is not required for the current Pages Git-integration release path. Treat as **REVOKE CANDIDATE AFTER MFA + final dependency readback**, not as a default credential for new workflows.
- narrow single-zone DNS token: least-privilege pattern to preserve.

Credential separation:

- Pages production release works through the existing exact-SHA Cloudflare Git integration; do not create a broad catch-all token just for Pages.
- #961 bounded D1/operator proof needs dedicated Pages-read + D1 proof access only.
- #611 may later need a narrow Worker deploy credential for automation hardening, but the current password-reset product blocker is outbound email capability, not Worker deployment.
- never copy local Wrangler OAuth credentials, Global API Key, broad Agent token or legacy build token into GitHub merely to unblock a workflow.

MFA on the sole Super Admin is a prerequisite before broad token/OAuth rotation or revocation.

## Email product boundary

Cloudflare Email Routing and Email Sending are different products.

- Google Workspace remains the apex inbound MX owner.
- Cloudflare Email Routing is used for intentional routing/forwarding paths and must not be interpreted as arbitrary transactional outbound capability.
- Current `send_email` binding architecture supports the existing approved verified-destination use case.
- #611 password-reset delivery to arbitrary eligible Repair Shop account recipients is a separate outbound transport/plan capability gate.

Do not change Google Workspace apex MX while solving password reset. Do not create a second auth/mail stack to hide a provider-plan limitation.

## HTTP/TLS ownership notes

- HTTP→HTTPS is already effective on apex, `www`, `connect` and `app`; dashboard `Always Use HTTPS=OFF` alone is not evidence of an HTTP defect.
- Application HSTS is present on apex and `connect`; keep zone-level HSTS/includeSubDomains/preload OFF until every owned hostname is intentionally covered.
- TLS 1.3 and Universal SSL remain enabled.
- Surviving zone hardening is tracked in #1349: raise Minimum TLS from 1.0 to 1.2 and enable Certificate Transparency Monitoring with readback/smoke.

## Current canonical trackers

- #1349 — single Cloudflare remediation tracker.
- #961 — final bounded `repair_shop_access` D1/operator proof only.
- #611 — password-reset outbound transport capability/proof.
- #687 — CLOSED/NOT_PLANNED; generic Preview must remain isolated from Production D1/email-service.
- #226 — CLOSED/COMPLETED; historical duplicate generic Worker investigation.

Do not use historical issue text to recreate work that current authenticated evidence has closed.

## Hermes Digital Interface Layer inheritance

Cloudflare is a delivery and production surface, not an independent brand source of truth.

All Hermes public surfaces delivered through Cloudflare Pages, Workers or related production routing must inherit the canonical visual implementation and tokens from the governed repository. The digital communication standard is defined in `docs/design/HERMES_DIGITAL_INTERFACE_LAYER.md`, under `docs/design/HERMES_UNIFIED_BRAND_SYSTEM.md`.

Rules:

- do not create Cloudflare-only visual tokens, CSS themes or brand rules that diverge from the repository;
- website, Hermes Connect and Command Center remain Product-Native Mode;
- channel-specific terminal treatments must not be imposed on production product UI merely because assets are served through Cloudflare;
- deployment verification must confirm the intended repository version is visible on the public Cloudflare-served surface;
- any intentional visual-system exception requires a reviewed repository change first, not a dashboard-only override.

Authority chain:

`Hermes Unified Brand System -> Hermes Digital Interface Layer -> governed repository implementation -> Cloudflare delivery`.
