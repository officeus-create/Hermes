# Hermes Design — Master Backlog

Last updated: 2026-09-03

This is the active Design 4 queue. It exists to prevent historical ideas, already-fixed defects, stale PRs and superseded implementation branches from repeatedly returning as current work.

The bounded Design OS code-convergence queue is currently exhausted. External live verification, owner decisions and approved non-blocking extensions remain intentionally separate.

## Status vocabulary

- `DONE` — completed at the strongest evidence level required for that artifact. For runtime/product work, production/live proof may still be required before 100%.
- `MERGED_VERIFY` — merged into canonical `main`; production/live verification still remains.
- `ACTIVE` — current bounded work with a concrete implementation path.
- `VERIFY` — implementation exists; a specified evidence gate remains.
- `REWORK` — useful product/backend logic exists, but stale shared/UI execution must converge semantically on current Design OS.
- `EXTERNAL_GATE` — requires authorized owner/admin action outside ordinary repository code work; do not block unrelated safe implementation work.
- `OWNER_DECISION` — do not invent a choice.
- `EXTENSION` — approved direction, not a launch blocker.
- `REJECTED / SUPERSEDED` — historical provenance only.

## Owner completion rule

Use the strongest required chain:

`Visual → UX → Conversion → Mobile/A11y → Backend truth → SEO crawl/index → GEO/entity clarity → exact-head CI → merge → production deploy → live verification → real result`.

A branch, PR, merge, document or screenshot is not 100% by itself.

- **100%** requires the appropriate production/live verification for runtime work.
- **101%** requires real willingness-to-pay/revenue proof for commercial work.

## P0 — merged Design 4 release chain

| Status | Item | Evidence / next action |
| --- | --- | --- |
| `DONE` | Repository dependency/security gate | #1024 merged; reproducible patched lockfile and dependency audit are canonical. Reopen only for a new advisory or reproducibility failure. |
| `MERGED_VERIFY` | Owner-approved public Design 4 polish | #1020 merged at `7f305d6005adbde0d19ee0b856218a68182e30db`; exact-head Website/visual evidence passed before merge. Production/live verification remains. |
| `MERGED_VERIFY` | Complete Russian Academy lesson content | #954 merged at `31c0077abab4e6a5da0ad2a36d9c0689bebfd53d`; canonical English IDs/structure preserved under RU parity contracts. |
| `MERGED_VERIFY` | SEO-safe Academy learner handoff | #1025 merged at `146d5f976fcd1eb452ce2d42cb1f82c9e88bf078`; one restrained tertiary handoff, no new indexable route family. |
| `MERGED_VERIFY` | Hermes Connect capability GEO hierarchy | #1026 merged at `45033b6b138f59ac44764392fa69f604819baf03`; reference capability pages remain truthful `WebPage` entities under the parent Hermes Connect application. |
| `MERGED_VERIFY` | London responsive / locale-safe QA | #1027 merged at `aa0ecb361d18af9b8f9deae38f521d010c1b8b87`; exact-head responsive/locale browser suite passed. |
| `MERGED_VERIFY` | Repair public/private IA cleanup | #1028 merged at `77ec30d5212756d65b1d363d119651ccc90dff8a`; public commercial/SEO owners preserved, private operational links removed from public source. |
| `DONE` | Design source-of-truth replay | #1009 merged at `33f42a46eec3e4571c94d86d8d625c5577605666`; docs-only current-state/backlog replay became canonical. |
| `MERGED_VERIFY` | Authenticated private five-width responsive matrix | #1031 merged at `3b2c112c39335a8461857612d67e96e140ccdd72`; Repair / Academy / Beauty / Internal AI verified with auth/mock-backed coverage at 390 / 430 / 768 / 1024 / 1440. Beauty 42px root-cause fixed at the real `.beauty-b1-page` source without SEO/indexability changes. |
| `MERGED_VERIFY` | Website Factory Design OS convergence | #1033 merged at `ec7ecdaa7e9fd649cf33c31e280b350520cf8d2f`; exact head `09e2ac5787d06eca24122d963705ed4ec3da8add` passed Website, visual and Carrier gates. Factory is a private `noindex,nofollow` workflow, uses one Hermes identity, neutral shared switcher, same-route `?lang=ru` localization and adds zero indexable routes. |
| `MERGED_VERIFY` | HR adaptive interview Design OS convergence | #1042 merged at `c5cfc9af32113505845f13a60ccfec6232729bc2` from exact head `60bcf86a042c1d6f958e22c04b5df4bca487f66f`; Website, visual, HR Design, backend-security, custom-domain, Cloudflare ownership and Carrier gates passed. Candidate remains private/noindex, RU/UK five-width verified, HR portfolio visibility is backend-authorized only, and the observed 31px mobile CTA was corrected to the HR-scoped 44px minimum. Production D1/runtime/live-pilot proof remains separate. |
| `EXTERNAL_GATE` | Production deploy / live verification | #961 remains the owner/admin Cloudflare parity gate. Keep `MERGED != DEPLOYED != LIVE_VERIFIED`. |

## P1 — implemented foundations to preserve

| Status | Item | Evidence / rule |
| --- | --- | --- |
| `DONE` | Option №02 production mark | #929/#959; one approved continuous-loop geometry across production contexts. |
| `DONE` | Pearl public / Obsidian operational Design OS | #930/#959 and follow-up refinements. |
| `DONE` | Four canonical public direction colors | Logistics `#1E88FF`, Marketing `#00C853`, Academy `#7C5CFF`, Technology `#FF7A00`; already applied and accessibility-adjusted. |
| `DONE` | Workspace semantic color cues | Repair blue, Academy violet, Internal AI orange, Beauty Connect cyan, HR Review neutral/Obsidian. Cues orient the user; they are not separate brands. |
| `DONE` | One Hermes identity / private portfolio switcher | Server-authoritative `/api/hermes-connect/account`; do not grant from localStorage/email/name/role text/current route. HR is shown only from backend reviewer authorization. |
| `DONE` | Repair private responsive/accessibility foundation | Auth/mock-backed five-width evidence exists; 44px controls, containment and private identity are guarded. |
| `DONE` | Academy learner foundation | Shared Hermes identity, private learner state, human progression gate, canonical program IDs. |
| `DONE` | Beauty private owner foundation | Bounded private owner/workspace controls; no invented fifth brand color. |
| `DONE` | Internal AI private foundation | Authenticated owner/internal capability and fail-closed access behavior. |
| `MERGED_VERIFY` | HR candidate/reviewer foundation | #1042; human-only consequential decisions, candidate/reviewer separation, RU/UK same-route candidate shell, backend-authorized reviewer capability, private/noindex candidate boundary. Production D1/runtime/live proof remains separate. |
| `DONE` | Public five-width visual evidence mechanism | Workflow captures/validates 1440 / 1024 / 768 / 430 / 390 on exact PR heads. |
| `DONE` | Design × SEO/GEO non-interference gate | Canonical skill persisted in Hermes One Brain Skills Library. Design promotion requires responsive/product truth and search-system non-regression on the same exact HEAD. |

## P2 — current bounded Design OS work

**No active bounded Design OS code-convergence item remains.**

The historical HR #1016 lane was replayed and promoted through merged #1042. Do not create a replacement REWORK branch merely to preserve an artificial queue.

### Website Factory provenance

Historical #955 is already closed/unmerged and is **superseded implementation provenance**, not active work. The preserved product requirement is now merged through #1033. Do not reopen the old Factory mini-accountbar or stale shell.

### HR provenance

Historical #1016 and conflict-only #1041 are closed/unmerged and **superseded implementation/convergence provenance**. The canonical HR implementation is the #1042 merge on `main`. Do not reopen #1016 wholesale and do not force the conflict path demonstrated by #1041.

## P3 — owner decisions, not bugs

| Status | Item | Rule |
| --- | --- | --- |
| `OWNER_DECISION` | Beauty & Wellness canonical direction accent | No fifth owner-approved direction color exists. Keep Connect cyan / neutral contextual treatment until explicit approval. |
| `OWNER_DECISION` | Any replacement of Option №02 | Current mark is locked. New logo families are rebrand proposals, never silent refinements. |

## P4 — approved non-blocking extensions

| Status | Item | Guardrail |
| --- | --- | --- |
| `DONE` | Dedicated Hermes Connect social/OG card | #1049 merged at `97e124ac85362737f5191e99d3a159ded64d1a1c` from exact head `6ed4ff95d7b0b020097312ed104aa829f12b4413`; Website `33792173101` and visual evidence `33792173072` passed. Root Connect now owns a deterministic 2200×1238 PNG social card while all other routes preserve the canonical Astro hero fallback. Option №02 and the four approved direction colors remain unchanged; no Beauty accent was invented. |
| `DONE` | Public authenticated-account affordance | #1048 merged at `876fce524f309cf01a7c30a560d5d8dc2cfc3130`; reuses the existing switcher/account API, remains hidden until backend-confirmed authenticated portfolio data exists, emits no privileged workspace anchors in public SSR, and does not revive Global Account duplicates. |
| `EXTENSION` | Explain-by-Interaction | Guiding question → awareness → understanding → application; core meaning remains server-rendered and accessible. |
| `EXTENSION` | Connected Thread storytelling | Use only where it clarifies person/request → Hermes → action → outcome. |
| `EXTENSION` | Hermes Intelligence Core / subtle living flow | Calm and reduced-motion safe; one user-facing Hermes Intelligence, not a swarm-of-bots aesthetic. |
| `EXTENSION` | Contextual 3D / flow waves | Restrained, performance-first, not cyberpunk. |
| `DONE` | Adaptive onboarding by business type | Existing canonical workspace already implements first-visit accessible business-type selection, persisted `hermes_business_type`, controlled four-parameter deep-link bypass, mobile business selection, and business-specific vertical/module configuration. `tests/hermes-connect-onboarding.spec.ts` covers Auto Repair, Logistics, Agency and Fitness flows and is included in the full Playwright suite; exact-head Website `33792173101` completed successfully before #1049 merge. No duplicate runtime implementation was needed. |
| `EXTENSION` | Richer empty/error/offline states | Add within each workspace implementation phase as real product states. |

Five approved P4 extensions remain. They are optional/non-blocking and must be evaluated one at a time; they are not evidence that the bounded Design OS is incomplete.

## Superseded / historical — do not reopen as current specs

- #1004 / #1005 / #1008 — duplicate Global Account replay chain; current server-authoritative switcher is canonical.
- #935 — stale Academy third-primary-CTA execution; preserved requirement merged as #1025.
- #926 — mixed London Design + Marketing attribution branch; valid Design QA merged as #1027.
- #1029 — accidental duplicate of #1028.
- #955 — old Website Factory implementation source; superseded by merged #1033.
- #1016 — historical HR pilot branch; unique value replayed semantically and merged through #1042.
- #1041 — conflict-only HR sync attempt; superseded by #1042 and must not be force-merged.
- #1034 — closed/unmerged FCC/Ollama replay; AI Infrastructure provenance, **not** Repair Shops Design work.
- #1035 — closed/unmerged social-distribution replay; Marketing/Social provenance, not Design P0.
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

1. Keep this source-of-truth synchronized with merged `main`; stale task numbers must never route work.
2. The bounded Design OS code-convergence queue is closed; completed P4 extensions #1048, #1049 and the reconciled existing adaptive onboarding do not reopen it.
3. When authorized owner/admin access resolves #961, run exact-main production deploy + custom-domain/live proofs and promote only verified runtime items from `MERGED_VERIFY` to `DONE`.
4. Keep Beauty accent and any replacement of Option №02 as `OWNER_DECISION`; do not guess them.
5. Evaluate the five remaining P4 extensions one at a time against current product value, existing evidence and duplicate risk. They are non-blocking and must not reopen already-closed Design OS foundations.

## Promotion discipline

Use the One Brain `PROMOTION-CLOSE LOOP`: if exact HEAD is unchanged, the diff is reconciled against current main, mandatory exact-head gates are green and no owner-only irreversible decision remains, complete ready → merge → verify merge → persist evidence in the same cycle. Do not stop at “99% / ready to merge.”
