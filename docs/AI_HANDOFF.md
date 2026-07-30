# AI Handoff Log

Shared journal between Claude Code and Codex for continuing work on the Hermes
website across sessions and across agents. Read this before starting work;
append an entry after finishing. Do not edit or remove another agent's prior
entries — append only.

## Entry format

```
## YYYY-MM-DD — <agent> — <short task title>

- Branch:
- Commit(s):
- PR:
- What was done:
- Files changed:
- Tests run (and result):
- Remaining / open items:
- Next step / what's needed from a human or the other agent:
```

## Log

## 2026-07-30 — Claude — Add CLAUDE.md and AI handoff journal

- Branch: docs/claude-agent-guidance
- Commit(s): bdcf896
- PR: https://github.com/officeus-create/Hermes/pull/2
- What was done: Created CLAUDE.md (commands, architecture, repo working rules, standing Claude/Codex agent role) and this handoff journal file, per the user's request to formalize a Claude+Codex collaboration process.
- Files changed: CLAUDE.md (new), docs/AI_HANDOFF.md (new)
- Tests run: none — documentation-only change, no app code touched.
- Remaining / open items: PR awaiting review/merge.
- Next step / what's needed from a human or Codex: review and merge the PR; future sessions (Claude or Codex) should read this file before starting new work.

## 2026-07-30 — Claude (Cowork) — SEO technical audit: CSP/GA4 bug, meta length, LCP hint

- Branch: fix/seo-meta-csp (created, files staged, not yet committed — see below)
- Commit(s): none yet
- PR: none yet
- What was done: Full technical SEO pass. Confirmed sitemap accuracy (all 46 URLs resolve, no orphans) and clean H1 structure (exactly one per page, 49/49) — no action needed there. Found and fixed: (1) `public/_headers` CSP allow-listed only `cloudflareinsights.com` in `script-src`/`connect-src`, silently blocking the GA4 tag added in PR #1 — confirmed live on production via browser JS eval that `window.gtag` was `undefined`, i.e. GA4 has been non-functional since PR #1 deployed; added `googletagmanager.com`/`google-analytics.com`. (2) 24 of 49 pages had `<title>` >60 chars or meta description >160 chars (truncation risk in search results) — added `seoTitle`/`seoDescription` optional fields to `LogisticsRecommendation` (falls back to existing on-page copy) rather than editing visible content. (3) `/demos/website-audit/` (their own internal audit tool) was the only one of three demo pages missing `<meta description>`/canonical — added, matching its siblings. (4) `/paths/*` hero images (`PathDetailPage.astro`, 150-400KB, likely LCP element) had no `fetchpriority` hint — added `fetchpriority="high"`.
- Files changed: `public/_headers`, `public/demos/website-audit/index.html`, `src/components/PathDetailPage.astro`, `src/data/localized-overviews.ts`, `src/data/logistics-path-engine.ts`, `src/pages/logistics/appleton-wi-vehicle-transport.astro`, `src/pages/paths/logistics/[...result].astro`.
- Tests run (and result): `astro check` (0 errors, 0 warnings, 1 pre-existing hint) and `astro build` (47/47 pages) passed in a separate clean clone with the identical diff applied. **`npm test` and `npm run test:e2e` were NOT run** — please run both before merging, per CLAUDE.md's rule.
- Remaining / open items: Diff is staged on branch `fix/seo-meta-csp` in the local `~/Hermes` checkout but not committed — the sandboxed bridge used to write these files could not reliably complete a `git commit` (mounted filesystem rejects the lock-file cleanup git needs; left the working tree in a clean, uncorrupted state, just uncommitted). A human (or an agent with normal shell access to `~/Hermes`) needs to run: `cd ~/Hermes && git commit -m "fix: unblock GA4 under CSP, tighten SEO meta lengths, LCP hint"` then `npm test`, `npm run test:e2e`, then push and open the PR. Also open: Cloudflare Pages cache hit rate was 10.33%/24h at time of check — not diagnosed, may be worth a separate look. `/logistics/appleton-wi-vehicle-transport/` and the equipment-carrier pages under `/paths/logistics/carriers/*` were the largest source of over-length titles — worth a copywriting pass later rather than just the mechanical trims done here.
- Next step / what's needed from a human or Codex: commit + test + push + open PR (see above); after merge and deploy, re-check `window.gtag` is defined on production to confirm the CSP fix actually restored GA4.

## 2026-07-30 — Claude (Cowork) — Protocol update: autonomy scope in CLAUDE.md

- Branch: none (docs edit written directly, see note)
- Commit(s): none yet — same uncommitted-bridge situation as the entry above; owner needs to commit this alongside (or separately from) the SEO fix commit.
- PR: none yet
- What was done: At the owner's request, added an "Autonomy scope" subsection to `CLAUDE.md` under Claude's standing role. Claude may now investigate, branch, commit, run build/tests, iterate, and open a PR without pausing to ask permission at each step. Merging to `main`, any production deploy, DNS/Cloudflare config changes, deletions, credential handling, and sending communications on the owner's behalf still require the owner's explicit confirmation each time — stated in the doc as something a future edit can't silently loosen, since it reflects how Claude operates rather than pure project policy.
- Files changed: `CLAUDE.md`
- Tests run: none — documentation-only change.
- Remaining / open items: not yet committed (see above).
- Next step / what's needed from a human or Codex: commit this alongside the SEO fix; Codex sessions should read the updated "Autonomy scope" section before assuming what does/doesn't need owner sign-off.

## 2026-07-30 — Claude (Cowork) — Fix Playwright regression from GA4 CSP restoration

- Branch: fix/seo-meta-csp
- Commit(s): 7a27107
- PR: none yet (branch has local commits ahead of `origin/fix/seo-meta-csp`, not yet pushed/opened)
- What was done: After GA4 was unblocked under CSP in 81a9595 (see the SEO audit entry above), 12 Playwright tests (6 "zero external delivery" assertions × desktop/mobile) started failing because `expect(posts).toEqual([])` / `expect(writes).toEqual([])` in `tests/site.spec.ts` now also caught GA4's own outbound requests to `google-analytics.com`, `googletagmanager.com`, and `google.com/g/collect`. Added a shared `isApprovedAnalyticsRequest()` helper (matches only those three known GA4 hosts, `/g/collect` path-checked) and used it to filter the `posts`/`writes` request trackers in all 6 affected tests, so genuine form submissions, CRM writes, or any other outbound request still fail the check — GA4 itself was not disabled or weakened.
- Files changed: `tests/site.spec.ts`
- Tests run (and result): `npm run build` (47 pages, 0 diagnostics) passed; `npm test` (validate-build + all 6 unit scripts) passed; `npm run test:e2e` passed — 118 passed, 2 expected skips (mobile-only/desktop-only tests), 0 failures.
- Remaining / open items: `docs/screenshots/intake02-marketing-desktop.png` and `package-lock.json` show as locally modified (screenshot regenerated as a side effect of running the marketing e2e test; package-lock.json was already modified before this session started) — left uncommitted/untouched since they're outside this task's scope. Branch not yet pushed; no PR opened.
- Next step / what's needed from a human or Codex: push `fix/seo-meta-csp` and open a PR (or fold into the existing SEO-fix PR work) for owner review; owner should confirm whether the pre-existing `package-lock.json`/screenshot diffs are wanted before anyone commits those separately.
