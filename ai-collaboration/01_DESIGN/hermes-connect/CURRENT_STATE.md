# Hermes Connect Design — Current State

Last updated: 2026-09-03

## Executive state

Hermes Connect is no longer in logo-selection or broad visual-exploration mode. **Design 4 is an audit/execution cycle over one canonical responsive Hermes runtime.** Finish near-complete work first, remove duplicates and stale implementations, preserve strong existing surfaces, and judge every change through UX, conversion, mobile/accessibility, backend truth, SEO and GEO before calling it done.

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
- Beauty → Connect cyan.

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
- Logistics / Marketing / Professional Services Hermes Connect configurations — reference/preview capability surfaces until separately proven live;
- HR — active convergence branch, not yet current production pilot truth.

Replay PRs #1004, #1005 and #1008 are historical duplicate Global Account attempts. Do not reopen them wholesale. Any public authenticated-account affordance must reuse the existing account API/switcher.

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

Merged into current `main` at `ec7ecdaa7e9fd649cf33c31e280b350520cf8d2f` from exact validated head `09e2ac5787d06eca24122d963705ed4ec3da8add`.

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

## External production gate — not a design-code regression

**#961 `[HC-DEPLOY-PARITY]` remains the external owner/admin gate.**

The code-side production workflow path is separate from Cloudflare credential/binding authorization. Do not mark the merged Design 4 chain `DONE` from merge alone.

Canonical rule:

`MERGED != DEPLOYED != LIVE_VERIFIED`

For commercial Repair:

`PAID_INTENT != PAID`.

When #961 is resolved, require exact-main production deploy, custom-domain read-back and relevant live/synthetic receiver/D1 proofs before promoting applicable runtime items to production-verified / 100%.

## Current bounded Design work

### HR adaptive interview — #1016 — `REWORK`

This is now the only open bounded Design OS convergence item in the active release queue.

Preserve unique HR truth:

- D1 candidate/evidence/reviewer architecture;
- candidate token and exact-origin boundaries;
- human-only consequential decisions;
- Academy identity bridge;
- explicit HR reviewer capability from backend authorization;
- candidate/reviewer separation already present on the branch;
- existing localized dynamic interview questions.

Do **not** merge the 50-commit historical branch wholesale onto current main. Final convergence must:

1. replay unique HR backend/API/product files onto the final #1031 + #1033 Design OS baseline;
2. replay shared account/switcher/middleware/package/CI changes semantically, keeping current `main` authoritative;
3. give the candidate one dominant Start/Continue Interview path;
4. keep Command Center / HR Review private reviewer surfaces;
5. expose `hr` in the shared account portfolio only when backend `getHrReviewerAccess` authorizes it; no `current === "hr"`, email, role text or client-state bypass;
6. finish full RU/UK candidate-shell localization — hero, model explanation, intake labels, consent, buttons, progress/result copy — rather than translating only dynamic questions;
7. treat reviewer/admin private-shell polish as a separate bounded phase if mixing it would widen the replay unnecessarily;
8. run the exact-head Design + SEO/GEO non-interference gate before promotion;
9. keep production D1/runtime/binding verification separate from code merge and from #961.

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
