# Codex Website Handoff

STATUS: LOCAL_V1_1_FUNCTIONALLY_COMPLETE

LOCAL_PATH: `/Users/progressopro/Documents/hermeslogisticus.com`

BRANCH: `prototype/editorial-v1`

SCOPE_COMPLETED:

- ecosystem homepage with four clear directions;
- dedicated Logistics, ProgressoPro, Academy, and IT Development pages;
- mobile and desktop navigation;
- direction-aware contact preview form;
- configurable preview/live contact workflow with validation, consent, idempotency, timeout, and failure handling;
- privacy notice;
- canonical and social metadata;
- custom 404 page, robots file, and sitemap;
- responsive layout and reduced-motion support;
- unsupported-claim and no-external-form safeguards.

VERIFICATION:

- Astro diagnostics: zero errors, warnings, or hints;
- six static HTML routes generated;
- automated route, content, asset, sitemap, and form checks passed;
- desktop 1440px: no overflow, broken images, or console errors;
- mobile 390px: no overflow, broken images, or console errors;
- mobile menu and path selection verified.
- Playwright: 17 desktop/mobile workflow tests passed; one desktop-only skip expected.

INTENTIONALLY NOT CONNECTED:

- public hosting and DNS;
- approved live form receiver and storage;
- analytics;
- CRM, Google Sheets, Telegram, or external APIs.

PUBLICATION GATE:

1. Vladimir approves the visible V1.
2. Choose the approved zero-cost host.
3. Connect a GitHub remote if required by the host.
4. Deploy a preview and verify it.
5. Connect the domain only after preview approval.
6. Connect a form endpoint only after destination and data-handling rules are approved.
