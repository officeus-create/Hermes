# Carrier Contract Funnel Analytics — 2026-08-06

Status: `REPOSITORY IMPLEMENTED / GA4 VERIFICATION REQUIRED`

Tracking issue: #206  
Legal execution issue: #280

## Purpose

Measure where a carrier enters, reviews, shares, begins, advances through, or leaves the proposal/agreement/onboarding journey without sending carrier identity, authority, operating profile, contract contents or signature data into analytics.

This document records repository event emission only. It does not prove that GA4 received, processed, retained or reported an event, and it does not prove delivery, qualification, contract execution or revenue.

## Controlled funnel

1. `/logistics/carrier/` — carrier audience and dispatch-review entry;
2. `/carrier/` — memorable private proposal link for SMS and site handoff;
3. `/logistics/carrier-offer/` — plans, value and responsibility review;
4. `/logistics/carrier-agreement/` — current document review and download;
5. `/logistics/carrier-onboarding/` — five-step packet and signature workflow;
6. `/api/carrier-contract` — server-side PDF generation and controlled delivery response.

## Event inventory

| Event | Trigger | Controlled parameters | Meaning |
|---|---|---|---|
| `commercial_cta_click` | Trusted click into proposal, plans, agreement or packet | `cta_type`, `audience_type`, `page_group`, `service_group`, `page_path`, `destination_path` | Carrier chose a next commercial path; not an intake completion. |
| `carrier_contract_share` | Native share, copy or SMS control | `handoff_method`, `audience_type`, `page_group`, `service_group`, `page_path` | A proposal link sharing method was selected; no proof that another person received or opened it. |
| `carrier_contract_document_action` | PDF/DOCX download or e-sign request control | `cta_type`, optional controlled `handoff_method`, `audience_type`, `page_group`, `service_group`, `page_path` | Carrier interacted with the document workflow; not proof of reading, consent or execution. |
| `carrier_contract_intake_start` | First trusted interaction with onboarding | `audience_type`, `page_group`, `service_group`, `page_path` | Carrier began the onboarding interface. |
| `carrier_contract_step_reached` | First arrival at each visible step | `stepNumber` 1–5 plus controlled base parameters | The browser displayed a step; not proof that its fields were complete or accurate. |
| `carrier_contract_packet_result` | Browser receives the controlled final result state | `preview_status=delivered|pending|failed` plus controlled base parameters | PDF generation/delivery state reported to the browser; must be reconciled with receiver and records evidence. |

## Controlled CTA values

- `carrier_proposal_entry`;
- `carrier_offer_review`;
- `carrier_agreement_review`;
- `carrier_packet_start`;
- `carrier_plan_essential`;
- `carrier_plan_pro`;
- `carrier_plan_custom`;
- `agreement_pdf_download`;
- `agreement_docx_download`;
- `carrier_esign_request`.

A plan CTA value identifies only the controlled route selected. Analytics must not receive the percentage, custom proposed percentage, service text or agreement contents.

## Approved categorical values

- `audience_type=carrier`;
- `service_group=carrier_contract`;
- `page_group=carrier_contract|carrier_agreement|carrier_contract_onboarding`;
- `handoff_method=native_share|copy|sms|email_request|hosted_session`;
- `stepNumber=1|2|3|4|5`;
- `preview_status=delivered|pending|failed`;
- public-safe page and destination paths.

## Prohibited values

Never send or derive:

- legal company or DBA;
- signer name, title, email or phone;
- MC or USDOT;
- address, city, state or ZIP tied to the carrier;
- fleet size, equipment, home base, lanes, deadhead or availability;
- load boards, access method or Hermes representative;
- selected percentage, custom percentage or custom scope;
- consent values, typed signature or signature image;
- generated request ID, document hash, provider ID or recipient;
- IP, user agent, device fingerprint, private email routing or infrastructure identifiers;
- PDF contents, free text, contract values, payment information or private documents.

## Interpretation boundary

- a CTA click is not an inquiry;
- an onboarding start is not a qualified carrier;
- a reached step is not a completed step;
- a drawn signature is not tracked;
- `pending` is not delivered;
- browser `delivered` must be reconciled against the approved receiver and permanent records system before it is reported as delivered;
- a delivered packet is not automatically a final executed agreement while Issue #280 remains open;
- no event is a ranking, traffic, conversion-rate, revenue or contract-value result.

## Repository validation

Automated tests must verify:

- trusted CTA/share/document interactions emit the expected controlled event once;
- onboarding records one start and steps 1–5 without reading form values;
- packet-result status is one of the three controlled values;
- event objects use only approved keys;
- synthetic private test values never appear in carrier-contract analytics events;
- the analytics component does not reference prohibited form field names.

## Production verification required

Under Issue #206, use synthetic non-private interactions to confirm privately:

1. the event appears once in Tag Assistant and GA4 DebugView;
2. only approved parameter names and values are transmitted;
3. no duplicate Google tag causes duplicate events;
4. preview hosts are excluded or classified appropriately;
5. synthetic tests are excluded from business KPI reporting;
6. `carrier_contract_packet_result=delivered` reconciles with receiver evidence before aggregate reporting;
7. human qualification remains a separate private operations disposition.
