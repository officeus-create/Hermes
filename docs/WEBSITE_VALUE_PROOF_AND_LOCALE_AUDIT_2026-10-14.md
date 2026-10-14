# Hermes website — first-visit value, USP evidence and multilingual conversion audit
Date: 2026-10-14 · Stage: SOURCE REVIEW / BOUNDED FIX PR · Owner: Marketing SEO × Product Design × Technology; One Brain is the canonical coordination layer.

## Task and limits
Owner supplied critique of another company's homebuilder site: a referral visitor cannot see distinct value, trustable proofs or a direct response path without guessing where to click. Apply that **decision framework** to Hermes four business directions; do not present the homebuilder's engineering/fire/material claims as relevant to Hermes. This review used the accessible public English/Russian/Ukrainian/Spanish pages, their linked service/case/contacts pages, current GitHub source and connected limited Google Search Console. It is not an all-page production browser audit, complete locale visual screenshot comparison, actual user research, or conversion attribution. Opera visual browser connector was not connected. No new unsupported public claims.

## Observations — dated source truth
1. English Home `/` uses `HomeMasterScene.astro`, a four-direction visual chooser + later corporate identity and contact section. This fulfills navigation but gives minimal in-place evidence of what makes each direction worth comparing after a recommendation.
2. Russian `/ru/`, Ukrainian `/ua/`, Spanish `/es/`, Italian and French root pages use `LocalizedOverviewPage.astro`: a full corporate hero and much longer direction + capability narratives. Thus language switching changes information architecture, not just locale. It should retain each language's semantics and four canonical target routes; avoid automatically cloning English motion across languages before visual/SEO approval.
3. Existing deep owners do contain distinct offers, process explanations, maturity disclaimers and a next step: `/paths/logistics/`, `/paths/marketing/`, `/paths/technology/`, `/paths/academy/`. Evidence is simply too far from the initial referral choice.
4. Publicly reviewable evidence exists but is not surfaced together near Home direction selection: Wisconsin company verification `/company-information/`; released SEO resource cluster (case with dated U.S. desktop GSC showing visibility but no conversion claim) `/case/appleton-vehicle-transport-seo/`; published website release `/case/it-development/`; open practice guides `/academy/resources/`. These source URLs may be English-only; localized visitors must be told.
5. Contact `/contacts/` is discoverable and offers a preview-safe **raw HTML** state (`Preview request` + copy/email fallback), but this must not be confused with the JavaScript-enabled live browser. Existing `ContactCTA.astro` supports explicit HTTPS live POST, while `scripts/check-production-contact-runtime.mjs` asserts that approved production runtime upgrades `/paths/logistics/` to `Send request` and `/api/logistics-lead`; closed issue #1344 records prior live receiver proof. A static text crawler showing `Preview request` therefore does **not** prove the real browser lacks a send button. The live mode for every route and current final provider-delivery, human qualification and revenue stages were **not reverified** in this audit; track browser mode → API acceptance → final provider delivery → human qualification separately. Do not reopen #1344 or bypass preview-safe raw shell to force a synthetic green check.
6. Current SEO built source includes canonical, reciprocal hreflang and sitemap tests; do not create parallel indexable landing pages for "why Hermes" and do not alter canonical or schema without evidence. Existing PR #1850 owns visual motion/cinematic Marketing redesign (and HomeMasterScene.astro), so this fix explicitly leaves that PR's files untouched.

## Google Search Console sample (read-only API; no inferential uplift claim)
Connected URL property `https://hermeslogisticsus.com/`, finalized period 2026-10-09 through 2026-10-11, free_recent_three_days, no comparable prior-period slice:
- `/contacts/`: 9 impressions, 0 clicks, avg position 2.78.
- `/company-information/`: 9 impressions, 0 clicks, avg position 4.44.
- `/about/`: 8 impressions, 0 clicks, avg position 3.875.
- GSC returned a same-query multi-page candidate on `what is there website` with a **single** homepage impression; do NOT treat this as cannibalization proven by one query instance.
Three-day limited GSC sampling supports monitoring, NOT statistical conversion inference, long-term SEO growth, full Search Console audit or ranking change claims. Search rankings, CVR, sales, qualified leads and real testimonial advantage remain unproven here.

## First-view USP / decision scorecard (binary rubric; evaluate by real user and analytics later)
For each of the four business directions and each of six home languages:
1. **Audience & outcome:** within one interaction, can a visitor name who the service is for, problem addressed and appropriate next step?
2. **Differentiation:** one concrete workflow or limitation distinguishes the operating approach, not generic adjectives (“best”, “innovative”, “guaranteed”).
3. **Claim/evidence pair:** at most one extra click to an authentic public source; exact fact, date, accountable owner and limits; no invented testimonial/client roster or unverified live service.
4. **Offer clarity:** published product maturity LIVE vs PILOT vs PREVIEW, actual scope, price only when approved, and any qualification/eligibility conditions.
5. **Trust / objections:** legal identity, privacy, process, safety, performance proof, limitations and clear contact route; no blanket promise of carrier loads, pickups, search rankings, employment or revenue.
6. **Direct next action:** full specific direction link plus a single viable /contacts/ route; measure clicked → completed request → delivered → human qualified → agreement → revenue, each stage DISTINCT; `UNKNOWN != 0`.
7. **Accessibility/mobile:** text without JS, heading hierarchy, 44px targets, reduced motion, contrast and no 390px overflow; visual layout parity 390/430/768/1024/1440 needs actual screenshot/owner approval.
8. **Search/AI discovery:** same-locale canonical/hreflang, real Service/Organization/Breadcrumb schema only as applicable, indexable unique purpose, honest llms.txt & source-dated entity consistency, page performance. Do not use SEO filler or force hreflang pointers to an English-only proof page.
9. **Social/referral previews:** title, distinct description, OG/Twitter image, URL canonical identity, no fabricated signal; preview needs real messenger share inspection.
10. **Performance and outcomes:** LCP/INP/CLS and consent-based funnel events from actual monitored data; verify source/date/device/Country and accessibility, not synthetic CI pass as user satisfaction.

## Implementation lane in this PR
A single `HomeProofDecision.astro` is rendered below the current English home choice and immediately following localized Home hero. It adds four SEO-crawlable, lightweight, honest claim/evidence/direction cards for `en/uk/ru/es/it/fr`; source links are visibly marked as English on non-English roots; canonical service links always use the existing locale owner. A consent-neutral `/contacts/` link is explicit. No artificial review stars, revenue figures, new SEO pages, backend intake, tracking pixels, schema changes, WebGL, paid tools or new plugin required.
A bounded Playwright test covers four correct proof+locale links, mobile 390, evidence click, source readability without JS and no proof-band overflow.
**Approval:** CI PASS must precede human/owner visual review for 390/430/768/1024/1440, keyboard/reduced-motion and SEO/no-index regression. DRAFT PR stage only; do not merge silently.

## Remaining owner tasks — do not repeat closed prior audits
- Marketing: confirm each proof item against live current approved claims register and Case owner before release; evaluate qualified channel-specific replies and GSC with stable 28-day filters, not 3-day extrapolation.
- Technology / CRM: **reuse existing** approved contact live receiver (#1344 CLOSED). Check browser-hydrated live form, receipt ID, final delivery status and human qualification on selected routes before asserting a UX/conversion defect; static raw HTML preview is deliberate fail-closed behavior, not proof of no live form. Assess consent, abuse controls, D1/private storage, inbox suppression, privacy and attribution before new modifications. No AI outgoing emails under CEO global no-send ban.
- Design: compare actual screenshots of 6 language roots and critical 4 direction pages at all mandated breakpoints; preserve V4 owner-approved scene and make locale changes only after reviewed visual choice. Unconnected Opera connector means **no screenshots were audited this turn**.
- SEO: keep previous loss-recovery source, exact canonical/hreflang mappings, GSC indexing facts and pages; do not mass-translate thin pages or replace existing money URL owners.
- Hermes Connect/Academy/Sales/HR: clarify proof vs demo vs training; tag genuine submitted inquiries vs tutorial/candidate/QA events; no false KPI conversion.

## Proof and safety rules
PR opened only after verifying existing #1850 file ownership; it does not touch `HomeMasterScene.astro`, `src/lib/home-portal-motion.ts`, or #1871's Technology proof band. Source/CI/production/conversion are separate states. No public outbound communications, account logins, emails, CRM role grants, HAE modifications, paid plugin purchases or claim that "all tests everywhere are perfect".
