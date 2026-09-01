# Hermes Brand System 2.0

Status: PRODUCTION OPERATING BASELINE
Final asset-compliance items remain explicitly listed at the end.

## 1. Brand architecture
Hermes is one business ecosystem with distinct operating directions:
- Logistics
- Marketing
- Academy
- Technology / IT

Hermes Connect is the shared AI/product operating layer that can connect those directions where the actual product capability exists.

The system must feel related without making every direction look identical.

---

## 2. Core visual law
### Public
**Pearl outside.**
Use light, premium, editorial surfaces for explanation, trust, discovery and conversion.

### Operating/product
**Obsidian where work gets serious.**
Use darker operational depth where dense tools, previews or intelligence systems benefit from separation. Approved Pearl private shells remain valid where they improve usability.

### Intelligence
Violet / cobalt / cyan can communicate intelligence and system continuity, but must not become generic neon decoration.

### Quality target
Premium, calm, intelligent, modern, global, operational.

Avoid:
- gaming UI;
- casino/neon visual language;
- cheap particles;
- random gradients;
- trucking clichés as a system identity;
- robot heads / circuit brains as AI shorthand;
- Web3-token aesthetics;
- motion with no information purpose.

---

## 3. Hermes Connect master mark
### Locked geometry
The owner-approved Hermes Connect master direction is **Option 02**: the continuous connected-flow horizontal loop.

Do not:
- redraw the geometry because a new style experiment looks interesting;
- reintroduce the retired mint-node / intelligent-knot geometry;
- replace the mark with an H monogram, wings, orbit nodes, brain/circuit symbol or unrelated infinity variant without explicit owner direction.

### Current production asset family
The production app/PWA SVG family renders the approved Option 02 geometry inside the Obsidian app tile.

Primary code references include:
- `public/demos/hermes-connect/icon.svg`
- `public/demos/hermes-connect/icon-192.svg`
- 512 / maskable / Apple Touch / PNG family used by the PWA/install surfaces.

### Current application scale contract
Shared launcher baseline:
- public desktop header: 22px tile;
- mobile navigation: 30px;
- footer brand: 24px;
- supporting banner/footer action: 20px;
- inline launcher: 18px.

Do not shrink the general UI application below the current 18px baseline merely to fit crowded navigation. Favicon assets are a separate small-size exception and must be evaluated as favicon assets.

### App tile vs standalone mark
The square Obsidian tile is correct for app/PWA contexts.
A transparent standalone Option 02 mark may be preferable in some public wordmark/header contexts, but it must be compared visually before replacing the current shared tile.

### Clear space
Until the final standalone transparent master is validated, do not invent a universal print-style clear-space formula. In UI, preserve the existing component gaps and never allow text/other icons to touch or overlap the mark.

### Monochrome / inverse
Geometry must remain recognizable without relying on glow or the full gradient. Final exported mono/inverse asset verification remains an asset-compliance task before calling the brand book fully closed.

---

## 4. Canonical color system
Source of truth: `src/styles/hermes-brand-system.css`.

### Core surfaces
- Pearl: `--hermes-pearl` `#F7F6F3`
- Paper: `--hermes-paper` `#FFFFFF`
- Obsidian: `--hermes-obsidian` `#0B0D12`
- Graphite: `--hermes-graphite` `#20232C`
- Raised graphite: `--hermes-graphite-raised` `#151922`

### Intelligence
- Violet: `--hermes-violet` `#7C5CFF`
- Ocean: `--hermes-ocean` `#5AC8FA`
- Intelligence gradient: violet -> ocean

### Division semantics
- Logistics: `#1E88FF`
- Marketing: `#00C853`
- Academy: `#7C5CFF`
- Technology / IT: `#FF7A00`

### Meaning
- Logistics blue: movement, speed, reliability, scale.
- Marketing green: growth, reach, attention, brand creation.
- Academy violet: knowledge, development, learning, future.
- Technology orange: technology, innovation, AI, automation.

### Important distinction
Semantic color is a navigation/context signal, not the only art-direction color allowed on a page.
A liked Marketing magenta/pink atmospheric composition may remain while Marketing green handles semantic workspace/context cues.

### Beauty
No approved canonical Beauty color exists. Do not derive one from personal taste or another division.

---

## 5. Color application hierarchy
Use division color in this order:
1. selected/current navigation;
2. small contextual badge/chip;
3. light border or ambient wash;
4. workspace accent;
5. contextual mark material only after visual validation.

Do not use division color as:
- full-page paint by default;
- replacement for all Pearl/Obsidian surfaces;
- reason to recolor strong art-directed sections;
- decorative saturation across every component.

The contextual Connect launcher may use restrained division atmosphere while the CTA remains operational/neutral.

---

## 6. Typography
Use the shared project typography tokens rather than introducing page-local type families.

### Display
`var(--font-display)`
- bold, editorial headlines;
- tight tracking where the shared Design OS specifies it;
- balanced wrapping;
- avoid tiny decorative display copy.

Design OS rhythm:
- `--hermes-display-tracking: -0.05em`
- `--hermes-display-leading: 0.96`

### Body
Use the standard project body family with readable line length and:
- `--hermes-copy-leading: 1.62` as the shared long-copy baseline.

### Mono/utility
Use `var(--font-mono)` for small system labels/technical metadata only when it improves hierarchy. Do not turn whole product screens into terminal UI.

### Localization
Never solve RU/UK/ES/IT/FR wrapping by globally shrinking font size. Dynamic identity/business names may ellipsize; important action/state copy should wrap inside bounded tracks.

---

## 7. Shape and spacing
Canonical shape tokens:
- control: `--hermes-radius-control` = 12px
- card: `--hermes-radius-card` = 22px
- panel: `--hermes-radius-panel` = 30px
- pill: `--hermes-radius-pill` = 999px

Canonical public section rhythm:
- `--hermes-section-space: clamp(4rem, 7vw, 6.5rem)`

Rule:
Do not globally compress section spacing to repair one under-filled block. Repair the component hierarchy/content density locally.

---

## 8. Card grammar
### Public card
- Pearl/Paper surface;
- light line;
- calm card shadow;
- clear title/content/next action;
- enough content to justify its footprint.

### Workspace panel
- contextual Pearl or Obsidian according to product need;
- restrained vertical accent;
- dense but readable information hierarchy;
- avoid giant decorative containers around tiny utility content.

### Directory/list card
A high-count route directory must use explicit layout primitives and scan-friendly rows/cards. Do not rely on inherited grid templates.

---

## 9. Buttons and interactive controls
Consistency does not mean identical paint.

Shared invariants:
- clear primary/secondary hierarchy;
- usable touch target;
- control-radius family unless the composition intentionally uses a pill;
- visible focus;
- explicit disabled/loading state;
- no interaction communicated by hover only.

Context may change foreground/background contrast on Pearl vs Obsidian.

Avoid:
- multiple equal “primary” buttons in one decision point;
- heavy decorative glow;
- icon-only actions without accessible name;
- tiny click targets.

---

## 10. Motion
Motion is allowed to communicate:
- connection/flow;
- system state;
- hierarchy transition;
- reveal of relevant information.

Motion is not allowed merely to make the page “more AI.”

Use shared motion timing tokens and honor `prefers-reduced-motion`.

Option 02 motion must preserve the master geometry. Future animation can move material/light/flow through the geometry; it must not morph the mark into unrelated shapes unless explicitly approved as a separate animation sequence.

---

## 11. Glass / transparency
Glass is supporting material, not the entire interface.

Use:
- restrained blur;
- visible boundaries;
- readable foreground contrast.

Honor `prefers-reduced-transparency` where glass materially affects legibility.

---

## 12. Imagery and 3D objects
Preferred:
- premium editorial photography;
- business-context imagery with believable operational relevance;
- tactile glass/metal system objects;
- restrained abstract flow/ribbon forms;
- strong image stages in hero compositions.

Avoid:
- generic AI robots;
- glowing brains;
- random 3D blobs unrelated to system meaning;
- stock trucking collage as the entire Logistics identity;
- decorative images that make page hierarchy less clear.

---

## 13. Public vs private behavior
### Public
Goal: trust -> understanding -> direction -> action.

Use:
- generous editorial composition;
- clear audience language;
- proof and scope;
- one obvious next step.

### Private/workspace
Goal: state -> decision -> action -> feedback.

Use:
- account identity;
- workspace switcher where relevant;
- contextual product navigation;
- operational status;
- clear empty/error/loading/success states;
- compact layouts that remain usable at 390px.

Do not copy the entire public corporate navigation into the center of an operational workflow.

---

## 14. Navigation model
Keep these jobs distinct:
- global Hermes navigation = move between public ecosystem directions;
- Hermes account/workspace switcher = change owned/shared workspace;
- product navigation = move inside Repair Shop / Academy / AI product;
- language selector = change locale without changing the product identity.

Do not merge them into one enormous menu simply to reduce the number of components.

---

## 15. Responsive contract
Minimum visual evidence for visual PRs:
- 1440px desktop;
- 390px mobile.

Add as relevant:
- 430;
- 768;
- 1024;
- wide desktop.

Must verify:
- no horizontal page overflow;
- no clipped cards/menus/drawers;
- long localization strings;
- sticky/fixed navigation;
- usable touch targets;
- safe modal/drawer close behavior.

---

## 16. Accessibility contract
Every visual component must preserve:
- visible keyboard focus;
- meaningful text/accessible names;
- non-color-only state communication;
- sufficient practical contrast;
- reduced motion;
- reduced transparency where relevant;
- status/error semantics;
- keyboard operability.

Accessibility is part of the design definition, not post-design QA.

---

## 17. Internal quality references
Preserve and learn from the strongest existing compositions rather than redesigning them for uniformity:
- Technology public hero / atmospheric system sections;
- Academy premium warm hero and direction mood;
- strongest Hermes Connect product compositions;
- approved Connect banner/product-family treatments.

When a screenshot mixes good and bad sections, classify each as KEEP/FIX/REPLACE before touching code.

---

## 18. Do / Don’t
### Do
- fix system causes rather than screenshot symptoms;
- use real product data/state where available;
- use division color sparingly;
- keep Option 02 geometry stable;
- validate desktop + mobile;
- record before/after evidence;
- keep public and private surfaces related but functionally appropriate.

### Don’t
- redesign a strong section because an adjacent one is weak;
- invent capabilities in UI copy;
- create duplicate Hermes Connect runtimes;
- create new logo geometry after an owner lock;
- add Beauty color without approval;
- make dense utility information tiny inside huge empty containers;
- treat every contextual button variation as a consistency defect.

---

## 19. Production source-of-truth files
Core:
- `src/styles/hermes-brand-system.css`
- `ai-collaboration/01_DESIGN/DIVISION_COLOR_CONTRACT_2026-09-01.md`
- `ai-collaboration/01_DESIGN/DESIGN_REGRESSION_CHECKLIST.md`

Hermes Connect decision history/current mark:
- `ai-collaboration/01_DESIGN/hermes-connect/OWNER_DECISION_OPTION02_2026-08-31.md`
- `ai-collaboration/01_DESIGN/hermes-connect/CURRENT_STATE.md`
- `public/demos/hermes-connect/icon.svg`

Current application audits:
- `hermes-connect/LOGO_REFERENCE_AUDIT_2026-09-01.md`
- `hermes-connect/LAUNCHER_APPLICATION_AUDIT_2026-09-01.md`
- `hermes-connect/LAUNCHER_ROUTE_COVERAGE_AUDIT_2026-09-01.md`

---

## 20. Remaining compliance items before calling Brand System 2.0 FINAL
These are intentionally not faked as complete:
1. side-by-side visual decision: square app tile vs transparent standalone Option 02 in public header contexts;
2. final transparent standalone master export validation;
3. explicit monochrome/inverse asset export validation;
4. final clear-space/minimum-size rules for the standalone master after that export is locked;
5. real iPhone Safari/PWA install check;
6. real Android install check;
7. Beauty color/identity owner decision;
8. optional trademark/similarity review.

Until those items close, this document is the **production operating baseline**, not a claim that every external brand-compliance deliverable is finished.
