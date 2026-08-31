# London Sprint 2 — Prospecting, Measurement, CRM

This file completes actions 61–80 from issue #915.

## 61–70 Prospect segments and scoring
61. **Auto repair:** prioritise independent garages with weak/mobile-broken websites, incomplete service pages, unclear booking CTA, weak review response, inconsistent GBP/site data or no visible lead tracking. Avoid chains with central procurement unless a local decision-maker is identifiable.
62. **Beauty salons:** prioritise businesses with strong visual work but weak website conversion, no treatment/service landing structure, poor booking handoff, inconsistent social-to-site CTA or weak local-search coverage.
63. **Dental:** prioritise independent/private practices with outdated service pages, weak mobile enquiry path, missing treatment intent pages, poor trust/proof organisation or unclear new-patient CTA. Do not make clinical efficacy claims.
64. **Restaurants:** prioritise venues with weak mobile menu/reservation paths, inconsistent hours/location information, no clear private-event/catering conversion, poor GBP/site consistency or social reach that does not convert to reservations.
65. **Contractors:** prioritise roofers/builders/electricians/plumbers and similar businesses with weak service-area explanation, few service pages, poor enquiry path, missing proof/case evidence or unclear emergency/quote CTA.
66. **Cleaning:** prioritise local residential/commercial cleaners with generic websites, unclear coverage, weak quote flow, no segment-specific pages, poor review capture or social pages disconnected from enquiries.
67. **Home services:** prioritise HVAC, locksmith, pest, landscaping, moving and similar local operators with high-intent demand but poor mobile conversion, incomplete location/service information or weak follow-up.
68. **Professional services:** prioritise accountants, consultants, small legal/business advisory and similar firms where expertise is visible but positioning, service pages, lead qualification or thought-leadership distribution is weak. Avoid regulated claims unsupported by the client.
69. **Logistics companies:** prioritise small freight/logistics/carrier-facing businesses with dated sites, vague service differentiation, weak shipper/carrier CTA separation, poor content authority or no measurable enquiry routing.
70. **Prospect scoring model (0–20):** +0–4 search opportunity, +0–4 website/conversion gap, +0–3 proof/assets available, +0–3 apparent ability to serve more customers, +0–2 decision-maker accessibility, +0–2 fit with Hermes existing capability, +0–2 urgency signal. Pursue 14+ first; 10–13 nurture; <10 deprioritise unless a strong trigger appears.

## 71–80 Measurement and CRM operating model
71. **Source taxonomy:** `utm_source` identifies origin (`london`, partner/referral, organic-social platform, email-outreach); never overload source with service name.
72. **Campaign taxonomy:** use durable kebab-case campaigns such as `london-services`, `london-academy`, `london-guides`, `london-outreach`, `london-partners`; campaign names describe initiative, not individual creative.
73. **Content taxonomy:** `utm_content` carries route/creative identity such as `seo-services`, `auto-repair-marketing`, `dispatcher-vs-load-planner`, `cold-email-website-v1`.
74. **Service intent taxonomy:** preserve supported service aliases: `website-development`, `seo`, `local-seo` where supported, `smm`, `meta-ads`, `crm`, `content`, `marketing`; map aliases to the receiving form’s existing contract rather than inventing parallel values.
75. **Academy track taxonomy:** use stable program `us-logistics-operations`; track/context may identify foundations, dispatcher, load-planner, carrier-sales, shipper-dealer-sales, negotiation or english-readiness without implying job placement.
76. **Lead stages:** New → Validated → Contacted → Discovery Scheduled → Discovery Complete → Proposal Needed → Disqualified/Not Now. Every disqualification gets a reason.
77. **Sales stages:** Proposal Sent → Follow-up → Negotiation/Scope → Verbal Yes → Contract/Payment Pending → Won → Lost. Never count proposal or verbal interest as revenue.
78. **Weekly KPI scorecard:** prospects researched; qualified prospects; outreach sent; positive replies; audits requested; discovery calls; proposals; wins; applications; qualified Academy applicants; landing-page sessions; CTA events; completed forms; source/campaign completeness. Report conversion rates only where denominator is meaningful.
79. **30-day experiment rules:** change one major variable per test where possible; record baseline; define target behaviour before launch; do not stop solely on vanity metrics; minimum useful sample beats arbitrary calendar completion; retain failed-test learning; escalate only when conversion or qualified-pipeline evidence improves.
80. **Attribution QA:** confirm every London CTA uses standard UTM fields; confirm service/program prefill survives navigation; confirm receiving form preserves allowed UTM values; confirm no PII enters analytics event names/parameters; confirm consent blocks analytics before opt-in; verify one test lead end-to-end before relying on dashboard totals.
