# Hermes Connect Design — Current State

Last updated: 2026-09-03

## Executive state

Hermes Connect is no longer in logo-selection or broad visual-exploration mode. **Design 4 is an audit/execution cycle over one canonical responsive Hermes runtime.** Finish near-complete work first, remove duplicates and stale implementations, preserve strong existing surfaces, and judge every change through UX, conversion, mobile/accessibility, backend truth, SEO and GEO before calling it done.

The bounded Design 4 code-convergence queue is now exhausted. Remaining production/live proof is external to ordinary Design code promotion and is tracked separately under #961. Three approved non-blocking P4 extensions are complete: public authenticated-account affordance (#1048), dedicated Hermes Connect social/OG card (#1049), and adaptive onboarding by business type reconciled from existing current-main runtime/test evidence.

Product perception remains:

> **Hermes Connect = premium AI Operating System for Business**
>
> **Run your business with AI.**

Do not restart the visual system from zero. Do not recreate Brand V1/V2/V3 as parallel production runtimes. Do not reopen rejected logo families unless the owner explicitly requests a rebrand exploration.

## Locked identity and Design OS

- Production mark: owner-approved Brand Exploration V2 **Option №02** (`continuous_loop` / Infinity Workflow Loop).
- One mark geometry across master, monochrome, inverse, contextual and PWA/app-icon usage.
- Public/storytelling surfaces: Pearl / warm light.
- Dense operational/private surfaces: Anthracite / Obsidian.
- Hermes Connect core identity: blue / cyan / violet with calm premium flow/motion.
- Visual language stays operational, tactile and restrained rather than gaming, crypto, cyberpunk or generic SaaS.
- Corporate Hermes identity and Hermes Connect product/PWA identity remain distinct unless the owner explicitly changes that architecture.

## Canonical direction and workspace colors

Owner-approved public direction colors are implemented and accessibility-adjusted:

- **Hermes Logistics** — `#1E88FF`
- **Hermes Marketing** — `#00C853`
- **Hermes Academy** — `#7C5CFF`
- **Hermes Technology / IT & Product** — `#FF7A00`

Hermes Connect keeps its core family (`#00A8FF`, `#7C5CFF`, `#22D3EE`, `#0A0F1C`).

Private workspace cues are semantic orientation, not separate brands:

- Repair → Logistics blue;
- Academy → Academy violet;
- Internal AI → Technology orange;
- Beauty → Connect cyan;
- HR Review → neutral/Obsidian internal capability cue.

**Beauty & Wellness has no owner-approved fifth canonical direction color.** Keep the current Connect-family cyan/neutral cue until explicit owner approval; do not invent a new canonical Beauty brand color.

## Product and account architecture

Strategic model: **one Hermes identity → multiple backend-authorized businesses/workspaces/capabilities**.

The shared `HermesConnectAccountSwitcher` and `/api/hermes-connect/account` are canonical. Private navigation consumes server-confirmed access only, preserves locale, and never grants privileges from localStorage, email shape, display name, role text or frontend state.

Current product truth:

- Repair Shops — current public live product vertical plus authenticated owner workspace;
- Academy — public search/conversion surfaces plus private learner workspace;
- Beauty & Wellness — private owner foundation with bounded scope;
- Internal AI — authenticated owner/internal capability;
- Website Factory — private `noindex,nofollow` owner workflow for creating and submitting a reviewable website brief; it is **not** a fifth owned business and does not claim an automated production build;
- HR — merged bounded candidate/reviewer foundation with backend-authorized reviewer capability and RU/UK candidate-shell parity; production D1/runtime/binding/live-pilot proof is **not** yet claimed;
- Logistics / Marketing / Professional Services Hermes Connect configurations — reference/preview capability surfaces until separately proven live.

Replay PRs #1004, #1005 and #1008 are historical duplicate Global Account attempts. Do not reopen them wholesale. The public authenticated-account affordance is now merged through #1048 and reuses the canonical account API/switcher with backend-confirmed portfolio visibility only.

## Design × SEO/GEO rule

SEO/GEO is part of design quality, not a later bolt-on.

- Important meaning stays server-rendered.
- Motion/client JS may enhance interaction but must not become the sole owner of product meaning or rewrite semantic heading ownership.
- Core navigation and commercial internal links remain crawlable ordinary links where appropriate.
- Canonical, robots, hreflang, schema, sitemap and indexable route ownership do not change casually from a visual task.
- Do not create thin duplicate pages for keyword coverage when one canonical page already owns the intent.
- Structured-data entity truth must match visible product truth.
- Public pages may explain private capabilities, but operational private-route navigation belongs inside authenticated Hermes shell.
- Private query localization such as `?lang=ru` must not silently create a second crawlable locale family.
- Visual and search-system non-regression must be proven on the **same exact HEAD** before promotion.

The reusable One Brain skill is `SKILL — HERMES DESIGN REGRESSION + SEO GEO NON-INTERFERENCE` in `00_HERMES_GLOBAL_CORE / 01_SKILLS_LIBRARY`.

## Completed repository release gate

**#1024 — dependency/security gate — DONE.**

Patched transitive dependencies and a reproducible lockfile are on `main`. Current CI uses `npm ci` and the dependency audit gate; do not weaken or bypass it.

## Merged Design 4 release chain

### #1020 — owner-approved visual / interaction polish — `MERGED_VERIFY`

Merged at `7f305d6005adbde0d19ee0b856218a68182e30db` after exact-head Website checks, visual evidence and ownership checks. It established the current public Design 4 baseline: shared header treatment, readable Connect wordmark, Product Hub-first launcher, Product Family context rail, compact locale UI, RU hero containment, restrained motion, dark-section contrast repair, semantic-heading protection, no generic AI decoration on non-AI pages, and no-JS crawlable navigation.

### #954 — complete Russian Academy lesson content — `MERGED_VERIFY`

Merged at `31c0077abab4e6a5da0ad2a36d9c0689bebfd53d`. English curriculum IDs/structure remain canonical; RU content projects onto the canonical lesson shape rather than changing progression mechanics.

### #1025 — SEO-safe Academy existing-learner handoff — `MERGED_VERIFY`

Merged at `146d5f976fcd1eb452ce2d42cb1f82c9e88bf078`. One restrained tertiary learner link connects public Academy to the existing private learner workspace without becoming a competing hero CTA or creating a new indexable route family.

### #1026 — Hermes Connect capability GEO entity hierarchy — `MERGED_VERIFY`

Merged at `45033b6b138f59ac44764392fa69f604819baf03`. Reference capability pages remain indexable where they own distinct intent, but page-level schema is a `WebPage` that is part of the parent Hermes Connect `WebApplication`; visible reference/not-current-live truth is preserved.

### #1027 — London responsive / locale-safe navigation QA — `MERGED_VERIFY`

Merged at `aa0ecb361d18af9b8f9deae38f521d010c1b8b87` after exact-head Website/browser suite. It preserves 390px overflow protection, image-alt coverage, measurable CTA sizing, RU→RU and UA→UA London navigation, and same-locale backlinks.

### #1028 — Repair Shops public/private information architecture — `MERGED_VERIFY`

Merged at `77ec30d5212756d65b1d363d119651ccc90dff8a` after exact-head Website checks and five-width visual evidence. Public Repair keeps Login/Register, $99/month Founding Shop Plan boundary, live capability/workflow explanation and commercial SEO/GEO owners. Direct dashboard/availability/customers links are not exposed in public source HTML; operational navigation remains private.

### #1009 — Design source-of-truth replay — `DONE`

Merged at `33f42a46eec3e4571c94d86d8d625c5577605666`. It made the Design current-state/backlog pair canonical after the earlier runtime chain. Later merges must update those docs rather than leaving stale ACTIVE entries.

### #1031 — authenticated private five-width responsive matrix — `MERGED_VERIFY`

Merged at `3b2c112c39335a8461857612d67e96e140ccdd72`.

Representative private Repair / Academy / Beauty / Internal AI surfaces are verified with mock/auth-backed browser coverage at:

- 390
- 430
- 768
- 1024
- 1440

The matrix requires real private content rather than login redirects, one server-authoritative Hermes account context, no horizontal overflow and a visible 44px+ primary control. It exposed one real Beauty defect: a page-local profile input measured 42px at 390px. The final correction was applied at the actual `.beauty-b1-page` root, excluded native checkboxes from the size floor and changed no auth, API, SEO metadata, canonical, sitemap or indexability behavior.

### #1033 — Website Factory Design OS convergence — `MERGED_VERIFY`

Merged at `ec7ecdaa7e9fd649cf33c31e280b350520cf8d2f` from exact validated head `09e2ac5787d06eca24122d963705ed4ec3da8add`.

Preserved product/backend truth:

- one shared Hermes identity/session;
- owner-scoped D1 drafts;
- create/list/resume/autosave/delete-before-submit;
- nine-step owner brief;
- readiness gate and immutable submitted snapshot;
- retryable handoff/delivery state;
- credential-shaped-field and HTTPS-source guards;
- truthful `build_started:false` boundary.

Design convergence:

- no second Factory accountbar or mini-account system;
- neutral shared account switcher shows only real server-authorized workspaces;
- Pearl-first private work surface, Obsidian decisive actions, Technology context;
- product chrome says **private Website Factory workflow**, not `REFERENCE CAPABILITY`;
- complete RU private wizard through the same `?lang=ru` route;
- route remains `noindex,nofollow`, has no sitemap owner and adds **zero new indexable routes**;
- dynamic RU/Handoff copy and locale MutationObserver behavior are idempotent and browser-tested.

Exact-head evidence before merge:

- Website checks `33756699840` — SUCCESS;
- Hermes Connect visual evidence `33756699764` — SUCCESS;
- Carrier Contract Live Activation `33756700140` — SUCCESS.

Historical #955 is closed/unmerged and is superseded implementation provenance only. Do not reopen the stale Factory shell.

### #1042 — HR adaptive interview Design OS convergence — `MERGED_VERIFY`

Merged at `c5cfc9af32113505845f13a60ccfec6232729bc2` from exact validated head `60bcf86a042c1d6f958e22c04b5df4bca487f66f`.

Preserved HR/backend truth:

- D1 candidate/evidence/reviewer architecture;
- candidate token and exact-origin boundaries;
- Academy identity bridge;
- protected/context fields outside readiness scoring;
- no automated consequential hire/reject decision;
- reviewer/admin capability requires explicit backend authorization.

Design convergence:

- candidate and reviewer/admin surfaces remain separated;
- candidate has one dominant Start/Continue Interview path;
- candidate route remains `noindex,nofollow` with no reviewer/admin navigation;
- static and dynamic candidate shell has RU/UK same-route localization;
- shared account portfolio exposes `hr` only when backend `getHrReviewerAccess` authorizes it; email/role/client-state/current-route bypass is forbidden;
- existing Internal AI authorization behavior is preserved;
- five-width 390/430/768/1024/1440 proof exposed a real 31px mobile CTA inherited from the common `.btn` override; the correction was scoped to the HR candidate shell and restores the 44px minimum without changing the shared Design OS.

Exact-head evidence before merge:

- Website checks `33763553540` — SUCCESS;
- Hermes Connect visual evidence `33763553545` — SUCCESS;
- HR Design 4 replay `33763553513` — SUCCESS;
- HR backend security `33763553770` — SUCCESS;
- Hermes Connect custom-domain verification `33763553665` — SUCCESS;
- Cloudflare deployment ownership contract `33763553642` — SUCCESS;
- Carrier Contract Live Activation `33763553543` — SUCCESS.

Visual artifact `9896616746` was captured for the exact HR promotion head; digest `sha256:4fb2db641f7267019fa55f011ba14bc0adcbef6ac5b2873fc8a48c749304fda6`.

Historical #1016 and conflict-only #1041 are closed/unmerged and superseded. Do not reopen either as a second HR implementation lane.

### #1048 — public authenticated-account affordance — `DONE`

Merged at `876fce524f309cf01a7c30a560d5d8dc2cfc3130`. The public Hermes Connect landing now reuses the canonical account switcher/API, stays hidden until a backend-confirmed authenticated portfolio exists, emits no privileged workspace anchors in public SSR, preserves locale, and does not recreate the historical Global Account implementations.

### #1049 — dedicated Hermes Connect social/OG card — `DONE`

Merged at `97e124ac85362737f5191e99d3a159ded64d1a1c` from exact validated head `6ed4ff95d7b0b020097312ed104aa829f12b4413`.

- Root `/services/hermes-connect/` now has a deterministic 2200×1238 PNG social card.
- All non-Connect routes preserve the canonical Astro hero fallback and explicit image overrides still win.
- Option №02 remains unchanged.
- Only the four owner-approved direction accents are used; no Beauty accent is invented.
- Runtime metadata remains Node-free; PNG generation is prerender-only.
- Website checks `33792173101` — SUCCESS.
- Hermes Connect visual evidence `33792173072` — SUCCESS.

### Adaptive onboarding by business type — `DONE` by evidence reconciliation

No replacement runtime was created because the canonical workspace already implements the requirement:

- first-visit accessible business-type selector;
- persisted `hermes_business_type` choice;
- controlled deep-link bypass only when `source_direction`, `business_type`, `business_subtype`, and `module` are all present;
- business-specific vertical/module configuration;
- desktop/keyboard and mobile selection coverage;
- Auto Repair, Logistics, Agency and Fitness scenarios in `tests/hermes-connect-onboarding.spec.ts`.

The onboarding spec is part of the full Playwright suite. Exact-head Website `33792173101` completed successfully before #1049 merge, so the stale P4 entry was reconciled to `DONE` instead of duplicating working product code.

## External production gate — not a design-code regression

**#961 `[HC-DEPLOY-PARITY]` remains the external owner/admin gate.**

The code-side production workflow path is separate from Cloudflare credential/binding authorization. Do not mark the merged Design 4 runtime chain `DONE` from merge alone.

Canonical rule:

`MERGED != DEPLOYED != LIVE_VERIFIED`

For commercial Repair:

`PAID_INTENT != PAID`.

When #961 is resolved, require exact-main production deploy, custom-domain read-back and relevant live/synthetic receiver/D1 proofs before promoting applicable runtime items to production-verified / 100%.

## Current bounded Design work

**No active bounded Design OS code-convergence item remains.**

The prior HR #1016 REWORK lane has been superseded by merged #1042. Temporary #1041 remains conflict evidence only. Do not manufacture another convergence branch simply to keep a Design queue open.

Three P4 extensions are complete (#1048, #1049, adaptive onboarding). Five approved P4 extensions remain optional/non-blocking:

1. Explain-by-Interaction;
2. Connected Thread storytelling;
3. Hermes Intelligence Core / subtle living flow;
4. contextual 3D / flow waves;
5. richer empty/error/offline states.

Next work is intentionally separated into:

1. external production/live verification under #961 when authorized Cloudflare owner/admin access is available;
2. owner decisions that must not be guessed (Beauty fifth canonical accent; any replacement of Option №02);
3. the five approved non-blocking extensions, one at a time, only where current product value and duplicate-risk audit support them.

## Mobile and accessibility contract

Representative surfaces must remain usable at 390 / 430 / 768 / 1024 / 1440+ with:

- no horizontal overflow;
- readable hierarchy and long RU/UA copy containment;
- approximately 44px minimum interactive targets where appropriate;
- keyboard focus;
- reduced-motion safety;
- no overlay covering the primary action.

Mobile is one responsive Hermes product, not a separate reduced runtime.

## Approved UX principles

- One screen → one primary decision.
- Progressive commitment instead of showing every module at once.
- Human language and real workflow facts over adjective-heavy feature walls.
- Mobile = field use; desktop = command center.
- Empty / error / offline states are first-class product states.
- Preserve strong existing sections and fix observed defects rather than flattening every page into one template.
- One Hermes Intelligence in the user-facing experience even if specialized internal agents operate behind it.
- Explain Hermes through causal workflow (`signal → context → action/outcome`) rather than disconnected feature lists.

## Owner decisions, not bugs

- Beauty dedicated canonical color remains an owner decision.
- Option №02 remains locked; any replacement family is a rebrand proposal requiring explicit owner approval.

## Promotion discipline

Use the One Brain `PROMOTION-CLOSE LOOP`:

If exact HEAD is unchanged, the diff is reconciled against current main, mandatory exact-head gates are green and no owner-only irreversible decision remains, complete `ready → merge → verify merge → persist evidence` in the same cycle. Do not leave a promotion-eligible task at 99% merely to write another report.

## Source of truth

Read together:

- `ai-collaboration/01_DESIGN/HERMES_BRAND_SYSTEM_2_0.md`
- `ai-collaboration/01_DESIGN/DESIGN_MASTER_BACKLOG.md`
- `ai-collaboration/01_DESIGN/hermes-connect/OWNER_DECISION_OPTION02_2026-08-31.md`
- this file
- One Brain skill: `SKILL — HERMES DESIGN REGRESSION + SEO GEO NON-INTERFERENCE`

Historical documents remain provenance only and do not override later owner decisions or later merged implementation state.