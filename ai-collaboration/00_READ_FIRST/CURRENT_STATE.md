# Hermes AI Ecosystem — Current State

Last updated: 2026-09-01
Evidence checkpoint: `officeus-create/Hermes` canonical `main` = `06e0d52446a74e454d1e42da83cbc2d77341553c`
Freshness class: `CURRENT_GITHUB_ROUTING_AND_GOVERNANCE_SNAPSHOT`

## Purpose

This is a compact bridge, not timeless truth. Before any repository mutation, fetch fresh `main`, enumerate all open PRs, identify the active writer, inspect exact-head evidence, and obey the current owner lane split.

## Source precedence

1. Latest explicit owner decision.
2. Fresh authenticated production/platform evidence.
3. Current GitHub `main`, open PRs, exact heads, checks/reviews and active issues.
4. Canonical AI Master Operating Board / One Brain.
5. Current department/task brief.
6. Historical documents, handoffs and chat.

## Governance

- Hermes Operating Stack (HOS) + Hermes Universal Evidence Gate (HUEG) are canonical.
- Core rule: `ONE TASK / ONE ARTIFACT / ONE ACTIVE WRITER — MANY REVIEWERS`.
- `MERGED != LIVE_VERIFIED`; green CI does not override owner/security/legal/writer-lock gates.
- Main branch protection is currently disabled; required-status enforcement is off. Issue #938 remains the owner/admin platform-enforcement gate.
- One Brain ACL risk remains tracked in issue #431. Fresh Drive metadata observed `anyone = writer` on multiple One Brain/control-tree nodes; remediation is an owner/admin action because the current connector does not expose permission removal.
- Every material agent handoff must use the Agent Report Passport and learning ledger: model/version if exposed, execution surface, chat/agent name, role/lane, date/time/timezone, task scope, source of truth, evidence, confidence class, learned facts, skills used, new/improved skill, proof, and next-agent reuse.

## Current owner routing override — 2026-09-01

This ChatGPT thread is an **integration / governance / One Brain** lane.

### In scope here

- One Brain / Google Drive governance, canonicalization, source reconciliation and task routing.
- Drive ACL/access-risk discovery and security handoff to owner/admin.
- Claude exit/migration acceptance after Codex 2 produces the fresh transfer package; Claude remains `DECOMMISSION_HOLD` until evidence-backed acceptance and independent audit.
- GitHub governance, machine-state freshness, PR archaeology/classification and cross-agent reconciliation.
- Connected-source evidence verification for this lane.
- Cross-chat collision prevention and writer-lock routing.

### Explicitly out of scope here

- Hermes Connect design/UI/branding → dedicated Design Hermes Connect lane.
- Hermes Connect AI / Internal AI / AI Connect runtime/features → dedicated `AI Hermes Connect` lane.
- SEO/GEO promotion, local SEO, rankings, backlinks and search-content implementation → dedicated SEO/GEO lane(s).
- Other product/domain implementation with an active specialist owner (Beauty, Academy, London, ordinary Hermes Connect product work) → route to that owner; do not take over from governance.

A task discovered here that belongs to a specialist lane is recorded/routed, not implemented.

## Fresh GitHub checkpoint

Current canonical main:

`06e0d52446a74e454d1e42da83cbc2d77341553c`

The latest main commit is the specialist-owned unified account-switcher merge. This governance thread did not implement that product slice; it is recorded only because it materially changed current-main truth.

Fresh open PR enumeration at this checkpoint returns 13 PRs:

| PR | Routing classification |
| --- | --- |
| #944 | `DESIGN_LANE / OUT_OF_SCOPE_THIS_THREAD` |
| #943 | `HERMES_CONNECT_PRODUCT_LANE / OUT_OF_SCOPE_THIS_THREAD` |
| #942 | `AI_HERMES_CONNECT / OUT_OF_SCOPE_THIS_THREAD` |
| #941 | `GOVERNANCE_MACHINE_STATE / OWNED_HERE` |
| #940 | `AI_HERMES_CONNECT / OUT_OF_SCOPE_THIS_THREAD` |
| #935 | `ACADEMY_LANE / OUT_OF_SCOPE_THIS_THREAD` |
| #926 | `LONDON_GROWTH_OR_SEO_GEO_LANE / OUT_OF_SCOPE_THIS_THREAD` |
| #887 | `AI_HERMES_CONNECT / OUT_OF_SCOPE_THIS_THREAD` |
| #886 | `AI_HERMES_CONNECT / OUT_OF_SCOPE_THIS_THREAD` |
| #885 | `AI_HERMES_CONNECT / OUT_OF_SCOPE_THIS_THREAD` |
| #882 | `AI_HERMES_CONNECT / OUT_OF_SCOPE_THIS_THREAD` |
| #877 | `AI_DECISION_DONOR / SOURCE_ONLY / ROUTE_AI_HERMES_CONNECT` |
| #871 | `STALE_SOURCE_ONLY_CORPORATE_AUDIT / GOVERNANCE_DONOR` |

Do not infer ownership from PR age/title alone. Fresh owner routing and exact current diff always win.

## Governance PR #941 replay

PR #941 was originally created from `809b1807...`. Main advanced afterward to `06e0d524...`, so the governance branch was intentionally replayed from the new exact main instead of merging a stale snapshot.

Safety actions:

- pre-replay head `6f852224a0f7a43be4e9120b2617d3c0a0c835f2` preserved at `backup/governance-current-state-closeout-pre-06e0-2026-09-01`;
- active branch reset to exact current main before rewriting only the two machine/governance state files;
- no product, design, AI Connect or SEO/GEO file was modified.

Promotion rule: exact-head CI must be green before #941 can be considered merge-ready. If main changes materially again first, refresh or classify #941 stale rather than merging an obsolete state snapshot.

## Claude exit / migration state

Codex 2 reported an intermediate `PHASE_2_BLOCKED` transfer with claimed local artifacts and two blockers. That report is **not accepted as final** because:

- the reported transfer path carried an anomalous historical-looking `20240517_143042` timestamp;
- artifact accounting covered only 8 JSONL sessions while the audit also referenced skills, `CLAUDE.md`, Digital CEO Bridge, exit packs and code/dependency evidence;
- claimed `claude-python@3.2.1` and `hermes-sdk@v2.4.7` dependencies still require exact source/consumer/breakage proof;
- Telegram MCP being offline should be classified as an operational follow-up unless it physically blocks knowledge transfer.

Required next artifact from Codex 2:

`~/Hermes-Claude-Exit-2026-09-01/CHATGPT_TRANSFER/HERMES_CLAUDE_EXIT_CHATGPT_TRANSFER.md`

Until that fresh package is supplied and reconciled: `CLAUDE_DECOMMISSION = HOLD`.

## One Brain security state

Fresh Drive metadata observed anonymous writer access (`type=anyone`, `role=writer`) on multiple control-tree nodes including the canonical Master Board parent chain. This is an integrity P0.

Current connected surface can inspect metadata but does not expose safe permission removal. Therefore:

1. keep issue #431 as the security source of truth;
2. owner/admin must remove anonymous writer access at the highest applicable parent while preserving required named-account/service access;
3. ChatGPT rechecks representative file/folder metadata after remediation;
4. secrets and plaintext credentials remain outside ordinary One Brain knowledge documents.

## Immediate next actions for this thread

1. Keep #941 current with exact main and exact open-PR routing; do not merge a stale machine snapshot.
2. Continue One Brain ACL/security evidence and owner/admin remediation handoff.
3. Receive and audit the fresh Codex 2 Claude transfer package when supplied; do not decommission Claude early.
4. Continue PR archaeology only for governance/source-of-truth cleanup; route specialist product PRs to their active owner chats.
5. Keep Agent Report Passport + learning ledger mandatory for all future delegated tasks.

## Operating rule

A stale current-state file is itself a bridge defect. Fresh GitHub/platform/owner evidence supersedes this snapshot immediately when material state changes.