# Hermes Connect — Iteration Quality Loop

Status: ACTIVE WORKING PROTOCOL
Owner: Vladimir / Hermes
Applies to: ChatGPT, Codex, Claude, Gemini, designers, developers and reviewers working on Hermes Connect / public direction UI.

## Purpose

Every implementation step must make the next step better. Do not repeatedly solve the same class of problem from zero.

## The 7-step loop

### 1. Re-read the decision boundary
Before editing, identify:
- the current owner-approved decision;
- the production source of truth;
- what is explicitly out of scope;
- strong existing sections that must be preserved.

Never replace a strong working area just because a neighboring area is weak.

### 2. Capture the baseline
Before changing behavior or visuals, record the current state using the strongest available evidence:
- current branch / commit;
- relevant screenshots or route state;
- affected files/components;
- current automated test status when available;
- known defect stated in one sentence.

A change without a baseline cannot be evaluated reliably.

### 3. Make the smallest reversible improvement
Prefer the smallest change that fixes the identified problem while preserving working behavior, SEO, localization, accessibility and conversion paths.

Avoid broad rewrites unless the existing architecture is itself the proven cause of the defect.

### 4. Validate in layers
Validate in this order:
1. syntax / build;
2. targeted contract tests;
3. broader regression tests where risk justifies them;
4. desktop visual review;
5. mobile visual review;
6. accessibility / reduced-motion / focus behavior;
7. conversion and SEO path preservation.

Do not call a step complete only because the code was written.

### 5. Compare before vs after
Score the result against the baseline on five questions:
- Is it clearer?
- Is it visually stronger and more consistent?
- Is the user path easier?
- Did we preserve working behavior and evidence?
- Did we reduce future maintenance or duplication?

If the answer is not clearly positive, refine or revert.

### 6. Extract the lesson
After each meaningful step, write one short lesson in the task/PR/decision record using this form:

`Observed -> Changed -> Result -> Rule for next time`

Example:
`Observed: Logistics directory collapsed into visually flat links -> Changed: restored grouped card/grid hierarchy -> Result: scanning and route discovery improved without changing URLs -> Rule: preserve information architecture when polishing visual density.`

### 7. Update the next-step priority
Choose the next task by impact, not by novelty:
1. broken / risky production behavior;
2. conversion blockers;
3. owner-visible design defects;
4. consistency across the four directions;
5. polish and experiments.

Do not start a new experiment while a higher-impact known defect remains open.

## Design-specific quality gates

For Hermes Connect logo / identity work, always check:
- 16 / 32 / 64 / 128 / 512 px legibility;
- light and dark backgrounds;
- monochrome and inverse versions;
- app/PWA icon safe zone;
- header and mobile navigation placement;
- reduced-motion behavior where animated;
- similarity / generic-infinity risk;
- consistency with Pearl / Obsidian Hermes system.

## Public direction UI gates

For Logistics / Marketing / Academy / Technology pages, preserve one shared system while allowing direction-specific signal color and content hierarchy.

Before completion verify:
- hero hierarchy;
- section rhythm;
- card density and scanability;
- mobile stacking;
- primary CTA visibility;
- direct contact path;
- SEO/crawlable links unchanged unless explicitly approved;
- no strong existing section regressed.

## Completion rule

A task is `DONE` only when all four are true:
- implemented;
- validated;
- compared against baseline;
- lesson recorded for the next iteration.

If any one is missing, status is `IMPLEMENTED / VALIDATION PENDING`, not done.
