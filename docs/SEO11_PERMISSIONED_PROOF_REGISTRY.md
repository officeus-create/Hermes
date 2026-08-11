# SEO 11 Permissioned Proof Registry

Date: 2026-08-11  
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
- Candidate state: `candidate_identified`
- Private evidence status: `PRIVATE_CANDIDATE_SELECTED`
- Source class: `OWNER_CONTROLLED_PRIVATE_RECORD`
- Identity verified for publication: `PENDING_PRIVATE_REVIEW`
- Permission status: `NOT_REQUESTED`
- Sanitization status: `PRIVATE_REVIEW`
- Quantitative claims approved: `NO`
- Public copy approved: `NO`
- Publication target: `PENDING`
- Evidence boundary: one exact private carrier-side operating record set has now been selected for eligibility review. The public registry intentionally does not name the carrier, counterparties, people, routes, rates, dates, load identifiers or outcomes.
- Next action: verify the current/appropriate relationship privately → select only evidenced process facts → decide whether manual outreach is appropriate under the existing trust workflow.

### PROOF-LOG-DEALER-001

- Direction: Logistics
- Proof type: Dealer/customer vehicle-movement workflow
- Candidate state: `candidate_identified`
- Private evidence status: `WORKFLOW_ARTIFACT_SELECTED_RELATIONSHIP_PENDING`
- Source class: `OWNER_CONTROLLED_PRIVATE_RECORD`
- Identity verified for publication: `PENDING_PRIVATE_REVIEW`
- Permission status: `NOT_REQUESTED`
- Sanitization status: `PRIVATE_REVIEW`
- Quantitative claims approved: `NO`
- Public copy approved: `NO`
- Publication target: `PENDING`
- Evidence boundary: one exact private vehicle-movement artifact has been selected because it documents a real dealership-origin workflow, but the current review does not yet prove that the dealer/recipient was a direct Hermes customer. It therefore remains process evidence only, not a customer case or testimonial.
- Next action: reconcile the selected artifact against private relationship records. If an appropriate direct relationship cannot be verified, replace the candidate rather than upgrading the artifact into a customer claim.

## Named trust-role decisions

### Logistics SEO reviewer

- Decision state: `PENDING`
- Allowed outcomes:
  - verified real reviewer + explicit publication permission; or
  - `NO_NAMED_REVIEWER`.
- Prohibited outcome: synthetic identity, implied review, invented credential or borrowed authority.

### Academy instructor / mentor

- Decision state: `PENDING`
- Allowed outcomes:
  - verified real instructor/mentor + explicit publication permission; or
  - `NO_NAMED_INSTRUCTOR`.
- Prohibited outcome: synthetic instructor profile, fabricated employment/teaching history or implied endorsement.

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
