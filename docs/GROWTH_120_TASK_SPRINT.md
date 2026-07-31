# Hermes Continuous Growth Sprint — 120 Tasks

Canonical tracker: GitHub Issue #18.

Implementation remains isolated in draft PR #19. No merge or production release is allowed without separate owner approval.

## Priority order

1. Car hauling carriers and owner-operators.
2. Dealers, shippers, brokers, and customers on matching verified lanes.
3. Website creation, SEO, and Local SEO for the U.S. market.
4. Marketing for Russian- and Ukrainian-speaking business owners in eligible international markets.
5. Academy programs in U.S. logistics and marketing only.
6. Careers, localization, measurement, performance, and safe cross-AI recommendations.

## Status of the original 100-task scope

Tasks 1–22 and 24–100 have implementation or governance deliverables in PR #19. Task 23 remains blocked because the full historical origin-to-destination route export has not been located. No route, demand level, competition score, or ranking opportunity may be guessed.

The latest verified CI before this extension was Website checks run #225, completed successfully for commit `8e4d4f371bf52e5a98e28c7e0aa97cd555b125f3`.

## Tasks 101–120

### Conflict-safe implementation expansion

101. [x] Re-check Claude PRs #15–#17 and record their merged scope before continuing.
102. [x] Re-check file overlap between PR #13 and PR #19 and document the reconciliation paths.
103. [x] Create a current-main synchronization plan that preserves Claude changes and both PR implementations.
104. [x] Create an executable lane-opportunity scoring module using only evidence fields, never guessed values.
105. [x] Add isolated automated tests for lane scoring, publish thresholds, and blocked records.
106. [x] Create a typed logistics language-eligibility registry for English, Spanish, Russian, Ukrainian, Romanian, Lithuanian, Hindi, Punjabi, and Gujarati.
107. [x] Create a typed car-hauler keyword registry by equipment, operating stage, problem, lane intent, and language.
108. [ ] Create a carrier-page research-record schema with source, review date, demand evidence, competition evidence, and publication status.
109. [ ] Create a paired dealer/shipper demand-record schema linked to verified carrier lanes.
110. [ ] Produce the first evidence-only pilot-lane queue after the historical route export is located; keep blocked until then.
111. [ ] Create a U.S. website/SEO market research registry for niche, location, evidence, competition, and service fit.
112. [ ] Create an implementation-ready route architecture for website creation and SEO/Local SEO services without doorway pages.
113. [ ] Implement the first website-creation service landing page after conflict review and proof validation.
114. [ ] Implement the first SEO/Local SEO service landing page after conflict review and proof validation.
115. [ ] Create a reviewed international-market registry for Russian- and Ukrainian-language marketing demand.
116. [ ] Implement the Russian-language marketing hub after market, payment, compliance, and service-capacity validation.
117. [ ] Implement the Ukrainian-language marketing hub after the same validation.
118. [ ] Implement an Academy overview limited to U.S. logistics and marketing, with unverified pricing hidden.
119. [ ] Extend Careers with approved vacancy categories, JobPosting eligibility gates, and privacy-safe measurement tests.
120. [ ] Produce the final 120-task release report, current-main conflict reconciliation, full CI verification, and owner approval checklist.

## Publication gate

A geo or language page must score at least 7/10:

- verified route, demand, or commercial evidence: 0–2;
- genuinely weak competition: 0–2;
- real Hermes service fit: 0–2;
- unique local or language value: 0–2;
- crawlable internal link and useful CTA: 0–1;
- approved source with review date: 0–1.

Pages below the threshold remain research records and are not published.

## Continuous execution rule

For every task:

1. inspect current and recently merged AI PRs;
2. retrieve actual source data;
3. classify evidence, overlap, and risk;
4. implement the smallest safe batch;
5. run available build, unit, static, and browser checks;
6. repair failures;
7. document results and blockers;
8. continue to the next independent task when one item is blocked;
9. never merge or release production without separate owner approval.
