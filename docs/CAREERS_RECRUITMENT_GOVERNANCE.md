# Hermes Careers — Recruitment and Publication Governance

Purpose: support the central Careers page and future vacancies with consistent qualification, honest claims, structured review, privacy-safe measurement, and reusable communication templates.

## 1. Website & SEO Sales application rubric

Score each category 0–2. A score is a review aid, not an automatic hiring decision.

1. English for U.S. business conversations.
2. Evidence of sales, account management, website, SEO, marketing, CRM, or B2B work.
3. Measurable recent results with enough context to understand the candidate's contribution.
4. Structured discovery and note-taking ability.
5. Follow-up discipline and pipeline organization.
6. Understanding of honest scope: no ranking, revenue, timeline, or client-volume guarantees.
7. Time-zone and schedule compatibility.
8. Stable internet, microphone, and professional communication setup.
9. Russian or Ukrainian for internal coordination or selected client segments.
10. Quality of the written application and ability to follow instructions.

Decision states:

- `priority_review`;
- `interview_review`;
- `practical_task_review`;
- `training_may_fit`;
- `hold_for_future_role`;
- `not_a_fit`.

Do not publish a pass score or imply that reaching a score guarantees an interview or offer.

## 2. Logistics Sales vacancy brief

Working title: `International Sales Manager — Carriers, Dealers & Shippers`.

Role purpose:

- qualify car-hauling carriers and owner-operators;
- identify equipment, authority, service area, and business need;
- support dealer/shipper outreach on verified lanes;
- document conversations and hand off qualified opportunities;
- explain Hermes support without guaranteed load, rate, revenue, insurance, or customer claims.

Required facts before publication:

- active opening confirmed;
- reporting line;
- working hours/time-zone expectations;
- compensation structure approved in writing;
- contractor/employment status;
- target metrics and trial process;
- required language level;
- application route;
- country eligibility;
- privacy notice.

Until those facts are approved, keep this as a vacancy brief rather than a live JobPosting.

## 3. Marketing Sales vacancy brief

Working title: `International Sales Manager — Marketing, Websites & Growth Systems`.

Role purpose:

- find and qualify businesses that may need marketing, websites, SEO, social media, CRM, or automation;
- conduct structured discovery;
- document niche, market, current system, problem, decision-maker, and next action;
- explain the approved Hermes/ProgressoPro scope;
- avoid guarantees for rankings, views, followers, leads, sales, or revenue;
- coordinate proposal and specialist handoff.

Required facts before publication are the same as the logistics vacancy gate.

## 4. JobPosting schema gate

`JobPosting` structured data is allowed only when a real, currently open position is publicly displayed and the visible page contains the same material facts.

Required:

- real title;
- description and responsibilities;
- hiring organization;
- valid application route;
- date posted;
- valid-through date or documented open-ended policy;
- employment/contract type when known;
- remote/location information;
- applicant location requirements;
- compensation only when approved and visible;
- no misleading salary, hiring, immigration, placement, or start-date promises.

Do not add JobPosting schema to a general careers page or a future-role brief.

## 5. Privacy-safe Careers analytics

Allowed event:

```js
{
  event: "career_action",
  role_key: "website_seo_sales",
  action: "view_vacancy" | "start_email_application" | "open_application_section",
  page_path: "/careers/"
}
```

Never send:

- name;
- email;
- phone;
- city;
- employer;
- LinkedIn/portfolio URL;
- message/application content;
- language level entered by the user;
- resume filename;
- query-string application data.

Email links should contain a general role subject and a blank structured template only. Analytics records the click category, not the applicant's values.

## 6. Candidate communication templates

### Application received / under review

Subject: `Hermes application received — [Role]`

`Thank you for sending your application for [Role]. The team will review the information against the current role requirements. Receipt of an application does not guarantee an interview, test, training place, contract, or employment. We will contact you when there is a relevant next step.`

### Request for missing information

`Thank you for your interest in [Role]. Before the team can review the application, please add: country and city, time zone, language levels, relevant experience, recent measurable results, working availability, and a portfolio or LinkedIn profile when available. Please provide factual information and explain your personal contribution to each result.`

### Practical task invitation

`Your background may fit the next review stage. We would like to invite you to a practical evaluation related to [Role]. The task is an assessment only and does not guarantee hiring, payment, a client assignment, or a start date. The task scope, deadline, permitted tools, confidentiality rules, and evaluation criteria will be provided in writing.`

### Interview invitation

`We would like to discuss your application for [Role]. The conversation will cover your experience, language level, availability, examples, and understanding of the work. An interview does not guarantee an offer or contract. Final terms exist only in an approved written agreement.`

### Hold for future role

`Thank you for the application. Your background is not the closest match for the current opening, but parts of your experience may be relevant to a future role. We will not promise a future opening or contact date. You may apply again when a suitable position is published.`

### Rejection

`Thank you for the time you invested in the application. After reviewing the current requirements, we will not continue with this role. This decision applies to the present opening and does not evaluate your overall professional value. We appreciate your interest in Hermes.`

### Training route suggestion

`The current vacancy requires experience or language readiness that is not yet demonstrated in the application. A relevant Hermes Academy or practice route may be a better next step when available. Participation in training does not guarantee later employment.`

## 7. Publication and review checklist

Before publishing any vacancy:

- confirm it is currently open;
- confirm the owner of the hiring decision;
- approve title and responsibilities;
- approve working hours/location;
- approve compensation and legal status, or omit until known;
- define application fields;
- add no-guarantee wording;
- review discrimination and eligibility language;
- ensure privacy-safe intake;
- decide whether JobPosting schema is permitted;
- add sitemap/internal link only while the vacancy is active;
- add reviewed date;
- define removal/expiry process.
