# SEO Qualified Lead Operating Runbook

Reviewed: 2026-08-02

## Revenue objective

Measure the complete commercial chain for the three canonical directions:

1. Car hauling dispatch;
2. Website development;
3. SEO services.

The operating chain is:

`landing page → commercial CTA → intake start → preview ready → explicit handoff → manual qualification → contract → revenue`

GA4 measures only the fixed, privacy-safe digital stages. Lead qualification, sales decisions, contract status, and revenue are maintained outside GA4.

## Canonical direction map

| Direction | Canonical landing owner | CTA | Intake | Preview | Handoff |
| --- | --- | --- | --- | --- | --- |
| Car hauling dispatch | `/logistics/car-hauling-dispatch/` | `commercial_cta_click` | `carrier_intake_start` | `carrier_intake_preview_ready` | `carrier_handoff_ready` |
| Website development | `/services/website-development/` | `commercial_cta_click` | `website_project_intake_start` | `website_project_preview_ready` | `website_handoff_ready` |
| SEO services | `/services/seo/` | `commercial_cta_click` | `seo_intake_start` | `seo_intake_preview_ready` | `seo_handoff_ready` |

Supporting pages may assist discovery, but they must link to one of these canonical commercial owners instead of creating a competing thin conversion page.

## Privacy boundary

Never place the following values in GA4, Looker Studio dimensions sourced from GA4, URL query parameters, campaign names, or this repository template:

- person or company names;
- email addresses or phone numbers;
- MC, USDOT, VIN, authority or insurance identifiers;
- addresses, cities tied to a person, routes or load details;
- current website URLs submitted by a prospect;
- budgets, messages, problems, references or other free text;
- contract files, payment details or credentials.

Use a non-identifying `lead_id` generated in the approved sales system. The actual contact record remains in the authorized CRM, inbox or secure operational system.

## Manual lead statuses

Use exactly one current status:

- `new` — explicit handoff exists but no human review yet;
- `contact_attempted` — first human contact attempt recorded;
- `contacted` — two-way contact established;
- `qualified` — need, fit, authority and next commercial step are confirmed;
- `nurture` — plausible fit, but timing or readiness is not current;
- `disqualified` — no fit, invalid request, prohibited use, duplicate or no authority to proceed;
- `proposal` — written commercial proposal or agreement issued;
- `contracted` — agreement accepted or signed;
- `won` — revenue received or approved billable work started;
- `lost` — qualified opportunity did not proceed.

Do not mark a lead `qualified` merely because a preview or email handoff was created.

## Qualification definitions

### Car hauling dispatch

A qualified carrier lead has enough verified context for a human sales decision:

- carrier or owner-operator identity is legitimate;
- MC/USDOT and authority status can be reviewed;
- insurance readiness is known;
- equipment and capacity fit the commercial scope;
- home area, availability and operating preference are usable;
- fleet size and current dispatch relationship are understood;
- the carrier has a real need and controls the final operating decision.

Pending/new authority may be qualified for a readiness service, but not treated as normal active-authority dispatch onboarding until requirements are confirmed.

### Website development

A qualified website lead has:

- a real business or approved project owner;
- new website, redesign or website-plus-SEO need;
- target market and primary business objective;
- realistic scope, timeline and access discussion;
- a next discovery or proposal step.

### SEO services

A qualified SEO lead has:

- a real business and website or approved pre-launch project;
- target U.S. market and search scope;
- a defined visibility, indexing, content, authority or conversion problem;
- known or discussable Search Console and GA4 access;
- a plausible audit, content, links, conversion or full-service need;
- a next discovery, access or proposal step.

## UTM standard

For controlled distribution links use lowercase values and no personal information:

- `utm_source`: platform or partner, for example `linkedin`, `youtube`, `email`, `partner_name_slug`;
- `utm_medium`: `organic_social`, `video`, `email`, `referral`, `community`, `profile`;
- `utm_campaign`: stable campaign name, for example `car_hauler_readiness_2026q3`;
- `utm_content`: asset or placement variant, for example `capacity_checklist_post_01`.

Never place a person's name, email, phone, company-private detail or lead status in a UTM parameter.

## Daily operating procedure

1. Review explicit handoffs from approved contact routes.
2. Create or match a non-identifying `lead_id` in the authorized sales system.
3. Record landing page, service direction and known source/medium.
4. Set status to `new`.
5. Assign one owner and one dated next action.
6. After human contact, update status and add a short non-sensitive qualification reason.
7. Record proposal, contract and revenue stages only when evidence exists.
8. Keep raw contact details outside analytics and outside the repository register.

## Weekly scorecard

Report separately for each direction:

- organic impressions and clicks;
- commercial CTA clicks;
- intake starts;
- previews ready;
- explicit handoffs;
- manually reviewed leads;
- qualified leads;
- proposals;
- contracted/won opportunities;
- expected and actual revenue;
- stage-to-stage conversion rates;
- median time from handoff to first contact;
- top landing pages and sources;
- disqualification reasons;
- unresolved follow-ups past due.

Core formulas:

- CTA rate = commercial CTA clicks / landing sessions;
- intake completion = previews ready / intake starts;
- handoff rate = explicit handoffs / previews ready;
- qualification rate = qualified leads / manually reviewed handoffs;
- proposal rate = proposals / qualified leads;
- win rate = won opportunities / qualified leads;
- revenue per qualified lead = actual revenue / qualified leads.

Do not optimize for raw handoff volume if qualification rate, proposal rate or revenue quality declines.

## Review cadence

- Daily: new handoffs and overdue next actions;
- Weekly: funnel and qualified-lead scorecard;
- Every 28 days: query/page/source comparison and conversion bottlenecks;
- Every 90 days: commercial-page ownership, offer, proof, authority and revenue review.

## Repository template

Use `docs/qualified-lead-register-template.csv` only as a field definition and non-sensitive operating example. A production register must live in the authorized CRM or controlled workspace with appropriate access, retention and privacy controls.
