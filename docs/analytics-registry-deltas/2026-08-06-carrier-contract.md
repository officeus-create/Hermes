# Production Analytics Registry Delta — Carrier Contract Funnel

Status: `DATALAYER_PRESENT / GA4_UNVERIFIED`  
Effective repository release: PR #291, merge commit `d4c28c3`  
Parent registry: `docs/PRODUCTION_ANALYTICS_EVENT_REGISTRY.md`  
Detailed boundary: `docs/CARRIER_CONTRACT_ANALYTICS_2026-08-06.md`  
Tracking issue: #206  
Legal execution issue: #280

## Purpose

Extend the August 4 production analytics implementation inventory with the carrier proposal, agreement-review, onboarding and packet-result events added on August 6.

This delta establishes repository emission and regression coverage only. It does not establish GA4 receipt, delivery, qualification, final contract execution, conversion rate or revenue.

## Canonical route group

- `/logistics/carrier/` — carrier audience entry;
- `/carrier/` — short private proposal link;
- `/logistics/carrier-offer/` — plans and responsibilities;
- `/logistics/carrier-agreement/` — draft agreement review;
- `/logistics/carrier-onboarding/` — five-step packet workflow.

All routes except the public carrier audience route are private sales/workspace paths and are not organic landing pages.

## Event inventory

| Event | Trigger | Controlled parameters | Repository status | Production status | Interpretation |
|---|---|---|---|---|---|
| `commercial_cta_click` | Trusted click into proposal, plans, agreement, packet or a controlled plan route | `cta_type`, `audience_type`, `page_group`, `service_group`, `page_path`, `destination_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | A next commercial route was selected; not an inquiry. |
| `carrier_contract_share` | Native share, copy or SMS action | `handoff_method`, `audience_type`, `page_group`, `service_group`, `page_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | A sharing method was selected; not proof that another person received or opened the link. |
| `carrier_contract_document_action` | Agreement PDF/DOCX action or e-sign request control | `cta_type`, optional controlled `handoff_method`, base route parameters | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Document workflow interaction; not proof of reading, consent or execution. |
| `carrier_contract_intake_start` | First trusted interaction with onboarding | `audience_type`, `page_group`, `service_group`, `page_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Onboarding interface started. |
| `carrier_contract_step_reached` | First display of each onboarding step | controlled `stepNumber` 1–5 plus base route parameters | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Step displayed; not proof that fields were complete or accurate. |
| `carrier_contract_packet_result` | Controlled browser result after packet generation/delivery attempt | `preview_status=delivered|pending|failed` plus base route parameters | `DATALAYER_PRESENT` | `GA4_UNVERIFIED`; `DELIVERY_RECONCILIATION_REQUIRED` | Browser result only; reconcile with receiver/private records before aggregate reporting. |

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

These values identify a controlled route/action only. They do not transmit the selected percentage, custom proposal, document contents or form fields.

## Prohibited values

The global parent-registry prohibition remains in force. In particular, these events must not include or derive:

- legal company, DBA or signer identity;
- email, phone, address, MC or USDOT;
- equipment, fleet, home base, lanes, deadhead or availability;
- load boards, access method or representative;
- selected or custom percentage, custom scope or contract text;
- consent state, typed signature, drawn signature or PDF contents;
- request/document/provider IDs, hashes, recipients, IP, device data or infrastructure identifiers.

GTM may add its own internal keys such as `gtm.uniqueEventId` after `dataLayer.push`. Those keys are not authored carrier-business parameters and must be separated from the approved application payload during verification.

## Production verification order

After the parent-registry priority events are verified, test this bounded sequence with synthetic non-private interactions:

1. proposal/packet `commercial_cta_click`;
2. `carrier_contract_share`;
3. agreement PDF action;
4. e-sign request action;
5. one `carrier_contract_intake_start`;
6. steps 1–5 exactly once per page session;
7. one controlled packet result;
8. network payload review for prohibited values;
9. receiver reconciliation for a synthetic `delivered` result;
10. exclusion of synthetic interactions from business KPI reporting.

## Reporting boundary

Do not report:

- reached step as completed step;
- `delivered` browser state as qualified inquiry or permanent record;
- review/onboarding packet as final executed agreement while #280 is open;
- any event as a ranking, traffic, conversion-rate, contract-value or revenue result without the required platform and private-operations evidence.
