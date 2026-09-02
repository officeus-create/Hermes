# Hermes Connect Design — Current State

Last updated: 2026-09-02

## Decision status

**Hermes Connect Brand System V1 remains the base design system, with two explicit owner-approved production decisions: original Option №02 (`continuous_loop`) is approved for implementation / launch, and the four Hermes business-direction semantic colors are now locked for contextual use.**

Read `OWNER_DECISION_OPTION02_2026-08-31.md` before proposing logo changes and `../DIVISION_COLOR_CONTRACT_2026-09-01.md` before proposing direction-color changes. Those decisions supersede older V1 language where it treated Möbius/infinity/continuous-loop concepts as unapproved replacements or division colors as deferred experimentation.

The surrounding Hermes Connect system should still be refined and extended rather than restarted from zero.

## Product perception goal

Hermes Connect should feel like a premium **AI Operating System for Business** rather than a generic trucking application, crypto project, legacy CRM or template SaaS dashboard.

Primary working message:

> Run your business with AI.

## Approved core visual language

- Warm Pearl / premium light marketing canvas.
- Anthracite / Obsidian dark operating and command-center environment.
- One visual system across website, app, web dashboard, presentations and social.
- Original Option №02 continuous connected-flow loop as the current production logo direction.
- Fine digital flow waves as a recurring signature motif.
- Restrained translucent / tactile 3D brand object for hero storytelling and motion.
- Large, simple typography and generous whitespace.
- Real product workflows shown in motion instead of feature-list overload.
- Editorial industry cards with controlled niche-specific art direction.
- Business-direction color is a contextual navigation signal, not a separate-brand treatment.

## Approved logo direction

The selected production mark is the original Brand Exploration V2 **Option №02**, concept id `continuous_loop`, historically described as the Infinity Workflow Loop / Петля Непрерывности.

It should remain a simple horizontal continuous connected-flow symbol. Production refinement may improve optical quality, small-size performance, motion and trademark differentiation without turning it into a different logo family.

For the current launch the Hermes Connect master identity uses the core blue / cobalt / violet spectrum. Business-direction colors do not recolor or replace the master mark; they identify business context through controlled accents, borders, dots, atmosphere, navigation and other bounded UI signals.

## Approved business-direction colors

The semantic direction colors are locked:

- Logistics — `--hermes-logistics: #1E88FF`.
- Marketing — `--hermes-marketing: #00C853`.
- Academy — `--hermes-academy: #7C5CFF`.
- Technology / IT & Product — `--hermes-technology: #FF7A00`.

These colors belong to the Hermes Brand System and must remain contextual signals rather than full-page rebrands. On Pearl/light surfaces, raw semantic colors must not be forced into small body text when contrast is insufficient; use approved same-hue contrast-safe text variants while preserving the canonical semantic hue for framing, atmosphere and UI cues.

Beauty does **not** currently have an owner-approved standalone semantic brand color. Keep Beauty neutral or within existing Hermes Connect-family UI cues until an explicit owner decision is recorded; do not invent a new `--hermes-beauty` brand token.

Hermes Intelligence remains a cross-business intelligence layer and may retain its violet / blue-violet identity where the UI is communicating Intelligence rather than a business division.

## Approved flow-wave motif

The dark Hermes panel with the small logo and elegant flowing digital waves is an approved reference. The wave system may be used in backgrounds, section transitions, launch videos, presentations, social templates and subtle product states.

It must remain calm, thin and premium rather than neon/cyberpunk.

## Light and dark product environments

### Pearl

Best suited for public storytelling, onboarding, presentations and selected service-business experiences.

### Anthracite / Obsidian

Best suited for dashboards, analytics, finance, logistics and dense operational work.

The two modes must preserve the same geometry, hierarchy, typography and identity.

## Hermes Intelligence

The user-facing AI model should feel like **one Hermes Intelligence**. Specialized internal agents may handle reception, sales, marketing, finance, operations, recruiting and logistics, but they should not make the experience feel like a collection of disconnected bots.

A transparent background-activity feed is allowed where useful.

## Adaptive onboarding

A fast adaptive setup is an approved product direction. Hermes should configure modules, navigation, AI capabilities, KPIs and workflows based on the user's business rather than showing every feature to every user.

## Runtime and distribution boundary

- Extend the one canonical responsive workspace under `public/demos/hermes-connect/`; do not recreate Brand V1/V2/V3 or a separate mobile page.
- Web and installable PWA are the current supported distribution paths.
- Any future Android package must be rebuilt from the current canonical runtime, signed with a controlled release key, checksum-recorded, and verified on a clean supported device before a direct download is restored.

## Industry art direction

Controlled mood families may adapt storytelling to different business categories while preserving one Hermes brand:

- Monochrome — professional services / premium B2B.
- Color Block — real estate / architecture / modern services.
- Podium / gradient portrait — wellness / health / premium personal services.
- Technicolor — beauty / lifestyle / fashion-forward businesses.

These are visual storytelling modes, not separate brands.

## Color direction

The broader Hermes palette remains locked around:

- Pearl / warm off-white;
- Graphite / Anthracite / Obsidian;
- Iris / violet;
- controlled blue / cobalt;
- restrained sage / mint;
- warm sand;
- semantic amber / red;
- the four approved business-direction accents defined above.

Exact production application still requires implementation-level accessibility and contrast validation.

Antigravity Brand Exploration V2 proposed candidate tokens including `#F8F6F0`, `#090A0F`, `#6D28D9`, `#2563EB`, `#D97706` and `#BE123C`. Those are historical exploration references, not replacements for the owner-approved production direction-color contract.

## Hero direction

The website should show Hermes operating:

`New lead → Hermes replied → qualified → booking confirmed → payment received → review requested → retention workflow`

The brand object, flow lines and product cards should help explain that orchestration.

## Antigravity V2 historical experiment

The remote branch `feature/brand-exploration-v2` contains:

- six vector logo explorations;
- Pearl / Obsidian themes;
- unified Hermes Intelligence UX;
- adaptive onboarding;
- updated logo explorer and UI components.

The branch remains historical exploration material and must not be merged wholesale. Only the owner-selected Option №02 concept is being reimplemented from fresh `main`.

The production implementation source of truth is the single canonical responsive tree at `public/demos/hermes-connect/`, consolidated by PR #546 and clarified by #547-#548. Retired Brand V1/V2 directories are not alternative design choices.

## Screenshot / visual-review rule

Owner screenshots may intentionally mix design defects with examples that are already liked. Infer which is which from the visual evidence, preserve strong existing work, and repair obvious breaks without flattening every section into one template.

The 2026-08-31 Logistics directory collapse / narrow stacked-link layout is a confirmed repair target in the current implementation cycle.

## Brand governance

Every design change should be labeled:

- `Refinement`
- `Extension`
- `Experiment`
- `Rebrand Proposal`

The Option №02 logo change and four business-direction semantic colors have explicit owner approval. Any new replacement logo family or new division/business semantic color still requires explicit owner approval.

## Required production validation

- Favicon 16/32 px
- App icon
- Monochrome and inverse logo
- Light/dark backgrounds
- Mobile header
- Website hero
- Social avatar
- Exact accessible color tokens
- Motion / reduced-motion behavior
- Competitor similarity / trademark review
- 3D and animation performance

## Source of truth

See:

- `ai-collaboration/01_DESIGN/hermes-connect/OWNER_DECISION_OPTION02_2026-08-31.md`
- `ai-collaboration/01_DESIGN/DIVISION_COLOR_CONTRACT_2026-09-01.md`
- `ai-collaboration/01_DESIGN/hermes-connect/APPROVED_BRAND_SYSTEM_V1.md`
