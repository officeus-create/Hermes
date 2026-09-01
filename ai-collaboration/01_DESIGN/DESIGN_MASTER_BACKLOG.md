# Hermes Design Master Backlog

Status: ACTIVE
Owner: CEO
Active implementation PR: #944
Execution rule: simple -> complex; fix systemic causes before one-off screens; preserve strong sections; validate desktop + mobile before merge.

## Progress snapshot — 2026-09-01
- Autonomous queue items marked DONE: **19 / 32**.
- Additional items actively implemented but awaiting CI/visual evidence: **3**.
- The autonomous queue has passed the halfway point without requiring owner access.

## Status vocabulary
- DONE — task/audit/design deliverable is complete at its defined scope and evidence is recorded.
- IN PROGRESS — implementation exists on the active design branch but final CI/visual evidence or remaining asset compliance is pending.
- TODO — can be completed autonomously.
- OWNER INPUT — requires taste/brand/access decision from the CEO.
- EXTERNAL ACCESS — requires an account/device/connector that is not currently available.

## Locked design decisions
1. Hermes is one ecosystem across Logistics, Marketing, Academy and Technology/IT.
2. Public visual system: Pearl-first premium environment.
3. Private/operating visual system: Obsidian/Anthracite where operational density benefits from it; Pearl private shells remain valid where already approved.
4. Hermes Connect master mark: owner-approved Option 02 continuous-loop mark. Do not reopen logo exploration without an explicit owner request.
5. Preserve strong existing Technology, Academy and Hermes Connect compositions as internal quality references.
6. Division semantic colors remain restrained accents, not full-page recoloring.
7. Never trade clarity, mobile usability, accessibility or information hierarchy for decorative effects.

## Completed foundation
- [x] Four-direction public ecosystem architecture.
- [x] Pearl / Obsidian design language established.
- [x] Hermes Connect Option 02 shipped through the approved asset family.
- [x] Logistics collapsed directory/commercial hierarchy received a first responsive repair.
- [x] Repair Shops private workspace received the Pearl-first product treatment.
- [x] Shared Hermes account/workspace switcher foundation exists.
- [x] RU continuity across significant public/private Connect flows substantially improved.
- [x] Responsive/focus/reduced-motion foundations exist across major Connect flows.

## Autonomous queue — simple to complex

### P0 — housekeeping and system consistency
- [x] Create this single Design Master Backlog.
- [x] Audit all current Hermes Connect logo references. Evidence: `hermes-connect/LOGO_REFERENCE_AUDIT_2026-09-01.md`; no active pre-Option-02 visual geometry found on the audited main baseline.
- [x] Audit shared header/footer/launcher logo sizing and spacing consistency. Evidence: `hermes-connect/LAUNCHER_APPLICATION_AUDIT_2026-09-01.md`.
- [x] Audit design-token duplication and document one canonical source per semantic token. Evidence: `DESIGN_TOKEN_AUDIT_2026-09-01.md`; Repair Shop partner UI migration is included in PR #944.
- [x] Add a design regression checklist for every visual PR: `DESIGN_REGRESSION_CHECKLIST.md`.

### P1 — bounded public-site repairs
- [~] Repair Marketing official-channels/social block hierarchy and excessive dead space. Implementation is in PR #944; remains IN PROGRESS until CI/visual evidence is green.
- [x] Audit remaining Logistics utility/directory blocks for the same collapsed-list pattern repaired in the Option 02 rollout. Evidence: `LOGISTICS_DIRECTORY_AUDIT_2026-09-01.md`.
- [x] Normalize section spacing where oversized containers hold low-information content. Code-level conclusion: defects are local, not a global spacing problem. Evidence: `SECTION_DENSITY_AUDIT_2026-09-01.md`.
- [x] Normalize repeated card/button/pill states only where inconsistent; do not flatten distinctive strong sections. Evidence: `PRIMITIVE_CONSISTENCY_AUDIT_2026-09-01.md`; current shared primitive boundaries are correct and no blind global rewrite is justified.
- [x] Verify global Hermes Connect launcher treatment across all path pages. Evidence: `hermes-connect/LAUNCHER_ROUTE_COVERAGE_AUDIT_2026-09-01.md`.

### P2 — responsive and accessibility pass
- [x] Build a page/component inventory for visual QA. Evidence: `VISUAL_QA_ROUTE_INVENTORY_2026-09-01.md`.
- [ ] Validate 390 / 430 / 768 / 1024 / 1440 widths for highest-value public and Connect routes.
- [ ] Eliminate horizontal overflow and clipped tap targets across the route matrix.
- [ ] Audit keyboard focus visibility, contrast and reduced-motion behavior across the route matrix.
- [x] Audit long EN/RU labels for wrapping and layout stability in the shared account switcher. Evidence: `LOCALIZATION_LAYOUT_AUDIT_2026-09-01.md`; long workspace-state track hardened in PR #944.

### P3 — division color application
- [x] Reconcile historical four-color board with current semantic tokens and document exact canonical mapping. Evidence: `DIVISION_COLOR_CONTRACT_2026-09-01.md`.
- [~] Apply division color as restrained context signal to approved components without global page recoloring. First shared Connect launcher context layer implemented in PR #944; visual evidence pending.
- [ ] Create Option 02 contextual variants from the same geometry; geometry must not change.
- [ ] Verify light/dark/mono behavior and small-size legibility.
- [ ] Beauty remains unassigned until owner approval; do not invent a Beauty color.

### P4 — private workspace consistency
- [x] Audit shared account/workspace navigation across Repair Shop, Academy and AI surfaces. Evidence: `PRIVATE_WORKSPACE_NAV_AUDIT_2026-09-01.md`.
- [x] Reduce duplicate navigation concepts between public shell and signed-in workspace. Audit found no duplicate account-switcher implementation to remove; account navigation and product navigation are intentionally separate jobs. AI header placement remains a visual-QA candidate, not a blind refactor.
- [ ] Normalize empty/loading/error states.
- [ ] Normalize drawers/modals/forms/table density for mobile.
- [ ] Verify Russian UI continuity through private navigation beyond the shared account-switcher scope.

### P5 — product UX
- [x] Design the production Website Factory intake flow from the existing product concept: sign-in, source links, business extraction, voice/text brief, competitor references by role, review, build handoff. Evidence: `WEBSITE_FACTORY_UX_SPEC_V1.md`.
- [x] Define reusable upload/link/competitor/brief components instead of a one-off wizard. Evidence: `WEBSITE_FACTORY_UX_SPEC_V1.md` reusable component contract.
- [x] Integrate validation, progress, save/resume and clear next-step states into the design specification. Evidence: `WEBSITE_FACTORY_UX_SPEC_V1.md`.

### P6 — brand system consolidation
- [~] Consolidate the production brand truth into Hermes Brand System 2.0. Production operating baseline exists: `HERMES_BRAND_SYSTEM_2_0.md`; final standalone mark/mono/device compliance remains open.
- [~] Include mark rules, minimum size, clear space, inverse/mono, division accents, typography, spacing, buttons, cards, imagery, motion, public/private examples and do/don'ts. Most rules are now consolidated; final standalone transparent mark clear-space/min-size and mono/inverse export validation remain open.
- [x] Consolidate design evidence and decision records into a navigable archive/index. Evidence: `README.md` in this design directory.
- [x] Retire contradictory historical logo guidance while retaining it as labelled history. `hermes-connect/APPROVED_BRAND_SYSTEM_V1.md` is now explicitly historical/partially superseded and points to the Option 02 owner decision.

## Requires owner input later
- [ ] Beauty color / visual identity.
- [ ] Approval of any major full-page redesign that materially changes an already strong composition.
- [ ] Any future change to Option 02 master geometry.
- [ ] Quick visual choice after evidence exists: square app tile vs transparent standalone Option 02 in selected public header contexts.

## Requires external access later
- [ ] Real iPhone Safari/PWA install verification.
- [ ] Real Android install verification.
- [ ] External account branding changes (for example Telegram avatars) where account access is required.
- [ ] Optional trademark/similarity review of Option 02.

## Working protocol
For every task:
1. Record baseline/problem.
2. Change the smallest canonical component/token that fixes the system cause.
3. Preserve URLs, SEO contracts and product behavior unless the task explicitly requires otherwise.
4. Validate desktop + mobile.
5. Record evidence and lesson.
6. Report one short `NEED FROM OWNER LATER:` line, then continue with the next autonomous task without waiting.
