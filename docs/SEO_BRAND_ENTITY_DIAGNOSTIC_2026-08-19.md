# Brand/entity diagnostic — Batch 4 tasks 261–270

## Search evidence
Owner-provided GSC export:
- `hermes logistics`: 3 clicks / 70 impressions / 4.29% CTR / avg position 26.93.
- `hermes logistics llc`: 1 / 12 / 8.33% / 4.75.
- homepage: 6 / 83 / 7.23% / 30.12.
- `/company-information/`: 2 / 75 / 2.67% / 9.76.
- `/ru/`: 2 / 24 / 8.33% / 9.17.
- `/ua/`: 2 / 23 / 8.70% / 14.22.

## Interpretation
The exact LLC query performs materially better than the broader ambiguous `hermes logistics` query. This is consistent with a brand/entity disambiguation problem being more important than a simple homepage CTR edit.

The export does not provide a joined query×page dataset, so it cannot prove which URL ranked for each brand query. Do not fabricate that attribution.

## Current public entity architecture
The repository currently separates:
- root Hermes ecosystem Organization: `https://hermeslogisticsus.com/#organization`, schema publication approved;
- Hermes Logistics direction: `#logistics`, separate Organization/schema publication held pending owner verification;
- Hermes Business Academy direction: approved;
- ProgressoPro relationship: held pending exact relationship resolution;
- Hermes IT direction: separate organization/brand publication held pending owner verification.

The root Organization sameAs currently includes only social profiles already classified as the same entity. Logistics-direction duplicate sameAs/schema publication is intentionally blocked until canonical ownership is confirmed.

`/company-information/` explicitly states that Hermes Logistics LLC is the U.S. logistics business identified on the website and warns that unrelated companies using Hermes/Hermes Logistics names must not be inferred to be the same entity.

## Decision
1. KEEP the existing disambiguation architecture.
2. Do not create a second competing Logistics Organization node merely to chase the broad brand query.
3. Do not add unsupported address, authority, fleet, revenue, employee count, customer, affiliation, award, or social-profile facts.
4. Do not move ProgressoPro into root sameAs without relationship approval.
5. Keep exact LLC/company identity copy aligned across Company Information, legal/contract surfaces and public contact routes.
6. Track broad `hermes logistics` separately from exact `hermes logistics llc` in future GSC exports.

## Completion gate
Brand/entity SEO is considered healthy only when comparable evidence shows:
- exact LLC/company-intent queries remain page-one/top-range;
- broader brand ambiguity improves without publishing false entity relationships;
- homepage/company-information/about/contact do not contradict one another;
- canonical sameAs remains evidence-backed;
- unrelated Hermes entities are not accidentally asserted as the same company.

## Tasks 261–270 status
- 261–263: brand query and entity-supporting page evidence diagnosed.
- 264–268: schema/sameAs/disambiguation architecture reviewed; current holds are intentional and should remain.
- 269: brand tracking split defined.
- 270: brand-SERP completion gate recorded; future comparable GSC evidence remains pending.
