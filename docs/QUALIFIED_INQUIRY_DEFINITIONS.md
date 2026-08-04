# Qualified Inquiry Definitions

Status: `OWNER_APPROVAL_REQUIRED`  
Reviewed: 2026-08-04  
Tracking issue: #206

## Purpose

Define when a website interaction becomes a delivered inquiry, a human-reviewed inquiry, and a qualified commercial or Academy opportunity.

These definitions prevent clicks, form starts, previews, email handoffs, approved synthetic tests, duplicates, spam, and incomplete requests from being reported as real leads.

This is a public-safe operating specification. Person-level review, contact details, private notes, routes, vehicles, authority data, budgets, contracts, and outcomes belong in an owner-controlled private system, not GitHub or GA4.

---

# 1. Canonical funnel stages

| Stage | Definition | Evidence source | May be counted as a lead? |
| --- | --- | --- | --- |
| `eligible_session` | A non-excluded visit to an approved commercial landing page | GA4 after tag/filter verification | No |
| `commercial_cta` | A trusted click into the intended commercial path | Privacy-safe analytics event | No |
| `intake_started` | First trusted interaction with an approved intake | Privacy-safe analytics event | No |
| `preview_ready` | Local validation produced a reviewable summary | Privacy-safe analytics event | No |
| `handoff_ready` | User selected secure delivery, email, or another approved contact route | Privacy-safe analytics event | No |
| `delivery_confirmed` | Approved receiver acknowledged the unique request | Receiver evidence plus controlled browser event where implemented | Delivered inquiry only; not yet qualified |
| `human_reviewed` | An accountable person reviewed the request and assigned a disposition | Private operations/CRM | Yes, as reviewed inquiry |
| `qualified` | Request meets the approved direction-specific minimum criteria | Private operations/CRM | Yes, as qualified inquiry |
| `contacted` | An approved follow-up attempt was made | Private operations/CRM | Yes, as contacted qualified inquiry |
| `conversation_started` | Two-way communication occurred | Private operations/CRM | Yes |
| `opportunity` | A real next commercial or enrollment decision exists | Private operations/CRM | Yes |
| `won` | Approved agreement, payment, activation, booking, or enrollment condition is met for that direction | Private authoritative source | Yes, separately from lead count |
| `lost` | Opportunity ended with a known negative decision | Private operations/CRM | Yes, as outcome |
| `not_ready` | Potential fit exists, but timing/readiness is insufficient | Private operations/CRM | Not an active opportunity |
| `unreachable` | Approved contact attempts did not produce contact | Private operations/CRM | Not a conversation |
| `duplicate` | Same underlying request already exists within the approved deduplication window | Receiver/CRM | Exclude from unique counts |
| `spam_or_test` | Spam, abuse, bot, internal QA, approved synthetic test, or invalid system request | Receiver/operations | Exclude from business counts |

## Counting rule

A website event becomes a **unique delivered inquiry** only when:

1. the approved receiver confirmed delivery;
2. the request is not a test, duplicate, spam, or system artifact;
3. the request belongs to one approved business direction;
4. the reporting period and timezone are defined;
5. no person-level details are exported into analytics or GitHub.

A delivered inquiry becomes **qualified** only after human review against the correct direction-specific definition below.

---

# 2. Universal review fields

Every direction should privately record:

- direction and service requested;
- originating landing page/source group;
- delivery date/time;
- unique/duplicate/test/spam classification;
- authorized requester status where relevant;
- geographic/market fit;
- need/problem fit;
- readiness and timing;
- minimum information completeness;
- reachability and permission to respond;
- assigned owner;
- current funnel stage;
- disqualification or not-ready reason;
- next action and review date.

Do not require every optional field merely to inflate form completeness. Qualification should identify a real fit, not punish a legitimate buyer who needs clarification.

---

# 3. Carrier / owner-operator dispatch inquiry

## Minimum qualified definition

A carrier inquiry may be marked `qualified` when human review confirms all of the following:

- the requester is the carrier, owner-operator, fleet representative, or an authorized person acting for the operation;
- the request concerns a real current or planned U.S. carrier operation rather than general curiosity, scraping, recruiting spam, or a fictional load request;
- operating-authority status is stated truthfully as active, pending, inactive, new, or uncertain and can be clarified;
- insurance readiness/status is stated and can be reviewed before active work;
- equipment class, practical capacity, home/operating area, and availability are sufficiently clear for a fit decision;
- the requested scope is related to dispatch, load search, broker communication, setup/paperwork, invoicing, back-office coordination, direct freight development, or readiness review;
- the carrier retains the final operating and booking decision;
- there is a valid permissioned contact route and a reasonable possibility of two-way follow-up.

## Qualification outcomes

- `qualified_ready_for_scope_review` — authority/insurance/equipment/readiness appear sufficient to discuss an approved working scope.
- `qualified_new_authority_readiness` — legitimate carrier operation exists, but ordinary active dispatch may depend on authority age, insurance, broker requirements, documents, or other readiness work.
- `needs_more_information` — likely fit, but authority, insurance, equipment, availability, geography, role, or requested scope is unclear.
- `not_ready` — legitimate future carrier, but no usable operating timeline, authority/insurance path, equipment, or decision readiness exists yet.
- `not_a_fit` — request is outside the approved carrier scope, misrepresents authority/operation, seeks prohibited guarantees, or cannot be safely/lawfully supported.

## Not required for initial qualification

The following may be useful privately but should not automatically disqualify a genuine inquiry:

- a universal minimum fleet size;
- a universal minimum revenue or rate expectation;
- a mandatory preferred-lane list when the carrier needs help defining lanes;
- immediate acceptance of a fixed percentage or contract;
- disclosure of private credentials, broker accounts, VINs, exact loads, or documents through a public form.

## Never infer

Do not infer active authority, active insurance, safe operation, broker acceptance, guaranteed loads, rates, mileage, lanes, revenue, dispatcher assignment, or response timing from form completion.

---

# 4. Dealer, auction, shipper, broker, or customer vehicle-transport inquiry

## Minimum qualified definition

A transport inquiry may be marked `qualified` when human review confirms:

- the requester is the vehicle owner, dealer, auction buyer/seller, shipper, broker, authorized employee/agent, or another party with a legitimate interest in arranging the movement;
- a real one-time movement or repeat transport need exists;
- pickup and delivery geography are sufficient for an initial route review, with exact private details collected only when needed;
- approximate timing/readiness is stated;
- vehicle/equipment type, quantity, and operable/inoperable condition are sufficiently clear;
- relevant loading, access, release, storage, auction/facility, open/enclosed, multi-car, or special-equipment context is known or can be clarified;
- the requester understands that submission starts a review and does not confirm carrier capacity, assignment, rate, pickup, delivery, booking, insurance coverage, or claim outcome;
- a permissioned contact route exists.

## Qualification outcomes

- `qualified_single_move` — a legitimate current movement can proceed to route/capacity/scope review.
- `qualified_repeat_program` — a legitimate recurring dealer, auction, shipper, broker, or customer need can proceed to volume/process review.
- `needs_release_or_access_details` — likely fit, but release status, gate/access, storage deadline, vehicle condition, documents, or authorized-party status requires clarification.
- `needs_equipment_or_capacity_review` — movement is real, but equipment, quantity, operability, route, or timing requires additional feasibility review.
- `not_ready` — legitimate future need without usable dates, vehicle availability, authority to arrange, or release readiness.
- `not_a_fit` — prohibited/unsafe request, fraudulent or unauthorized movement, insufficient ownership/authorization basis, or request outside the approved service scope.

## Not required for initial qualification

- a guaranteed final rate;
- a chosen carrier;
- full VIN, gate-pass credential, payment information, identity document, title, contract, or release file through the public website;
- a target price;
- immediate confirmation of exact pickup or delivery timing.

---

# 5. Logistics shipper/broker commercial inquiry beyond vehicle transport

## Minimum qualified definition

A shipper/broker/logistics-manager inquiry may be marked `qualified` when:

- the requester represents or is authorized to explore a real freight, carrier-capacity, logistics-support, brokerage/coordination, or operational need;
- the cargo/equipment/service category and general geography are sufficiently clear for routing;
- timing, volume/frequency, and the desired Hermes role can be clarified;
- the request does not depend on a false representation of fleet ownership, authority, guaranteed capacity, guaranteed rates, or live product functionality;
- the person can participate in or connect Hermes with the relevant operational/commercial decision process;
- a permissioned contact route exists.

Possible dispositions:

- `qualified_current_opportunity`;
- `qualified_relationship_development`;
- `needs_scope_or_authority_clarification`;
- `not_ready`;
- `not_a_fit`.

The exact legal/operating role must be confirmed before any brokerage, carrier, agency, shipper, or motor-carrier representation is made.

---

# 6. SEO / marketing inquiry

## Minimum qualified definition

An SEO or marketing inquiry may be marked `qualified` when:

- the requester owns, operates, markets, or is authorized to evaluate work for a real business/project;
- the business, offer, market, or target audience is sufficiently clear for an initial diagnostic;
- there is a concrete visibility, indexing, content, local presence, traffic quality, conversion, social, paid-media, funnel, or measurement problem/opportunity;
- the requester can provide or help obtain the minimum access/evidence needed for the agreed scope, or explicitly needs setup first;
- the desired starting level can reasonably be classified as diagnostic, focused implementation, or ongoing system;
- the requester understands that rankings, reach, traffic, inquiries, leads, sales, revenue, ROI, and timing are not guaranteed;
- a permissioned contact route and a plausible decision path exist.

## Qualification outcomes

- `qualified_diagnostic` — enough context exists to define an audit/diagnostic scope.
- `qualified_focused_implementation` — a bounded priority problem and implementation path can be scoped.
- `qualified_ongoing_system` — the business needs continuing measurement/content/optimization and can support an ongoing process.
- `needs_access_or_baseline` — real fit, but Search Console, GA4, ad/social access, current metrics, ownership, or baseline evidence must be established first.
- `needs_business_offer_clarity` — marketing work would be premature until the offer, target market, commercial path, or decision owner is clarified.
- `not_ready` — genuine interest without a usable business/project, owner, timing, or evidence path.
- `not_a_fit` — seeks fabricated proof, policy-violating tactics, guaranteed outcomes, impersonation, spam, fake reviews, or unsupported claims.

## Budget rule

Budget may affect recommended scope, but absence of a public-form budget should not automatically disqualify a legitimate diagnostic inquiry. Commercial scope, deliverables, exclusions, approval points, fee, and responsibilities must be confirmed separately in writing.

---

# 7. Website development / redesign / automation inquiry

## Minimum qualified definition

A website or automation inquiry may be marked `qualified` when:

- a real business, organization, product, or authorized project exists;
- the requester can participate in or connect Hermes with the decision process;
- the primary business objective, user group, market, and current problem are sufficiently clear for discovery;
- the project can be classified at least broadly: new website, redesign, website plus SEO, CRM/workflow, integration, portal, scheduling, automation, or another approved system;
- current assets/tools and required integrations can be reviewed or are explicitly unknown and need discovery;
- the desired outcome can be translated into a bounded first scope rather than an unsupported promise of a complete live product;
- security/data-sensitivity concerns can be addressed before access or implementation;
- a permissioned contact route exists.

## Qualification outcomes

- `qualified_discovery` — enough information exists for a discovery/architecture scope.
- `qualified_website_scope` — website/redesign scope can be estimated after defined dependencies are reviewed.
- `qualified_automation_scope` — workflow/integration problem is real and can proceed to architecture review.
- `needs_requirements` — legitimate project with insufficient user, workflow, integration, content, market, or ownership detail.
- `needs_access_or_security_review` — project may fit, but credentials, data, permissions, compliance, or infrastructure boundaries require a separate controlled process.
- `not_ready`;
- `not_a_fit`.

Do not treat a generated brief as a signed scope, estimate, acceptance, live account, working integration, delivery date, or guaranteed result.

---

# 8. Hermes Business Academy inquiry

## Minimum qualified definition

An Academy inquiry may be marked `qualified` when:

- the requester is applying for or asking about one of the currently approved public programs;
- location/time zone, languages, English level where relevant, recent experience, objective, and learning availability are sufficiently clear for human review;
- the requester understands that submission does not guarantee enrollment, seat, schedule, format, price, discount, mentor, account access, certificate, employment, income, client assignment, or future paid work;
- the candidate can be contacted through a permissioned route;
- the current program, capacity, schedule, language, terms, and participation requirements can be confirmed separately if a fit may exist.

## Qualification outcomes

- `qualified_program_review` — candidate information is sufficient for program-fit review.
- `needs_language_or_schedule_clarification` — possible fit, but language, English, availability, time-zone, or format requires clarification.
- `needs_experience_or_objective_clarification` — target role/skill and current level are not yet sufficient.
- `not_ready` — no realistic availability, objective, or current program fit.
- `not_a_fit` — seeks guaranteed work/income/access, cannot meet essential current requirements, or the requested program is not currently approved/public.

Academy inquiry counts must remain separate from commercial customer leads and recruiting candidates unless an approved private operating model explicitly maps them.

---

# 9. Disqualification and exclusion vocabulary

Use one primary reason and optional controlled secondary reasons:

- `approved_test`;
- `duplicate`;
- `spam_or_bot`;
- `invalid_contact`;
- `unreachable`;
- `insufficient_information`;
- `unauthorized_requester`;
- `outside_service_scope`;
- `outside_geography_or_market`;
- `not_ready_timing`;
- `no_real_business_or_move`;
- `prohibited_or_unsafe_request`;
- `requires_unsupported_guarantee`;
- `rights_or_permission_problem`;
- `authority_insurance_readiness`;
- `access_or_security_blocker`;
- `current_program_unavailable`;
- `owner_decision_required`.

Do not put free-form disqualification notes into GA4. Private operational notes should be access-controlled and retained only as long as necessary.

---

# 10. KPI formulas

## Unique delivered inquiry rate

`unique non-test delivered inquiries / eligible sessions`

Use only after session, source, test, duplicate, and receiver evidence are reconciled.

## Human-review rate

`human-reviewed unique inquiries / unique delivered inquiries`

A low value may indicate an operational review backlog, receiver-routing problem, or invalid/spam volume.

## Qualified inquiry rate

`qualified unique inquiries / human-reviewed unique inquiries`

Do not divide by raw CTA clicks or all sessions when describing lead quality.

## Contact rate

`qualified inquiries with approved follow-up attempt / qualified inquiries`

## Conversation rate

`qualified inquiries with two-way communication / qualified inquiries`

## Opportunity rate

`opportunities / qualified inquiries`

## Win rate

`won opportunities / closed won + closed lost opportunities`

State the attribution window, direction, cohort, period, timezone, and source. Do not combine Academy, carrier, transport, SEO/marketing, and technology funnels into one conversion rate without showing the direction mix.

---

# 11. Private reconciliation requirements

The private system should be able to reconcile, without copying private rows to GitHub:

- browser event date/time bucket;
- approved source/landing-page group;
- receiver delivery confirmation;
- duplicate/test/spam exclusion;
- direction;
- human reviewer;
- controlled qualification disposition;
- next action;
- aggregate outcome.

No deterministic person-level identifier should be sent to GA4 merely to make reconciliation easier. Use private operational controls and aggregate reporting instead.

---

# 12. Owner approval checklist

- [ ] Carrier qualification definition matches the current legal and operating model.
- [ ] Vehicle-transport authorization, condition, release, access, and carrier-review rules are approved.
- [ ] Shipper/broker scope accurately reflects the entity's current authority and role.
- [ ] SEO/marketing starting levels and decision ownership are approved.
- [ ] Website/automation discovery and security boundaries are approved.
- [ ] Academy program names, language, availability, and participation requirements are current.
- [ ] Test, duplicate, spam, unreachable, not-ready, and not-a-fit rules are approved.
- [ ] Review owners and response workflow are assigned privately.
- [ ] CRM stages use controlled values and do not mix directions.
- [ ] GA4 contains no private inquiry values or CRM person-level outcomes.
- [ ] Seven-day and 28-day scorecards use these definitions consistently.

# 13. Current release decision

Use this file as a draft operating contract for measurement and CRM design.

Do not publish qualification rates, lead totals, win rates, response rates, or business outcomes until:

- the definitions are owner-approved;
- production event collection is verified;
- receiver delivery is reconciled;
- tests and duplicates are excluded;
- private human-review records exist;
- the exact source, period, cohort, and methodology are stated.
