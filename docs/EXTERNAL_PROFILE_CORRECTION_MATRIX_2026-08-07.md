# External Hermes Profile Correction Matrix — 2026-08-07

## Purpose

Reduce branded-search and AI entity ambiguity by separating owner-controlled Hermes facts from stale, modelled, personal-history, or same-name third-party claims.

This document is a public-safe correction plan only. It does not authorize any external account change and contains no credentials or private owner data.

## Core rule

Only owner-approved facts may be promoted across external company profiles. Personal resumes, modelled directory estimates, same-name businesses, and unverified historical claims must not be used as `Organization.sameAs` evidence or as proof of current Hermes scale, staffing, offices, revenue, fleets, customers, or authority.

## Priority order

1. Company-controlled Work.ua profile, if authenticated ownership exists.
2. Company-controlled Staff.am English/Russian profiles, if authenticated ownership exists.
3. D&B and Buzzfile legal/contact reconciliation from owner-controlled records.
4. Branded Google/Bing and AI-entity recheck after corrections propagate.
5. Personal Work.ua/robota.ua resumes remain Person/history records and are not linked as company identity.

## Staff.am — current public risk

Public Staff.am profiles currently present several claims that require owner confirmation before they can be treated as canonical company facts, including:

- company type `Holding`;
- foundation year `2019`;
- employee range `50-200`;
- worldwide operating language;
- language about expansion of offices in Ukraine;
- a broad transportation/logistics service description;
- a Ukrainian telephone number;
- benefits that may reflect an older recruiting profile rather than the current public operating model.

### Recommended treatment

| Field | Default action before owner verification |
| --- | --- |
| Legal/public company name | Keep only after matching owner-controlled legal record |
| Website | Keep `https://hermeslogisticsus.com/` if profile ownership is confirmed |
| Industry | Keep only if current profile category accurately reflects the approved business direction |
| Holding classification | Remove or replace unless separately verified |
| Foundation year | Do not change from public sources alone; verify privately |
| Employee count | Remove or leave unspecified unless a current owner-approved count/range exists |
| Worldwide/offices wording | Replace with approved U.S. logistics + remote/email coordination wording; do not imply staffed offices |
| Services | Narrow to current approved public scope; do not import generic forwarding claims without evidence |
| Phone | Replace only with owner-approved monitored public contact |
| Benefits | Keep only current recruiting benefits approved for publication |

## Work.ua company profile — high-priority risk

The company profile has surfaced large-scale claims such as employee ranges, agency/network counts, logistics combinations, marketing-agency counts, and future business directions. These are high-impact branded entity claims and should be reviewed before they remain attached to the current Hermes identity.

### Recommended treatment

- remove or evidence-gate unsupported employee-count, agency-count, network-size and business-scale claims;
- remove future-service claims unless they are intentionally approved as current public roadmap language;
- use one concise current company description aligned with the owned website;
- use only the approved public domain and monitored contact routes;
- do not convert personal resume history into corporate proof.

## D&B / Buzzfile

Public directories currently show legal/entity-style records for a Milwaukee Hermes Logistics LLC, but also expose addresses, principal/contact data and modelled/estimated employee or revenue information.

### Recommended treatment

- reconcile exact legal name and address only from owner-controlled records;
- reconcile public phone/contact only from approved monitored routes;
- treat employee counts and revenue as third-party/modelled estimates unless Hermes independently verifies them;
- do not copy modelled figures into owned-site schema, case studies, social profiles, sales material, or AI/entity summaries;
- do not use a directory URL as `sameAs` unless ownership/entity match and publication intent are explicitly approved.

## Personal resumes and candidate/profile pages

Work.ua and robota.ua personal resumes may contain historical employment or role statements. They are not current Organization proof and must remain excluded from Hermes root `sameAs`, company schema, corporate biography, scale claims, and authority claims.

## Same-name Hermes businesses

Unrelated Hermes logistics/cargo/relocation companies must remain blocked from root entity inference. Search presence alone is not evidence that two organizations are the same entity.

## Safe canonical profile copy — draft pending owner approval

**Hermes Logistics LLC is the U.S. logistics direction of the Hermes website. Public services include dispatch and carrier operations support, car-hauling support, vehicle-transport coordination, and related logistics workflows. Current requests are coordinated through hermeslogisticsus.com and approved public contact channels.**

This wording intentionally avoids unverified employee counts, office counts, fleet ownership, global-office claims, customer volume, revenue, guarantees, awards, and authority claims.

## Acceptance criteria

- [ ] Owner privately approves canonical legal/public name, monitored contact, geography wording and concise service description.
- [ ] Work.ua company profile is classified field-by-field and corrected where authenticated access permits.
- [ ] Staff.am EN/RU profiles are classified field-by-field and corrected where authenticated access permits.
- [ ] D&B/Buzzfile exact legal/contact data are reconciled from owner-controlled records.
- [ ] Modelled directory employee/revenue figures remain excluded from owned public claims.
- [ ] Personal resumes remain excluded from Organization identity and `sameAs`.
- [ ] Branded Google/Bing/AI entity check is repeated after external corrections propagate.

Supports Issues #176, #204 and #306.
