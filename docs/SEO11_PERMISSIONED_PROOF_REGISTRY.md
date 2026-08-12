# SEO 11 Permissioned Proof Registry

Date: 2026-08-12  
Owner: SEO 11 / Issue #362  
Scope: public-safe proof status only. Private source evidence and consent records remain in owner-controlled systems.

## Purpose

Create a controlled bridge from real operational evidence to publishable commercial proof without leaking private records or inventing outcomes.

A record appearing here means only that a candidate evidence package exists for private review. It does **not** mean the person/company has agreed to a testimonial, that a public claim is approved, or that the evidence supports any particular performance result.

## Source-of-truth boundary

Hermes already maintains a private testimonial/consent workflow covering eligibility, targeted human outreach, evidence review, exact public-draft approval, identity/media/channel permission, publication logs, periodic review, correction and withdrawal.

This registry does not duplicate that private workflow. It stores only safe execution status.

Do not place here:

- names or contact details;
- company identities before explicit approval;
- MC/USDOT or other operational identifiers;
- VINs, exact routes, addresses, rates or private financial values;
- contracts, invoices, manifests, screenshots, private messages or consent evidence;
- account IDs, credentials or private source URLs.

## Current proof candidates

### PROOF-LOG-CARRIER-001

- Direction: Logistics
- Proof type: Carrier / owner-operator workflow
- Candidate state: `eligibility_reviewed`
- Private evidence status: `DIRECT_HISTORICAL_RELATIONSHIP_VERIFIED`
- Source class: `OWNER_CONTROLLED_PRIVATE_RECORD`
- Identity verified for publication: `PENDING_PRIVATE_REVIEW`
- Permission status: `NOT_REQUESTED`
- Sanitization status: `PRIVATE_REVIEW`
- Quantitative claims approved: `NO`
- Public copy approved: `NO`
- Publication target: `PENDING`
- Evidence boundary: one exact private carrier-side operating record set is supported by owner-controlled billing evidence that verifies a direct historical Hermes-to-carrier service relationship. The public registry intentionally does not name the carrier, counterparties, people, routes, rates, dates, invoice/load identifiers, payment details or outcomes.
- Next action: confirm that manual outreach to the historical carrier relationship is still appropriate and identify a current authorized contact privately; if yes, request feedback/permission under the existing trust workflow. Do not infer publication permission from the historic commercial relationship.

### PROOF-LOG-DEALER-001

- Direction: Logistics
- Proof type: Dealer/customer vehicle-movement workflow
- Candidate state: `eligibility_reviewed`
- Private evidence status: `DIRECT_HISTORICAL_CUSTOMER_RELATIONSHIP_VERIFIED`
- Source class: `OWNER_CONTROLLED_PRIVATE_RECORD`
- Identity verified for publication: `PENDING_PRIVATE_REVIEW`
- Permission status: `NOT_REQUESTED`
- Sanitization status: `PRIVATE_REVIEW`
- Quantitative claims approved: `NO`
- Public copy approved: `NO`
- Publication target: `PENDING`
- Evidence boundary: owner-controlled billing evidence now independently verifies a direct historical Hermes-to-customer commercial relationship for a customer-side vehicle-movement candidate. The billing record contains multiple vehicle-movement service rows and a service amount due to Hermes. The public registry intentionally does not name the customer or expose routes, vehicles, dates, prices, percentages, contacts, invoice identifiers, payment information or outcomes. This verification establishes a historical customer relationship; it does not by itself establish that the organization should be publicly described as a dealer.
- Next action: confirm that manual outreach to the historical customer is appropriate and identify a current authorized contact privately; if yes, request feedback and exact publication permission under the existing trust workflow. If outreach is not appropriate, retain the evidence privately and select another permissionable customer candidate.

## Named trust-role decisions

### Logistics SEO reviewer

- Decision state: `NO_NAMED_REVIEWER_CURRENT_CYCLE`
- Publication decision: current Logistics SEO content remains institutionally/repository reviewed; no named reviewer biography, credential, photograph, endorsement, or `reviewedBy` person is published for this cycle.
- Reason: no sufficiently verified real reviewer identity + current review responsibility + publication permission was established in the reviewed owner-controlled sources. Absence of evidence is not replaced with a synthetic expert.
- Reopen condition: a real reviewer may be added later only after identity, actual review responsibility, biography/credential wording and publication permission are verified.

### Academy instructor / mentor

- Decision state: `NO_NAMED_INSTRUCTOR_CURRENT_CYCLE`
- Publication decision: current Academy pages do not create a named instructor/mentor profile merely to strengthen trust signals.
- Reason: no sufficiently verified real instructor/mentor identity + current approved program responsibility + publication permission was established for public use in this cycle.
- Reopen condition: a real instructor/mentor may be added later only after the current program role, identity, biography/credential wording and publication permission are verified.

These are conservative publication defaults, not claims that no real reviewer, instructor, mentor, employee, contractor, or contributor exists. They prevent an unresolved trust slot from blocking unrelated SEO work or being filled with invented authority.

## Promotion gates

A candidate may move from `PRIVATE_REVIEW` only when all applicable gates are satisfied:

1. underlying relationship/workflow is verified;
2. exact public fact is evidenced;
3. identity is verified when identity is part of the public claim;
4. publication permission is explicit for exact wording and identity/media/channel use;
5. sensitive operational details are removed;
6. quantitative claims have a documented baseline, timeframe and methodology or are removed;
7. wording does not expand beyond evidence;
8. destination page is selected because the proof helps the buyer decision;
9. website/privacy/SEO tests remain green.

## Safe state machine

`candidate_identified → eligibility_reviewed → request_approved → request_sent → response_received → evidence_review → public_draft_prepared → consent_requested → consent_approved_or_declined → publication_review → published → periodic_review → updated_or_withdrawn`

At any point a record may become:

- `private_feedback_only`
- `blocked`
- `declined`
- `withdrawn`

## Rule for SEO 11

Do not delay technical/search work waiting for testimonials, but do not strengthen E-E-A-T/trust sections with invented evidence. Until proof clears every gate, money pages should rely on verifiable process descriptions, real public product behavior, compliant structured data, and clearly labeled demonstrations/case material.
