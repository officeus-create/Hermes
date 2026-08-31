# London Sprint 2 — Governance + Launch

This file completes actions 81–90 and 99–100 from issue #915. Actions 91–98 are enforced by `scripts/london-launch-contract.test.mjs`.

## 81–90 International SEO, trust and compliance
81. **EN messaging rule:** English is the canonical London market language. Write for real London/UK intent, not keyword repetition. Use “London” only where geography is relevant to the offer or audience.
82. **RU messaging rule:** Russian pages are language-entry pages for people in the UK/London market. They must not imply Russia-based service geography, duplicate English copy mechanically, or weaken English-readiness requirements for US-logistics live communication.
83. **UA messaging rule:** Ukrainian pages are language-entry pages for people in the UK/London market. Preserve the same commercial/training boundaries as EN and keep US-logistics terminology aligned with the canonical programme.
84. **hreflang governance:** EN `/gb/london/…`, RU `/ru/gb/london/…`, and UA `/ua/gb/london/…` must point to true equivalents only. Reciprocal mappings are required; do not create hreflang for a translation that does not exist.
85. **Local-presence claims:** never state or imply a London office, storefront, team address or “near you” physical presence unless it is factually established and approved. “Serving London businesses” or “London market” is acceptable when true.
86. **Pricing claims:** prices may be described as starting/indicative only when current and supportable. Evergreen SEO pages should prefer scoped quotes. Media spend, platform fees, tax and third-party costs are separate unless explicitly included.
87. **Academy employment/income rule:** never promise a job, placement, salary, client, contract, load volume or income for course participation/completion. Any career examples must be clearly illustrative and evidence-backed.
88. **Search-ranking rule:** never guarantee position, indexing date, traffic, lead quantity or revenue from SEO. Discuss process, evidence, eligibility and measured improvement instead.
89. **Evidence/testimonial rule:** use only attributable, permissioned and supportable cases. Do not invent London customers, reviews, revenue figures or before/after results. Separate internal examples/demos from customer evidence.
90. **PII/analytics rule:** analytics must not receive names, email addresses, phone numbers, free-form messages or other direct identifiers. London events reuse the consent-aware shared analytics transport and standard attribution fields.

## 99. Post-launch Search Console checklist
- Confirm deployed London canonical URLs return 200 and expected canonicals.
- Submit/verify sitemap discovery through the existing sitemap index; do not create duplicate sitemap ownership.
- Inspect the London hub plus representative service, guide, Academy, RU and UA URLs.
- Record indexed/not-indexed state and stated reason; do not treat submission as indexing.
- Track queries, impressions, clicks and average position by page/query with appropriate caveats.
- Watch accidental query cannibalisation between London service pages and general `/services/` pages.
- Validate that RU/UA pages receive language-appropriate impressions rather than stealing EN intent.
- Record rich-result/schema warnings where relevant; fix only factual/semantic issues.
- Log every significant content/route change with date so movement is not attributed blindly.
- Use Search Console evidence to decide which pages deserve expansion, consolidation or de-prioritisation.

## 100. 30-day London review
At day ~30 (or later if impressions are too sparse), review: indexation coverage; pages with impressions; query/page fit; CTR outliers; qualified leads; Academy applications; source/campaign completeness; sales pipeline; outreach response; content performance; technical errors; cannibalisation; and business capacity. Keep pages that earn relevant discovery or support conversion. Improve pages with clear demand but weak CTR/conversion. Consolidate or noindex only with evidence and architectural review. Do not manufacture borough pages simply to increase URL count.

### Decision framework
- **Scale:** relevant impressions + engagement/qualified action evidence.
- **Improve:** relevant impressions but weak CTR, weak CTA or unclear intent fit.
- **Hold:** insufficient sample, technically healthy, strategically useful.
- **Consolidate:** duplicated intent with no differentiating evidence.
- **Retire/noindex:** wrong intent, unsupported claims, or no strategic/search/conversion role after evidence review.
