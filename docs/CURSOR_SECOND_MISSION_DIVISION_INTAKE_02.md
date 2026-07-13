# Cursor Second Mission - Division Intake 02

STATUS: READY_FOR_CURSOR
ROLE: Conversion Workflow Engineer
PROJECT: Hermes corporate website
DESIGN_SCOPE: preserve the current visual system

## Objective

Turn the shared contact preview into a useful discovery form for each business
direction without adding a backend, external service, CRM write, or redesign.

## Required behavior

1. Keep the existing common fields: name, email, direction, message, consent.
2. Render a small direction-specific field group after a direction is selected.
3. Include the completed direction fields in the copied request summary.
4. Keep preview mode as the default and send zero network requests.
5. Clear stale preview output when a direction or direction-specific answer changes.

## Direction fields

### Hermes Logistics

- Optional phone.
- MC/DOT.
- Equipment type.
- Fleet size.
- Preferred lanes or operating area.
- Service needed.

Phone input and telephone contact routes are allowed only for Logistics.

### ProgressoPro Marketing

- Platforms: Google, YouTube, TikTok, Threads, Facebook, Instagram, X,
  LinkedIn, or Other.
- Planning horizon: 3, 6, 9, or 12 months.
- Primary goal.
- Target audience.
- Current channels/results.
- Monthly budget range.

Marketing contact uses email only.

### Hermes Business Academy

- Target role or skill.
- Current level.
- Weekly learning availability.
- Preferred language.
- Desired start period.

Academy and course contact uses email only.

### IT Development

- System or workflow needed.
- Current tools.
- Number of users.
- Integrations needed.
- Data sensitivity.
- Timeline.
- Budget range.

IT contact uses email only.

## Engineering rules

- Extend the existing typed contact helper instead of building a second form.
- Prefer semantic controls: checkboxes for platforms, select controls for fixed
  option sets, and inputs/textareas for free text.
- Do not render every direction's fields at once.
- Do not store answers in localStorage, cookies, analytics, or hidden network
  requests.
- Do not add dependencies, invent public claims, alter package prices, deploy,
  or change visual branding.
- Preserve all current Codex and Cursor work.

## Tests required

- Correct field group appears for every direction.
- Switching direction hides old fields and clears stale preview handoff.
- Marketing accepts multiple platforms and a 3/6/9/12-month horizon.
- Logistics exposes optional phone; the other three directions expose no phone
  input and no `tel:` route.
- Copied summaries include direction-specific answers and contain no HTML.
- Preview mode sends zero POST requests.
- Existing unit, static, desktop, and mobile tests remain green.

## Documentation

Update `docs/CURSOR_WORK_LOG.md` with a new Session 02 section. Change the
revenue register only when supported by completed tests.

## Return format

AI_NAME: Cursor
ROLE: Conversion Workflow Engineer
STATUS:
FILES_CHANGED:
BEHAVIOR_DELIVERED:
TESTS_PASSED:
SCREENSHOTS:
RISKS:
NOT_IMPLEMENTED:
NEXT_RECOMMENDED_TASK:
LEARNED_DURING_TASK:
WAITING_FOR:
