# Hermes website QA — evidence-first OSS reuse decisions
Date: 2026-10-14 · Owner: Technology × Hermes Design × Marketing · Status: BOUNDED REVIEW / PR #1888 · **No new vendor installed**

## Real failure observed (not a speculative full-site audit)

Original GitHub `open-source-web-quality` workflow allowed both Pa11y and ZAP exit failures to be silently nonblocking (`continue-on-error: true`).

Downloaded actual artifact `11908210608` from [workflow 38590653110](https://github.com/officeus-create/Hermes/actions/runs/38590653110), exact draft PR #1886 head `967e1e95746e0cf3bcd4d910f1942b090eeb54ad`:
- Pa11y/axe WCAG2AA checks returned **0/12 public routes free from errors**, total **1,052 finding instances**. This is not a unique-root-defect count or proof of every production route being broken.
- Parsed categories: **979 color-contrast finding instances**, **70 disallowed ARIA attribute instances**, **2 invalid ARIA-value instances**, **1 nested interactive-control instance**.
- Worst sample URLs by count: /businesses/ 363, /services/hermes-connect/repair-shops/ 117, /load-board/ 116.
- **Main-equivalent budget tightened after first instrumented run:** [workflow 38594402143](https://github.com/officeus-create/Hermes/actions/runs/38594402143), archived artifact 11909059108, includes `pa11y.txt` and three nonempty ZAP reports. It observed 1,043 occurrences from the same 12 URLs (home 61, /ru/ 19); this PR's web source remains identical to base main SHA 63c980c..., so the anti-regression caps were reduced to those values. The 9-instance delta vs PR #1886 is a **build/source difference, not remediation or user impact**.
- ZAP reports now persisted in this QA-only branch. Findings include locally missing security headers, medium-rated source-code-disclosure heuristics, and informational alerts. **Do not promote preview scanner findings to live production risks without inspecting exact matching public response headers/content and app ownership.** Current actionable defect was lost evidence and a false-green label; report persistence is now verified in the new artifact.
- Original ZAP run logged `FAIL-NEW 0`, `WARN-NEW 13`, `PASS 54`, then `AccessDeniedException /zap/wrk/zap.html` while generating reports. Only `pa11y.txt` was archived: security evidence was missing **despite overall workflow SUCCESS**. Warning counts are not a confirmed exploitable security defect.

## Repair in this PR (source only until exact-head CI)
- Keep Pa11y 4.1.1/axe, existing local Astro preview and source-controlled 12-route config.
- New `check-pa11y-nonregression.mjs` plus tests and dated JSON budget. Only a **temporary ceiling** derived from the actual PR preview, not a clean WCAG baseline or a substitute for independent main comparison. Fail on increased per-route counts, missing/duplicated/extra results, unreadable report. Always display accumulated defects.
- ZAP receives its own write-permitted ephemeral `artifacts/web-quality/zap` subfolder. No whole-repository permission changes. Require non-empty persisted `zap.json`, `zap.md`, `zap.html`. Fail if results are missing, instead of falsely passing security verification. Initial scan remains loopback-only and `-I` continues treating warnings as non-fatal.
- Raw artifact upload is retained before Pa11y budget enforcement, so CI failure still leaves audit evidence.
- **Do not claim accessibility PASS from overall workflow success**; debt limit PASS means merely no growth over the recorded cap, with a separate count of open violations.

## Evaluated technologies (verified public upstream on 2026-10-14)

| Candidate | Existing owner/reuse test | Decision |
| --- | --- | --- |
| [Pa11y CI](https://github.com/pa11y/pa11y-ci), [Pa11y](https://github.com/pa11y/pa11y) (LGPL-3.0-only) | Already run as Pa11y 4.1.1 with axe via `.pa11yci.cjs`; missing gate, **not** missing software | **REUSE + HARDEN**. Fix evidence and thresholds; triage contrast and invalid ARIA in shared components first |
| [Playwright](https://playwright.dev/docs/test-snapshots) | Existing browser test shards and 170 screenshot observations; a six-home-locale × five-width comparison runs in #1886 | **REUSE**. Introduce approved screenshot baselines only after design signoff; never auto-approve visual drift |
| [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | Existing `production-lighthouse-baseline.yml`, baseline docs and summary contracts | **REUSE CURRENT**. On-demand, same URL/device/config; field CWV and conversion are separate measurements |
| [Unlighthouse](https://github.com/harlan-zw/unlighthouse), MIT, Node 22.18+ | Can sample many public URLs but would duplicate broad SEO testing and consume additional Chromium/CI budget; Hermes has known specific homepage and indexed money-page work | **RESEARCH_ON_DEMAND**, not scheduled. Require owned and capped page sample, explicit source and no live form execution; no install now |
| [lychee](https://github.com/lycheeverse/lychee), Apache-2.0/MIT | Internal links already audited by Hermes canonical internal-link scripts; external proof resources may later warrant occasional links-only sampling | **HOLD** until a verified set of broken external canonical sources emerges. Avoid blocking on rate-limited third-party hosts or creating noise |
| OWASP [ZAP](https://www.zaproxy.org/) | Already configured on local preview; evidence lost due filesystem permission error | **REUSE + REPAIR OUTPUT**. Security review of 13 WARN is separate from actual FAIL severity and report generation |

## Incremental repair queue

1. **P0 CI credibility:** finish exact-head PR #1888 smoke evidence, prove failure when simulated accessibility count grows or ZAP reports cannot be written.
2. **P1 high-ROI CSS/accessibility fixes** (separate owner PR): cluster repeated color-contrast violations in shared header, hero, consent, and Catalog. Confirm visual/design approval and axe readback with net reductions, without hiding meaningful text or disabling consent.
3. **P1 ARIA correctness:** identify 70 disallowed attributes by component and remove invalid attributes only where semantic equivalent exists; preserve keyboard and screen-reader behavior, add small focused tests.
4. **P1 underlying ZAP warnings** after a valid archived JSON exists; classify without promising zero warnings, distinguish local header-only findings from customer PII exposure.
5. **P2 beyond-current tools:** limited Unlighthouse/lychee trial only when a distinct uncovered business-critical failure can be reproduced, with open-source license, scoped source URLs, exact measured gain and opt-out/rollback; no weekly entire-site crawler.

## Hard boundaries

This is a **preview/CI** artifact and a draft non-regression proposal. It changes no public copy, canonicals, hreflang, indexed pages, D1/Cloudflare production, customer identity, paid tooling, email or social messaging. Do not alter other chat's MCP/HAE/identity work. The next proof must be green *exact PR head* CI and independent review; no claims of zero violations, zero vulnerabilities, SEO uplift or revenue.


## 2026-10-16 current-main replay note

PR #1902 (shared contrast/map semantics repair) is now **MERGED** into current protected `main`. That changes the relevant comparison base for #1888: the previous 2026-10-15 quality failure on #1888 head `3c02e32b...` was measured before this current-main repair could be incorporated into a fresh pull-request merge test.

Do **not** raise Pa11y ceilings to absorb that failure. Trigger a fresh exact-head #1888 pull-request run against current `main`, then classify only the remaining delta. If the Academy/RU contrast counts fall back under the existing cap, keep the lower cap. If any count still exceeds it, repair the demonstrated shared selector/component instead of weakening the gate.

This replay note changes QA evidence only; no production CSS, public content, Cloudflare setting, analytics, form transport, email, social or dispatcher workflow is modified here.
