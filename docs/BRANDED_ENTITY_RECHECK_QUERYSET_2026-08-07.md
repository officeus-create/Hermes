# Hermes Branded Entity Recheck Query Set — 2026-08-07

## Purpose

Provide one repeatable query set for Google, Bing and AI/entity checks after external-profile corrections. The goal is not to manufacture branded visibility; it is to verify that search systems distinguish the current Hermes website from unrelated same-name businesses and stale third-party claims.

## Run conditions

- Record engine/product, country/language, date and signed-in/incognito state where relevant.
- Capture only public results; do not store private account data or personalized history.
- Do not infer ownership from name similarity.
- Treat snippets and AI summaries as observations, not authoritative company records.
- Recheck after profile corrections have had time to propagate; compare against the same query set.

## Query set

### A. Exact brand + domain

1. `Hermes hermeslogisticsus.com`
2. `Hermes Logistics hermeslogisticsus.com`
3. `Hermes Logistics LLC hermeslogisticsus.com`
4. `site:hermeslogisticsus.com Hermes Logistics`
5. `site:hermeslogisticsus.com ProgressoPro`
6. `site:hermeslogisticsus.com Hermes Business Academy`
7. `site:hermeslogisticsus.com Hermes IT Development`

Expected direction: owned-domain results should be clearly distinguishable and should not inherit unrelated-company facts.

### B. Brand + current service intent

8. `Hermes Logistics car hauling dispatch`
9. `Hermes Logistics vehicle transport Wisconsin`
10. `Hermes Logistics Appleton vehicle transport`
11. `Hermes Logistics carrier operations support`
12. `Hermes Logistics dealer vehicle transportation`
13. `Hermes logistics SEO ProgressoPro`

Expected direction: if owned pages appear, descriptions should match the current service scope without guarantees, fleet-ownership assumptions or unrelated brokerage/freight-forwarding claims.

### C. Brand + identity disambiguation

14. `Hermes Logistics Milwaukee Wisconsin`
15. `Hermes Logistics LLC Milwaukee Wisconsin website`
16. `Hermes Logistics contact hermeslogisticsus.com`
17. `Hermes Logistics office locations`
18. `Hermes Logistics employees`
19. `Hermes Logistics founded`
20. `Hermes Logistics revenue`

These are diagnostic queries. Search results may surface Staff.am, Work.ua, D&B, Buzzfile or unrelated companies. Do not copy their values into canonical Hermes facts. Record whether stale/unsupported scale, office, contact or financial claims dominate the result.

### D. Four-direction separation

21. `Hermes ProgressoPro`
22. `Hermes Business Academy hermeslogisticsus.com`
23. `Hermes IT Development hermeslogisticsus.com`
24. `Hermes Logistics ProgressoPro same company`
25. `Hermes four business directions`

Expected direction: systems should be able to describe the four public directions without collapsing every direction into one legal entity or treating ProgressoPro social profiles as root Hermes `sameAs` automatically.

### E. Same-name collision checks

26. `Hermes Logistics company`
27. `Hermes Logistics USA`
28. `Hermes Logistics Wisconsin`
29. `Hermes Logistics reviews`
30. `Hermes logistics cargo relocation`

Expected direction: unrelated same-name companies may rank, but a result or AI answer should not merge their locations, services, reviews, phone numbers, addresses, executives, fleet claims or websites with `hermeslogisticsus.com`.

## AI/entity prompts

Use neutral factual prompts rather than leading prompts:

1. `What is Hermes at hermeslogisticsus.com?`
2. `What services does Hermes Logistics at hermeslogisticsus.com provide?`
3. `What is the relationship between Hermes, Hermes Logistics, ProgressoPro, Hermes Business Academy and Hermes IT Development on hermeslogisticsus.com?`
4. `What public contact information is listed by hermeslogisticsus.com?`
5. `Does hermeslogisticsus.com claim public offices outside the United States?`
6. `What evidence supports any employee-count, office-count, fleet, revenue or network-size claim about Hermes Logistics at hermeslogisticsus.com?`

For the final prompt, a safe result may be that no owned-site evidence supports those quantitative claims.

## Observation fields

For each query record:

- `query`
- `engine_or_ai_product`
- `date`
- `owned_domain_present` — yes/no
- `owned_domain_position` — nullable
- `wrong_entity_merged` — yes/no
- `wrong_domain_or_phone_attributed` — yes/no
- `unsupported_scale_claim_present` — yes/no
- `unsupported_office_claim_present` — yes/no
- `root_vs_direction_confusion` — yes/no
- `citation_or_source_url`
- `next_action`

Do not store personal search history, account identifiers or private prompt conversations in the public repository.

## PASS criteria

A branded entity recheck passes when:

- owned-domain identity is distinguishable from unrelated same-name businesses;
- no unrelated address, phone, principal, service or website is attributed to the owned Hermes entity in the reviewed answer/result;
- no Staff.am/Work.ua/D&B/Buzzfile estimate is silently promoted to an owner-verified fact;
- the four public directions remain distinguishable;
- current domain and approved public contact routes are represented accurately when surfaced;
- no public-office claim is inferred from coordination markets;
- any remaining ambiguity is documented with a concrete correction owner.

## FAIL / remediation triggers

- unrelated Hermes business merged into current entity;
- retired phone/email shown as primary active contact;
- unsupported employee, office, agency, network, fleet, revenue or customer-volume claim repeated as fact;
- current service scope replaced by generic freight-forwarding/global-trade language from an old profile;
- personal resume used as company identity proof;
- ProgressoPro profile treated as root Hermes `sameAs` without explicit relationship approval.

Supports #176, #204, #206 and #306.
