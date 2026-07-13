# Cursor First Mission - Revenue Sprint 01

STATUS: READY_FOR_CURSOR
ROLE: Revenue Completion Engineer
PROJECT: Hermes corporate website
DESIGN_SCOPE: frozen; preserve the current visual system

## Objective

Reduce the number of visitors lost between completing the preview form and
contacting the correct Hermes business direction.

Build a `Preview-to-contact handoff v0.1` that works without a backend, API key,
CRM write, analytics service, or production deployment.

## Start here

1. Read `AGENTS.md` and the files listed there.
2. Inspect `src/components/ContactCTA.astro`, `src/data/site.ts`, and
   `tests/site.spec.ts`.
3. Run the complete baseline test suite before editing.
4. Write the baseline result and your architecture summary to
   `docs/CURSOR_WORK_LOG.md`.

## Required implementation

After a valid preview form submission:

1. Keep the honest message that data was not sent or stored.
2. Display a compact, accessible request handoff panel.
3. Generate a plain-text request summary from the validated form values.
4. Add a `Copy request` button using the Clipboard API with a clear success or
   failure state.
5. Display the direct contact route matching the selected business direction.
6. Allow the visitor to copy the request and immediately open the approved
   contact route from site data. Channel policy is strict:
   - Hermes Logistics may expose approved phone and logistics email routes.
   - ProgressoPro Marketing must use email only.
   - Hermes Business Academy and all courses must use email only.
   - IT Development must use email only.
   - Social profiles remain follow/discovery channels and must not be used as
     the primary request handoff for Marketing, Academy, or IT.
7. Do not create a network request in preview mode.
8. Clear stale handoff content when the form becomes invalid or the selected
   direction changes.

## Code quality

- Remove the duplicated contact-channel definitions from
  `ContactCTA.astro`; keep approved public channels in structured site data or
  a small typed helper.
- Keep form payload and summary construction in testable functions where
  practical.
- Do not use `innerHTML` for visitor-provided values.
- Preserve keyboard access, focus visibility, live-region announcements, and
  reduced-motion behavior.
- Do not add a framework or new production dependency for this task.

## Tests required

- Preview mode sends zero POST requests.
- A valid preview reveals the handoff panel.
- The selected direction exposes the correct approved channel.
- No `tel:` request route exists on Marketing, Academy, or IT pages.
- `Copy request` receives the expected sanitized plain text.
- Clipboard failure produces honest recoverable feedback.
- Existing form validation, direction preselection, mobile menu, interactive
  components, SEO checks, and public-information gates still pass.

## Documentation required

Update:

- `README.md` with the preview-to-contact behavior;
- `docs/CURSOR_WORK_LOG.md` with evidence;
- `docs/REVENUE_COMPLETION_REGISTER.md` only when a status changes.

## Do not do

- no visual redesign;
- no live form endpoint;
- no CRM or Google Sheets write;
- no analytics vendor;
- no cookies or tracking pixels;
- no new public claims or invented prices;
- no production deployment;
- no changes outside this repository.

## Definition of done

- Implementation is complete and understandable.
- All required tests pass.
- Desktop and mobile screenshots show no overlap or broken layout.
- Work log contains exact commands, results, assumptions, and remaining gaps.
- Handoff is ready for Codex review.

## Cursor return format

AI_NAME: Cursor
ROLE: Revenue Completion Engineer
STATUS:
FILES_CHANGED:
BEHAVIOR_DELIVERED:
TESTS_PASSED:
SCREENSHOTS:
RISKS:
ASSUMPTIONS:
NOT_IMPLEMENTED:
NEXT_RECOMMENDED_TASK:
LEARNED_DURING_TASK:
WAITING_FOR:
