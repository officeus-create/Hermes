# Hermes SEO Growth Sprint — 100 Tasks

Status legend: `[ ]` queued, `[~]` in progress, `[x]` completed.

The sprint is ordered from low-risk technical hygiene to higher-complexity content, authority, data, and automation work. Public claims must remain evidence-backed. Production merge and deployment remain separate approval steps.

## Phase 1 — Crawlability, indexability, and metadata QA

1. [x] Create a dedicated 100-task SEO backlog.
2. [~] Inventory all generated HTML routes after build.
3. [~] Verify every indexable page returns one valid `<title>`.
4. [~] Verify every indexable page has one meta description.
5. [~] Verify every indexable page has exactly one visible H1.
6. [~] Verify every indexable page has a self-referencing absolute canonical.
7. [~] Verify sitemap URLs and rendered canonicals match exactly.
8. [~] Verify sitemap contains only successful canonical URLs.
9. [~] Verify `robots.txt` references the canonical sitemap URL.
10. [~] Verify no important page contains `noindex`.
11. [~] Detect accidental indexable preview, demo, or test pages.
12. [ ] Decide index/noindex policy for `/load-board/` preview content.
13. [~] Detect duplicate titles across built pages.
14. [~] Detect duplicate meta descriptions across built pages.
15. [~] Detect duplicate H1 headings across pages where search intent differs.
16. [~] Detect titles outside a practical SERP readability range.
17. [~] Detect empty or excessively long meta descriptions.
18. [~] Validate canonical URLs do not contain fragments or query strings.
19. [~] Validate canonical host and HTTPS consistency.
20. [~] Add CI failure messages that identify the exact offending route.

## Phase 2 — Multilingual and international SEO

21. [ ] Inventory English, Russian, Ukrainian, Spanish, French, and Italian route pairs.
22. [ ] Verify reciprocal `hreflang` annotations.
23. [ ] Verify each localized page canonical points to the same-language URL.
24. [ ] Verify `x-default` is present where appropriate.
25. [ ] Verify Ukrainian public routes use `/ua/`, not `/uk/`.
26. [ ] Detect untranslated body sections on localized pages.
27. [ ] Detect mixed-language navigation labels.
28. [ ] Detect localized title and description duplication.
29. [ ] Add language-specific Open Graph locale alternatives.
30. [ ] Add multilingual sitemap annotations when route parity is stable.
31. [ ] Create localization QA rules for industry terms that should remain English.
32. [ ] Create translation glossary for carrier, broker, shipper, dispatch, load board, and owner-operator.
33. [ ] Add tests preventing accidental `/uk/` links.
34. [ ] Add tests preventing missing localized home links.
35. [ ] Review localized CTAs for natural search language rather than literal translation.

## Phase 3 — Structured data and search appearance

36. [~] Validate every JSON-LD block parses successfully.
37. [ ] Maintain one stable Organization `@id` across the site.
38. [ ] Maintain one stable WebSite `@id` linked to Organization.
39. [ ] Validate Organization name, URL, logo, phone, email, and `sameAs` values.
40. [ ] Add visible breadcrumbs to deep commercial pages.
41. [ ] Add matching `BreadcrumbList` markup to deep commercial pages.
42. [~] Ensure structured data represents visible page content only.
43. [ ] Add `Service` schema to approved logistics service pages.
44. [~] Remove or avoid unsupported service claims in schema.
45. [~] Add FAQ markup only where the FAQ is visible on the page.
46. [~] Validate schema URLs are absolute HTTPS URLs.
47. [~] Add structured-data regression tests to CI.
48. [ ] Document Rich Results Test and URL Inspection release checks.
49. [ ] Review logo dimensions and crawlability for Organization markup.
50. [ ] Review site-name signals: WebSite name, alternateName, title consistency, and favicon.

## Phase 4 — Internal architecture and commercial landing pages

51. [ ] Build and validate `/logistics/car-hauling-dispatch/`.
52. [ ] Build and validate `/logistics/dealer-vehicle-transportation/`.
53. [ ] Create an auction vehicle transportation content brief.
54. [ ] Create an open car transport content brief.
55. [ ] Create an enclosed car transport content brief.
56. [ ] Create a carrier onboarding content brief.
57. [ ] Create a shipper and dealer intake content brief.
58. [ ] Create a broker collaboration content brief.
59. [ ] Create a port-to-dealer/warehouse coordination brief without claiming warehousing.
60. [ ] Create a luxury and classic vehicle transport coordination brief.
61. [ ] Add contextual links from the logistics hub to approved commercial pages.
62. [ ] Add contextual links between related commercial pages.
63. [ ] Add links from commercial pages to contacts and intake routes.
64. [ ] Add descriptive anchor text; avoid generic “learn more” links.
65. [ ] Detect orphan pages after build.
66. [ ] Detect internal links to redirects or missing pages.
67. [ ] Add visible breadcrumb navigation for users.
68. [ ] Establish hub → service → supporting article architecture.
69. [ ] Keep demo tools separate from primary commercial search intent.
70. [ ] Add a release checklist for new commercial landing pages.

## Phase 5 — Content quality, evidence, and conversion

71. [ ] Create a claims-to-evidence register for every public commercial page.
72. [ ] Ban unsupported guarantees for income, loads, rankings, pickup, delivery, or capacity.
73. [ ] Add “carrier controls final decision” language where operationally relevant.
74. [ ] Add service-scope sections explaining what Hermes does and does not do.
75. [ ] Add onboarding-process sections to reduce uncertainty.
76. [ ] Add equipment compatibility sections based on verified operations.
77. [ ] Add qualification requirements using approved MC/DOT/insurance language.
78. [ ] Add visible updated/reviewed dates where editorial maintenance matters.
79. [ ] Add author/reviewer attribution for expert operational articles when evidence exists.
80. [ ] Add conversion events for phone, email, and approved form submission.
81. [ ] Keep PII out of analytics payloads and URL parameters.
82. [ ] Provide a working contact fallback when forms or APIs fail.
83. [ ] Replace non-working interface controls with honest preview or direct-contact behavior.
84. [ ] Add CTA copy variants by audience: carrier, dealer, shipper, broker, candidate.
85. [ ] Measure landing-page engagement and qualified contact actions in GA4.

## Phase 6 — Performance, media, and mobile search experience

86. [ ] Identify the LCP element for each major template.
87. [ ] Convert oversized hero images to modern formats.
88. [ ] Generate responsive image widths and correct `srcset`/`sizes`.
89. [ ] Keep dimensions on all images to prevent layout shift.
90. [ ] Lazy-load below-the-fold images only.
91. [ ] Preload only the true above-the-fold LCP image.
92. [ ] Reduce unused CSS and avoid template-wide blocking styles where practical.
93. [ ] Reduce unnecessary client JavaScript and hydration.
94. [ ] Validate mobile navigation, tap targets, and keyboard access.
95. [ ] Add performance budgets to CI for image size and generated page weight.

## Phase 7 — Measurement, Search Console, and scalable growth

96. [ ] Connect GA4 reporting through Analytics MCP when the US computer is available.
97. [ ] Export Search Console queries and landing pages for prioritization.
98. [ ] Build a query-to-page cannibalization report.
99. [ ] Create a monthly editorial and refresh queue from impressions, CTR, and position data.
100. [ ] Establish a monthly SEO release cycle: evidence → brief → implementation → QA → publish → inspect → measure.

## Immediate execution batch

The first implementation batch focuses on tasks 2–20 and 36–47: build-output SEO validation, canonical/sitemap consistency, duplicate metadata detection, JSON-LD parsing, H1 validation, and actionable CI errors. These changes improve reliability without inventing new public claims or requiring Google API credentials.
