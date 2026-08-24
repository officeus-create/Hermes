# Hermes Academy asset inventory and first-course assembly

Issue: #587  
Parent: #585 / #644  
Reviewed against main: `e6b730b8eb1a60d83458b28def9025a398fe4dd2`  
Status: `SOURCE_RECONCILIATION / NO_RUNTIME_CHANGE`

## Purpose

This document reconciles existing Hermes Academy/training material before any new lesson runtime is added. It is intentionally an inventory and assembly map, not a second Academy product, auth stack, curriculum store, reviewer system, pricing system, or public claim source.

Current Academy A1-A4 already provide shared Hermes identity/enrollment, curriculum self-progress, private submissions/human review, support, and human progression. The remaining near-term content problem is to turn the existing concise module map into genuinely learnable lesson/task sequences by reusing existing source material.

Private Drive source identifiers, learner/candidate/customer data, credentials, compensation figures, and other private identifiers are deliberately omitted from this public repository document.

## Classification contract

`COURSE_LESSON | TASK | TEMPLATE | SCRIPT | QUIZ | PRACTICE | REVIEW_RUBRIC | REFERENCE | OBSOLETE | DUPLICATE`

Readiness:

`READY | NEEDS_EDIT | NEEDS_STRUCTURE | NEEDS_FACT_CHECK | PRIVATE_ONLY`

## Current canonical product surfaces to preserve

| Source | Current location | School | Course | Module | Classification | Readiness | Duplicate of | Gap | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public Academy curriculum data | `src/data/academy-subsite.ts` | U.S. Logistics | U.S. Logistics Operations | 6 current modules | REFERENCE | READY | — | Module summaries are not full lessons | Keep as canonical public curriculum outline |
| Authenticated Logistics curriculum | `src/pages/services/hermes-connect/academy/program/[program].astro` | U.S. Logistics | U.S. Logistics Operations | stable lesson IDs | REFERENCE | READY | public curriculum data | Cards currently summarize modules | Reuse IDs and attach reconciled lesson content later |
| Public Academy curriculum data | `src/data/academy-subsite.ts` | Marketing & SMM | Marketing | 6 current modules | REFERENCE | READY | — | Module summaries are not full lessons | Keep as canonical public curriculum outline |
| Authenticated Marketing curriculum | `src/pages/services/hermes-connect/academy/program/[program].astro` | Marketing & SMM | Marketing | stable lesson IDs | REFERENCE | READY | public curriculum data | Cards currently summarize modules | Reuse IDs and attach reconciled lesson content later |
| Evidence workspace | `/services/hermes-connect/academy/submissions/` | Shared | Shared | assignment submission | REFERENCE | READY | — | Needs real assignment definitions | Reuse; do not create another submission store |
| Reviewer workspace | `/services/hermes-connect/academy/reviewer/` | Shared | Shared | human review | REFERENCE | READY | — | Needs course rubrics attached to assignments | Reuse separate reviewer authorization |
| Progression workspace | `/services/hermes-connect/academy/progression/` + reviewer progression | Shared | Shared | human progression | REFERENCE | READY | — | Needs reviewed lesson/task evidence to become useful | Reuse; no automatic job/certification outcome |
| Learner support | `/services/hermes-connect/academy/support/` + reviewer support | Shared | Shared | questions/support | REFERENCE | READY | — | No content gap | Reuse existing support boundary |

## Reconciled private/source assets

Exact private Drive IDs are intentionally not published here. The canonical private source register remains the authorized location for those identifiers.

| Source alias | Current location | School | Course | Module | Classification | Readiness | Duplicate of | Gap | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ACADEMY-LOGISTICS-CONVERSATION-MODULES` | Private Academy source corpus | U.S. Logistics | U.S. Logistics Operations | Carrier & broker communication / negotiation | COURSE_LESSON | READY | — | Owner checklist in source still asks for final terminology/reviewer/language confirmation | Use as primary first full lesson; preserve claim/data boundaries |
| `ACADEMY-LOGISTICS-CONVERSATION-PRACTICE` | Same private lesson source | U.S. Logistics | U.S. Logistics Operations | Negotiation practice | PRACTICE | READY | — | None for synthetic exercise | Attach to A3 evidence submission |
| `ACADEMY-LOGISTICS-CONVERSATION-RUBRIC` | Same private lesson source | U.S. Logistics | U.S. Logistics Operations | Negotiation practice | REVIEW_RUBRIC | READY | — | None structurally | Map Pass/Revise items to human reviewer feedback; never auto-promote learner |
| `HERMES-LOGISTICS-STEP-BY-STEP-COURSE` | Historical private training source | U.S. Logistics | U.S. Logistics Operations | course operating sequence | REFERENCE | NEEDS_EDIT | — | Historical commercial/earnings and old live-practice wording are not current approved Academy terms | Reuse only learn → observe → assess → supervised practice → review sequence; exclude compensation promises |
| Historical call-listening / call-analysis routine | Existing training/candidate corpus | U.S. Logistics | U.S. Logistics Operations | communication practice | PRACTICE | NEEDS_EDIT | conversation lesson | Real calls may contain private data | Convert to synthetic/anonymized call-analysis exercises unless explicit approved data exists |
| Historical negotiation repetition exercise | Existing training/candidate corpus | U.S. Logistics | U.S. Logistics Operations | negotiation practice | PRACTICE | NEEDS_STRUCTURE | conversation lesson | Raw repetition count/cadence varied historically | Preserve deliberate-practice idea; define current bounded exercise in lesson spec |
| Logistics simulator concept | Existing Hermes Academy/Connect source corpus | U.S. Logistics | U.S. Logistics Operations | equipment/lane/rate/negotiation/documents | PRACTICE | NEEDS_STRUCTURE | — | Not one current verified learner runtime | Use synthetic scenarios only; no live loads/rates/customer data |
| Carrier onboarding wizard fields | Existing Hermes Connect source corpus | U.S. Logistics | U.S. Logistics Operations | documents/setup | TEMPLATE | NEEDS_EDIT | — | Operational fields can include sensitive data | Convert to synthetic readiness/checklist exercise; never collect credentials in Academy lesson |
| `ACADEMY-MARKETING-FIRST-CONTENT-PLAN-TASK` | Private Academy source corpus | Marketing & SMM | Marketing | Website-first content | TASK | READY | — | Source-page freshness must be checked at implementation time | Use as first Marketing assignment and A3 submission payload |
| Marketing content-plan rubric | Same private assignment source | Marketing & SMM | Marketing | Website-first content | REVIEW_RUBRIC | READY | — | None structurally | Map 10 Pass/Revise criteria into reviewer guidance |
| Website-first content record template | Same private assignment source | Marketing & SMM | Marketing | Website-first content | TEMPLATE | READY | — | None | Reuse as learner deliverable schema |
| Marketing department launch packet | Private marketing source corpus | Marketing & SMM | Marketing | positioning/offer → distribution → analytics | COURSE_LESSON | NEEDS_EDIT | — | Historical timing/budget/staffing assumptions are not universal course facts | Reuse process architecture; strip fixed commercial/time claims unless separately approved |
| Commercial SMM proposal structure | Private marketing source corpus | Marketing & SMM | Marketing | positioning and offer | TEMPLATE | NEEDS_FACT_CHECK | — | Historical price/results/proof points are not current public claims | Reuse document structure only; require current evidence for claims |
| Three-phase marketing architecture | Derived from multiple existing Hermes marketing packages | Marketing & SMM | Marketing | strategy | REFERENCE | NEEDS_EDIT | — | It is a synthesis, not a measured universal law | Teach as a planning framework: foundation → distribution/growth → measurement/scale |
| Sales-manager diagnostic test | Private historical management source | Sales | Sales Team Lead | KPI diagnosis | QUIZ | NEEDS_EDIT | — | Contains historical names/private identifiers and legacy currency figures | Rebuild with synthetic sellers and normalized figures |
| Sales KPI diagnosis method | Same management source + operating practice | Sales | Sales Team Lead | calls → meetings → deals → turnover | COURSE_LESSON | NEEDS_EDIT | — | Metric meanings must be made generic/current | Preserve driver-to-outcome diagnosis; use synthetic data |
| Peer/cell coaching method | Existing operations/training corpus | Sales / Operations | Sales Team Lead | coaching | PRACTICE | NEEDS_EDIT | — | Historical instructions can be overly person-specific | Convert to paired review + explicit rubric + privacy-safe feedback |
| Daily/weekly/monthly reporting patterns | Existing management source | Operations & Management | Operations Leadership | operating rhythm | TEMPLATE | NEEDS_EDIT | — | Reporting frequency varies by role | Reuse as configurable operating-review exercise |
| Future COO packet | Existing COO source corpus | Operations & Management | Future COO | multiple | REFERENCE | PRIVATE_ONLY | — | Existing source has unresolved owner fields | Keep out of first Academy release until those gaps are reconciled |
| AI approval/redaction/read-only analytics pattern | Existing AI operations source corpus | Websites, Apps & Automation | AI-Assisted Business Operations | approval/privacy/analytics | COURSE_LESSON | NEEDS_STRUCTURE | — | Product examples must remain bounded to verified behavior | Candidate later course; not needed for first two-course exit |

## Explicit duplicate / obsolete decisions

1. Do **not** create a second learner identity, enrollment table, submission store, reviewer authorization system, support system, or progression system for lesson content.
2. Historical public/private course descriptions that only restate the six current modules are `DUPLICATE` of `src/data/academy-subsite.ts` unless they add a unique lesson/task/rubric.
3. Historical fixed earnings, compensation, guaranteed income, fixed current tuition, conversion promises, guaranteed leads/rankings/loads/rates, or unverified client outcomes are `OBSOLETE` or `NEEDS_FACT_CHECK` for Academy use and must not be copied into learner content.
4. Real call recordings, customer/carrier records, live rates/routes, credentials, contracts, identity documents, banking data, or private contact details are not Academy lesson fixtures. Use synthetic or explicitly approved anonymized evidence only.
5. A learner rubric may return `Pass/Revise` or existing reviewer states; it must not automatically grant employment, certification, client access, operational permissions, income, promotion, or cohort progression.

# First course assembly — U.S. Logistics Operations

The existing six stable module IDs remain the spine. This assembly adds content/tasks without renaming the canonical program.

## Module 1 — `dispatch-foundations`

**Outcome:** explain the operating chain and identify which party controls each decision.

- Lesson: dispatch/freight workflow foundations using current public Academy outline.
- Lesson: roles of carrier, broker and shipper; separate operating truth from sales claims.
- Task: synthetic workflow map `party → responsibility → information needed → decision owner`.
- Review: check role clarity, no invented guarantees, and correct decision boundary.

## Module 2 — `carrier-broker-communication`

**Outcome:** recognize conversation stage and ask the next useful question.

- Canonical full lesson: `ACADEMY-LOGISTICS-CONVERSATION-MODULES`.
- Five stages: first-contact clarity → diagnosis → scope/next step → objection clarification → pressure-free follow-up.
- Practice: classify synthetic conversation snippets by stage and choose one next question.
- Boundary: no real calls/private records in default course fixtures.

## Module 3 — `equipment-lane-logic`

**Outcome:** reason about equipment/lane context without pretending a load or rate is available.

- Lesson: equipment/operating-model context from existing Logistics curriculum and simulator concepts.
- Task: synthetic scenarios; choose missing facts before making an operating recommendation.
- Review: learner must distinguish fact, assumption and question.

## Module 4 — `documents-setup`

**Outcome:** understand document/setup workflow and data boundaries.

- Lesson: what a setup/readiness packet is for and why secure submission matters.
- Template exercise: synthetic carrier-readiness checklist based on existing onboarding fields.
- Privacy rule: no real W-9, insurance, banking, credential, identity or shipment documents in learner submissions.

## Module 5 — `negotiation-practice`

**Outcome:** handle an objection through clarification rather than pressure.

- Practice: existing synthetic owner-operator objection case from `ACADEMY-LOGISTICS-CONVERSATION-PRACTICE`.
- Submission: exactly the bounded response requested by the existing exercise.
- Human rubric: six `Pass / Revise` criteria from the existing source.
- Resubmission: allowed through the existing A3 reviewer loop.

This module is the strongest first end-to-end proof because lesson → task → submission → human review → revision → progression already has matching product infrastructure.

## Module 6 — `operating-rhythm`

**Outcome:** turn learning/review into a repeatable work-control loop.

- Lesson: plan → action → evidence → review → correction.
- Exercise: synthetic daily plan + end-of-day evidence + next-day correction.
- Reference only: historical fixed schedules/cadences; current course should define its own bounded cadence later.

## Logistics completion definition

A learner can:
1. explain the main operating roles;
2. identify conversation stage and ask a relevant next question;
3. reason through synthetic equipment/lane context;
4. demonstrate document/privacy boundaries;
5. submit the negotiation practice and receive human Pass/Revise feedback;
6. see the reviewed evidence reflected in the existing progression surface.

Completion of the course does not itself imply employment, certification, operational access, income, client assignment or promotion.

# Second course assembly — Marketing

Marketing is selected before Sales Team Lead because it already has a complete learner assignment, deliverable schema, ten-criterion human rubric and revision workflow that fit A3/A4 immediately.

## Module 1 — `positioning-offer`

**Outcome:** connect audience/problem/offer without inventing results.

- Lesson: offer architecture from existing marketing launch/proposal sources.
- Exercise: rewrite a synthetic offer into `audience → problem → useful scope → evidence boundary → CTA`.
- Exclude historical fixed prices and proof claims unless separately verified.

## Module 2 — `website-first-content`

**Outcome:** turn canonical website assets into a coherent one-week content plan.

- Canonical assignment: `ACADEMY-MARKETING-FIRST-CONTENT-PLAN-TASK`.
- Deliverable: five content records using the existing template.
- Human rubric: ten `Pass / Revise` criteria.
- Submission/resubmission: existing A3 reviewer loop.

This is the strongest first Marketing end-to-end proof.

## Module 3 — `platform-distribution`

**Outcome:** adapt a concept to platform context instead of copying universal text.

- Lesson: Facebook context, Threads observation/discussion, Instagram visual-first format from the existing assignment source.
- Practice: transform one synthetic source topic into three distinct platform concepts; do not publish.

## Module 4 — `lead-journey`

**Outcome:** connect content to an appropriate destination, funnel stage and next action.

- Lesson: canonical destination + audience + funnel stage + CTA.
- Task: map five synthetic records to `discovery | education | comparison | qualification | application` and explain the CTA choice.

## Module 5 — `sales-follow-up`

**Outcome:** preserve context between marketing response and a human follow-up without inventing urgency/results.

- Reuse the pressure-free follow-up principle from the Logistics conversation lesson as a shared skill, not a copied second lesson.
- Marketing-specific practice: draft a follow-up for a synthetic inbound question with one useful next action and a stop condition.
- Classification: shared lesson concept with a course-specific practice; avoid duplicating the core conversation material.

## Module 6 — `analytics-improvement`

**Outcome:** define what to observe before claiming performance.

- Lesson: choose a business-path KPI, not only vanity metrics.
- Exercise: for each content record define `expected action → observable metric → evidence source → review decision`.
- Boundary: no claim that a draft caused traffic/leads/sales without dated measured evidence.

## Marketing completion definition

A learner can:
1. build a claim-safe offer frame;
2. produce the five-record website-first plan;
3. adapt content by platform;
4. map content to funnel destination/CTA;
5. draft a pressure-free follow-up;
6. define measurement/review criteria;
7. submit the main assignment, receive human feedback, revise if required, and see progression separately from self-tracked module completion.

# Five-school target map

| School | Current strongest reusable assets | Current readiness | Immediate decision |
| --- | --- | --- | --- |
| U.S. Logistics | public six-module course + full conversation lesson/practice/rubric + historical operating training + simulator/onboarding concepts | STRONG | First course to assemble |
| Sales | sales KPI diagnostic test, coaching/reporting patterns, carrier-sales material in existing sales corpus | MEDIUM/STRONG | Third course candidate after first two |
| Marketing & SMM | public six-module course + marketing launch packet + complete website-first assignment/rubric | STRONG | Second course to assemble |
| Websites, Apps & Automation | website/project sales material + approval/privacy/AI operations patterns | MEDIUM | Later; reconcile after first two |
| Operations & Management | Sales Team Lead + COO/reporting/process materials | MEDIUM, some PRIVATE_ONLY/owner gaps | Later; reconcile unresolved COO inputs first |

# Implementation order after this inventory

1. Keep A1-A4 architecture unchanged.
2. Introduce a reusable lesson-content definition that references the existing stable program/lesson IDs rather than creating new program routes.
3. Implement the **Logistics conversation lesson + negotiation assignment/rubric** as the first complete lesson/task slice.
4. Prove learner → lesson → A3 submission → reviewer feedback → correction/resubmission → A4 progression on desktop and 390px.
5. Implement the **Marketing website-first lesson/assignment/rubric** using the same content contract.
6. Only after those two slices work, fill the remaining modules with reconciled assets in this document.
7. Keep A5 commercial access separate until exact owner-approved offer facts exist.

## HUEG boundary

This inventory proves source reconciliation only. It does **not** prove that full lessons are deployed or production-live. Any implementation slice still requires exact-head CI, relevant browser/mobile checks, and production proof before promotion.