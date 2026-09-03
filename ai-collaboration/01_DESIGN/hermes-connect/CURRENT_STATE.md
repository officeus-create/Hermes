# Hermes Connect Design — Current State

Last updated: 2026-09-04

## Executive state

**DESIGN = CLOSED / MAINTENANCE_ONLY.**

The bounded Hermes Design 4 code queue and its approved P4 extension queue are closed. Do not manufacture new visual/convergence work to keep a Design lane active. The next primary execution lane is **SEO/GEO**.

Design may reopen only for:

1. a reproducible production UX/accessibility/design regression;
2. an explicit owner-directed change;
3. a product change that genuinely requires a new UI state.

External production/live proof remains separate under #961 and does not make the Design implementation queue open.

Canonical rule:

`MERGED != DEPLOYED != LIVE_VERIFIED`

## Locked Design OS

- Production mark: owner-approved Brand Exploration V2 **Option №02** (`continuous_loop` / Infinity Workflow Loop).
- Public/storytelling surfaces: Pearl / warm light.
- Dense operational/private surfaces: Anthracite / Obsidian.
- Hermes Connect remains a premium, restrained AI Operating System for Business; avoid gaming/crypto/cyberpunk or generic SaaS decoration.
- Do not recreate Brand V1/V2/V3 or a second Global Account/design runtime.

### Canonical public direction colors

- Logistics — `#1E88FF`
- Marketing — `#00C853`
- Academy — `#7C5CFF`
- Technology / IT & Product — `#FF7A00`

**Beauty & Wellness has no owner-approved fifth canonical direction color.** Keep the current Connect-family cyan/neutral contextual treatment until the owner explicitly changes it.

Any replacement of Option №02 is also an `OWNER_DECISION`, not a bug or backlog item.

## Product/account architecture to preserve

Strategic model: **one Hermes identity → multiple backend-authorized businesses/workspaces/capabilities**.

The shared account switcher and `/api/hermes-connect/account` remain canonical. Private visibility and privileges must come from server-confirmed authorization, never localStorage, email/name shape, role text, current route or frontend state.

Current product truth includes:

- Repair Shops — public product + authenticated owner workspace;
- Academy — public acquisition/search surfaces + private learner workspace;
- Beauty & Wellness — bounded private owner foundation;
- Internal AI — authenticated internal capability;
- Website Factory — private `noindex,nofollow` owner workflow, not a fifth owned business;
- HR — bounded candidate/reviewer foundation with human-controlled consequential decisions; production D1/runtime/live-pilot proof remains separate;
- other Hermes Connect vertical/configuration pages remain truthful previews/reference surfaces until separately proven live.

Historical duplicate Global Account PRs #1004/#1005/#1008 and superseded Factory/HR branches are provenance only. Do not reopen them wholesale.

## Final Design release/extension chain

### #1048 — public authenticated-account affordance — `MERGED`

- merge: `876fce524f309cf01a7c30a560d5d8dc2cfc3130`
- exact validated head: `10ef5eb924295994c57d79ce7af5777ae33f0b3b`
- Website `33773650893` — SUCCESS

The public Connect root reuses the canonical account API/switcher, stays hidden until backend-confirmed portfolio data exists, emits no privileged workspace anchors in SSR and grants no client-side privilege.

### #1049 — dedicated Hermes Connect social/OG card — `MERGED`

- merge: `97e124ac85362737f5191e99d3a159ded64d1a1c`
- exact validated head: `6ed4ff95d7b0b020097312ed104aa829f12b4413`
- Website `33792173101` — SUCCESS
- visual `33792173072` — SUCCESS

Root `/services/hermes-connect/` owns a deterministic 2200×1238 PNG card; non-Connect routes retain the canonical Astro hero fallback. Option №02 and the four approved direction accents remain unchanged; no Beauty accent was invented.

### Adaptive onboarding by business type — `DONE` by reconciliation

No duplicate runtime was created. Existing canonical workspace behavior already supplies first-visit business-type selection, persisted choice, controlled deep-link context and business-specific module configuration; the existing onboarding browser coverage is part of the full acceptance suite.

### Explain-by-Interaction + Connected Thread — `DONE` by current-main evidence

The canonical Connect Product Hub already implements the approved interaction/storytelling requirement through the existing signal flow in `public/design-owner-polish.js`:

- `SIGNAL_COPY` explains capture → context → action;
- `activateProductHubSignals()` exposes the interactive sequence;
- core product meaning remains available without inventing a separate product/runtime.

Do not create another storytelling component merely to satisfy an old P4 label.

### Hermes Intelligence Core / subtle living flow — `DONE` by current-main evidence

The existing Product Hub already has restrained, reduced-motion-safe intelligence/motion behavior through `activateKnotPointer()` and `addSparseAiMotion()`. It remains one user-facing Hermes intelligence rather than a swarm-of-bots aesthetic.

### #1052 — Repair richer empty/error/offline states — `MERGED`

- merge: `c9939bbdcdd2f2968df1f9d6e72745541a28276a`
- exact validated head: `c6b8e3c277f71ed51557d4d033a8f9459b80cfeb`
- Website `33808467669` — SUCCESS
- Hermes Connect visual evidence `33808467709` — SUCCESS

Final behavior:

- existing Services / Booking inbox / Feedback empty states remain authoritative;
- real GET failures get section-local recovery while other successfully loaded sections stay usable;
- offline and connection-restored states are accessible and localized;
- Retry uses the existing page/runtime rather than introducing a second data owner;
- the observer is exact-route scoped to the Repair dashboard and adds no API/auth/account/schema/sitemap/SEO ownership;
- final acceptance models a real endpoint outage across both legitimate `/api/services` readers until Retry, avoiding request-order-dependent false failures.

### Contextual 3D / flow waves — `NOT_PLANNED`

This was an optional decorative P4 direction, not a product requirement. It is deliberately closed as `NOT_PLANNED` because the current restrained motion language already communicates intelligence and another 3D/wave layer would add performance/visual debt without proven user value before SEO/GEO execution.

This is a closure decision, not an unfinished task.

## Design × SEO/GEO non-interference contract

Preserve these rules while SEO/GEO becomes the primary lane:

- important meaning stays server-rendered;
- client motion/interactions may enhance but never own critical product meaning;
- commercial/internal links remain ordinary crawlable links where appropriate;
- canonical, robots, hreflang, schema, sitemap and indexable ownership change only through explicit search-product work;
- do not create thin duplicate geography/keyword pages because a design idea needs another surface;
- public pages may explain private capabilities, but operational private navigation belongs inside authenticated Hermes shell;
- private query localization must not create a second crawlable locale family;
- future UI changes require responsive/product truth and search-system non-regression on the same exact head.

## Mobile/accessibility baseline

Representative product surfaces remain guarded at 390 / 430 / 768 / 1024 / 1440 with:

- no horizontal overflow;
- readable RU/UA containment;
- approximately 44px minimum actionable controls where appropriate;
- keyboard/focus support;
- reduced-motion safety;
- no overlay covering the primary action.

Mobile is one responsive Hermes product, not a separate reduced runtime.

## External production/live gate

**#961 `[HC-DEPLOY-PARITY]` remains `EXTERNAL_GATE`.**

It requires authorized owner/admin Cloudflare deployment/binding/read-back proof. Repository merges or preview deployments must not be promoted to `LIVE_VERIFIED` without that evidence.

#961 is **not** an active Design code task and must not block SEO/GEO work.

## No-touch boundary

This Design close did not take ownership of:

- CEO / AI Cabinet;
- One Brain governance;
- `CLAUDE LOCAL EXIT & SALVAGE`;
- owner/runner remote-browser → Codex proof lane;
- unrelated AI Infrastructure ownership.

Those remain outside Design routing.

## Routing from this point

1. **SEO/GEO becomes the primary execution lane.**
2. Design stays `CLOSED / MAINTENANCE_ONLY`.
3. #961 stays external/live verification, separate from ordinary Design work.
4. Beauty accent and Option №02 replacement stay owner decisions, not open tasks.
5. Historical Design PRs/ideas are evidence/provenance only unless a new reproducible defect or explicit owner instruction reopens a bounded item.
