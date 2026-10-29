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
| Pre-deploy tests | The workflow runs 4 contract tests and a dry-run first | Builds has no equivalent gate, but the same tests run in PR CI. |

## Settings to use when connecting (owner approves the GitHub/Cloudflare OAuth in the dashboard)

Workers & Pages → `hermes-lead-email` → Settings → Builds → Connect.

- Repository: `officeus-create/Hermes`, production branch `main`.
- Root directory: `workers/lead-email`.
- Build command: empty.
- Deploy command: `npx wrangler deploy --config wrangler.production.jsonc --keep-vars`.
- Build watch paths: include `workers/lead-email/*` only.
- Non-production branch builds: OFF. Pull requests must not upload Worker versions.
- Do not change the Worker name, bindings or variables in the dashboard.

Open point to confirm in the dashboard: whether Builds picks the Wrangler version from a
`package.json` reachable from the root directory. If not, pin it in the deploy command
(`npx wrangler@4 deploy ...`) to match the workflow.

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
