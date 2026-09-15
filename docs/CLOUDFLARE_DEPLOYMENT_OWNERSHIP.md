# Cloudflare deployment ownership

Status: repository audit complete; one dashboard-side Workers Git integration remains to be disabled or narrowed.

## Approved public deployment architecture

### Main Hermes Pages project

- Cloudflare Pages project: `hermes`.
- Repository: `officeus-create/Hermes`.
- Approved production branch: `main`.
- Build output: `dist`.
- Public domains currently confirmed through this project:
  - `hermeslogisticsus.com`;
  - `connect.hermeslogisticsus.com`.
- Pull requests may receive isolated Pages preview URLs.
- The Connect hostname is routed by `functions/_middleware.js` to the reviewed `/demos/hermes-connect/` Web App while the main hostname continues to serve the normal Hermes site.

The strict public verifier confirmed the approved Connect release on 24 of 24 requests with HTTP 200, the expected Web App title, approved markers present and previous-version markers absent.

### Booking prototype Pages project

- Cloudflare Pages project: `hermes-connect-prototype`.
- Public domain: `app.hermeslogisticsus.com`.
- Purpose: preserve the previous profile and availability prototype independently from the main Hermes Connect Web App.

### Private email-delivery Worker

- Intended Worker name: `hermes-lead-email`.
- Repository source: `workers/lead-email/src/index.mjs`.
- Intended configuration: `workers/lead-email/wrangler.jsonc.example` copied to an authenticated, non-repository deployment environment only when activation is approved.
- `workers.dev` is disabled.
- preview URLs are disabled.
- the Worker has no public route and is intended to be called only through a Pages Service Binding.
- lead delivery remains default-off until the authenticated Cloudflare acceptance evidence in `docs/CLOUDFLARE_LEAD_DELIVERY_ACTIVATION.md` is complete.

## Confirmed duplicate integration

Recent pull requests produced two independent Cloudflare bot results for the same commit:

1. a Cloudflare Pages preview deployment for project `hermes`;
2. a Cloudflare Workers deployment named `hermes`, shown under a Workers `production/builds` path.

The Workers deployment named `hermes` is not the approved private email Worker, whose reviewed name is `hermes-lead-email`.

The repository audit found:

- no committed active root `wrangler.jsonc`;
- no committed active root `wrangler.toml`;
- only reviewed `.example` configurations;
- no GitHub Actions workflow that runs `wrangler deploy`;
- one controlled GitHub workflow that explicitly runs `pages deploy dist --project-name=hermes`.

Therefore the automatic Workers deployment named `hermes` is controlled by a Cloudflare dashboard-side Git integration or dashboard build configuration, not by a committed GitHub workflow in this repository.

## Required Cloudflare dashboard action

In the authenticated Cloudflare account:

1. Open **Workers & Pages** and select the Workers service named `hermes`, not the Pages project with the same display name.
2. Inspect **Builds / Git integration** and record privately:
   - connected repository;
   - production branch;
   - preview branch behavior;
   - build command;
   - deploy command;
   - root directory;
   - environment bindings available to production and previews;
   - routes or custom domains, if any.
3. Confirm whether the service has any legitimate purpose distinct from Pages.
4. If it is a duplicate full-site integration, disconnect its Git integration or disable automatic deployments.
5. If it is required for a documented layered architecture, restrict production to reviewed `main`, isolate previews, remove production secrets and bindings from previews, and document its exact route boundary.
6. Do not disable, rename or delete `hermes-lead-email` while resolving the duplicate service.
7. Do not change Google Workspace MX, SPF, DKIM, DMARC or mail routing as part of this deployment-isolation task.

## Verification after dashboard correction

Open one harmless documentation-only pull request and confirm:

- Cloudflare Pages creates an isolated preview URL;
- no Workers deployment named `hermes` is created for the PR;
- `hermeslogisticsus.com` remains on the approved production release;
- `connect.hermeslogisticsus.com` remains `LIVE_APPROVED_WEB_APP`;
- `app.hermeslogisticsus.com` continues to serve the preserved prototype;
- no preview receives production inquiry-delivery bindings or secrets.

Then merge the harmless change and confirm that only the approved production path updates the custom domain.

## Repository enforcement

`scripts/cloudflare-deployment-contract.test.mjs` and the dedicated GitHub workflow enforce the repository-controlled part of this boundary:

- root Cloudflare configurations remain examples rather than active Worker deploy configs;
- the main configuration remains Pages-oriented;
- the private Worker keeps its distinct `hermes-lead-email` identity and public-route restrictions;
- GitHub workflows may use `wrangler pages deploy`, but may not introduce a generic `wrangler deploy` path without an explicitly reviewed architecture change.

This enforcement cannot disconnect a dashboard-side Git integration. That remaining authenticated action stays tracked in Issue #226.

## Hermes Digital Interface Layer inheritance

Cloudflare is a **delivery and production surface**, not an independent brand source of truth.

All Hermes public surfaces delivered through Cloudflare Pages, Workers or related production routing must inherit the canonical visual implementation and tokens from the governed repository. The digital communication standard is defined in `docs/design/HERMES_DIGITAL_INTERFACE_LAYER.md`, under the parent `docs/design/HERMES_UNIFIED_BRAND_SYSTEM.md`.

Rules:

- do not create Cloudflare-only visual tokens, CSS themes or brand rules that diverge from the repository;
- website, Hermes Connect and Command Center remain **Product-Native Mode**: they may share HDIL labels, state markers, pearl/ink hierarchy and compact interface grammar, but functional product UI takes priority over decorative terminal styling;
- social/channel-specific Full Terminal or Adapted Interface treatments must not be globally imposed on production product UI merely because the assets are served through Cloudflare;
- deployment verification should confirm the intended repository version is the version visible on the public Cloudflare-served surface;
- any intentional visual-system exception requires a reviewed repository change first, not a dashboard-only override.

This keeps the chain of authority explicit:

`Hermes Unified Brand System → Hermes Digital Interface Layer → governed repository implementation → Cloudflare delivery`.
