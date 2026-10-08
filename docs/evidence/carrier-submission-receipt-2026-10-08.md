# Carrier submission receipt correction

Date: 2026-10-08. Scope: draft carrier analytics correction; no merge or deployment.
Baseline: `f43483c680ebc63278a2b4dfd50573642c0ebb79` in public repository `officeus-create/Hermes`.

## Public source contract

`CarrierDispatchIntakeEnhancer.astro` previously emitted `carrier_delivery_confirmed` after any HTTP 2xx. `functions/api/logistics-lead.ts` returns `success: true` and `request_id` after asynchronous handoff; it exposes no final-delivery or human-receipt contract.

Reuse unchanged `requireSubmittedReceipt` from `logistics-submission-receipt.ts`. Emit `carrier_submitted` only for successful matching acceptance. Delivery/human receipt remain `unconfirmed` (UNKNOWN, not false/zero). Unsupported delivery flags cannot upgrade acceptance. Controlled audience/page/service attribution and consent stay unchanged; request IDs and submitted fields stay out of analytics. Registry and existing GEO evidence request reflect acceptance-only meaning, while retaining the legacy acquisition request ID.

Historical audit snapshots are preserved and must not be counted as current delivered leads. Actual GA4 transport, external key-event configuration and downstream receipt need separate verification.

## Validation

Actual-enhancer mock fixtures: 16 PASS. Covers bare/empty HTTP 2xx, mismatched ID, accepted/duplicate receipts, unsupported delivery claims, consent, attribution/privacy, preview, qualification and stable retry identity. Existing shared receipt contract: PASS. Injected mock fetch only; no production submission or event.

Required build/static/browser and exact-head CI status are recorded in the draft PR. A genuine delivery fixture is unavailable because the receiver does not support that evidence. No receiver/helper/VehicleTransport/TR-058, route, SEO, sitemap, collector, credential or permission changes.

## Learning receipt

PROBLEM: delivery KPI inferred from HTTP status.
ROOT_CAUSE: transport success was treated as human delivery without request correlation.
FAILED_APPROACH: any 2xx -> delivery confirmed.
WORKING_APPROACH: matching accepted receipt -> submission event; downstream states UNKNOWN.
EVIDENCE: public source contract and actual-module mocks.
LESSON: acceptance, final delivery and human receipt are separate facts.
REUSE_RULE: emit only the strongest correlated stage the receiver supports.

Shared AI_HANDOFF/ERROR_REGISTER journals overlap open #1789 and are not edited concurrently; reconcile this entry after that writer. Next: independent exact-head QA, then separately authorized release and analytics reconciliation. Measurement/trust/reuse improve; search owners and privacy remain preserved.

## Independent QA consumer reconciliation

Independent review accepted the runtime change but found an active audit consumer still requiring `carrier_delivery_confirmed`. On 2026-10-08, fresh open-PR file lists showed no overlap with the three affected Search files. Last JSON/test commits were August; backlog's latest owner change was 6 October historicalization. The bounded delegated correction preserves Search ownership and all 14 canonical routes/CTA destinations.

Machine-readable carrier event family now ends in `carrier_submitted`; final delivery/human receipt are UNKNOWN. Original August carrier family is retained in an explicitly dated field. Other dated event families remain historical. The existing test now cross-checks active carrier JSON against the enhancer and registry, requires UNKNOWN downstream states, preserves historical evidence and prevents the backlog from reinstating the August document as current authority. No existing route/readiness/privacy assertions were removed.

Bounded restack parent is `cb41eb25a4b04c4766261c075469a39053a20e0d`, after Governance #1792 and Wisconsin #1791; upstream changes are preserved, not part of the Logistics diff. Fresh build, targeted regression and full required exact-head CI remain release gates. Earlier green CI does not validate this updated tree.
