# Production Measurement Baseline Runbook

Status: `AUTHENTICATED_ACCESS_REQUIRED`  
Supports: Issue #206 and SEO-4 Issue #176  
Purpose: produce the first evidence-backed 7-day and 28-day search, analytics, delivery, qualification, and field-performance baseline without placing private lead data or guessed values in GitHub.

This runbook is an execution protocol, not a completed report. Blank values must remain blank until the relevant authenticated property or private operating record is reviewed.

## Evidence levels

- `REPOSITORY_VERIFIED` — implementation or contract exists in the current repository and CI.
- `PRODUCTION_RECEIVER_VERIFIED` — the approved receiver confirmed delivery; this is not lead qualification.
- `PLATFORM_VERIFIED` — value was read from an authenticated Search Console, Bing Webmaster Tools, GA4, PageSpeed/CrUX, Cloudflare, or other named property.
- `PRIVATE_OPERATIONS_VERIFIED` — a human reviewed the private inquiry and recorded a disposition in an owner-controlled system.
- `UNVERIFIED` — no authenticated or owner-controlled evidence was reviewed.

## Safety boundary

Never store the following in this repository, issue comments, screenshots attached to GitHub, analytics parameters, or public artifacts:

- names, email addresses, phone numbers, companies, MC/USDOT numbers, VINs;
- pickup/delivery addresses, routes, messages, documents, rates, budgets, contracts;
- candidate applications, customer/carrier identities, credentials, cookies, API keys;
- complete GA4 user/event exports, inbox messages, CRM records, or row-level lead data.

GitHub may contain only public-safe definitions, aggregate counts, date ranges, property identifiers that are already public-safe, query/page groups, methodology, status, and sanitized evidence references.

---

# 1. Baseline identity and date window

Complete privately before collecting numbers.

| Field | Required value |
| --- | --- |
| Baseline owner | Authenticated human or approved agent |
| Collection date/time and timezone | Exact timestamp |
| Primary domain | `https://hermeslogisticsus.com/` |
| 7-day window | Exact inclusive dates |
| Previous comparable 7-day window | Exact inclusive dates |
| 28-day window | Exact inclusive dates |
| Previous comparable 28-day window | Exact inclusive dates |
| Search Console property | Exact verified property |
| Bing property | Exact verified site |
| GA4 property and web stream | Exact authenticated property/stream |
| Delivery evidence source | Approved receiver/log source |
| Private qualification source | Owner-controlled CRM/Sheet/operations system |
| Field-performance source | CrUX/PageSpeed field data where available |

Do not mix timezones or compare partial current days with complete prior days without labeling the limitation.

---

# 2. Google Search Console baseline

## Required checks

1. Confirm the exact verified property and preferred canonical domain.
2. Record Indexing → Pages counts by current reason, not only the headline total.
3. Inspect Sitemaps and record the submitted sitemap files, last read date, discovered URLs, and errors.
4. Use Performance → Search results with Web search, the exact baseline window, and no guessed filters.
5. Export privately and aggregate by:
   - canonical money page;
   - business direction;
   - branded vs non-branded query group;
   - country;
   - device;
   - query intent group.
6. Review URL Inspection for the priority pages only when necessary; do not repeatedly request indexing without a material change.

## Priority page groups

- Homepage and role routing;
- Car Hauling Dispatch and direct carrier intake;
- Dealer Vehicle Transportation and direct transport intake;
- Shipper/dealer and broker paths;
- Logistics SEO;
- Website Development;
- Marketing path;
- Academy path and application;
- Technology path and project brief;
- Appleton and current Wisconsin commercial pages.

## Public-safe output

| Metric | 7 days | Prior 7 days | 28 days | Prior 28 days | Evidence level | Notes |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Total clicks |  |  |  |  | `PLATFORM_VERIFIED` |  |
| Total impressions |  |  |  |  | `PLATFORM_VERIFIED` |  |
| CTR |  |  |  |  | `PLATFORM_VERIFIED` |  |
| Average position |  |  |  |  | `PLATFORM_VERIFIED` | Interpret cautiously. |
| Non-branded clicks |  |  |  |  | `PLATFORM_VERIFIED` | Query-group method required. |
| Money-page clicks |  |  |  |  | `PLATFORM_VERIFIED` | Exact route list required. |
| Indexed canonical money pages |  |  |  |  | `PLATFORM_VERIFIED` | Not inferred from sitemap alone. |
| Pages excluded by unexpected reason |  |  |  |  | `PLATFORM_VERIFIED` | List reason and affected route group. |

No Search Console value may be inferred from repository page counts or sitemap output.

---

# 3. Bing Webmaster Tools baseline

1. Confirm the exact authenticated site.
2. Record sitemap status and crawl/index issues.
3. Capture search clicks, impressions, CTR, and average position for the same exact date windows where available.
4. Record priority page and query groups using the same taxonomy as Search Console.
5. Keep Bing values separate from Google values; do not combine them into one search total unless the method is explicit.

Public-safe aggregate table:

| Metric | 7 days | 28 days | Evidence level | Notes |
| --- | ---: | ---: | --- | --- |
| Bing clicks |  |  | `PLATFORM_VERIFIED` |  |
| Bing impressions |  |  | `PLATFORM_VERIFIED` |  |
| Indexed priority pages |  |  | `PLATFORM_VERIFIED` |  |
| Crawl/index issues |  |  | `PLATFORM_VERIFIED` | Aggregate by reason. |

---

# 4. GA4 implementation and event verification

Use `docs/PRODUCTION_ANALYTICS_EVENT_REGISTRY.md` as the implementation inventory. Repository presence or a `dataLayer.push` call does not prove that GA4 receives, stores, or reports the event.

## Verification sequence

1. Confirm the authenticated GA4 property and web stream belong to the production domain.
2. Confirm the production tag/measurement setup and consent behavior.
3. Use DebugView or Realtime only for controlled synthetic tests with no private values.
4. For each approved event:
   - trigger the exact production action;
   - confirm event receipt;
   - confirm allowed parameters only;
   - verify no names, email, phone, MC/USDOT, route, VIN, message, budget, or free text;
   - record GA4 status as `VERIFIED`, `NOT_RECEIVED`, `WRONG_PROPERTY`, `PARAMETER_VIOLATION`, or `NOT_TESTED`.
5. Verify that `delivery_confirmed` requires approved receiver confirmation and is not fired by click, preview, or browser-only success.
6. Do not mark human qualification as a public GA4 event unless an approved privacy-safe aggregate bridge exists.

## Event verification register

| Event | Route/action tested | GA4 received | Allowed parameters verified | Private-value check | Evidence date | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `homepage_role_click` |  |  |  |  |  | `NOT_TESTED` |
| commercial CTA event(s) |  |  |  |  |  | `NOT_TESTED` |
| intake start event(s) |  |  |  |  |  | `NOT_TESTED` |
| preview/review ready event(s) |  |  |  |  |  | `NOT_TESTED` |
| fallback email/phone event(s) |  |  |  |  |  | `NOT_TESTED` |
| handoff event(s) |  |  |  |  |  | `NOT_TESTED` |
| `delivery_confirmed` or direction-specific confirmed delivery |  |  |  |  |  | `NOT_TESTED` |

## Public-safe GA4 aggregates

| Metric | 7 days | Prior 7 days | 28 days | Prior 28 days | Evidence level |
| --- | ---: | ---: | ---: | ---: | --- |
| Users/sessions on priority landing pages |  |  |  |  | `PLATFORM_VERIFIED` |
| Primary CTA actions |  |  |  |  | `PLATFORM_VERIFIED` |
| Intake starts |  |  |  |  | `PLATFORM_VERIFIED` |
| Review/preview ready |  |  |  |  | `PLATFORM_VERIFIED` |
| Explicit handoffs |  |  |  |  | `PLATFORM_VERIFIED` |
| Receiver-confirmed deliveries |  |  |  |  | `PLATFORM_VERIFIED` plus receiver evidence |
| Fallback email/phone actions |  |  |  |  | `PLATFORM_VERIFIED` |

---

# 5. Delivered inquiry reconciliation

Use receiver-confirmed delivery as the beginning of private reconciliation, not as a qualified lead.

## Private minimum fields

Store only in an owner-controlled private system:

- internal inquiry ID or hashed reconciliation key;
- received timestamp;
- business direction and form/route group;
- delivery status and approved destination;
- duplicate/synthetic/spam/test exclusion status;
- first human review timestamp;
- qualification disposition from `docs/QUALIFIED_INQUIRY_DEFINITIONS.md`;
- reason code;
- next action and private owner;
- final outcome when known.

Do not copy row-level records into GitHub.

## Aggregate funnel

| Stage | 7 days | Prior 7 days | 28 days | Prior 28 days | Evidence level |
| --- | ---: | ---: | ---: | ---: | --- |
| Receiver-confirmed deliveries |  |  |  |  | `PRODUCTION_RECEIVER_VERIFIED` |
| Excluded synthetic/test/duplicate/spam |  |  |  |  | `PRIVATE_OPERATIONS_VERIFIED` |
| Human-reviewed inquiries |  |  |  |  | `PRIVATE_OPERATIONS_VERIFIED` |
| Qualified inquiries |  |  |  |  | `PRIVATE_OPERATIONS_VERIFIED` |
| Needs clarification |  |  |  |  | `PRIVATE_OPERATIONS_VERIFIED` |
| Not qualified |  |  |  |  | `PRIVATE_OPERATIONS_VERIFIED` |
| No response / unreachable |  |  |  |  | `PRIVATE_OPERATIONS_VERIFIED` |
| Sales/operations next step accepted |  |  |  |  | `PRIVATE_OPERATIONS_VERIFIED` |

Recommended rates, calculated only when denominator is non-zero and definitions are unchanged:

- delivery-to-human-review rate;
- human-review-to-qualified rate;
- landing-session-to-primary-CTA rate;
- intake-start-to-handoff rate;
- handoff-to-confirmed-delivery rate;
- confirmed-delivery-to-qualified rate;
- qualified-to-next-step rate.

---

# 6. Direction-specific qualified inquiry baseline

Use the current approved definitions without weakening them to increase counts.

| Direction | Delivered | Human reviewed | Qualified | Needs clarification | Not qualified | Definition version/date |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Carrier / dispatch |  |  |  |  |  |  |
| Dealer/customer transport |  |  |  |  |  |  |
| Shipper/broker |  |  |  |  |  |  |
| SEO/Marketing |  |  |  |  |  |  |
| Website/automation |  |  |  |  |  |  |
| Academy |  |  |  |  |  |  |
| Partner/agency/careers |  |  |  |  |  |  |

A delivered message is not qualified merely because all form fields were completed.

---

# 7. Field Core Web Vitals and production performance

Repository build budgets and Playwright tests are laboratory evidence. They do not replace field data.

## Required sources

- PageSpeed Insights field data / CrUX where sufficient data exists;
- Search Console Core Web Vitals group data;
- Cloudflare production timing only when authenticated and interpreted correctly;
- optional controlled Lighthouse lab runs, labeled separately.

## Priority routes

- `/`;
- `/logistics/car-hauling-dispatch/`;
- `/logistics/dealer-vehicle-transportation/`;
- `/logistics/start-car-hauling-dispatch/`;
- `/logistics/request-vehicle-transport/`;
- `/services/seo-for-logistics-companies/`;
- `/services/website-development/`;
- `/paths/marketing/`;
- `/paths/academy/`;
- `/paths/technology/`.

## Results table

| Route/group | Mobile LCP | Mobile INP | Mobile CLS | Desktop field status | Source/date | Status |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Homepage |  |  |  |  |  | `UNVERIFIED` |
| Logistics money pages |  |  |  |  |  | `UNVERIFIED` |
| Digital money pages |  |  |  |  |  | `UNVERIFIED` |
| Academy/Technology paths |  |  |  |  |  | `UNVERIFIED` |

If field data is unavailable because traffic is insufficient, state `INSUFFICIENT_FIELD_DATA`; do not substitute a single Lighthouse run and call it field performance.

---

# 8. Mobile task test

Run at approximately 375 px width on a real or appropriately emulated mobile device under a constrained network profile.

Tasks:

1. Carrier finds dispatch support and reaches direct intake.
2. Dealer/customer prepares vehicle transport request.
3. Shipper understands carrier review and reaches intake.
4. Logistics SEO buyer finds the first engagement scope.
5. Website buyer finds project brief/contact route.
6. Academy applicant understands human review and reaches application.
7. Marketing buyer understands engagement levels.
8. Partner understands evidence and non-endorsement boundary.

Record only aggregate results:

| Task | Participants/runs | Completion rate | Median time | Main failure point | Evidence level |
| --- | ---: | ---: | ---: | --- | --- |
|  |  |  |  |  | `PLATFORM_VERIFIED` or `PRIVATE_OPERATIONS_VERIFIED` |

Do not store participant identity, screen recordings with private information, or submitted lead values in GitHub.

---

# 9. Baseline interpretation

Every conclusion must identify:

- source;
- exact date window;
- comparison window;
- denominator;
- route/query/event grouping;
- definition version;
- known missing data;
- whether the result is correlation or a tested causal effect.

Prohibited conclusions without evidence:

- “SEO is working” from impressions alone;
- “the form converts” from CTA clicks alone;
- “we received leads” from preview or handoff events;
- “the lead was qualified” from delivery confirmation;
- “performance is good” from repository budgets alone;
- “a page should be expanded” without indexing, query, conversion, and differentiation evidence.

---

# 10. Completion checklist

The first production baseline is complete only when:

- [ ] exact 7-day and 28-day windows are recorded;
- [ ] authenticated Search Console values are recorded;
- [ ] authenticated Bing values are recorded or explicitly unavailable;
- [ ] GA4 property and production event receipt are verified event by event;
- [ ] private delivered inquiries are reconciled to human dispositions;
- [ ] qualified inquiries use the approved direction-specific definitions;
- [ ] synthetic, duplicate, spam, and test submissions are excluded;
- [ ] field CWV is recorded or marked insufficient with source/date;
- [ ] a mobile task-test baseline is recorded;
- [ ] all public outputs are aggregate and privacy-safe;
- [ ] no guessed number is used;
- [ ] the next 7-day and 28-day review dates are assigned.

Repository status after this runbook: methodology ready; production values remain `UNVERIFIED` until authenticated execution is completed.
