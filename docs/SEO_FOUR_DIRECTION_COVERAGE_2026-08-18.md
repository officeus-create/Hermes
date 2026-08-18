# Hermes SEO — Four-Direction Coverage Audit

Date: 2026-08-18  
Scope: Google/Bing SEO only. GEO / AI visibility is a separate workstream.  
Canonical base reviewed: `b03890eea8eb4e28fbc70da34fe04a0be188f521`.

## Executive conclusion

Hermes does not yet have equally mature market SEO across all four directions.

- **Logistics:** strongest implementation; U.S. service and Wisconsin local clusters already exist, but the local layer is still concentrated in one state.
- **ProgressoPro / Marketing:** strong service owners exist, but there is no controlled global-city acquisition layer yet.
- **Hermes Business Academy:** core program/funnel pages exist, but there is no Ukraine + Ukrainian diaspora + approved non-Russia Russian-speaking market layer yet.
- **Hermes IT / Hermes Connect:** product/service SEO exists and Repair Shops is the first real vertical acquisition cluster; Beauty, Fitness and Education/Courses are not yet represented as acquisition clusters.

This audit treats the theoretical market/keyword combination space as a research universe, not a bulk publishing queue.

---

## 1. Logistics — United States

### Current canonical footprint

`public/sitemap-services.xml` contains **17 logistics service/resource URLs**, including:

- car-hauling dispatch;
- direct vehicle transport network;
- dealer vehicle transportation;
- auction vehicle pickup;
- open/enclosed/inoperable/multi-car transport;
- owner-operator and fleet-owner dispatch support;
- new-authority car-hauler support;
- calculators and carrier resources.

`public/sitemap-local.xml` contains **16 local vehicle-transport URLs**.

### Geographic reality

The current local cluster is overwhelmingly **Wisconsin**:

- Wisconsin state owners;
- Green Bay;
- Milwaukee;
- Oshkosh;
- Madison;
- Waukesha;
- Kenosha;
- Racine;
- Fond du Lac;
- Sheboygan;
- Eau Claire;
- La Crosse.

### Status

`FOUNDATION_STRONG / U.S. NATIONAL MARKET EXPANSION NOT YET MATURE`

### Next SEO work

1. Preserve the existing canonical service owners.
2. Use authenticated query/index/conversion evidence before expanding beyond Wisconsin.
3. Build a ranked U.S. opportunity inventory by:
   - state/metro demand;
   - dealer/auction/shipper/carrier intent;
   - equipment/use case;
   - commercial action fit;
   - competition;
   - current service truth.
4. Publish only distinct owners where demand + service + conversion path justify a page.
5. Every proposed location/equipment page must pass cannibalization and thin-page checks.

---

## 2. ProgressoPro / Marketing — high-value global cities

### Current canonical footprint

The digital-services sitemap currently includes the principal marketing owners:

- `/services/seo/`;
- `/services/local-seo/`;
- `/services/seo-for-logistics-companies/`;
- `/services/seo-for-independent-auto-dealers/`;
- `/services/website-development/`;
- `/services/website-redesign/`;
- supporting audit/checklist resources.

### Geographic reality

There is **no controlled top-global-city SEO layer yet**. The current service owners are primarily geography-neutral.

### Status

`SERVICE_OWNERS_EXIST / GLOBAL_CITY MARKET ENGINE MISSING`

### Next SEO work

Build a ranked research matrix:

`city × service × niche × language × buyer value × competition × conversion fit`

Candidate cities must be selected from evidence, not prestige alone. Research factors include:

- local commercial search demand;
- business density / addressable buyers;
- contract value potential;
- language support;
- competition and SERP difficulty;
- local-intent fit;
- whether Hermes can genuinely serve the buyer remotely or locally;
- whether a distinct city page would add useful market-specific value.

No automatic `service × city` page generation.

---

## 3. Hermes Business Academy — Ukraine and diaspora markets

### Current canonical footprint

`public/sitemap-academy.xml` contains **5 academy URLs**:

- U.S. Logistics Operations;
- Marketing;
- How Training Works;
- Apply;
- Resources.

### Geographic/language reality

There is currently **no dedicated indexable market architecture** for:

1. Ukraine;
2. Ukrainian diaspora countries/cities;
3. approved Russian-speaking markets outside Russia.

### Hard market boundary

- **Russia is excluded.**
- Other country/jurisdiction exclusions must come from an explicit owner/compliance list; the SEO system must not invent geopolitical classifications.

### Status

`CORE_FUNNEL_EXISTS / INTERNATIONAL AUDIENCE SEO MISSING`

### Next SEO work

Research and rank:

`country × city × Ukrainian-diaspora signal × language × program intent × competition × support fit`

Then separately:

`approved non-Russia country × Russian-language demand × low competition × program fit × compliance`

The Academy must not create duplicate UA/RU pages that only translate keywords. A localized owner must add market-relevant enrollment, schedule, currency/process, eligibility or learning-context value when truthful and supportable.

---

## 4. Hermes IT / Hermes Connect — vertical SaaS/service acquisition

### Current canonical footprint

The digital-services sitemap contains Hermes Connect and product/module owners, including:

- Hermes Connect hub;
- AI Command Center;
- Business Automation;
- Load Analyzer;
- Proposal Builder;
- Rate Negotiator;
- ROI Calculator;
- Unified Inbox;
- Repair Shops;
- Repair Shops Plan;
- Access/download center.

### Vertical reality

**Repair Shops / auto-service businesses are the first developed vertical acquisition cluster.**

The following CEO-priority verticals are not yet represented as equivalent acquisition clusters:

- Beauty salons / beauty businesses;
- Fitness trainers / coaches / studios;
- Education / course businesses.

### Status

`PRODUCT_SEO_EXISTS / REPAIR_SHOPS_FIRST_VERTICAL / THREE PRIORITY VERTICALS MISSING`

### Next SEO work

Build a controlled opportunity universe:

`vertical × workflow/problem × Hermes Connect module × country × region/state × city × district × language`

But publish only after the candidate passes:

- actual product/workflow fit;
- buyer intent;
- market demand;
- distinct content requirement;
- conversion path;
- evidence/status language;
- cannibalization review.

Initial vertical order:

1. Repair Shops — deepen only with evidence.
2. Beauty.
3. Fitness.
4. Education/Courses.

---

## 5. Conversion and visual SEO requirement

SEO completion is not a metadata/content-only definition.

Every commercial SEO owner must be evaluated as:

`query → SERP promise → landing comprehension → trust/evidence → CTA → intake/handoff → measurement`

Before a page is considered ready for scale, verify:

- title/description match actual intent;
- first mobile viewport explains who the page is for and why it matters;
- one dominant next action is understandable;
- CTA timing matches buyer readiness;
- trust/evidence is truthful and visible;
- no preview/demo is represented as production truth;
- mobile composition is usable at 390px;
- page remains within Hermes Design OS;
- performance/accessibility are not degraded.

### CEO visual approval boundary

Any noticeable visual change remains preview-gated:

1. working preview;
2. desktop QA;
3. 390px mobile QA;
4. explicit CEO approval;
5. only then merge/deploy.

Technical SEO changes that do not materially alter visible design may continue through normal CI/release gates.

---

## 6. Current priority order

### P0 — finish measurement/control foundation

- preserve current Logistics SEO experiment observation window;
- authenticated GSC/Bing/GA4 evidence remains external and must not be fabricated;
- maintain P0, contextual-link, evidence and privacy contracts.

### P1 — market opportunity research

Run four separate inventories:

1. **Logistics:** U.S. states/metros/intents beyond the current Wisconsin concentration.
2. **Marketing:** top global commercial cities by service/niche opportunity.
3. **Academy:** Ukraine + Ukrainian diaspora + owner-approved non-Russia Russian-speaking markets.
4. **IT:** Repair Shops + Beauty + Fitness + Education/Courses markets.

### P2 — publish only validated owners

No cluster may move from research to publication only because many keyword combinations exist.

Required evidence classes before scalable expansion:

- market/query evidence;
- service/product truth;
- distinct canonical intent;
- useful page differentiation;
- contextual internal-link plan;
- conversion path;
- measurement plan;
- visual/funnel QA when the page requires visible design changes.
