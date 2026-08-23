# Hermes GEO — Current State

Updated: 2026-08-23

Canonical execution backlog: #753  
SEO execution router: #346  
Search measurement source of truth: #206  
External entity reconciliation: #204  
Authority pipeline: #368  
Material public visual/design gate: #665 / #694

## Scope

GEO owns public AI visibility, entity consistency, citations, answer-engine evidence, factual-error tracking, source coverage, competitor share, and AI referral measurement.

It does **not** own Hermes Connect auth, D1, booking, CRM, private Academy/Beauty flows, or other private product internals. It also does not silently rewrite SEO title/meta/canonical ownership or mass-generate pages.

## Current canonical contracts

- Hermes is the public root entity.
- The public direction hierarchy is Hermes Logistics / Hermes Marketing / Hermes Academy / Hermes Technology.
- Subordinate operating/program labels may remain where factual (for example ProgressoPro or IT Development), but they must not compete with the approved root/direction hierarchy.
- Held/unverified external profiles must not leak into `sameAs` or unsupported Organization claims.
- Every public claim must remain evidence-backed; unknown stays unknown.

## AI visibility system already present

The repository contains a governed AI-visibility prompt/observation model across Logistics, Marketing, Academy, and Technology, with ChatGPT, Gemini, Copilot, Perplexity, Google AI Mode and other-provider classifications.

The observation contract records structured fields such as brand mention, linked citation, cited path, recommendation strength, entity/description accuracy, factual error, competitors, corrective action, and evidence reference. Full AI conversations are not the evidence store.

Current prompt registry covers commercial, comparison, educational, problem-solving, and brand-discovery intents with explicit canonical owners, expected facts, and prohibited claims.

## Proven / protected public resource owners

Current useful resource owners include:

- `/logistics/resources/auction-vehicle-pickup-checklist/`
- `/logistics/resources/car-hauler-capacity-checklist/`
- `/logistics/resources/new-authority-car-hauler-readiness-checklist/`
- `/logistics/resources/broker-setup-packet-checklist/`
- `/logistics/resources/dispatch-service-vs-self-dispatch/`
- `/resources/search-to-inquiry-conversion-checklist/`
- `/resources/technical-seo-checklist/`
- `/resources/website-project-brief-template/`

Do not create another generic authority/checklist page unless distinct demand, distinct evidence, and a real content gap justify a new canonical owner.

## Current bounded engineering work

- Public four-direction entity hierarchy is being converged through the current bounded public-truth PR rather than the old stacked public/GEO branch.
- GEO-400 tasks 366–367 are implemented in the bounded car-hauling semantic-authority PR: commercial owner → Broker Setup Packet Checklist and → New Authority Readiness Checklist, with regression protection.
- Existing protected resource winners retain self-canonical/indexable state, commercial handoffs, and no-guarantee boundaries.

Never call a pending PR merged or CI-verified until its exact current head is green and merged.

## Authority state

The authority registry already contains 15 evidence/relevance-classified opportunities. The research-count target is met; do not inflate it with weak directories.

Highest-priority Logistics mappings remain:

- WMCA → New Authority Readiness / Car Hauler Capacity;
- WATDA → Auction Vehicle Pickup Checklist;
- TIA → Broker Setup Packet Checklist;
- NAAA → Auction Vehicle Pickup Checklist.

Actual membership, outreach, sponsorship, partnership, negotiation, or payment is a Sales/Partnerships/Operations action. GEO/SEO records the target, destination, evidence requirements, published citation and referral result. Paid advertising is not earned authority.

## External evidence still required

These cannot be inferred from CI, sitemap submission, IndexNow, branch Preview, or unauthenticated public search sampling:

1. authenticated GSC page/query evidence for comparable 7-day and 28-day windows;
2. `Country = United States` + `Device = Desktop` page/query evidence where sample size permits;
3. exact Google URL Inspection / JobPosting enhancement evidence for priority owners;
4. exact Bing URL/index state and current search-performance evidence;
5. GA4 exact-once priority event receipts and duplicate-tag/privacy verification;
6. manual 48-prompt × provider AI observation coverage and comparable follow-up waves;
7. owner-authenticated correction of conflicting third-party Hermes profiles under #204;
8. aggregate human qualification/opportunity outcomes where safely available.

Missing external evidence means `NOT_YET_VERIFIED`, not failure and not zero.

## Decision rules

- No new indexable owner from a keyword list alone.
- No location/lane/equipment permutations from aggregate demand.
- No title/meta rewrite without owner-specific query/position/CTR evidence.
- No ranking-lift attribution from an internal-link change alone.
- No sameAs publication for a held or ambiguous entity.
- No unsupported office, fleet, employee, customer, revenue, ranking, award, certification, result, load, rate, capacity, or employment claim.
- No mass AI-generated pages or mass guest-post/backlink campaigns.
- Material visual changes remain Preview + desktop/390 QA + CEO approval work.

## Next autonomous GEO actions

1. Finish exact-head CI/merge of the bounded public entity and semantic-authority releases without touching Hermes Connect internals.
2. Keep the 15-target authority registry current using primary sources; activate only genuinely relevant opportunities after identity/fit gates.
3. Re-run schema/provider/answer parity after any approved entity relationship change.
4. Consume authenticated GSC/Bing/GA4/AI-wave evidence when it becomes available and route the next change from that evidence.

## Stop condition

Do not open another GEO implementation wave merely because historical checkbox backlogs exist. Start a new public owner/content/entity experiment only when current evidence identifies a concrete defect or opportunity that is more valuable than closing the remaining measurement, entity, citation, or qualification gaps.
