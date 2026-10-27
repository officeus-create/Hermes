# Hermes public localization plan — RU / UA / ES / FR / IT

Status: **SCOPE / EXECUTION CONTRACT — NO MASS PAGE GENERATION**  
Date: 2026-10-27  
Owner directive: plan the full public localization project before creating or translating additional route families.

## 1. Current verified language system

Canonical site locales are exactly:

- English `en` → `/`
- Ukrainian `uk` → public URL prefix `/ua/`
- Russian `ru` → `/ru/`
- Spanish `es` → `/es/`
- Italian `it` → `/it/`
- French `fr` → `/fr/`

Do not create public `/uk/` routes.  
The existing direction-owner registry already has all four direction owners in all six languages, and the Academy U.S. Logistics owner already has six-language parity.

Existing localized overview pages are **not evidence that the whole site is translated**. The current code explicitly treats them as overview/owner surfaces.

## 2. Non-negotiable gates

No localized route is released merely because machine translation exists.

Every released counterpart must pass:

1. same primary intent as the English canonical owner;
2. useful standalone localized body copy, not translated header/footer only;
3. natural CTA, form labels, validation/errors and privacy/consent copy;
4. terminology from `docs/SEO_TRANSLATION_GLOSSARY.md`;
5. same-language self-canonical;
6. reciprocal hreflang across every released counterpart plus `x-default`;
7. visible/schema fact parity — no translated claim may become stronger than the English evidence;
8. no new city, lane, equipment, job or service URL solely for keyword surface area;
9. no private/demo/product workspace translation is promoted into the public SEO sitemap by accident;
10. build + SEO/hreflang/internal-link/localization tests + mobile review before merge.

## 3. Route-family rollout order

### P0 — commercial owners with existing demand

Translate only after the English owner/funnel is accepted and stable.

- Logistics commercial owners:
  - car-hauling dispatch;
  - dealer / shipper vehicle transport;
  - auction vehicle pickup;
  - Appleton/Wisconsin vehicle transport where local intent remains valid.
- Marketing:
  - SEO;
  - SEO for logistics companies;
  - Local SEO.
- Technology:
  - Website Development;
  - Website Redesign;
  - Auto Repair Website Design.
- Academy:
  - the existing U.S. Logistics Operations owner first;
  - other program owners only where the English intent and current lifecycle are truthful.

**Acceptance:** localized person → promise → proof → mechanism → one next action, with the same evidence boundary as English.

### P1 — proof and decision-support pages

After the commercial owner exists in that locale:

- relevant case studies;
- resources/checklists that directly support the localized commercial owner;
- company information / about / contacts where missing;
- privacy/legal pages required by a localized live intake.

Do not translate every resource just because it exists. Translate resources that support a released localized buyer journey.

### P2 — direction and market support

- London pages only where the English/London owner is current and the localized page adds real value;
- Academy country pages remain governed by the existing Academy localization pipeline and human publication gate;
- Catalog/Insights remain separate product/editorial systems and are not bulk-translated by this project.

### HOLD — no automatic multiplication

Do not mass-create localized variants for:

- the 25 car-hauler city pages while E3/indexation quality is unresolved;
- thin geo/directory templates;
- closed or owner-held careers;
- private agreements/sign/onboarding;
- Hermes Connect private workspaces;
- demos/concepts;
- pages whose English owner is `PARTIAL`, `HOLD` or lacks approved proof when proof is material to the offer.

## 4. Translation workflow per family

For each English owner:

1. **Inventory** — record canonical URL, page family, search intent, funnel stage, schema, CTA destination and evidence dependencies.
2. **Locale brief** — write target-language terminology and audience phrasing before translating paragraphs.
3. **Human-quality draft** — translation must read naturally in the target market; retain U.S. logistics terms where the glossary says to keep the English abbreviation/term.
4. **Fact parity check** — compare every number, status, service scope, phone/email, review/case statement and product-state label against the current canonical facts.
5. **Route parity** — only create/release the localized URL if there is a clear canonical owner and no competing localized owner.
6. **SEO parity** — unique title/description/H1; same-language canonical; reciprocal hreflang; sitemap only after parity.
7. **Funnel parity** — CTA and live/preview semantics match the English owner; no translated form silently changes receiver behavior.
8. **Visual QA** — 390 / 430 / 768 / 1024 / 1440 where the family is material; check text expansion, overflow, focus, touch, reduced motion.
9. **Release evidence** — exact-head CI → deploy → live readback.
10. **Measurement** — compare locale-specific impressions, CTA actions, delivered inquiries and human qualification separately. Missing data is UNKNOWN, not zero.

## 5. Existing automated protections to preserve

Current repository already contains:

- `scripts/localization-content-audit.test.mjs`
- `scripts/localized-owner-parity.test.mjs`
- `scripts/sitewide-language-owner-integrity.test.mjs`
- `scripts/hreflang-audit.test.mjs`
- `scripts/internal-link-audit.test.mjs`
- `scripts/academy-localization-pipeline.test.mjs`
- `docs/SEO_TRANSLATION_GLOSSARY.md`
- `docs/SEO_RELEASE_CHECKLIST.md`

The project extends these owners; it must not create a second localization registry or a second hreflang authority.

## 6. Required tracking matrix

Before implementation, create one row per **existing English public owner**, not one row per possible translation:

`family | en_owner | intent | current_status | proof_dependency | ru | ua | es | fr | it | locale_priority | translation_status | hreflang_status | funnel_status | live_readback | measurement`

Allowed locale statuses:

- `NOT_PLANNED`
- `PLANNED`
- `DRAFT`
- `HUMAN_REVIEW`
- `READY_FOR_QA`
- `LIVE`
- `HOLD_PROOF`
- `HOLD_OWNER`
- `HOLD_INDEXATION`

Do not use `DONE` for a translation that has not passed live readback.

## 7. First implementation wave

The first code wave should be deliberately small:

1. select **one** already accepted commercial family;
2. fill any missing locale counterpart for that family only;
3. preserve URLs, schema/entity ownership, receiver and analytics contracts;
4. run the existing localization + SEO + internal-link suites;
5. visually verify all five non-English variants;
6. deploy and measure before starting the next family.

Recommended first family: **Technology / Website Development**, because the English family is already `ACCEPTED_LIVE` and it has a relatively bounded offer/CTA surface. Do not start with the 25 city pages or a broad all-site translation sweep.

## 8. Completion definition

“Full translation” is complete only when every public family has an explicit disposition:

- localized and live;
- intentionally English-only with reason;
- held for proof/owner/indexation;
- product/private and outside this program.

The target is **complete language ownership**, not maximum URL count.
