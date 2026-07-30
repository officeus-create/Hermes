# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A production Astro static site for `hermeslogisticsus.com` (Hermes — Logistics, Marketing, Academy, and IT Development divisions), deployed to Cloudflare Pages. `output: "static"`; the only server-side code is a single Cloudflare Pages Function. Node `>=20 <25` (see `.nvmrc`, pinned to 22).

## Commands

```bash
npm install
npm run dev          # astro dev
npm run build        # astro check && astro build (must be 0 diagnostics)
npm run preview      # astro preview — required by playwright's webServer
npm test             # static validation + all unit test scripts (see below)
npm run test:e2e     # playwright, desktop + mobile projects
npm run sync:product-demos   # pulls demo prototypes from sibling repos on disk into public/demos (local machine only, not part of CI)
```

`npm test` is a single chained command, not a test runner:

```
node scripts/validate-build.mjs                                  # requires a prior `npm run build` (reads dist/)
node --experimental-strip-types scripts/path-engine.test.mjs
node --experimental-strip-types scripts/p0-data-layer.test.mjs
node --experimental-strip-types scripts/contact-handoff.test.mjs
node --experimental-strip-types scripts/load-board.test.mjs
node --experimental-strip-types scripts/load-operations.test.mjs
node --experimental-strip-types scripts/sales-lead-receiver.test.mjs
```

To run a single unit test file, run its `node --experimental-strip-types scripts/<name>.test.mjs` line directly — they are plain Node scripts (assertions + process exit code), not a test-framework runner, so there is no `-t`/`--grep` filter. To run `validate-build.mjs` alone you must `npm run build` first since it validates the `dist/` output.

For a single Playwright test: `npx playwright test tests/site.spec.ts -g "<test name>"` (or `--project=desktop` / `--project=mobile`).

CI (`.github/workflows/ci.yml`) runs, in order: `npm ci` → `npm run build` → `npm test` → install chromium → `npm run test:e2e`. Any local verification should follow the same order since `test` depends on `build`'s output.

## Architecture

### Content is data-driven, not hardcoded in components

`src/data/site.ts` is the single source of truth for brand claims, contact channels (phone/email/Telegram), and per-direction `PathDetail` content (offerings, process, FAQ, direct contacts). Components like `PathDetailPage.astro`, `ContactCTA.astro`, and `SiteFooter.astro` render from this data rather than owning copy directly. When changing a business claim, contact address, or direction's content, edit `src/data/site.ts` (or the locale/audience files below), not the `.astro` templates.

Related data modules:
- `src/data/logistics-path-engine.ts` — a decision-tree engine (`PathNode`/`PathOption`/`LogisticsRecommendation`) powering the Logistics "find your path" flow at `src/pages/paths/logistics/find-your-path.astro` and `[...result].astro`.
- `src/data/logistics-audiences.ts` — the audience router at `src/pages/logistics/[audience].astro` (shipper/dealer, broker, carrier, agency, careers, students).
- `src/data/localized-overviews.ts` + `src/data/locales.ts` — drive the `es/fr/it/ru/ua` locale homepages under `src/pages/{locale}/index.astro`. These are email-coordination-only overview pages, not full translations of every route.

### Preview-first contact/lead architecture (do not weaken)

Every form on the site (`ContactCTA.astro`, Load Board, logistics apply/intake) defaults to **preview mode**: no network request, no storage, no automatic delivery. A visitor gets a generated email/summary they can copy or open in their own mail client. Live delivery is opt-in per environment via `PUBLIC_CONTACT_MODE=live` + `PUBLIC_CONTACT_ENDPOINT` (see `.env.example`) and is not active in this repo's checked-in config. This is a deliberate, audited product contract — see `docs/DESIGN_INTEGRATION_CONTRACT.md` — not an oversight to "fix" by wiring up live submission.

Shared logic for this lives in `src/lib/`:
- `contact.ts` — payload/summary building for the general contact form, `contactHandoffRoutes` derived from `site.paths`.
- `path-lead.ts` — lead payload shaping for the path-engine flow.
- `load-board.ts` / `load-operations.ts` / `lane-intelligence.ts` / `carrier-enrichment.ts` — Car Hauling Load Board business logic: demo load matching, rate/deadhead/RPM metrics from synthetic offer and shipment-history data (see `fixtures/load-operations/*.csv`, consumed via `load-operations.test.mjs`), and lane scoring.

### The one server endpoint

`functions/api/logistics-lead.ts` is a Cloudflare Pages Function — the sole piece of server code, and the only path by which `PUBLIC_CONTACT_MODE=live` could ever actually send email. It enforces same-origin (`ALLOWED_ORIGIN`), a fixed sales destination/subject built server-side (never trusts a client-supplied subject), request-ID idempotency and per-IP rate limiting via a KV namespace, and body-size/content-type limits. `wrangler.toml.example` is a template for the real (untracked) `wrangler.toml`; the KV namespace, verified sender, and Cloudflare Email Sending must all be provisioned before flipping this live. Covered by `scripts/sales-lead-receiver.test.mjs`.

### Post-build static validation gate

`scripts/validate-build.mjs` runs after `astro build` and greps the generated `dist/` HTML for required strings per route (see the `routes` array), confirms the HSTS header in `public/_headers`, and enforces the public-information policy by blocking known internal project/AI-team terms from ever reaching generated HTML (`docs/PUBLIC_INFORMATION_POLICY.md`). If you introduce a new internal-only name (prototype codename, internal tool, routing/queue terminology), add it to this script's block list. If you add or rename a route/page, update its `required` strings here too — this is what CI treats as the contract for "the page renders the right content," not a snapshot test.

### Testing layers

1. `scripts/*.test.mjs` — plain Node assertion scripts (no framework) covering the path engine, contact handoff, load board, load operations, and the lead receiver function's pure logic.
2. `scripts/validate-build.mjs` — static output validation (see above), requires a fresh build.
3. `tests/site.spec.ts` (Playwright, `playwright.config.ts`) — browser-level behavior across `desktop` and `mobile` projects, driven against `npm run preview` on port 4321. One mobile-only menu test is expected to skip on desktop.

## Working rules specific to this repo

These come from `docs/DESIGN_INTEGRATION_CONTRACT.md`, `docs/PUBLIC_INFORMATION_POLICY.md`, and `.cursor/rules/00-hermes-core.mdc`, and apply regardless of which agent is editing:

- Preserve the frozen functional contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md`: the five routes plus `/privacy/` and `/404.html`, the `#main-content`/`#paths`/`#journey`/`#about`/`#contact` anchor targets, contact field names (`name`, `email`, `path`, `message`, `website`, `consent`) and `data-contact-*` hooks, preview-mode-as-default, and per-direction contact-channel rules (Logistics may show phone+email; Marketing/Academy/IT Development are email-only).
- Never add secrets, real credentials, private/internal contacts, internal revenue targets, or unsupported public claims. Business claims carry a `ClaimStatus` (`VERIFIED_PUBLIC`, `VERIFIED_INTERNAL`, `OWNER_APPROVED_PENDING_SOURCE`, `PLACEHOLDER_DO_NOT_PUBLISH`) in `src/data/site.ts` — don't publish anything not `VERIFIED_PUBLIC`/approved.
- Don't deploy, change DNS, or push to `main` as a side effect of a task — treat those as separate, explicitly-requested actions.
- Run `npm run build`, `npm test`, and `npm run test:e2e` before reporting any change complete.
- `AGENTS.md` documents a project boundary path (`/Users/progressopro/Documents/hermeslogisticus.com`) from an earlier repo location that no longer matches this checkout (`/Users/progressopro/Hermes`) — treat the *rules* in that file as current, not the literal path.

## Claude's standing role: technical/SEO agent alongside Codex

Claude Code acts as an ongoing technical and SEO agent for Hermes in this repo, working alongside Codex. When Codex is unavailable, out of quota, or has handed off a task, continue from the project's current state rather than redoing work already done.

Environment available for this role: macOS (this Mac), this repo (`~/Hermes`, GitHub `officeus-create/Hermes`), the live site `https://hermeslogisticsus.com/`, Google Workspace (Drive, Analytics, Search Console), Cloudflare, Vercel, and Claude in Chrome for browser-based checks — used once the relevant official connectors are configured.

Before starting any task in this role:
- Check `git status`, recent commit history, and open PRs for current state.
- Read `docs/AI_HANDOFF.md` — the shared handoff journal between Claude and Codex — before starting work, and update it after finishing. Append; never overwrite another agent's prior entries. Each entry should record: date, task, branch, commit, PR, test results, and the next step / what's needed from a human or from Codex.

Access and safety rules for this role:
- Don't work directly on `main` — create a branch and open a Pull Request; run build and tests before finishing.
- For deletions (files, projects, accounts, DNS records, domains, databases) or changes to billing, subscriptions, users, or permissions: present a plan first and get explicit confirmation before acting.
- Don't send email, Telegram messages, or publish anything without separate, explicit confirmation each time. Don't read through inboxes indiscriminately.
- Don't use personal accounts or personal data unless a task explicitly calls for it.
- Never store passwords, cookies, tokens, or API keys in GitHub or in `CLAUDE.md` — use separate scoped tokens/service accounts kept outside the repo.
- Don't bypass macOS permission prompts, and don't run with permission-bypass as a standing mode.
