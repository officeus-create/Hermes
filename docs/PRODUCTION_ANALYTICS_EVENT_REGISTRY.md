# Production Analytics Event Registry

Status: `IMPLEMENTATION_INVENTORY — GA4 VERIFICATION REQUIRED`  
Reviewed: 2026-08-04  
Tracking issue: #206

## Purpose

Record which privacy-safe commercial events already exist in the Hermes browser code, which funnel step they represent, and what still must be verified in the production analytics property.

This registry deliberately separates:

1. an event name present in repository code;
2. an event object pushed to `window.dataLayer` or emitted through the local analytics helper;
3. an event observed in Tag Assistant or GA4 DebugView;
4. an event available in Realtime and standard reports;
5. an event reconciled with a confirmed delivered and human-qualified inquiry.

Only step 1 and parts of step 2 are established by this repository review. Steps 3–5 require authenticated production verification and private operational reconciliation.

## Current tag foundation

The production layout loads the site-wide Google tag and initializes one global `window.dataLayer`.

Important boundary:

- the presence of the tag does not prove that every custom object push is received, processed, retained, or reportable in GA4;
- a data-layer entry is not a delivered inquiry;
- a browser success state is not a qualified lead;
- a DebugView event is not a revenue result;
- no custom event may be marked verified until it is observed through the approved production property and checked for privacy-safe parameters.

Do not add a second GA4/GTM installation during verification. Confirm the current installation first to avoid duplicate page views and duplicate custom events.

---

# 1. Privacy-safe parameter vocabulary

## Approved controlled parameters

The currently implemented event layer uses controlled values such as:

- `page_path`;
- `destination_path`;
- `page_group`;
- `page_cluster`;
- `service_group`;
- `audience_type`;
- `audience_role`;
- `role_id`;
- `cta_type`;
- `contact_method`;
- `handoff_method`;
- `preview_status`;
- `submitter_group`;
- `intake_type`;
- `direction`;
- `recommendationId`;
- `resultRoute`;
- `selection` or controlled selection count;
- `stepNumber`;
- controlled case, track, CTA, or simulation identifiers where those helpers are used.

These values must remain controlled enums, approved route paths, or non-sensitive aggregate counts.

## Prohibited analytics values

Never send or derive any of the following into GA4, GTM, Google Ads, pixels, analytics logs, or public debugging screenshots:

- name or personal identity;
- email address;
- phone number;
- company name;
- MC or USDOT number;
- authority, insurance, fleet, dispatch, or equipment answers tied to a person/company;
- origin, destination, preferred lane, exact service area, or exact address;
- vehicle details, VIN, stock number, buyer number, gate pass, release data, or condition notes;
- free-form message, problem statement, project brief, SEO brief, or transport notes;
- rate, budget, price, commission, revenue, contract value, invoice, or payment information;
- request body, email body, subject containing identity, or generated preview summary;
- request ID, idempotency key, provider ID, email identifier, IP address, account ID, property ID, stream ID, container ID, secret, token, KV identifier, or Cloudflare resource identifier;
- customer, carrier, candidate, employee, reviewer, instructor, partner, or testimonial identity.

The browser may use private values to prepare or securely deliver a request. That does not make them valid analytics parameters.

---

# 2. Event inventory

Status vocabulary:

- `CODE_PRESENT` — event emission exists in repository code.
- `DATALAYER_PRESENT` — the code pushes a controlled event object to the shared data layer.
- `LOCAL_EVENT_PRESENT` — the generic helper also emits `hermes:analytics` in the browser.
- `GA4_UNVERIFIED` — no authenticated DebugView/Realtime/report evidence is recorded.
- `DELIVERY_RECONCILIATION_REQUIRED` — event cannot be treated as a delivered or qualified inquiry without private receiver/operations evidence.

## A. Homepage and commercial entry

| Event | Trigger | Implemented parameters | Code status | GA4 status | Business interpretation |
| --- | --- | --- | --- | --- | --- |
| `homepage_role_click` | Trusted click on a homepage role-router link | `page_group`, `role_id`, `page_path`, `destination_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Visitor chose a role path; not an inquiry. |
| `commercial_cta_click` | Trusted click on an approved commercial CTA | `cta_type`, `audience_type`, `page_group`, `service_group`, `page_path`, `destination_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Visitor entered a commercial path; not an intake completion. |
| `logistics_cta_click` | Click to the legacy Load Board entry path | `cta_type`, `audience_role`, `page_cluster`, `page_path`, `destination_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Legacy/demo entry click; must not be mixed with direct commercial intake. |
| `contact_click` | Trusted `tel:` or `mailto:` click | `contact_method`, `page_cluster`, `service_group`, `page_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Contact fallback usage; does not prove that a call connected or an email was sent. |

## B. Direct carrier dispatch intake

Canonical workspace: `/logistics/start-car-hauling-dispatch/`

| Event | Trigger | Implemented parameters | Code status | GA4 status | Funnel meaning |
| --- | --- | --- | --- | --- | --- |
| `carrier_intake_start` | First trusted focus/input/change in the direct carrier form | `audience_type`, `page_group`, `service_group`, `page_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Carrier began the direct intake. |
| `carrier_intake_preview_ready` | Qualified local review generated | base parameters plus `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | A reviewable request was prepared locally; not delivered. |
| `carrier_handoff_ready` | Email fallback clicked or secure delivery initiated | base parameters plus `handoff_method`, `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | User chose a handoff route; not confirmed delivery. |
| `carrier_delivery_confirmed` | Approved receiver returned a successful response | base parameters plus `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED`; `DELIVERY_RECONCILIATION_REQUIRED` | Browser received delivery confirmation. Must be reconciled against receiver evidence and duplicate/test exclusion before reporting a delivered inquiry. |

## C. Direct dealer/shipper/broker/customer vehicle-transport intake

Canonical workspace: `/logistics/request-vehicle-transport/`

| Event | Trigger | Implemented parameters | Code status | GA4 status | Funnel meaning |
| --- | --- | --- | --- | --- | --- |
| `vehicle_transport_intake_start` | First trusted focus/input/change in the direct transport form | `audience_type`, `page_group`, `service_group`, `page_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Customer-side transport intake began. |
| `vehicle_transport_preview_ready` | Local transport review generated | base parameters plus `preview_status`, controlled `submitter_group` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | A reviewable request was prepared locally; not booked or delivered. |
| `vehicle_transport_handoff_ready` | Email fallback clicked or secure delivery initiated | base parameters plus `handoff_method`, `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | User chose a handoff route; no capacity, carrier, price, pickup, or booking confirmation. |
| `vehicle_transport_delivery_confirmed` | Approved receiver returned a successful response | base parameters plus `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED`; `DELIVERY_RECONCILIATION_REQUIRED` | Browser received delivery confirmation. Must be reconciled with receiver and human-review evidence. |

## D. Legacy Load Board carrier workflow

Canonical interpretation: fictional/demo product path, not the primary commercial dispatch intake.

| Event | Trigger | Code status | GA4 status | Boundary |
| --- | --- | --- | --- | --- |
| `carrier_intake_start` | Trusted engagement with the Load Board carrier form | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Must use `page_group=load_board` to remain separate from direct commercial intake. |
| `carrier_intake_preview_ready` | Demo/local qualification preview appears | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Preview is not a delivered request, live load, account, or booking. |
| `carrier_handoff_ready` | Prepared email or secure handoff selected | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Must not be counted as confirmed delivery. |

Known measurement gap:

- the reviewed legacy Load Board qualification code does not emit a dedicated delivery-confirmed event after its secure request receives a successful response;
- because the Load Board is not the primary commercial intake, do not add a production conversion event there until its role, duplicate risk, and reporting need are approved;
- keep Load Board events segmented by `page_group=load_board`.

## E. SEO service intake

Routes include the main SEO intake and controlled supporting variants such as Local SEO, Logistics SEO, and Auto Dealer SEO.

| Event | Trigger | Implemented parameters | Code status | GA4 status | Funnel meaning |
| --- | --- | --- | --- | --- | --- |
| `seo_intake_start` | First trusted interaction with the SEO-specific form | `intake_type`, `page_group`, `service_group`, `page_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | SEO brief started. |
| `seo_intake_preview_ready` | Local handoff summary becomes available | base parameters plus `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Brief prepared locally; not sent. |
| `seo_handoff_ready` | Prepared email route clicked | base parameters plus `handoff_method`, `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Email handoff selected; does not prove send or receipt. |

Known measurement gap:

- no SEO-specific secure `delivery_confirmed` event was established in this code inventory;
- production generic contact delivery may occur through the shared receiver, but it must not be attributed to SEO delivery until a privacy-safe event is emitted after receiver confirmation and verified in production;
- do not infer delivery from `seo_handoff_ready`.

## F. Website development and redesign intake

| Event | Trigger | Implemented parameters | Code status | GA4 status | Funnel meaning |
| --- | --- | --- | --- | --- | --- |
| `website_project_intake_start` | First trusted engagement with the website project brief | `intake_type`, `page_group`, optional controlled `service_group`, `page_path` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Website brief started. |
| `website_project_preview_ready` | Review step/summary becomes available | base parameters plus `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Project brief prepared locally. |
| `website_handoff_ready` | Prepared email route clicked | base parameters plus `handoff_method`, `preview_status` | `DATALAYER_PRESENT` | `GA4_UNVERIFIED` | Email handoff selected; not confirmed delivery. |

Known measurement gap:

- no website-project-specific `delivery_confirmed` event was established in this inventory;
- new website and redesign flows must use the same event names with distinct approved `service_group` values rather than creating unnecessary duplicate taxonomies;
- submitted project scope, integrations, market, current URL, languages, budget, and free text must remain outside analytics.

## G. Logistics path engine

| Event | Trigger | Implemented parameters | Code status | GA4 status | Funnel meaning |
| --- | --- | --- | --- | --- | --- |
| `path_started` | Logistics decision engine initializes | `direction`, `stepNumber` | `DATALAYER_PRESENT` and `LOCAL_EVENT_PRESENT` | `GA4_UNVERIFIED` | Decision flow opened. |
| `path_role_selected` | Controlled role chosen | `direction`, controlled `role`, `selection`, `stepNumber` | `DATALAYER_PRESENT` and `LOCAL_EVENT_PRESENT` | `GA4_UNVERIFIED` | Role selected. |
| `path_need_selected` | Controlled need/equipment choice made | controlled path identifiers and/or `selectionCount` | `DATALAYER_PRESENT` and `LOCAL_EVENT_PRESENT` | `GA4_UNVERIFIED` | Need selected. |
| `path_situation_selected` | Controlled situation choice made | controlled path identifiers | `DATALAYER_PRESENT` and `LOCAL_EVENT_PRESENT` | `GA4_UNVERIFIED` | Situation selected. |
| `path_completed` | Recommendation route resolved | `direction`, `recommendationId`, `resultRoute` | `DATALAYER_PRESENT` and `LOCAL_EVENT_PRESENT` | `GA4_UNVERIFIED` | Decision path completed; not a commercial inquiry. |
| `path_back_clicked` | User moves back | `direction`, `stepNumber` | `DATALAYER_PRESENT` and `LOCAL_EVENT_PRESENT` | `GA4_UNVERIFIED` | Friction/navigation signal. |
| `path_restarted` | User restarts the path | `direction` | `DATALAYER_PRESENT` and `LOCAL_EVENT_PRESENT` | `GA4_UNVERIFIED` | Friction or changed intent. |

## H. Generic local analytics helper

The shared helper can emit:

- `track_selected`;
- `case_opened`;
- `simulation_started`;
- `cta_clicked`;
- arbitrary controlled events through `trackEvent()`.

Status:

- helper implementation is present;
- it emits a browser `hermes:analytics` CustomEvent;
- it also pushes to `dataLayer` when the array exists;
- each concrete usage still needs route-level inventory and production verification before inclusion in a KPI report;
- arbitrary event names must not become an uncontrolled parallel taxonomy.

---

# 3. Current funnel coverage by business direction

| Direction | CTA/entry | Intake start | Preview ready | Handoff ready | Receiver-confirmed browser event | Qualified-lead reconciliation |
| --- | --- | --- | --- | --- | --- | --- |
| Carrier dispatch | Implemented | Implemented | Implemented | Implemented | Implemented in direct carrier intake | Required privately |
| Dealer/shipper/customer transport | Implemented | Implemented | Implemented | Implemented | Implemented in direct transport intake | Required privately |
| Logistics Load Board demo | Implemented | Implemented | Implemented | Implemented | Not established in reviewed demo code | Do not treat as primary conversion |
| SEO services | Implemented | Implemented | Implemented | Email handoff implemented | Not established as SEO-specific event | Required |
| Website development/redesign | Implemented | Implemented | Implemented | Email handoff implemented | Not established as project-specific event | Required |
| General Marketing | Contact path exists | Generic form behavior requires verification | Generic preview behavior requires verification | Direct contact tracking exists | Direction-specific event not established | Required |
| Academy | Contact/application path exists | Application event taxonomy not established in this inventory | Not established as approved analytics event | Direct contact tracking exists | Direction-specific event not established | Required |
| General IT/automation | Contact/project paths exist | Website project subset implemented | Website project subset implemented | Website project subset implemented | Direction-specific secure event not established | Required |

This table is an implementation map, not a performance scorecard.

---

# 4. Production verification protocol

## Step 1 — tag health

Use the current production domain and approved authenticated analytics property.

Verify:

- one Google tag installation is detected;
- no duplicate page-view installation exists;
- no second GTM or GA4 snippet sends the same events;
- production and preview/deployment hosts are not unintentionally combined without an approved filter;
- internal/test traffic handling is documented.

## Step 2 — event transport

For each priority event:

1. open Tag Assistant and GA4 DebugView;
2. perform one approved synthetic interaction with no real personal or operating data;
3. confirm the expected event appears once;
4. inspect the browser network request and event parameters;
5. confirm no prohibited values are present;
6. record only the event name, controlled parameter names, timestamp, route, test classification, and verification result;
7. exclude the synthetic test from business KPI reporting.

Priority sequence:

1. `commercial_cta_click`;
2. `carrier_intake_start`;
3. `carrier_intake_preview_ready`;
4. `carrier_handoff_ready`;
5. `carrier_delivery_confirmed`;
6. `vehicle_transport_intake_start`;
7. `vehicle_transport_preview_ready`;
8. `vehicle_transport_handoff_ready`;
9. `vehicle_transport_delivery_confirmed`;
10. `contact_click`;
11. SEO and website-project funnel events;
12. homepage role and path-engine events.

## Step 3 — GA4 reporting availability

After transport is confirmed:

- verify the event in Realtime;
- verify it appears in the Events report after normal processing;
- register only necessary categorical parameters as event-scoped custom dimensions;
- avoid registering raw paths or high-cardinality identifiers unless they are truly required and reviewed;
- mark key events only for meaningful downstream outcomes, not every click or preview;
- document timezone, property owner, retention, internal/test exclusion, and first verified date.

Recommended initial key-event candidates after evidence review:

- `carrier_delivery_confirmed`;
- `vehicle_transport_delivery_confirmed`;
- later direction-specific secure-delivery confirmations only after implementation and receiver reconciliation.

Do not mark `contact_click`, `handoff_ready`, `preview_ready`, or a generic CTA as a completed lead merely to inflate conversion counts.

## Step 4 — receiver and human reconciliation

A browser event is reportable as a delivered inquiry only when:

- receiver confirmation exists;
- the request is not an approved test;
- duplicate suppression is reconciled;
- spam/invalid/system requests are classified;
- the responsible team confirms human review;
- qualification rules for that direction are applied privately.

Aggregate funnel stages:

`eligible landing session → commercial CTA → intake start → preview ready → handoff ready → delivery confirmed → human reviewed → qualified → contacted → conversation → opportunity → won/lost/not-ready/unreachable`

GitHub and GA4 must not store person-level CRM stages or lead details.

---

# 5. Implementation decisions before any runtime change

## Decision A — current data-layer transport

The repository uses a site-wide Google tag plus direct object pushes to the shared data layer. Official Google documentation describes the data layer as shared by Google Tag and Tag Manager, while the explicit Google tag API uses the `gtag('event', ...)` command to send event data.

Therefore:

- do not assume the current object pushes are absent from GA4;
- do not assume they are successfully collected either;
- verify with Tag Assistant, DebugView, Realtime, and the network layer;
- do not add parallel `gtag('event', ...)` calls before verification, because that may create duplicates;
- if the current events are not transported, choose one controlled adapter and migrate all approved events through it with regression tests.

## Decision B — missing direction-specific delivery events

Do not implement delivery-confirmed events by watching success text or click state.

A valid delivery-confirmed event must fire only after:

- the same-origin receiver returns the approved success response;
- the event contains controlled context only;
- no request ID, lead body, identity, provider detail, or operational value is included;
- synthetic/test events can be excluded from KPI reporting;
- duplicate behavior is understood.

## Decision C — event taxonomy control

New events require:

- one business definition;
- one canonical event name;
- allowed parameters;
- prohibited parameters;
- trigger evidence;
- route ownership;
- GA4 verification status;
- KPI role;
- review owner and date.

Avoid synonyms such as `lead_sent`, `form_success`, `request_complete`, `contact_submitted`, and `delivery_confirmed` for the same stage.

---

# 6. Acceptance criteria for Issue #206 analytics section

- [ ] Current Google tag is verified through Tag Assistant on the custom production domain.
- [ ] Duplicate tag/page-view risk is checked.
- [ ] Each priority custom event is observed exactly once in DebugView using approved synthetic data.
- [ ] Network requests contain only approved controlled parameters.
- [ ] No names, emails, phones, companies, MC/USDOT, locations, messages, project details, vehicle data, rates, budgets, IDs, secrets, or infrastructure details enter analytics.
- [ ] Carrier and vehicle-transport delivery-confirmed events reconcile with receiver evidence.
- [ ] Tests and duplicates are excluded from business KPI counts.
- [ ] SEO, website, Marketing, Academy, and IT delivery gaps are explicitly approved, implemented, or left as non-conversion events.
- [ ] Event-scoped custom dimensions are created only where necessary.
- [ ] Key events are limited to reconciled commercial outcomes.
- [ ] First 7-day and 28-day aggregate funnel baselines are recorded privately and summarized safely.
- [ ] Search Console, GA4, receiver/CRM, Lighthouse lab, CrUX field, and finance evidence remain separately labeled.

# 7. Current conclusion

The Hermes site already has a substantial privacy-conscious micro-conversion vocabulary in code. The strongest complete browser funnel currently exists for direct carrier dispatch and direct customer/dealer vehicle transport.

The current blocker is no longer “add analytics everywhere.” It is:

1. prove that the existing event objects reach the intended GA4 property exactly once;
2. confirm that no submitted values leak into analytics;
3. reconcile delivery-confirmed browser events with the receiver and human qualification process;
4. add only the missing direction-specific confirmed-delivery events that have a real commercial need;
5. establish 7-day and 28-day aggregate baselines before optimization claims or new page expansion.

---

# 8. Hermes Connect Public Beta Event Taxonomy

The following event vocabulary is registered for the Hermes Connect Public Beta application and product acquisition pages:

### Acquisition & Workspace Launch
- `connect_landing_view`: Triggered when visiting `/services/hermes-connect/` or a feature page. Parameters: `page_path`, `feature_group`.
- `connect_workspace_open`: Triggered when opening the Workspace. Parameters: `source_page`, `deep_link_tool`, `business_type`.
- `connect_request_access_click`: Triggered when clicking a Request Access CTA. Parameters: `source_page`, `cta_location`.

### Navigation & Onboarding
- `connect_module_open`: Triggered when switching tabs in the Workspace. Parameters: `module`, `source_page`, `business_type`.
- `connect_onboarding_start`: Triggered when the business type onboarding modal opens.
- `connect_onboarding_complete`: Triggered when a business type selection is saved. Parameter: `business_type` (controlled enum).

### Inbox & Lead Intake
- `connect_inbox_open`: Triggered when viewing the Command Center Inbox.
- `connect_lead_intake_start`: Triggered when starting the lead intake modal.
- `connect_lead_intake_preview`: Triggered when local lead preview is generated.
- `connect_lead_delivery_confirmed`: Triggered ONLY when lead is sent to local receiver (never for previews).

### Tools & Calculators
- `connect_load_analyzer_open`: Triggered when opening Load Analyzer.
- `connect_load_analysis_completed`: Triggered when a load calculation completes.
- `connect_rate_negotiator_open`: Triggered when opening Rate Negotiator.
- `connect_counter_offer_generated`: Triggered when an automated counter-offer strategy is generated. (Note: `counter_offer_sent` is prohibited until live dispatch API is connected).
- `connect_proposal_open`: Triggered when opening Proposal Builder.
- `connect_proposal_generated`: Triggered when generating an instant proposal.
- `connect_proposal_export_html`: Triggered when exporting proposal HTML.
- `connect_proposal_print_pdf`: Triggered when printing proposal PDF.
- `connect_roi_open`: Triggered when opening ROI Calculator.
- `connect_roi_calculated`: Triggered when calculating business ROI.

### Feedback & Engagement
- `connect_beta_feedback_open`: Triggered when opening Beta Feedback popup.
- `connect_beta_feedback_submitted`: Triggered when feedback is submitted. Parameter: `feedback_rating` (`useful` or `not_useful`), `controlled_reason`. No PII or raw text.

