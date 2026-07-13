# Cursor Mission 03 - First-Party Conversion Event Contract

AI_NAME: Cursor
ROLE: Conversion Instrumentation Engineer
PROJECT: Hermes Website
STATUS: WAITING_CURSOR_USAGE_RESET
MODE: Program / bounded sprint

## Objective

Implement a vendor-neutral, browser-local conversion event contract for the
existing Hermes website. The contract must let Codex verify which public
actions matter before any analytics provider is selected.

This mission must not change the current visual design.

## Launch evidence

Attempted from the authenticated Cursor CLI on 2026-07-13. Cursor returned:
`You've hit your usage limit`. No Mission 03 code changes were made. Resume
this same mission after the Cursor usage limit resets; do not create a duplicate
mission.

## Required events

Use one DOM event channel, `hermes:conversion`, with a typed detail payload.

1. `direction_pillar_opened`
2. `direction_page_cta_clicked`
3. `contact_preview_generated`
4. `contact_request_copied`
5. `contact_route_opened`

Emit only after the matching visitor action. Do not emit an event for an
initial render, failed validation, failed copy, or hidden element.

## Allowed payload

The payload may contain only non-personal context:

- `event_name`
- `event_version`
- `occurred_at`
- `source_path`
- `direction`
- `component`
- `action`

Use an allowlist. Unknown keys must be discarded or rejected.

## Forbidden payload and behavior

Never include:

- name, email, phone, message, MC/DOT, request ID, form answers, clipboard
  content, URL query content, or any free-text visitor value;
- cookies, localStorage, sessionStorage, fingerprinting, device identifiers,
  IP data, or hidden IDs;
- `dataLayer`, Google Analytics, Google Tag Manager, Meta Pixel, third-party
  SDKs, tracking images, beacons, or network requests;
- console logging in production behavior;
- live CRM, Google Sheets, email, Telegram, or form-delivery actions.

The event bus is in-memory only. Reloading the page clears it.

## Implementation requirements

1. Add a small typed helper under `src/lib/`; do not duplicate event-building
   logic across components.
2. Preserve the current preview-first contact workflow.
3. Instrument the existing interactive pillars, direction CTAs, preview
   generation, successful copy, and approved contact-route opening.
4. Keep links and keyboard behavior unchanged.
5. Make the contract usable by a future first-party listener without adding
   that listener now.
6. Document the event table and privacy boundary in README or a focused doc.
7. Update `docs/CURSOR_WORK_LOG.md` as Session 03 with exact evidence.

## Tests

Add focused unit/static checks and Playwright coverage proving:

1. every required event can be observed through `hermes:conversion`;
2. opening a pillar by click and keyboard produces the expected event;
3. invalid contact submission produces no conversion event;
4. preview, successful copy, and route click produce distinct events;
5. event detail contains no PII or form-field values;
6. instrumentation creates no POST, beacon, analytics, or other new network
   request;
7. existing desktop and mobile behavior still passes.

Run:

```bash
npm test
npm run build
npm run test:e2e -- --workers=3
```

## Do not do

- Do not redesign or restyle the site.
- Do not deploy or push.
- Do not modify DNS, Cloudflare, GitHub settings, or external accounts.
- Do not add a package unless the existing stack cannot express the contract.
- Do not refactor unrelated code.
- Do not remove or overwrite existing uncommitted work.

## Handoff

Return:

- files changed;
- event contract delivered;
- exact tests and results;
- proof that no network sink or PII was added;
- remaining risks;
- recommended Mission 04, but do not start it.

LEARNED_DURING_TASK:
IDEAS_ADDED:
IDEAS_REVIEWED:
OPPORTUNITIES_FOUND:
TASKS_CREATED_FROM_IDEAS:
WAITING_FOR:
