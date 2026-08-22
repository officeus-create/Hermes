# Hermes GEO — External Entity Correction Queue

Date: 2026-08-22
Scope: public AI/entity/evidence only

This queue records external public profiles whose current claims conflict with each other or exceed the currently approved Hermes public entity/evidence contract. A conflict is not automatically proof that one source is false; owner verification is required before changing factual company-history, headcount, legal, office, or service claims.

## Priority 0 — Work.ua company profile

Source:
- https://www.work.ua/en/jobs/by-company/366364/
- https://www.work.ua/jobs/by-company/366364/

Observed public claims:
- profile title: `Hermes Logistics, LLC`;
- describes `Hermes Logistics / ProgressoPro` as one ecosystem relationship;
- employee range displayed as `250–1000`;
- says Hermes Logistics has operated in the U.S. market since 2018;
- claims `40+ logistics agencies`;
- claims `150+ logistics combinations`;
- claims `41+ marketing agencies` under ProgressoPro;
- presents Medical Billing as an upcoming Hermes direction.

Current GEO conflict:
- the Hermes website contract treats `Hermes` as the master public entity and `Hermes Marketing` as the public direction;
- the exact ProgressoPro relationship is held pending relationship resolution and must not be promoted as a proven Organization/provider relationship;
- agency counts, employee scale, launch timelines, and unreleased directions must not be used as AI-answer facts without current approved evidence.

Required correction path:
1. owner-verify legal/company relationship, founding year, headcount range, agency counts, and whether Medical Billing remains an approved public direction;
2. remove or rewrite unsupported/stale scale and future-launch claims;
3. align the company description with the approved Hermes master-brand / Four Directions contract;
4. keep recruitment-specific facts separate from general Organization schema facts;
5. re-check the indexed public profile after the platform republishes the edits.

Status: `OWNER_PLATFORM_EDIT_REQUIRED`

## Priority 0 — Staff.am company profile

Source:
- https://staff.am/company/hermes-logistics-llc
- https://staff.am/ru/company/hermes-logistics-llc

Observed public claims:
- profile title: `Hermes Logistics LLC`;
- company type displayed as `Holding`;
- foundation year displayed as `2019`;
- employee range displayed as `50–200`;
- describes services including intermodal drayage, material handling, value-added services, and global trade management;
- describes U.S./Worldwide operations plus office expansion in Ukraine;
- publishes a Ukraine phone contact.

Current GEO conflict:
- Staff.am and Work.ua disagree on foundation year and employee range;
- several service/scale/geography claims are broader than the current approved evidence-bounded Hermes public contract;
- the current Hermes public contact architecture uses controlled department/contact routing rather than treating every historical external contact as a canonical Organization contact.

Required correction path:
1. owner-verify foundation year, legal/company type, current headcount band, current operating geography, and the listed service scope;
2. remove unsupported or historical service claims that are no longer part of the approved public offer;
3. align current website and approved contact ownership;
4. re-check the indexed public profile after platform publication.

Status: `OWNER_PLATFORM_EDIT_REQUIRED`

## Cross-source conflict ledger

| Field | Work.ua | Staff.am | Current GEO treatment |
|---|---|---|---|
| Master/entity framing | Hermes Logistics / ProgressoPro ecosystem | Hermes Logistics LLC | Hermes master brand; Marketing/Academy/Technology are public directions; ProgressoPro relationship held |
| Foundation year | 2018 | 2019 | `UNVERIFIED_EXTERNAL_CONFLICT` |
| Employee range | 250–1000 | 50–200 | `UNVERIFIED_EXTERNAL_CONFLICT` |
| Agency/scale counts | 40+ / 41+ / 150+ claims | not aligned | `DO_NOT_USE_WITHOUT_CURRENT_EVIDENCE` |
| Future direction | Medical Billing launching | not present | `DO_NOT_USE_WITHOUT_CURRENT_APPROVAL` |
| Service scope | logistics ecosystem + marketing | broad logistics / drayage / handling / trade management | `VERIFY_AGAINST_CURRENT_OFFER` |

## AI correction priority

External correction order should prioritize facts most likely to cause entity merge or factual hallucination:

1. master brand / ProgressoPro relationship;
2. legal/company identity and founding year;
3. employee/agency scale claims;
4. current service scope;
5. future/unreleased business directions;
6. canonical contact ownership.

Do not mark an external inconsistency `corrected` until the platform itself visibly republishes the corrected value.