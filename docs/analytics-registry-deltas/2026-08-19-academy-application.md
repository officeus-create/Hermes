# Analytics Registry Delta — Academy Application

Date: 2026-08-19
Status: `CODE_PRESENT / DATALAYER_PRESENT / GA4_UNVERIFIED`
Parent registry: `docs/PRODUCTION_ANALYTICS_EVENT_REGISTRY.md`
Measurement owner: #206

## Purpose

Add a bounded, privacy-safe Academy application funnel without creating a second analytics installation or treating a browser handoff as delivered/qualified evidence.

## Controlled parameters

New controlled parameters for this funnel:

- `academy_program`: `us-logistics-operations | marketing | not_selected`
- `application_language`: `en | uk`

Existing approved controlled parameters reused:

- `page_group=academy_application`
- `service_group=academy`
- `page_path`
- `preview_status=prepared` where applicable
- `handoff_method=email` where applicable

These parameters are categorical application context only. They must not contain candidate identity or application answers.

## Events

| Event | Trigger | Parameters | Code status | GA4 status | Meaning |
| --- | --- | --- | --- | --- | --- |
| `academy_application_start` | First trusted interaction with the Academy application | program, language, page group/service group/page path | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Application interaction began. |
| `academy_application_preview_ready` | Preview-mode form produced a visible reviewable handoff summary | base + `preview_status=prepared` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Local preview prepared; not sent or delivered. |
| `academy_application_handoff_ready` | User clicks the approved Academy email handoff after a prepared preview | base + `handoff_method=email`, `preview_status=prepared` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Email handoff selected; not confirmed delivery. |

## Deliberate delivery gap

No `academy_application_delivery_confirmed` event is introduced by this delta.

The shared live `ContactCTA` currently treats a successful POST as a browser success state, but there is no Academy-specific receiver-confirmed lifecycle contract in the approved analytics registry. Do not infer confirmed Academy delivery from:

- `academy_application_preview_ready`;
- `academy_application_handoff_ready`;
- generic contact success UI;
- a browser `fetch()` success without receiver reconciliation.

A delivery-confirmed event may be added only through a shared, privacy-safe receiver-confirmation contract and then verified in the existing production analytics property.

## Privacy boundary

Never include in these events:

- name;
- email;
- phone;
- country or city;
- languages entered by the applicant;
- English-level answer tied to an applicant;
- recent experience;
- objective;
- schedule/time-zone availability;
- free-form message;
- contact-route detail;
- request ID or idempotency key;
- any payment, identity, candidate, customer or operational data.

## Verification boundary

Repository code and browser tests can prove the event objects are created and privacy-safe. They do not prove GA4 receipt, exact-once processing, reporting availability, application delivery, admission, qualification, or revenue. Those remain external evidence gates under #206.
