# Cloudflare Readiness

## Product decision

Keep the current Hermes website on its existing Cloudflare Pages project
`hermes`. The site is a static Astro build with one Pages Function, so a
production migration to Workers would add risk without solving a current
problem. Use Workers for new application backends such as Hermes Connect and
the Hermes CRM, not for this website release.

## Completed locally

- Wrangler 4 is installed as a project development dependency.
- `wrangler.jsonc` is the local configuration source.
- Astro produces 58 static routes and 61 final HTML pages with no type
  errors, warnings, or hints.
- The Pages Function compiles successfully with Wrangler.
- Static, Path Engine, logistics-location, carrier-enrichment, CRM payload,
  lane-intelligence, contact-handoff, Load Board, and lead-receiver checks
  pass with 0 broken internal links.
- The full Playwright regression passes on desktop and mobile:
  112 passed, 2 intentionally skipped, 0 failed.
- Cloudflare binding types are generated without overriding Astro browser
  runtime types.
- Secrets, local Wrangler state, build output, and environment files are
  excluded from version control.
- Live lead delivery remains disabled until its external dependencies are
  verified.

## Authorization status

Wrangler 4.115.0 is installed, but the Cloudflare account has not completed
OAuth in this workspace. `wrangler whoami` reports that it is not
authenticated. No account resource was read or changed, and no deployment was
created.

Use only these initial OAuth scopes for this website:

- `account:read`
- `user:read`
- `pages:write`
- `zone:read`
- `workers_kv:write`
- `email_sending:write`

Do not grant D1, AI, DNS edit, Workers Scripts, Queues, or other write scopes
until a concrete feature requires them.

## Safe continuation after OAuth

Run these from the repository root:

```bash
npm run cf:whoami
npx wrangler pages project list
npx wrangler pages deployment list --project-name hermes
npm run cf:types
npm run cf:validate
npm test
```

Then create a staging deployment:

```bash
npm run cf:deploy:staging
```

Verify the staging URL, the 58 generated routes, 61-page HTML inventory,
response headers, redirects, the 404 page, market-page canonical/schema
metadata, and the unconfigured lead endpoint before any production deployment.
Use `docs/PUBLISHING_RUNBOOK.md` for the exact staging, production, and rollback
gates.

## Lead delivery activation gate

Do not add `LEAD_LIMITS` or `LEAD_EMAIL` to `wrangler.jsonc` until all of the
following are true:

1. `hermeslogisticsus.com` is verified for Cloudflare Email Sending.
2. `website@hermeslogisticsus.com` is approved as the sender.
3. `officeus@hermeslogisticsus.com` is approved as the destination.
4. A restricted KV namespace is created for deduplication and rate limiting.
5. The staging endpoint passes a real delivery test.
6. `PUBLIC_CONTACT_MODE=live` and the approved same-origin endpoint are reviewed.

Never commit a Cloudflare API token, password, OAuth credential, `.dev.vars`,
or `.env` file.
