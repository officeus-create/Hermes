# Hermes Design — Master Backlog

Last updated: 2026-09-03

This is the active Design 4 queue. It prevents historical ideas, already-fixed defects, stale PRs and speculative recommendations from repeatedly returning as current work.

## Status vocabulary

- `DONE` — implemented, merged, deployed and verified at the evidence level required by the owner rule.
- `MERGED_VERIFY` — merged into canonical runtime; production/live verification still remains.
- `ACTIVE` — current bounded work with a concrete implementation path.
- `VERIFY` — implementation exists; a specified evidence gate remains.
- `REWORK` — useful product/backend logic exists but the current UI/shared-file execution must converge on the canonical Design OS.
- `EXTERNAL_GATE` — requires authorized owner/admin action outside ordinary repository code work; do not block unrelated safe implementation work.
- `OWNER_DECISION` — do not invent a choice.
- `EXTENSION` — approved direction, not a launch blocker.
- `REJECTED / SUPERSEDED` — historical provenance only.

## Owner completion rule

Use the strongest required chain:

`Visual → UX → Conversion → Mobile/A11y → Backend truth → SEO crawl/index → GEO/entity clarity → merge → production deploy → live verification`.

A branch, mergeable PR, green unit test, merge or screenshot is not 100% by itself.

- **100%** requires appropriate production/live verification.
- **101%** requires real willingness-to-pay/revenue proof for commercial work.

## P0 — current execution

| Status | Item | Evidence / next action |
| --- | --- | --- |
| `DONE` | Repository dependency/security gate | #1024 is merged; reproducible patched lockfile and dependency audit are canonical. Reopen only for a new advisory or reproducibility failure. |
| `MERGED_VERIFY` | Owner-approved public Design 4 polish | #1020 merged at `7f305d6005adbde0d19ee0b856218a68182e30db`; exact-head Website/visual evidence passed before merge. Production/live verification remains. |
| `MERGED_VERIFY` | Complete Russian Academy lesson content | #954 merged at `31c0077abab4e6a5da0ad2a36d9c0689bebfd53d`; canonical English IDs/structure preserved, RU content layer complete under strict parity contract. |
| `MERGED_VERIFY` | SEO-safe Academy learner handoff | #1025 merged at `146d5f976fcd1eb452ce2d42cb1f82c9e88bf078`; one restrained tertiary learner route, crawlable fallback, locale preserved. |
| `MERGED_VERIFY` | Hermes Connect capability GEO hierarchy | #1026 merged at `45033b6b138f59ac44764392fa69f604819baf03`; reference capability `WebPage` entities belong to parent Hermes Connect `WebApplication` without claiming false live apps. |
| `MERGED_VERIFY` | London responsive / locale-safe QA | #1027 merged at `aa0ecb361d18af9b8f9deae38f521d010c1b8b87` after full exact-head browser suite; valid Design scope extracted from superseded mixed #926. |
| `MERGED_VERIFY` | Repair public/private IA cleanup | #1028 merged at `77ec30d5212756d65b1d363d119651ccc90dff8a`; final exact-head Website checks and five-width visual evidence passed. Public source no longer exposes dashboard/availability/customers deep links; commercial SEO/GEO links and $99 offer remain. |
| `ACTIVE` | Design source-of-truth sync | #1009 is replayed from final current `main`; only `CURRENT_STATE.md` + this backlog belong in the PR. Merge after docs-only exact-head validation. |
| `ACTIVE` | Authenticated private five-width responsive matrix | Reuse existing mock/auth-backed private tests for Repair / Academy / Beauty / Internal AI across 390 / 430 / 768 / 1024 / 1440. Do not use unauthenticated private screenshots that redirect to login and produce false evidence. |
| `EXTERNAL_GATE` | Production deploy / live verification | #961 remains open: code-side auto-deploy trigger works, but Cloudflare production credentials/bindings require authorized owner/admin reconciliation. Keep `MERGED != DEPLOYED != LIVE_VERIFIED`. |

## P1 — implemented foundations to preserve

| Status | Item | Evidence / rule |
| --- | --- | --- |
| `DONE` | Option №02 production mark | #929/#959; one approved continuous-loop geometry across production contexts. |
| `DONE` | Pearl public / Obsidian operational Design OS | #930/#959 and follow-up refinements. |
| `DONE` | Four canonical public direction colors | Logistics `#1E88FF`, Marketing `#00C853`, Academy `#7C5CFF`, Technology `#FF7A00`; already applied and accessibility-adjusted. |
| `DONE` | Workspace semantic color cues | Repair blue, Academy violet, Internal AI orange, Beauty Connect cyan. Cues orient the user; they are not separate brands. |
| `DONE` | One Hermes identity / private portfolio switcher | Server-authoritative `/api/hermes-connect/account`; do not grant from localStorage/email/name/role text. |
| `DONE` | Repair mobile/accessibility foundation | Existing 44px/contrast/containment and real mock-backed browser coverage. |
| `DONE` | Academy learner foundation | Shared Hermes identity, private learner state, human progression gate, canonical program IDs. |
| `DONE` | Beauty private owner foundation | Bounded private owner/workspace controls; no invented fifth brand color. |
| `DONE` | Internal AI private foundation | Authenticated owner/internal capability and fail-closed access behavior. |
| `DONE` | Public five-width visual evidence mechanism | Existing workflow captures/validates 1440 / 1024 / 768 / 430 / 390 on exact PR heads. |

## P2 — current Design OS convergence

| Status | Item | Required execution |
| --- | --- | --- |
| `REWORK` | Website Factory B1 (#955) | Preserve D1 drafts, autosave/resume/delete, 9-step brief, readiness/immutable submit, retry/delivery state, shared Hermes auth and truthful `build_started: false`. Remove stale Factory mini-accountbar and custom mini-product shell. Add neutral/no-current-workspace shared switcher mode; show only server-authorized real workspaces. Use Pearl-first work surface, Obsidian decisive actions, Technology context, 390px containment, focus/reduced-motion. After successful in-page shared login/register, reload so the shared switcher rehydrates authenticated state. |
| `REWORK` | HR adaptive interview (#1016) | Preserve candidate/reviewer D1 safety, human gate, Academy identity bridge and backend authorization. Candidate gets one dominant Start/Continue path. Reviewer/admin belongs in private Hermes shell. Add backend-authorized `hr` portfolio capability without client bypass. Replay shared files semantically onto current `main`. Finish full RU/UK candidate-shell localization, not only dynamic questions. |

## P3 — owner decisions, not bugs

| Status | Item | Rule |
| --- | --- | --- |
| `OWNER_DECISION` | Beauty & Wellness canonical direction accent | No fifth owner-approved direction color exists. Keep Connect cyan / neutral contextual treatment until explicit approval. |
| `OWNER_DECISION` | Any replacement of Option №02 | Current mark is locked. New logo families are rebrand proposals, never silent refinements. |

## P4 — approved non-blocking extensions

| Status | Item | Guardrail |
| --- | --- | --- |
| `EXTENSION` | Dedicated Hermes Connect social/OG card | Use Option №02 with proper provenance; not a release blocker. |
| `EXTENSION` | Public authenticated-account affordance | Reuse existing switcher/account API; do not revive Global Account duplicates. |
| `EXTENSION` | Explain-by-Interaction | Guiding question → awareness → understanding → application; core meaning remains server-rendered and accessible. |
| `EXTENSION` | Connected Thread storytelling | Use only where it clarifies person/request → Hermes → action → outcome. |
| `EXTENSION` | Hermes Intelligence Core / subtle living flow | Calm and reduced-motion safe; one user-facing Hermes Intelligence, not a swarm-of-bots aesthetic. |
| `EXTENSION` | Contextual 3D / flow waves | Restrained, performance-first, not cyberpunk. |
| `EXTENSION` | Adaptive onboarding by business type | Progressive disclosure; configure relevant modules instead of showing everything. |
| `EXTENSION` | Richer empty/error/offline states | Add within each workspace implementation phase as real product states. |

## Superseded / historical — do not reopen as current specs

- #1004 / #1005 / #1008 — duplicate Global Account replay chain; current private server-authoritative switcher is canonical.
- #935 — stale Academy third-primary-CTA execution; preserved requirement is already merged as #1025.
- #926 — mixed London Design + Marketing attribution branch; valid Design QA is already merged as #1027.
- #1029 — accidental duplicate of #1028.
- Brand V1/V2/V3 parallel production proposals — historical only; Design 4 operates on one canonical responsive runtime.

## Historical idea filter

Keep only when current evidence supports it:

- compact non-blocking consent;
- readable hero contrast/no text collision;
- one primary decision per screen;
- reduced repeated CTA/feature clutter when an observed page audit proves it;
- real workflow over generic feature-wall storytelling;
- interaction that demonstrates causality while remaining useful without JavaScript.

Do not implement automatically:

- unsupported conversion/performance claims;
- unverified offices, locations, availability, production status, pricing, trials or response-time promises;
- wholesale brand/direction renames;
- team photography without rights/provenance;
- giant rewrites based only on old AI opinions;
- parallel Brand V1/V2/V3 production trees;
- new logo candidates competing with Option №02;
- copied proprietary UI/trade dress or unlicensed material.

## Current execution order

1. Replay and merge #1009 docs-only source-of-truth sync on final `main`.
2. Add authenticated/mock-backed private responsive coverage across 390 / 430 / 768 / 1024 / 1440 and fix only observed regressions.
3. Converge Website Factory #955 onto current Design OS without a second account system or stale Factory shell.
4. Converge HR #1016: backend-authorized HR workspace, complete candidate RU/UK shell, then bounded reviewer/admin shell convergence.
5. When authorized owner/admin access resolves #961, run exact-main production deploy + custom-domain/live proofs and promote only verified items from `MERGED_VERIFY` to `DONE`.
6. Keep Beauty accent as `OWNER_DECISION`; execute non-blocking extensions only after the current bounded queue is exhausted.
