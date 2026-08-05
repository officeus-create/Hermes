# Hermes External Profile Inventory

Status: `PUBLIC OBSERVATION / OWNER RECONCILIATION REQUIRED`  
Observation date: 2026-08-05  
Supports: Issue #204 and the entity/trust workstream in Issue #176.

## Purpose

Record high-visibility public profiles and search-result conflicts without treating third-party wording, modelled directory data, historical resumes, or same-name businesses as approved Hermes facts.

This document is an inventory, not a canonical facts sheet. Approved values belong in `docs/CANONICAL_COMPANY_FACTS_APPROVAL.md` only after private owner review and source verification.

## Safety boundary

- No account credentials, login-holder identity, private legal document, private address, candidate information, customer/carrier information, contract, rate, route, shipment, VIN, or message is stored here.
- Public observations are classified as observations, not endorsements or verified corporate facts.
- Historical personal resume statements must not become current corporate claims automatically.
- Modelled directory employee/revenue values must not become public Hermes metrics.
- Same-name organizations and carriers must remain separate entities.

---

## Priority inventory

| Platform/profile | Public URL | Public observation | Classification | Required action | Login owner known |
| --- | --- | --- | --- | --- | --- |
| Staff.am company profile | `https://staff.am/en/company/hermes-logistics-llc` | Shows Hermes Logistics LLC as a Holding founded in 2019, employee range 50–200, broad U.S./worldwide service language, Ukraine-office expansion language, public phone/site, and multiple employment benefits. | `HIGH CONTRADICTION RISK / OWNER APPROVAL_REQUIRED` | Privately identify account owner; compare every field with approved legal, employment, location, service, phone, and benefits facts; update or retire unsupported fields. | Unknown |
| Staff.am Russian profile | `https://staff.am/ru/company/hermes-logistics-llc` | Repeats the employee range, worldwide/Ukraine-office language, benefits, phone, and website in Russian. | `DUPLICATE LANGUAGE SURFACE / SAME REVIEW REQUIRED` | Apply the same approved corrections across language variants. | Unknown |
| Work.ua personal resume | `https://www.work.ua/resumes/10640079/` | Indexed resume presents a personal historical Hermes Logistics CEO period and broad C-level responsibility statements. | `PERSONAL HISTORICAL RECORD / NOT CORPORATE SAMEAS` | Keep personal employment history separate from current company facts; classify each statement as historical, current, private, unsupported, or approved before editing. | Owner review required |
| robota.ua personal resume | `https://robota.ua/candidates/23423822` | Indexed resume presents a historical Hermes Logistics CEO period and broad responsibility/achievement wording. | `PERSONAL HISTORICAL RECORD / NOT CORPORATE SAMEAS` | Reconcile with Work.ua and approved personal-history wording; do not use as current company proof. | Owner review required |
| D&B company directory | `https://www.dnb.com/business-directory/company-profiles.hermes_logistics_llc.8edaf29fe6ae5d78a393fc24657b08ac.html` | Public directory exposes a Milwaukee Hermes Logistics LLC entry with principal/address/industry fields and modelled company data. | `LEGAL IDENTITY RECONCILIATION REQUIRED` | Privately compare exact entity, principal, address, status, and publication intent against official owner-controlled records. Do not copy modelled values into the website. | Unknown |
| Buzzfile company directory | `https://www.buzzfile.com/business/Hermes-Logistics%2C-LLC-414-269-7377` | Public directory exposes a Milwaukee Hermes Logistics LLC entry with principal/address/phone and estimated employee/revenue data. | `LEGAL IDENTITY RECONCILIATION REQUIRED` | Verify exact entity and current public contact/address privately; treat employee/revenue figures as third-party estimates, not evidence. | Unknown |

---

## Same-name entity conflicts

Current search results also surface unrelated organizations using Hermes Logistics or similar wording, including:

- an Egypt-based logistics/minerals business at `hermes-logistic.com`;
- a Wisconsin relocation-support business at `hermesreloservice.com`;
- a Nigeria/global shipping business at `hermesexp.com`;
- an air-cargo software company at `hermes-cargo.com`;
- other U.S. motor carriers with similar legal names.

A public FMCSA result observed during the same search belongs to a different Hermes Logistics Inc in Massachusetts and must not be associated with `hermeslogisticsus.com` without exact official evidence.

Classification: `ENTITY DISAMBIGUATION REQUIRED`.

Required boundary:

- do not add unrelated domains, profiles, authorities, reviews, addresses, fleets, people, customers, or claims to Hermes `sameAs`, schema, bios, or sales materials;
- use exact domain, verified legal identity, approved contact, and restrained service descriptions to distinguish the intended entity;
- recheck branded search and AI answers only after the controlled profile set is corrected.

---

## Field-by-field review queue

### Staff.am

Each visible field requires one decision:

| Field group | Current review status | Required evidence/decision |
| --- | --- | --- |
| Legal/public company name | `OWNER_APPROVAL_REQUIRED` | Exact current legal/public identity and capitalization. |
| Company type: Holding | `EVIDENCE_REQUIRED` | Legal/organizational basis or remove. |
| Foundation year: 2019 | `EVIDENCE_REQUIRED` | Separate legal formation, project start, and team history. |
| Employees: 50–200 | `EVIDENCE_REQUIRED` | Define employees versus contractors, trainees, candidates, partners, and historical team. |
| U.S./worldwide scope | `OWNER_APPROVAL_REQUIRED` | Define actual customer/service geography without implying offices or guaranteed capacity. |
| Ukraine office expansion | `EVIDENCE_REQUIRED` | Verify legal/staffed office status or remove/replace with accurate remote/team wording. |
| Service list | `OWNER_APPROVAL_REQUIRED` | Match current approved scope; do not imply fleet, brokerage authority, global-trade capability, or motor-carrier control without evidence. |
| Phone and website | `OWNER_APPROVAL_REQUIRED` | Confirm ownership, monitoring, purpose, and canonical domain. |
| Benefits | `EVIDENCE_REQUIRED` | Confirm each current benefit, eligibility, geography, and responsible employment entity; remove unsupported items. |
| Slogan/testimonial-like text | `OWNER_APPROVAL_REQUIRED` | Confirm ownership and current brand use; do not present as customer evidence. |

### Work.ua / robota.ua

| Statement class | Treatment |
| --- | --- |
| Dated employment period | Preserve only as personal historical history when accurate and owner-approved. |
| C-level role list and achievements | Do not convert into current Hermes departments, staff, results, or corporate claims without evidence. |
| Website association | Keep only when the historical/current relationship wording is accurate. |
| Current title and availability | Review as personal profile data, not company schema. |
| Quantitative or operational scale | Evidence-gate and keep private unless exact source, period, definition, and approval exist. |

### Directories

| Data type | Treatment |
| --- | --- |
| Legal name/principal/address | Verify against official owner-controlled records before correction or publication. |
| Phone | Confirm ownership and monitoring before use. |
| Employee/revenue estimates | Mark as modelled/estimated third-party data; do not publish as Hermes facts. |
| Industry classification | Review for legal and operational accuracy; directory taxonomy is not a complete service description. |
| Claim/ownership workflow | Use only through authenticated account or documented directory correction process. |

---

## Safe implementation order

1. Complete private owner approval of the canonical company-facts sheet.
2. Identify the authenticated owner of each profile without recording credentials in GitHub.
3. Correct Staff.am first because it exposes company-scale, office, service, contact, and benefits claims together.
4. Classify Work.ua and robota.ua as personal historical profiles and edit only with the profile owner's intent.
5. Reconcile legal/principal/address details privately before contacting D&B/Buzzfile.
6. Align owned social/company bios after canonical facts are approved.
7. Add `sameAs` only for exact controlled profiles representing the same entity.
8. Wait for propagation, then repeat branded SERP and AI-entity checks with date and query set.

## Completion evidence

Issue #204 can be closed only when:

- canonical facts are owner-approved privately;
- Staff.am and personal resume surfaces have explicit keep/update/remove decisions;
- the highest-ranking owned profiles use consistent domain, contact, geography, and service scope;
- unsupported office, employee, network, fleet, authority, customer-volume, result, and technology claims are removed or evidence-gated;
- corrections and recheck dates are recorded without credentials or private account information;
- branded search and AI-entity results are rechecked after propagation.
