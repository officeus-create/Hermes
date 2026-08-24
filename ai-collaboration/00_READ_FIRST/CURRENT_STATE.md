# Hermes AI Ecosystem — Current State

Last updated: 2026-08-15

## Objective

Build a shared, version-controlled knowledge and decision system where multiple AI assistants and humans can review the same current context, contribute specialized work, challenge assumptions and preserve evidence behind decisions without duplicating execution or sharing secrets.

## Active systems

- Hermes Logistics corporate website with commercial logistics, SEO, marketing, Academy and technology paths.
- Hermes Connect web-first product system and main-site bridge, with product expansion continuing iteratively.
- Direct carrier dispatch intake and direct vehicle-transport request workflows.
- Carrier proposal, plan selection, mobile onboarding, finger signature and PDF review/onboarding packet generation.
- Logistics operations, recruiting, Academy, marketing and sales workflows.
- ProgressoPro marketing and sales direction.
- GitHub-based multi-agent collaboration hub with department current-state files, decisions, proposals, handoffs and evidence records.

## Current Hermes Connect direction

Approved decisions now supersede the older exploratory design state:

- Brand System V1 is the current approved base direction under DEC-004: Hermes Connect as an AI Operating System for Business, with the approved Pearl + Anthracite/Obsidian environments, compact intelligent-knot/loop identity direction, restrained digital-flow language and unified Hermes Intelligence.
- DEC-005 establishes the web-first productization sequence: validate desktop/web first, derive responsive/mobile-web from the approved system, then begin native mobile implementation from validated components and workflows.
- New contributors should refine or extend this approved direction rather than restarting the identity or product sequence without an explicit new decision.

## Current Hermes Connect implementation

- `public/demos/hermes-connect/` is the only canonical generic preview/tool tree.
- `public/demos/hermes-connect/workspace.html` is one responsive desktop/mobile workspace; there is no separate mobile application page.
- Repair Shop production routes and D1 APIs remain a separate real product track under `src/pages/services/hermes-connect/repair-shops*` and the owner/public Repair Shop API namespaces.
- PRs #529 and #532-#545 delivered D1 auth hardening, owner services/profile/availability, real booking, persisted status history, cancelled-slot rebooking, vehicle data and booking-derived customer CRM.
- PRs #546-#548 removed duplicate Brand V1/V2 physical runtimes, corrected active guidance and removed retired runtime labels/debug output.
- PR #509 is closed as superseded. Its old branch must not be merged or used as a product source because it predates and conflicts with the later production runtime.
- Historical retired URLs remain compatibility redirects and historical release deltas remain audit evidence; neither is an active duplicate application.
- Web and installable PWA are the current supported distribution paths. The old Android APK was removed after it was found to bundle retired runtimes and use an Android Debug certificate; direct APK distribution remains blocked until a current release-signed build passes checksum and clean-device gates.

The next Repair Shop milestone is distribution to the first 5-10 permissioned real shops and privacy-safe feedback/booking measurement, not another app rewrite.

## Current revenue and SEO state

Repository work already provides:

- indexable commercial logistics and digital-service pages;
- direct mobile CTAs from priority money pages into real intake workflows;
- controlled analytics events that exclude submitted private values;
- canonical, robots, hreflang, sitemap, internal-link and structured-data regression tests;
- a short private carrier sales link at `/carrier/`;
- proposal, agreement-review and onboarding routes separated by user intent;
- build, static, contract-engine and desktop/mobile browser test coverage.

Latest sanitized SEO14 owner-provided Codex handoff dated 2026-08-14 reports:

- Google Search Console window 2026-07-28 through 2026-08-12: 17 clicks, 487 impressions, 3.5% CTR and average position 40.8;
- United States slice: 306 impressions and 2 clicks;
- `/services/seo-for-logistics-companies/`: 119 impressions and 0 clicks in that handoff;
- GSC external links: 4, reported from work.ua; GSC internal links: 28;
- production sitemap coverage: 108 indexable URLs;
- Google sitemap status: Success;
- Bing sitemap status: Success, with seven child sitemap files rather than seven total URLs;
- `robots.txt` reportedly exposes all eight sitemap references and `BingSiteAuth.xml` returns HTTP 200;
- GA4 ownership/receipt is still not platform-confirmed in the current handoff; the visible environment reportedly shows only the start-measuring state.

Evidence boundary: the metrics above are `OWNER_PROVIDED_HANDOFF` from the authenticated Codex SEO14 run supplied by the owner in the current workstream. They are current enough for prioritization, but this ChatGPT contribution did not independently open the authenticated GSC/Bing/GA4 account views and therefore does not silently reclassify them as direct `PLATFORM_VERIFIED` evidence.

## Current SEO decision boundary

SEO13 already optimized `/services/seo-for-logistics-companies/` on 2026-08-13 from authenticated GSC demand evidence. The page remains the canonical owner for logistics/trucking/transportation SEO commercial intent. Do not rewrite its title/H1/description again immediately merely because the latest snapshot still shows zero clicks; preserve the planned 7-day and 28-day measurement windows unless fresh evidence reveals a defect.

Current priority is to strengthen discoverability, relevant internal support, measurement integrity, entity consistency and external authority while preserving one canonical owner per intent.

## Current AI collaboration state

The bridge remains document/GitHub based rather than a live credential-sharing AI-to-AI bus.

**2026-08-23 governance override:** DEC-007, DEC-008 and DEC-009 supersede the older fixed identity-to-role routing below. The current model is One Brain + Hermes Operating Stack (HOS) + Hermes Universal Evidence Gate (HUEG): route each slice by required skill and verified capability, assign one primary writer and an independent reviewer when required, and continue safe reversible work when another agent is unavailable.

Current durable routing principles:

- ChatGPT — orchestration/synthesis and any connected-source execution or verification that the active surface can physically perform; not a substitute for unavailable local-shell/browser evidence.
- Codex and Claude — peer execution agents with equal baseline governance authority; either may implement or review within a bounded assigned slice, subject to actual tool access and one-writer rules.
- Antigravity — browser/local verification, research and other explicitly assigned capabilities; it may not be treated as a second source of truth or parallel writer.
- Gemini — peer agent for Workspace/research/evidence governance or other capabilities its current surface actually verifies; no GitHub/local-shell/browser capability is assumed merely from model identity.
- future agents — routed by verified capability and task scope, not vendor prestige or historical role labels.
- human owner — final authority at the applicable security/access, destructive, billing/payment, legal/contract, irreversible production/data/domain, material commercial/hiring/business-policy boundary.

The execution protocol is defined in `HERMES_OPERATING_STACK.md`. Core rule: `NO_EVIDENCE_NO_PROMOTION`. A merge, deployment, HTTP 200, green stale-head CI, or AI-generated JSON does not automatically prove the promoted business/production claim.

The collaboration protocol requires an evidence receipt, explicit task owner, source of truth, write scope and handoff target. A passing bridge/self-test is not enough if the transported context is stale.

## External evidence still required

- direct authenticated GA4 property/stream ownership and event receipt verification;
- GA4 duplicate-tag and privacy verification in DebugView/Realtime/network inspection;
- completed current Bing search-performance baseline once processing is available;
- human-qualified inquiry reconciliation and aggregate 7-day/28-day funnel scorecards;
- field Core Web Vitals from real-user data where available;
- permissioned customer/carrier cases and authoritative external-profile corrections.

## Current carrier-contract boundary

The website can create a signed review/onboarding packet and deliver/download the generated PDF through the implemented contract engine.

Final legal execution remains gated by the approved master agreement/version/hash, legal approval, private production bindings, permanent records storage and synthetic end-to-end verification. SEO or AI-collaboration autonomy does not override legal activation gates.

## Immediate next actions

1. Keep issue #206 as the measurement source of truth and add sanitized fresh evidence rather than spawning duplicate measurement issues.
2. Preserve the 2026-08-13 Logistics SEO page change long enough to measure 7-day and 28-day effects before another snippet rewrite.
3. Audit and strengthen relevant internal support paths into the Logistics SEO canonical owner without creating doorway variants.
4. Resolve GA4 ownership/access and verify controlled event receipt exactly once before adding any parallel analytics runtime.
5. Capture Bing performance when its current processing completes; do not create a replacement Bing site/account to make a checklist green.
6. Improve external entity consistency and authority through legitimate owned/claimable profiles and editorially justified references; do not manufacture backlinks.
7. Route every task through HOS/HUEG with one current writer, claim-matching evidence and bounded takeover when an executor is unavailable.

## Operating rule

This file describes the latest verified repository state plus explicitly labelled current owner-provided platform handoffs. Update it whenever a newer approved decision or authenticated measurement materially changes the operating picture. A stale current-state file is itself a bridge defect.
