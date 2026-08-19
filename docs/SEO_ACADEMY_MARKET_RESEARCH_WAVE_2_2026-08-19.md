# Hermes SEO — Academy Market Research Wave 2

Date: 2026-08-19
Scope: Google/Bing organic acquisition research for Hermes Business Academy. This document does not authorize country-page publication.

## Decision summary

1. **Ukraine / U.S. Logistics Operations — KEEP existing Ukrainian owner.**
   - Current canonical owner: `/ua/academy/us-logistics-operations/`.
   - Public search results include Ukrainian-language commercial training for U.S.-market dispatcher/logistics work.
   - Existing Hermes page has distinct curriculum, B2+ readiness boundary for live U.S.-market communication, one application backend, and explicit no-employment/no-income guarantees.

2. **Ukraine / Marketing — BUILD CANDIDATE, but only after the shared Ukrainian application shell is merged and measurement ownership is recorded.**
   - English canonical program truth already exists at `/academy/marketing/`.
   - Current curriculum is broader than a thin SMM page: positioning and offer, website-first content, platform distribution, lead journey, sales follow-up, analytics and controlled AI assistance.
   - Ukrainian search results show active commercial demand around SMM and digital-marketing education in Ukrainian.
   - A future Ukrainian owner should be one program owner such as `/ua/academy/marketing/`, not a set of city/country permutations.
   - It must reuse the shared Academy application with `program=marketing&language=uk`; no second form or receiver.

3. **Germany / Ukrainian Marketing — DEEPER RESEARCH, no country page yet.**
   - Sampled SERP includes a Digital Marketing offer explicitly framed for Ukrainians in Germany.
   - This proves that country-specific Ukrainian marketing education intent can exist; it does not prove Hermes demand, competitiveness, local compliance fit, support capacity, or a distinct Hermes Germany offer.

4. **Poland / Ukrainian Marketing — DEEPER RESEARCH, no country page yet.**
   - Sampled SERP includes a Digital Marketing course explicitly framed for Ukrainians in Poland.
   - Country intent is plausible, but a Hermes page still needs distinct local value, query evidence, conversion readiness and measurement ownership.

5. **Czechia / U.S.-logistics-for-Ukrainians hypothesis — HOLD.**
   - Sampled results did not show a clean Ukrainian-diaspora U.S.-logistics course archetype; results skewed toward general local logistics education.
   - Do not infer demand from temporary-protection population alone.

6. **Spain / U.S.-logistics-for-Ukrainians hypothesis — HOLD.**
   - Sampled results skewed toward general logistics/supply-chain education rather than a distinct Ukrainian-diaspora U.S.-logistics training archetype.
   - Do not publish a Spain page from population presence alone.

## Public SERP evidence sampled

### Ukraine — U.S. Logistics
- Education.ua — `Диспетчер-логіст на ринку перевезень США`: https://www.education.ua/courses/50014/

### Ukraine — Marketing / SMM
- Marketer.ua / Kukurudza — `Комплексний SMM`: https://edu.marketer.ua/course/kompleksnii-smm
- Hillel — SMM course: https://ithillel.ua/courses/smm
- Prometheus — `SMM: фундамент`: https://prometheus.org.ua/prometheus-free/smm-foundation/
- GoIT — SMM & Targeting: https://goit.global/ua/courses/smm/

### Germany — Ukrainian Marketing
- DTA Akademie — `AI & Digital Marketing`, explicitly for Ukrainians in Germany: https://www.dtakademie.de/ai-digital-marketing

### Poland — Ukrainian Marketing
- Choice31 — `Інтернет-маркетинг для українців в Польщі`: https://choice31.com/course/dm/poland/

## Canonical ownership rules

### Ukrainian Logistics
- EN owner: `/academy/us-logistics-operations/`
- UK owner: `/ua/academy/us-logistics-operations/`
- Reciprocal `en` / `uk` / `x-default` hreflang required.
- Shared application backend only.

### Ukrainian Marketing candidate
- EN owner remains `/academy/marketing/`.
- Candidate UK owner may be `/ua/academy/marketing/` only after build gate passes.
- The separate business-service direction `Hermes Marketing · ProgressoPro` must not be replaced by an Academy course URL.
- Academy Marketing and Marketing services have different intent and must remain separate canonical owners.

## Diaspora publication gate

Population or temporary-protection presence is a **market-prioritization signal only**. A country-specific Academy page can move from `research` to `approved_for_build` only when all of the following are recorded:

1. **Distinct query archetype** — sampled search results and preferably quantitative query evidence show a country-specific program need, not only generic course results.
2. **Distinct Hermes offer/value** — the country changes language, local-market workflow, support, legal/payment context, employer/client context, or another user-relevant part of the program. Merely replacing the country name is insufficient.
3. **Program truth** — curriculum, readiness, language requirements, participation rules and public boundaries are approved and factual.
4. **Canonical ownership** — the proposed page does not compete with the Ukraine-language owner or generic English owner for the same intent.
5. **Conversion readiness** — one working shared application/handoff can preserve program, language and country context without a duplicate backend.
6. **Compliance/support fit** — sanctions, payment, local support and any material jurisdiction-specific constraints are reviewable.
7. **Measurement owner** — 7/28-day query×page, indexation and application/handoff evidence has an owner before expansion.
8. **Thin-page test** — the page contains material country-specific value that cannot be represented by a language alternate or a small section on the canonical program page.

If any item is missing, status stays `research` or `hold`.

## Next build decision

The next Academy growth URL should be evaluated in this order:

1. Merge reciprocal Academy hreflang and Ukrainian shared application-shell work.
2. Record the 7/28-day measurement owner for Academy.
3. Build one Ukrainian Marketing program owner if the final owner map confirms no duplicate route and the shared application supports `program=marketing&language=uk`.
4. Measure Ukraine program owners before any Germany/Poland country expansion.
5. Keep Czechia/Spain country hypotheses on HOLD until new query evidence changes the decision.

## Boundaries

- No Russia market publication.
- No employment, income, certification, seat, mentor, cohort-date, price or outcome claims without an approved offer.
- No country pages generated from diaspora population tables.
- No country/language combinatorial page engine.
- No separate application backend per language or country.
