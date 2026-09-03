# Hermes Connect Design — Current State

Last updated: 2026-09-03

## Executive state

Hermes Connect is no longer in logo-selection or broad visual-exploration mode. **Design 4 is an audit/execution cycle over one canonical responsive Hermes runtime.** The owner direction is to finish near-complete work first, remove duplicates and stale implementations, preserve strong existing surfaces, and judge every change through UX, conversion, mobile/accessibility, backend truth, SEO and GEO before calling it done.

Product perception remains:

> **Hermes Connect = premium AI Operating System for Business**
>
> **Run your business with AI.**

Do not restart the visual system from zero. Do not recreate Brand V1/V2/V3 as parallel production runtimes. Do not reopen rejected logo families unless the owner explicitly requests a rebrand exploration.

## Locked identity and Design OS

- Production mark: owner-approved original Brand Exploration V2 **Option №02** (`continuous_loop` / Infinity Workflow Loop).
- One mark geometry across master, monochrome, inverse, contextual and PWA/app-icon usage.
- Public/storytelling surfaces: Pearl / warm light.
- Dense operational/private surfaces: Anthracite / Obsidian.
- Hermes Connect core identity: blue / cyan / violet with calm premium flow/motion.
- Visual language stays operational, tactile and restrained rather than gaming, crypto, cyberpunk or generic SaaS.
- Corporate Hermes identity and Hermes Connect product/PWA identity remain distinct unless the owner explicitly changes that architecture.

## Canonical direction and workspace colors

Owner-approved public direction colors are already implemented and accessibility-adjusted; they are not a future experiment:

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

**Beauty & Wellness has no owner-approved fifth canonical direction color.** The current Connect-family cyan is an intentional temporary cue. Do not invent `--hermes-beauty` or a new canonical Beauty identity without explicit owner approval.

## Product and account architecture

Strategic model: **one Hermes identity → multiple backend-authorized businesses/workspaces/capabilities**.

The shared `HermesConnectAccountSwitcher` and `/api/hermes-connect/account` are canonical. Private Repair / Academy / Beauty / Internal AI navigation consumes server-confirmed access only, preserves locale, and never grants privileges from localStorage, email shape, display name, role text or frontend state.

Replay PRs #1004, #1005 and #1008 are historical duplicate Global Account attempts. Do not reopen them wholesale. A future public authenticated-account affordance is an extension only and must reuse the existing account API/switcher.

Current product truth:

- Repair Shops — current public live product vertical;
- Academy — private learner workspace plus public Academy search/conversion surfaces;
- Beauty & Wellness — private owner foundation with bounded scope;
- Internal AI — authenticated owner/internal capability;
- Logistics / Marketing / Professional Services Hermes Connect configurations — reference/preview capability surfaces until separately proven live.

## Design × SEO/GEO rule

SEO/GEO is part of design quality, not a later bolt-on.

- Important meaning stays server-rendered.
- Motion/client JS may enhance interaction but must not become the sole owner of product meaning or rewrite semantic heading ownership.
- Core navigation and commercial internal links remain crawlable ordinary links where appropriate.
- Canonical, robots, hreflang, schema, sitemap and indexable route ownership do not change casually from a visual task.
- Do not create thin duplicate pages for keyword coverage when one canonical page already owns the intent.
- Structured-data entity truth must match visible product truth.
- Public pages may explain private capabilities, but operational private-route navigation belongs inside authenticated Hermes shell.

## Completed repository release gate

**#1024 — dependency/security gate — DONE.**

Patched transitive dependencies and a reproducible lockfile are on `main`. Current CI uses `npm ci` and the dependency audit gate; do not weaken or bypass it.

## Merged Design 4 release chain

The near-complete runtime chain that was previously scattered across stale branches is now merged into canonical `main`:

### #1020 — owner-approved visual / interaction polish — `MERGED_VERIFY`

Merged at `7f305d6005adbde0d19ee0b856218a68182e30db` after exact-head Website checks, visual evidence and ownership checks. It established the current public Design 4 baseline: shared header treatment, readable Connect wordmark, Product Hub-first launcher, Product Family context rail, compact locale UI, RU hero containment, restrained motion, dark-section contrast repair, semantic-heading protection, no generic AI decoration on non-AI pages, and no-JS crawlable navigation.

### #954 — complete Russian Academy lesson content — `MERGED_VERIFY`

Merged at `31c0077abab4e6a5da0ad2a36d9c0689bebfd53d`.

- English curriculum IDs/structure remain canonical.
- `documents-setup` is canonical; historical `broker-setup-packet` survives only as an internal RU localization alias.
- Russian content projects onto the canonical lesson shape instead of changing progression mechanics.
- Auth, enrollment, reviewer and submission schema were not split into a second Academy model.

### #1025 — SEO-safe Academy existing-learner handoff — `MERGED_VERIFY`

Merged at `146d5f976fcd1eb452ce2d42cb1f82c9e88bf078`.

One restrained tertiary learner link connects the public Academy surface to the existing private learner workspace without becoming a competing hero CTA. The no-JS fallback remains canonical/crawlable and supported locale query is preserved.

### #1026 — Hermes Connect capability GEO entity hierarchy — `MERGED_VERIFY`

Merged at `45033b6b138f59ac44764392fa69f604819baf03`.

Reference capability pages remain indexable where they own distinct intent, but page-level schema is a `WebPage` that is part of the parent Hermes Connect `WebApplication`; the UI continues to state reference/not-current-live truth.

### #1027 — London responsive / locale-safe navigation QA — `MERGED_VERIFY`

Merged at `aa0ecb361d18af9b8f9deae38f521d010c1b8b87` after the exact-head full Website/browser suite passed.

The valid Design portion of old mixed #926 is now preserved without the Marketing attribution observer: 390px overflow protection, image-alt coverage, measurable primary CTA sizing, RU→RU and UA→UA internal London links, and same-locale hub backlinks.

### #1028 — Repair Shops public/private information architecture — `MERGED_VERIFY`

Merged at `77ec30d5212756d65b1d363d119651ccc90dff8a` after exact-head Website checks and Hermes Connect visual evidence both passed.

The public Repair page now keeps:

- Login / Register;
- $99/month Founding Shop Plan boundary;
- live product capabilities and workflow explanation;
- Local SEO / Website Development / SEO Services commercial owners;
- canonical schema/SEO/GEO truth.

Direct dashboard / availability / customers links were removed from the public source HTML. Operational navigation remains inside the authenticated workspace instead of being hidden with client-side JS.

## Evidence state after the merged chain

Public visual evidence already runs the canonical five-width matrix:

- 390
- 430
- 768
- 1024
- 1440

The workflow builds the exact PR head, validates Option №02 and approved color contracts, captures route evidence and validates layout.

Private Repair, Academy, Beauty and Internal AI already have real mock/auth-backed browser tests, especially at 390px. The next responsive task is **not** to add unauthenticated static screenshots of private routes because those can redirect to login and create false evidence. Extend the existing authenticated/mock-backed browser coverage across the five-width matrix instead.

## External production gate — not a design-code regression

**#961 `[HC-DEPLOY-PARITY]` remains OPEN.**

The code-side automatic production workflow trigger is proven, but controlled Cloudflare Pages deployment fails closed at credential/binding validation because the authorized GitHub `production` environment still lacks the required scoped Cloudflare deployment credentials/account identifier and production bindings are not fully reconciled.

Do not mark the merged Design 4 chain `DONE` from merge alone.

Canonical owner rule remains:

`MERGED != DEPLOYED != LIVE_VERIFIED`

and for the commercial Repair surface:

`PAID_INTENT != PAID`.

When #961's external owner/admin gate is resolved, require exact-main production deploy, custom-domain read-back and the relevant live/synthetic receiver/D1 proofs before promoting the applicable items to `PRODUCTION_VERIFIED` / 100%.

## Next Design 4 implementation work

### 1. Authenticated private five-width responsive matrix

Extend existing mock/auth-backed browser coverage for representative private Repair / Academy / Beauty / Internal AI surfaces across 390 / 430 / 768 / 1024 / 1440. Check real private heading/identity, no horizontal overflow, primary action usability, touch/focus behavior and avoid fake unauthenticated screenshot evidence.

### 2. Website Factory B1 — #955 — `REWORK`

Preserve:

- shared Hermes session/auth endpoints;
- private D1 owner-scoped drafts;
- create/list/resume/autosave/delete;
- 9-step owner brief;
- readiness gate;
- immutable submitted snapshot;
- delivery retry/state;
- HTTPS-source and credential-shaped-field guards;
- truthful `build_started: false` boundary.

Do not merge the stale `factory-*` mini-app shell wholesale. The current branch already uses shared `/api/auth/login` and `/api/auth/register`; there is no second password store to migrate. Rebuild the page against the current Design OS, remove the duplicate Factory accountbar/logout identity layer, and use the shared account system.

Website Factory is not a fifth owned business merely because it needs account context. Add a neutral/no-current-workspace mode to the shared account switcher that displays only server-authorized workspaces. If login/register occurs inside the Factory access state, reload after successful shared-auth mutation so the account switcher rehydrates against the authenticated session instead of inventing a second client account bus.

### 3. HR adaptive interview — #1016 — `REWORK`

Preserve:

- D1 candidate/evidence/reviewer architecture;
- candidate token and exact-origin boundaries;
- human-only consequential decisions;
- Academy identity bridge;
- explicit HR reviewer capability from backend authorization;
- candidate/reviewer separation already added to the branch;
- RU/UK dynamic interview question localization already implemented.

Final convergence requirements:

- candidate surface gets one dominant Start/Continue Interview path;
- Command Center / HR Review remain private reviewer surfaces;
- add `hr` to the shared account portfolio only when backend `getHrReviewerAccess` authorizes it; never use `current === "hr"` or client state as a bypass;
- replay shared account/middleware/package/CI changes semantically onto current `main`, never blob-copy stale shared files;
- finish full RU/UK candidate-shell localization (hero, model, intake labels, consent, buttons, progress/result copy), not only dynamic questions;
- reviewer/admin localization and private-shell convergence can follow as a separate bounded step rather than mixing all candidate/admin UI into one uncontrolled rewrite.

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

## Evidence and owner completion rule

Evidence levels:

1. `SOURCE_VERIFIED`
2. `LOCAL_TEST_VERIFIED`
3. `BROWSER_VERIFIED`
4. `PRODUCTION_VERIFIED`

A branch, green unit test, merged PR or attractive screenshot is not 100% by itself.

- **100%** = appropriate live production verification, including representative desktop/mobile where relevant.
- **101%** = real willingness-to-pay/revenue proof for commercial work.

## Source of truth

Read together:

- `ai-collaboration/01_DESIGN/HERMES_BRAND_SYSTEM_2_0.md`
- `ai-collaboration/01_DESIGN/DESIGN_MASTER_BACKLOG.md`
- `ai-collaboration/01_DESIGN/hermes-connect/OWNER_DECISION_OPTION02_2026-08-31.md`
- this file

Historical documents remain provenance only and do not override later owner decisions or later merged implementation state.
