# Claude Execution Queue — 200 Tasks

Purpose: give Claude a conflict-safe, evidence-first queue for finishing the Hermes website, completing development, and then expanding SEO and commercial growth.

Rules for every task:

- work from a branch and PR, never directly on `main`;
- check open and recently merged PRs before editing;
- do not replace another PR's file wholesale when reconciliation is required;
- run build, static/unit tests, and browser tests when the task changes runtime behavior;
- no secrets, billing, DNS, Cloudflare account, production deploy, merge, deletion, or irreversible action without owner approval;
- no invented routes, demand, competition, prices, customers, results, income, loads, rankings, approvals, or hiring claims;
- location/language pages require evidence, unique value, and a publication score of at least 7/10;
- continue to the next independent item when a task is blocked.

## A. Coordination, branch health, and source-of-truth cleanup

1. Review `CLAUDE.md`, `AGENTS.md`, `docs/AI_ROLES.md`, and `docs/AI_HANDOFF.md`.
2. Inventory every open PR and record its branch, base, changed files, checks, and blocker.
3. Inventory recently merged PRs that changed SEO, layouts, schema, analytics, navigation, or tests.
4. Compare PR #13 with current `main` and record stale assumptions.
5. Compare PR #19 with current `main` and record stale assumptions.
6. Record the exact overlap between PR #13 and PR #19.
7. Preserve localized hero alt text from merged PR #15.
8. Preserve preconnect and alternate Open Graph locale changes from merged PR #16.
9. Preserve breadcrumb schema and safe external-link hardening from merged PR #17.
10. Review PR #7 and confirm whether `#journey` is still absent on current `main`.
11. Run or verify browser tests for PR #7 before any merge recommendation.
12. Review PR #9 and identify which commercial logistics work is already superseded.
13. Review PR #6 and identify which Academy baseline notes remain useful.
14. Create a single branch-conflict matrix for all active work.
15. Create a source-of-truth index for product facts, service claims, pricing, and contact information.
16. Mark obsolete handoff instructions that reference legacy APIs or old architecture.
17. Mark duplicate AI recommendations to prevent repeat implementation.
18. Record every owner-only gate: merge, deploy, DNS, billing, secrets, deletion, outbound communication.
19. Create a clean next-action handoff after each completed batch.
20. Keep all unresolved blockers visible rather than silently guessing.

## B. Finish core website development

21. Verify the current production route inventory against the repository route inventory.
22. Verify every homepage navigation target and frozen anchor contract.
23. Verify `#main-content`, `#paths`, `#journey`, `#about`, and `#contact` behavior.
24. Verify desktop keyboard navigation across the homepage.
25. Verify mobile navigation, focus order, and menu dismissal.
26. Verify reduced-motion behavior for animations and transitions.
27. Verify all direct phone links use valid `tel:` values.
28. Verify desktop phone fallback guidance remains usable.
29. Verify all direct email links use correct subjects and recipients.
30. Verify preview forms do not claim delivery when no delivery occurs.
31. Verify production forms actually deliver only when live mode is enabled.
32. Verify consent is never preselected or fabricated.
33. Verify no placeholder applicant/customer email is submitted as a real lead.
34. Verify all Cloudflare Functions validate origin, method, content type, and body size.
35. Verify rate limiting uses durable/shared infrastructure rather than process-local memory.
36. Verify idempotency and duplicate-submission handling.
37. Verify no PII is written to analytics events.
38. Verify no secrets or environment values appear in generated client code.
39. Verify all preview/demo routes are clearly labeled.
40. Verify non-production demos are `noindex` when appropriate.
41. Verify 404 behavior for unknown routes.
42. Verify canonical host redirect behavior for `www` and non-`www`.
43. Verify HTTP-to-HTTPS behavior.
44. Verify trailing-slash consistency.
45. Verify localized paths use `/ua/`, not `/uk/`.
46. Verify language switching preserves a valid destination.
47. Verify localized pages contain no broken English fallback fragments.
48. Verify footer links and legal links on every route family.
49. Verify privacy policy coverage for analytics, forms, careers, and future APIs.
50. Produce a development-completion defect list ranked P0–P3.

## C. Test automation and release safety

51. Reconcile PR #13 and PR #19 `package.json` test scripts.
52. Reconcile PR #13 and PR #19 `public/sitemap.xml` entries.
53. Keep all technical SEO audit scripts in the combined test command.
54. Keep Careers regression tests in the combined test command.
55. Keep lane-opportunity scoring tests.
56. Keep multilingual logistics registry tests.
57. Keep growth-research registry tests.
58. Add a frozen-anchor regression test.
59. Add a route-inventory regression test.
60. Add a canonical-host regression test where test architecture allows it.
61. Add a no-PII analytics-event test.
62. Add a consent-state regression test.
63. Add a preview-versus-live contact-mode regression test.
64. Add a structured-data parsing test for critical route families.
65. Add a sitemap-versus-build consistency test.
66. Add an internal-link orphan-page test.
67. Add a language-alternate reciprocity test.
68. Add a page-title and description uniqueness test.
69. Add a one-visible-H1 test.
70. Add an image dimension and missing-alt audit.
71. Add a keyboard/tap-target smoke test for new templates.
72. Add a page-weight budget for new routes.
73. Add an LCP-image priority check.
74. Add a no-index leakage check for demos and private previews.
75. Run `npm run build` after every runtime batch.
76. Run `npm test` after every runtime batch.
77. Run `npm run test:e2e` after every interactive batch.
78. Repair flaky tests without weakening real safety assertions.
79. Publish a test evidence table in each PR description.
80. Do not mark a release ready until the latest head commit has green CI.

## D. Technical SEO completion

81. Verify unique titles across all indexable pages.
82. Verify useful meta descriptions across all indexable pages.
83. Verify one canonical URL per indexable page.
84. Verify canonical URL matches sitemap URL.
85. Verify robots meta state matches sitemap inclusion.
86. Verify Open Graph title, description, URL, image, and locale.
87. Verify Twitter Card metadata.
88. Verify Organization entity consistency.
89. Verify WebSite entity consistency.
90. Verify Service schema only uses supported service claims.
91. Verify BreadcrumbList schema on commercial and path pages.
92. Verify FAQ schema questions are visible in page content.
93. Verify Course schema is withheld until program facts are approved.
94. Verify JobPosting schema is withheld unless the role is currently open and fully specified.
95. Verify hreflang reciprocity for all localized pages.
96. Verify `x-default` behavior.
97. Verify localized canonical URLs.
98. Verify no accidental `/uk/` URLs.
99. Verify no thin location pages enter the sitemap.
100. Verify no duplicate localized titles/descriptions.
101. Audit orphan pages and click depth.
102. Audit anchor text for descriptive internal linking.
103. Audit image formats, dimensions, and responsive variants.
104. Audit render-blocking CSS and JavaScript.
105. Audit unused client JavaScript.
106. Audit mobile LCP and CLS risks.
107. Audit third-party connection cost from analytics scripts.
108. Audit Cloudflare cache behavior separately from SEO conclusions.
109. Create a technical SEO release checklist for every new route.
110. Create a monthly technical SEO regression report template.

## E. Logistics carrier and owner-operator growth

111. Confirm the 20 approved Hermes carrier value categories against source documents.
112. Separate coordination/support language from guaranteed outcomes.
113. Preserve carrier control over loads, rates, equipment, insurance, and business decisions.
114. Preserve the two-department positioning only where the signed service scope supports it.
115. Keep direct-freight timelines approximate and non-guaranteed.
116. Locate the actual historical origin-to-destination route export.
117. Remove names, phones, addresses, VINs, and other private fields from route research.
118. Normalize city, state, ZIP, equipment, and dates.
119. Deduplicate repeated lane records.
120. Create provenance for every retained route row.
121. Score lane evidence without guessed values.
122. Score real demand evidence.
123. Score competition using dated SERP research.
124. Score Hermes operational fit.
125. Score unique local value.
126. Block every lane below the 7/10 publication threshold.
127. Create the first verified pilot-lane shortlist.
128. Create carrier research records linked to source IDs.
129. Create equipment clusters for open car haulers.
130. Create equipment clusters for enclosed car haulers.
131. Create equipment clusters for hotshot car haulers.
132. Create equipment clusters for multi-car trailers.
133. Create problem clusters for load search.
134. Create problem clusters for backhaul and deadhead.
135. Create problem clusters for documents and setup.
136. Create problem clusters for rate negotiation support.
137. Create problem clusters for direct shipper/dealer development.
138. Create third-party vendor-introduction boundaries for insurance, trucks, and trailers.
139. Research English carrier queries first.
140. Research Spanish carrier queries where measurable demand exists.
141. Research Russian carrier queries where measurable demand exists.
142. Research Ukrainian carrier queries where measurable demand exists.
143. Keep Romanian, Lithuanian, Hindi, Punjabi, and Gujarati research-only until thresholds are met.
144. Create natural multilingual logistics terminology reviews.
145. Create carrier CTA variants by equipment and operating stage.
146. Create internal links from carrier problems to verified service hubs.
147. Create no-guarantee FAQ language.
148. Create carrier qualification and onboarding content without approval promises.
149. Create a carrier content refresh schedule.
150. Measure carrier impressions, clicks, qualified inquiries, and cannibalization without PII.

## F. Dealers, shippers, brokers, and transport customers

151. Link dealer/shipper demand records only to verified carrier lanes.
152. Define independent-dealer transport intent.
153. Define dealer-group relocation intent.
154. Define auction pickup intent.
155. Define remarketing-volume intent.
156. Define classic/luxury vehicle intent.
157. Define port or storage pickup intent without warehousing claims.
158. Define private-customer qualification intent.
159. Define broker opportunity qualification.
160. Define recurring-volume shipper qualification.
161. Confirm real carrier capacity before publishing customer-demand pages.
162. Require dated local demand evidence.
163. Require dated competition evidence.
164. Require unique operational guidance per route.
165. Create dealer CTA variants.
166. Create shipper CTA variants.
167. Create broker CTA variants.
168. Create private-customer CTA variants.
169. Create lane-pair internal linking rules.
170. Measure qualified customer demand without exposing private shipment data.

## G. Website creation, SEO, and marketing services

171. Confirm the national website-creation service scope.
172. Confirm the website-redesign service scope.
173. Confirm multilingual website capabilities.
174. Confirm SEO service scope.
175. Confirm Local SEO service scope.
176. Confirm CRM and automation boundaries.
177. Create an approved proof/prototype register.
178. Create a case-study evidence standard.
179. Create a U.S. niche-and-location research registry.
180. Score demand, competition, proof, and service fit.
181. Build a national website-creation hub before geo pages.
182. Build a national website-redesign hub before geo pages.
183. Build a national SEO hub before geo pages.
184. Build a national Local SEO hub before geo pages.
185. Build an SEO-for-logistics-companies page after proof review.
186. Build an SEO-for-independent-auto-dealers page after proof review.
187. Research beauty, education, professional services, and home services separately.
188. Create audit, redesign, new-build, SEO, and Local SEO CTA variants.
189. Create Russian-language marketing services only after response-capacity validation.
190. Create Ukrainian-language marketing services only after response-capacity validation.

## H. Academy, Careers, release, and continuous promotion

191. Keep Academy limited to U.S. logistics and marketing programs.
192. Hide `$999`, `$400/month`, and `$600/month` pricing until written facts and policies are approved.
193. Separate paid enrollment from free practice or scholarship tracks.
194. Publish no employment, income, client, load, ranking, view, or lead guarantees.
195. Finish central Careers route and approved vacancy pages.
196. Apply JobPosting schema only to verified open roles.
197. Add privacy-safe career conversion measurement.
198. Produce the final current-main reconciliation and full green CI report.
199. Request owner approval only for the exact merge/deploy package after all blockers are visible.
200. After release, continue the cycle: Search Console and analytics evidence → next safe page → tests → publish gate → measure → refresh.

## Claude's current known decision gates

- PR #7: browser-test verification and owner merge decision.
- PR #13: reconcile with current `main` and PR #19 before merge review.
- PR #19: synchronize with current `main`, preserve merged Claude work, reconcile shared files, and obtain green CI.
- Production: merge and deploy remain owner-only decisions.
- Historical lane pages: blocked until the real route export is located.
- Academy pricing: blocked until written program and payment facts are approved.
- Multilingual/location expansion: blocked until dated demand, competition, service-capacity, payment, and compliance evidence exists.
