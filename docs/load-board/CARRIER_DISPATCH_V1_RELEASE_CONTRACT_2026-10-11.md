# Hermes Carrier/Dispatcher V1 — executable contract & release gates
Owner: Hermes Logistics / Load Board | 2026-10-11 | Issue #1836; source lifecycle #1074.

## Delivery order
1. Authenticated CARRIER read-only load discovery (real permissioned data or honest zero-state). Driver sees no source details.
2. Minimal dispatcher work queue in same existing Hermes Connect identity/tenant; assigned dispatcher phone shown only when verified.
3. Carrier saved loads + interest request to assigned dispatcher with persisted idempotency and audit. No self-book or external contact.
4. Expand into dealer/shipper portal only after carrier/dispatcher utility and legal/source rights gates.

## Architecture
One D1 operational source of truth, existing Hermes Connect sessions, business identity, company membership/RBAC, source provenance, Load Board APIs and existing dealer transport request models. No second CRM, public API, load counting, or duplicate company record.
PROHIBIT DealerCenter external technology positioning; logistics/dispatch-only and only by explicit CEO authorization.

## Roles & scope
- guest: public, indexable discovery and safe non-bookable demo, no restricted records.
- carrier_member: *their company* allowed records, own dispatcher, own requests/saves.
- assigned_dispatcher: requests and carriers assigned to them; sensitive source info only to authority/need-to-know.
- authorized operations admin: audited least-privilege support.
- dealer/shipper: submit/view only own requests, not the internal carrier board.
- broker: NO private inventory access, detail/search/export or leaked metadata, even if a broker can submit a screened incoming offer.
Deny by default on every list/detail/search/export API and cache, session, object ownership; immediate revocation for removed assignments; no source contact or PII in carrier payload.

## Candidate minimal API contracts (integrate existing endpoints, avoid parallel implementation)
GET carrier allowed loads: {id,origin:{city,state},destination:{city,state},unitCount,equipment,condition,pickupWindow,rate:{amount,currency,scope},distance:{miles,kind},availableUntil,status,sourceRightsVersion}; NO source identity/contact, no VIN or street addresses by default.
GET assigned dispatcher: {assignmentId,displayName,businessPhone,availabilityLabel}; phone null when unverified; no fallback to another dispatcher.
POST interest: {loadId,message,idempotencyKey}; caller/carrier/dispatcher IDs derived SERVER-SIDE; enforce carrier-role + active assignment + freshness + entitlement; response {requestId,status:'queued'} is not human read or booking. Duplicate idempotency keys return same request.
List own saved loads and interests; dispatcher GET scoped queue and PATCH valid status changes with audit actor/evidence.
State flow: DRAFT -> REQUESTED -> QUEUED -> SEEN_BY_DISPATCHER -> REVIEWING -> PROPOSED -> CARRIER_APPROVED -> SOURCE_CONFIRMED -> DISPATCH_CONFIRMED. Terminal: EXPIRED / WITHDRAWN / DECLINED / NOT_AVAILABLE. Never infer human view from HTTP 2xx. Confirmation needs independent source/legal/operational evidence.

## Car-hauling capability gates
- Equipment capacity: open/enclosed/hotshot/wedge, slot/weight/dimensions, operable/inoperable/winch.
- Location: last confirmed city/state/ZIP, available date, desired direction, next reload, estimated vs GPS-verified; no fabricated availability.
- Economics: rate, loaded miles, deadhead, toll/fuel estimates, RPM; Hermes 5% modeled and 8% target not implied as contracted carrier fee. Carrier-specific rate/fee must use signed terms.
- Document readiness: MC/USDOT, authority, COI expiry, W-9, NOA, LOA and relevant broker setup/portal state with secure RBAC.
- Execution proof later: pickup/release, BOL, inspection, POD, invoice/factoring/payment, exception recovery.
- SOURCE=LOAD vs CAPACITY and DEMO must be explicit. An old record or auction inventory is not active freight. TTL, dedupe, revocation and rights enforced.
- FMCSA dispatch-vs-broker legal classification review is a hard activation gate for direct shipper/dealer allocations; hiding contacts does not itself establish no broker activity.

## UI acceptance (390px mobile and desktop)
- Reusable card: city->city, vehicle count, equipment, rate permission, pickup, age/freshness, source-gated real/demo status, no contacts.
- Saved & requested tabs, clean empty/expired/revoked states; no fake activity or fake load count.
- Call assigned dispatcher via verified tel URI only, with number visible only to own authorized carrier.
- Request load includes spinner, disabled duplicate click, stable request ID and source-status re-check, clear 'not a booking' copy.
- Tests: guest and broker 403, wrong tenant 403, guessed load ID 404/403 without enumeration, stale 410/disabled, source revocation removal, dispatcher reassignment, hidden source fields absent in network payload, phone privacy, duplicate idempotency, API auth, timezone display, 390px visual, A11y and mobile Lighthouse.
- Release evidence: current main SHA, PR conflict review, CI pass, preview manual walkthrough, production verify with a real consented carrier (never synthetic counted as business proof), rollback. No claim of readiness based only on green HTTP status.

## Internal AI responsibilities
- Hermes Connect CRM: owner for role model, company identity, assignment, request event trail, onboarding; store this contract in shared documentation.
- Load Board AI skill: procedural load/right/verification checklist and regression fixtures in repo, not a separate plugin yet.
- Hermes SEO/GEO: indexed public dispatch/car hauling pages, non-indexed private customer/carrier details. No artificial freight inventory or deceptive SEO.
- Future optional external plugin only when repeatable read/write operations and auth contract warrant one.

## Outbound/communications
DO NOT send email, contact DealerCenter, carriers, shippers, or Dispatch 107. CEO-wide outbound email hold. Drafts only, subject to later single explicit approval. No unverified SLA or instant capacity promises.

## KPI and go/no-go
- First release: 0 broker leakage / 0 private source leaks / 0 duplicate interests / verified assigned dispatcher / permissioned current loads or honest zero.
- Measured metrics: real active LOAD count, eligible carrier count, requests queued, actually seen, qualified, completed, documented POD, source legal authorization, operating fee.
- GO for first carrier pilot only after above tests plus counsel/operational authorization and human owner acceptance. DealerCenter outreach remains separate NO-GO until partner readiness proven.
