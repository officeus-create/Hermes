# hermes-lead-email — migration to Cloudflare Workers Builds (plan, not yet applied)

Status: PLAN. Nothing in Cloudflare has been changed. The GitHub Actions workflow
`.github/workflows/lead-email-worker-production.yml` stays the deploy path until the
new path is confirmed. Owner decision 2026-10-29: no manually created Cloudflare API token.

## Why

The workflow fails at "Validate Cloudflare credentials" on every run since 2026-10-04
(missing `CLOUDFLARE_API_TOKEN` in GitHub Environment `production`). The deployed Worker
therefore predates the carrier dispatch copy and the Gmail read-only intake. Workers Builds
authenticates through Cloudflare's own GitHub App, so no API token is stored in GitHub.

## Compatibility check (from the repository at main)

| Item | State | Effect on Builds |
|---|---|---|
| Worker name | `hermes-lead-email` in `workers/lead-email/wrangler.production.jsonc` | Must equal the connected Worker's name. It does. |
| Config location | Monorepo subfolder, non-default filename | Root directory `workers/lead-email`; deploy command must pass `--config wrangler.production.jsonc`. |
| Secrets | Set on the Worker (`LEAD_SERVICE_TOKEN`, Gmail OAuth, Telegram) | Not in the repo. Keep `--keep-vars` so a deploy does not wipe them. |
| Durable Objects | `CarHaulingDeliveryCoordinator`, `ColdFairActionLedger` (sqlite, `exports` block) | Same config the workflow already deploys. No new migration. |
| Email binding | `send_email` `EMAIL`, sender `website@hermeslogisticsus.com` | Declared in config. |
| Cron | `*/15 * * * *` | Declared in config. |
| Exposure | `workers_dev:false`, `preview_urls:false`, no routes | Must stay. Enforced by `cloudflare-production-hardening-contract.test.mjs`. |
| Pre-deploy tests | The workflow runs 4 contract tests and a dry-run first | Carried into the Builds build command below; exact-main CI must also be green before the first production build. |

## Settings to use when connecting (owner approves the OAuth in the dashboard)

Workers & Pages → `hermes-lead-email` → Settings → Builds → Connect.

- Repository: `officeus-create/Hermes`, production branch `main`.
- Root directory: `workers/lead-email`.
- Build command (keeps the safety gate the Actions workflow has today):
  `cd ../.. && npm ci && node scripts/repair-shop-password-recovery-contract.test.mjs && node scripts/load-board-intake-api-contract.test.mjs && node scripts/load-board-gmail-readonly-contract.test.mjs && npm run test:cold-fair-outbound-guard && npx --yes wrangler@4 deploy --dry-run --config workers/lead-email/wrangler.production.jsonc --outdir /tmp/hermes-lead-email-dry-run`
  A failing test fails the build and nothing is deployed. Keep this list equal to the workflow's pre-deploy steps.
- Deploy command: `npx --yes wrangler@4 deploy --config wrangler.production.jsonc --keep-vars`.
  `workers/lead-email` has no `package.json` or lockfile and the root `package.json` does not declare Wrangler, so an unpinned `npx wrangler` could pick the latest release. `wrangler@4` matches the workflow's `wranglerVersion: "4"`. An exact 4.x pin through an isolated manifest is a follow-up, not a blocker.
- Build watch paths: include `workers/lead-email/*`. Also add `scripts/*lead*`, `scripts/load-board-*`, `scripts/repair-shop-password-recovery-contract.test.mjs` and `.github/workflows/lead-email-worker-production.yml` only if the owner wants those changes to redeploy; the default is Worker source and config only.
- Non-production branch builds: OFF. Pull requests must not upload Worker versions.
- Do not change the Worker name, bindings or variables in the dashboard.

### Token that Builds creates (show to the owner before the OAuth)

Builds creates and stores its own Cloudflare API token, so nothing is pasted into GitHub or chat. The default token is broader than one Worker: account settings read, Workers Scripts / KV / R2 edit, Workers Routes edit across zones, user details and memberships read. The owner sees this permission list in the dashboard and may pick an existing, narrower token instead if one exists.

### First launch

Connecting does not by itself deploy. A build runs on the next push that touches a watch path, or from a manual retry/trigger if the dashboard offers one. Do not assume an immediate deploy after Connect.

## Order of work

1. Owner connects the Worker to the repo (OAuth confirmation only, no token).
2. Trigger one build from `main`. Do not run the GitHub Actions workflow at the same time
   (the workflow has a `concurrency` group, but only against itself).
3. Verify: Worker revision/deployment time and `main` SHA; bindings still present; `workers_dev`
   and preview URLs still off; secrets still present by name.
4. Delivery proof, kept separate: Sales carrier and dealer synthetic leads to the office
   mailbox; idempotent replay produces no second email.
5. Dispatch routing: synthetic requests are excluded from dispatch notifications by design,
   so the two synthetic leads do not prove the dispatcher receives mail. Prove the dispatch
   route in an isolated test of the routing function, and state it as such.
6. Only after steps 3–5 pass: disable the GitHub Actions deploy workflow and update
   `scripts/cloudflare-deployment-contract.test.mjs` and `CLOUDFLARE_DEPLOYMENT_OWNERSHIP.md`
   in one PR. Until then both files remain the contract.
7. Gmail read-only intake (`LOADBOARD_GMAIL_INTAKE_ENABLED`) stays `false` until a separate OAuth
   check and owner approval.

## Rollback

Disconnect the repository in Builds; redeploy the previous Worker version from the dashboard
(Deployments → Rollback). The GitHub Actions workflow is untouched.
