# Instagram Skills adoption — Hermes / ProgressoPro

Date: 2026-10-26. Stage: DRAFT PR ONLY; NOT MERGED, NOT ACTIVATED IN PRIVATE CHATGPT PLUGINS, NOT LIVE_VERIFIED.

Donor: https://github.com/Jakeschincariol/instagram-agent-skill/tree/d03c56bb598be770c60b201f94237e5d1a4268a6 (MIT, license retained).
Primary owner: `hermes-marketing-growth` existing private plugin. Do **not** create duplicate plugin; the 13 Claude skills are task skills, not 13 agents or a second command center. Other roles: `hermes-design-hub` for creative quality; QA for independent evidence; Sales and Hermes Connect for attributed business outcomes; Knowledge Curator for One Brain verified lessons; HAE for eventual deterministic runtime only.

## Skills
`ig-reel, ig-viral, ig-caption, ig-carousel, ig-story, ig-profile, ig-plan, ig-human, ig-comment, ig-reply, ig-dm, ig-repurpose, ig-audit`. Local tooling: 2 reel scripts + hook formula JSON; caption linter; humanize/detect + vocabulary JSON; swipe outlier ranker; profile rubric JSON.

## Workflow
`SOURCE_PERMISSION -> CLAIM_PROOF -> SINGLE_BRAND_ACCOUNT -> VOICE -> TOPIC_HYPOTHESIS -> 3_HOOKS -> LOCAL_SCRIPT/BEAT/CAPTION_QA -> DESIGN_QA -> OWNER_APPROVAL -> CANONICAL_PUBLISHER_ONLY -> PROVIDER_ID/READBACK -> INSIGHTS -> QUALIFIED_LEAD -> CONTRACT/REVENUE_RECEIPT -> REVIEWED_LESSON`.
Pending/missing rights, identities, analytics or verified claims = HOLD/UNKNOWN. Content research is not automatic scraping. Do not auto-DM, auto-comment, auto-post or spend without explicit authorization. Keep Facebook on HOLD.

Pilot 1: ProgressoPro US website/marketing leads. Pilot 2: Hermes Logistics car-hauling carriers. Pilot 3: Hermes Connect repair shops. Each needs one audited offer, real account and lawful metrics. Account-specific voice files and analytics must stay outside public GitHub. No invented numbers, simulated comments or synthetic leads counted toward KPI.

Baseline: use median performance of the SAME account's recent material; compare outlier multiple, saves, profile visits, website clicks, qualified inquiries, CRM opportunities and verified revenue. Not just views and followers. Source dates and confidence count; UNKNOWN != 0.

## HAE release boundary
HAE P0.1 (same-SHA natural heartbeat, read-only proof, independent QA) takes precedence. These repo additions contain **no** changes to Worker/D1/Queue/cron/schedule/production publishing. Proposed future job `marketing.instagram.content.draft.audit` remains a **candidate**, not a registered/live job; require reviewed schema, role contract, permissions, CI, readback and separate release.

## Acceptance checklist
- All 13 skill definitions + MIT license and offline tools exist.
- Source is pinned; every skill has mandatory brand/account, no-write, provenance gate.
- Static/checker tests on synthetic fixtures; no unknown provider access.
- Single private voice/swipe/log namespace per account; no cross-customer leakage.
- Human visual/fact checks and external-write approval unchanged.
- Draft PR independently reviewed; no auto-merge. Plugin version update independent, if approved.
