# London Measurement & Launch

## 61–70 Conversion and analytics
61. Acquisition source convention: `source=london` plus a specific `service` or `track` parameter on London CTAs.
62. BusinessLeadForm attribution: service pages route to `/business-growth/` with an existing supported service alias so `CampaignLeadPrefill` can pre-select the service.
63. Academy attribution: training CTAs use `source=london&track=<track>`; retain track in downstream intake when the Academy form pipeline adds/reads this parameter.
64. Primary conversions: business inquiry submitted; Academy application submitted.
65. Secondary conversion: qualified click from London page into business inquiry or Academy apply.
66. Form-completion event should include market=`london`, route, service/track and locale, never free-text PII.
67. Service CTA tracking dimensions: source page, service intent, locale.
68. Course CTA tracking dimensions: source page, track intent, locale.
69. Production QA after deploy: verify analytics exact-once, query preservation, consent behaviour and no PII in event parameters.
70. Dashboard/query plan: sessions → qualified CTA → form start → form submit → accepted lead/application, segmented by service/track, locale and landing route.

## 91–97 QA gates
91. Production build must pass on current PR head.
92. Internal-link audit must pass and find no obsolete `/uk/london/` routes.
93. Hreflang audit must pass for EN/RU/UA London foundation pages.
94. Sitemap checks must confirm `sitemap-london.xml` is valid and registered in `sitemapindex.xml`.
95. Existing SEO hygiene tests must stay green; never weaken a guardrail to make London pass.
96. Mobile QA at <=800px: cards collapse to one column, CTAs wrap without overflow, headings remain readable, forms retain usable tap targets.
97. Cannibalisation review: each indexed page must have a distinct primary intent. Merge/noindex pages that show the same query/impression pattern instead of multiplying near-duplicates.

## 98. Search Console submission plan
After production deploy and HTTP 200 verification, submit/refresh `sitemapindex.xml`; inspect the London hub plus representative service, vertical and Academy URLs. Do not request indexing for broken, redirected, duplicate or noindex pages.

## 99. 30-day KPI baseline
Record at launch and day 7/14/30:
- indexed London URLs / submitted London URLs
- impressions and clicks by landing page/query
- non-brand London query count
- qualified CTA clicks
- business form starts/submits
- Academy apply clicks/submits
- top 10 pages by impressions
- pages with zero impressions after sufficient crawl time
- sales: contacted prospects, replies, audits, meetings, proposals, wins, loss reasons

Do not set fabricated traffic/ranking targets before baseline data exists.

## 100. Iteration rules
- Impressions, no clicks: improve title/description/intent match before adding more pages.
- Clicks, no CTA: improve offer/proof/page-to-CTA alignment.
- CTA clicks, no submit: inspect form friction and lead expectations.
- Leads, poor quality: narrow intent and qualifying copy.
- One niche outperforms: deepen that niche before expanding borough/city coverage.
- Near-duplicate pages share the same queries: consolidate.
- Academy interest but weak English readiness: route to readiness material before live-communication tracks.
- No London signal: do not scale content volume blindly; validate demand through outreach and direct customer conversations.