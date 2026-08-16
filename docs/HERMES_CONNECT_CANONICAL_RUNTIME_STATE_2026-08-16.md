# Hermes Connect — Canonical Runtime State

**Status date:** 2026-08-16  
**Purpose:** authoritative runtime boundary for the current Hermes Connect product family.  
**Rule:** historical documents remain evidence, but any conflicting runtime/release claim is superseded by this document and current production evidence.

## CURRENT PRODUCTION

- **Canonical repository:** `officeus-create/Hermes`
- **Canonical branch:** `main`
- **Verified production main:** `9ea76245caac15360e7c2dcf882bbe6e92758bf6`
- **Production Pages project:** `hermes`
- **Primary product path:** `https://hermeslogisticsus.com/services/hermes-connect/`
- **Current live vertical:** Repair Shops / СТО
- **Distribution:** browser-first Web/PWA surface. No public APK, Google Play, or App Store release is currently claimed.
- **Product family rule:** Repair Shops is the current live pilot. AI Command Center, Unified Inbox, Load Analyzer, Rate Negotiator, Proposal Builder, ROI Calculator, and Business Automation are reference capabilities unless separately production-verified later.

### Current Repair Shop flow

Production code and automated coverage currently support the canonical loop:

`Register/Login → Shop Profile → Services → Availability → Public Booking → Customer Booking + Vehicle → Booking Inbox/Status/History → Customers/CRM → Private Feedback`

Additional live/current supporting paths include:

- private salesperson/source attribution and referral capture;
- direct `?mode=register|login` auth entry for manager/referral links;
- Corporate Partner Offer delivered server-side to Hermes only after explicit consent;
- booking-success growth CTA with explicit consent and privacy-safe analytics.

## SHARED IDENTITY / DATA BOUNDARY

The current canonical runtime and the preserved legacy runtime use the D1 database historically named `hermes-connect-prototype`.

Current canonical code uses shared identity tables such as `specialists` and `sessions` and Repair Shop-specific tables including, among others:

- `repair_shops`
- `services`
- `repair_shop_availability`
- `repair_shop_bookings`
- `repair_shop_booking_vehicles`
- booking history/status data
- customer/CRM data derived from bookings
- `repair_shop_feedback`
- private Repair Shop sales attribution

**Do not create a second D1 or a second auth system for Repair Shops.**

## LEGACY RUNTIME: `app.hermeslogisticsus.com`

### Current classification

**`TEMPORARY_COMPATIBILITY`**

Do not disable or delete this runtime until the authenticated retirement gates below are complete.

### Evidence table

| Question | Current evidence | Status |
|---|---|---|
| Domain/runtime | `app.hermeslogisticsus.com` is assigned to the separate Cloudflare Pages project `hermes-connect-prototype`. | VERIFIED FROM PROJECT RECORDS |
| Source | Preserved local prototype source is `/Users/progressopro/Projects/hermes-connect-prototype`; the folder was recorded as not being an active git repository. A recovery package is retained separately. | VERIFIED FROM RECORDED SOURCE INVENTORY |
| Source commit | No trustworthy git SHA exists for the preserved local prototype because the recorded source directory is not git-tracked. | UNKNOWN / DO NOT INVENT |
| Available browser surfaces | Preserved source inventory contains root/product UI plus `manage`, `book`, and `meet` surfaces and PWA assets. | SOURCE-VERIFIED, USAGE NOT VERIFIED |
| Legacy APIs | Auth, profile, services, booking, clients, staff, public booking/specialist/meeting, analytics. | SOURCE-VERIFIED |
| D1 | Legacy project is recorded with binding `DB` to D1 `hermes-connect-prototype` (`ead19786-db06-4ed6-9078-0ddf97005abd`). | VERIFIED FROM PRIOR AUTHENTICATED INVENTORY |
| Legacy tables | `specialists`, `sessions`, `services`, `availability_slots`, `bookings`, `client_notes`, `staff_members` plus migrations for related functionality. | VERIFIED FROM PRIOR AUTHENTICATED INVENTORY |
| Current users | No current authenticated traffic/session analysis has been completed in this cycle. | **BLOCKED / UNKNOWN** |
| Current external links | Current canonical repo search surfaces `app.hermeslogisticsus.com` in documentation, not as a canonical user-facing product link. External websites/bookmarks/referrers are not yet proven absent. | PARTIAL |
| Unique capability vs canonical | Staff/team management, legacy client-note editing, old public meeting flow, and some legacy PWA/analytics pieces appear potentially unique. Telegram auth is **not** unique: canonical auth includes Telegram. | PARTIAL / DECISION REQUIRED |

### What has already migrated or been replaced in canonical Repair Shops

The following are no longer reasons to keep the legacy runtime as a second Repair Shop application:

- register/login/session/auth;
- Telegram auth;
- shop profile;
- services;
- availability;
- public booking;
- booking inbox and status lifecycle;
- vehicle data and booking history;
- customer/CRM view;
- private feedback.

The legacy `staff`, editable client notes, and old meeting flow must **not** be ported automatically. First determine whether real Repair Shop pilots need them.

## RETIREMENT GATES FOR `app.hermeslogisticsus.com`

Before changing classification from `TEMPORARY_COMPATIBILITY` to `RETIRE`, perform these read-only checks:

1. **Cloudflare runtime evidence**
   - current production deployment ID/build timestamp for `hermes-connect-prototype`;
   - custom-domain attachment for `app.hermeslogisticsus.com`;
   - recent request/traffic activity for the domain (prefer 7-day and 30-day windows where available);
   - D1 binding name/database identity;
   - environment variable/secret **names only**, never secret values.

2. **Privacy-safe D1 activity evidence**
   - aggregate counts and most-recent timestamps only for legacy-significant activity such as sessions, bookings, client notes, and staff records;
   - do not export names, emails, phones, tokens, notes, or other PII.

3. **Unique-function decision**
   - determine whether staff/team management, editable notes, or meeting flow are required by the first 5–10 real Repair Shop pilots;
   - if not required and no active legacy users/traffic are demonstrated, recommend `RETIRE`;
   - actual domain/runtime shutdown remains a separate controlled action.

## SECURITY GATE

A separate read-only security audit is still required for:

`/Users/progressopro/hermes_tunnel.py`

The file itself is not present in the connected repository/library evidence available to the current execution owner, so no security conclusion may be claimed yet.

Audit scope for Claude or another authenticated local reviewer:

- attack surface;
- authentication;
- command validation;
- shell injection / arbitrary command execution;
- listening interfaces and exposed ports;
- secrets;
- privilege level;
- persistence/autostart;
- realistic exploitation path;
- severity;
- minimal safe fix.

If a realistic unauthenticated or weakly authenticated remote command-execution path is confirmed as High/Critical, it becomes P0 before broad external pilot distribution.

## PRODUCT DEVELOPMENT STOP RULE

Do not add speculative Hermes Connect features now.

After the security gate is clear, move to **5–10 real Repair Shop pilots** and observe:

- registration completion;
- profile/services/hours completion;
- time to first shareable booking link;
- first booking conversion;
- booking processing/completion;
- operational errors and support questions;
- feedback;
- repeat booking;
- requested missing features.

Only real-user evidence should determine the next product feature.

## STATUS LABELS FOR DOCUMENTATION

Use these labels consistently across future Hermes Connect documentation:

- **CURRENT PRODUCTION** — verified current canonical runtime behavior.
- **BETA** — live Repair Shop pilot behavior that is intentionally early-stage.
- **REFERENCE / DEMO** — non-live product-family capability or historical visual prototype.
- **LEGACY** — preserved old runtime/source not used as canonical development target.
- **RECOVERY** — backup/snapshot only; never deploy directly without review.
- **PLANNED** — not currently shipped.
- **HISTORICAL / SUPERSEDED** — old document or claim retained for traceability but no longer authoritative.
