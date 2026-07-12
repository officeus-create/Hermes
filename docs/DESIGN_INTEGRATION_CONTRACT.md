# Hermes Website Design Integration Contract

STATUS: FUNCTIONAL_CORE_FROZEN_AT_V1_1

The design workstream may change layout, typography, colors, imagery, spacing, motion, and visual composition. It should preserve the functional contracts below.

## Routes To Preserve

- `/`
- `/paths/logistics/`
- `/paths/marketing/`
- `/paths/academy/`
- `/paths/technology/`
- `/privacy/`
- `/404.html`

## Functional Contracts

- Keep `#main-content`, `#paths`, `#journey`, `#about`, and `#contact` targets.
- Keep all four `/paths/{slug}/` links discoverable from the homepage.
- Keep the mobile menu button, `aria-expanded`, controlled menu, and Escape behavior.
- Keep contact field names: `name`, `email`, `path`, `message`, `website`, and `consent`.
- Keep `data-contact-form`, `data-contact-mode`, `data-contact-endpoint`, `data-form-alert`, and `data-form-status` hooks.
- Keep preview mode as the default and do not add a form `action`.
- Keep live delivery controlled only by `PUBLIC_CONTACT_MODE` and `PUBLIC_CONTACT_ENDPOINT`.
- Keep direction pages preselecting the matching contact option.
- Keep canonical, Open Graph, favicon, sitemap, robots, 404, security headers, and privacy route.
- Keep reduced-motion behavior and avoid horizontal overflow.

## Required Checks After Design Changes

```bash
npm run build
npm test
npm run test:e2e
```

Expected result: zero Astro diagnostics, static validation pass, and 17 passing browser tests with one expected desktop skip for the mobile-only menu test.

## Out Of Scope For The Design Workstream

- production deployment;
- domain or DNS changes;
- contact endpoint selection;
- CRM, Google Sheets, email, Telegram, or analytics integration;
- changing business claims without source approval.
