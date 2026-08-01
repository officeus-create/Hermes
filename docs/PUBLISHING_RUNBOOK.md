# Hermes Website Publishing Runbook

STATUS: READY_FOR_EXTERNAL_SETUP

This runbook starts only after owner approval for creation or use of the external accounts and repository.

## Recommended Path

Use a private GitHub repository for source control and Cloudflare Pages for static hosting.

Cloudflare Pages settings:

- production branch: `main`;
- build command: `npm run build`;
- build directory: `dist`;
- Node version: `22`;
- framework preset: `Astro` when available;
- environment variables: none required for V1.

The current static website does not need the Cloudflare Astro server adapter.

Keep `PUBLIC_CONTACT_MODE=preview` for the first deployment. Live contact delivery is a separate release because the endpoint domain must also be added to the Content Security Policy `connect-src` directive.

## Publication Sequence

1. Confirm the GitHub account or organization that will own the repository.
2. Use the private GitHub repository for the Hermes website.
3. Add the repository as `origin` and push the reviewed V1 commit.
4. Confirm the GitHub Actions `Website checks` workflow passes.
5. In Cloudflare Pages, import the repository and apply the settings above.
6. Review the generated `*.pages.dev` URL on desktop and mobile.
7. Record the deployed commit and preview URL.
8. Connect `hermeslogisticsus.com` only after the owner approves the preview.
9. After approval, attach the custom domain in Cloudflare and verify HTTPS.

## Preview Acceptance Checks

- all five public routes return HTTP 200;
- the custom 404 page is served for an invalid route;
- images and favicon load;
- desktop and mobile have no horizontal overflow;
- navigation and direction links work;
- the contact form shows the local preview message and sends no request;
- canonical URLs point to `https://hermeslogisticsus.com`;
- no secrets or environment variables are configured;
- the form remains in preview mode and produces no POST request;
- deployed commit matches the approved local commit.

## Rollback

Before connecting the domain, rollback means selecting the previous successful Cloudflare deployment. After domain connection, preserve the previous verified deployment and its commit ID before every production update.

## Separate Future Decision

The V1 form intentionally does not send data. Connecting email, CRM, Google Sheets, or another form service requires a separate destination, retention, and approval decision.
