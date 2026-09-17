# GSC indexing triage — 2026-09-11

Scope: classify Search Console indexing exclusions before any request-indexing or Validate Fix action.

## Current live snapshot supplied by the owner

- Search Console report updated: 2026-09-03.
- Indexed: 110.
- Not indexed: 194.
- Expected exclusions: 113 total — 53 canonical duplicates, 49 noindex, 6 404, 3 redirects, 2 blocked/403.
- Review queue: 81 total — 61 Discovered, currently not indexed; 20 Crawled, currently not indexed.

These totals must not be mixed with the older August capture, which represented a smaller site and did not include URL-level export evidence.

## Decision rule

Do not bulk-submit the 81 URLs. First classify each URL against current production intent:

1. `EXPECTED_EXCLUSION_*` — tracking/query variants, private Hermes Connect routes, demos, or canonical variants.
2. `REDIRECT_OR_REMOVE_LEGACY` — retired route families that should not remain independent index owners.
3. `CURRENT_CANONICAL_REVIEW` — exact current sitemap owners; these qualify for technical/live review, not automatic indexing.
4. `MANUAL_REVIEW` — URLs not explained safely by current sitemap or exclusion rules.
## Current repository truth already verified

- `/es/` is a current public sitemap owner and uses the default index/follow + self-canonical layout contract.
- `public/sitemap-london.xml` currently contains 52 London routes across EN plus RU/UA public owners.
- Current sitemap inventory contains 204 canonical URL owners across the declared sitemap set.
- `/uk/london/` is a retired route family and must not be treated as a current London owner.
- Hermes Connect private/dashboard/auth/demo surfaces are not candidates for forced indexing.

## Read-only classifier

Run:

```bash
node scripts/gsc-indexing-triage.mjs /path/to/gsc-export.csv
```

For structured output:

```bash
node scripts/gsc-indexing-triage.mjs /path/to/gsc-export.csv --json
```

The classifier performs no Search Console writes and sends no URL to Google. It only compares the export against the repository's current sitemap ownership and conservative exclusion rules.

After classification, only `CURRENT_CANONICAL_REVIEW` URLs move to live HTTP/canonical/noindex/internal-link verification. Request indexing remains a separate, evidence-gated action.

## Live follow-up — 2026-09-17

Current authenticated Search Console domain-property readback (report last updated 2026-09-13):

- Indexed: **121**.
- Not indexed: **227**.
- `Discovered - currently not indexed`: **98**.
- `Crawled - currently not indexed`: **1**.
- Alternate page with proper canonical: **61** — expected canonical/query variants; current samples include `?service=`, `?lang=` and Academy UTM/application variants.
- Excluded by `noindex`: **55** — expected until a current public owner is proven otherwise.
- Redirected: **4**.
- Blocked/403: **1**.
- Not found/404: **7**.

The growth of the discovered queue is not, by itself, evidence of a sitewide indexing regression. Current main exposes **260** canonical sitemap owners versus **204** at the 2026-09-11 triage snapshot. **67** sitemap URLs carry `lastmod` dates from 2026-09-11 through 2026-09-16, including new Load Board families, Academy country/localized pages, insights and localized direction owners.

Authenticated `Discovered` examples start with all nine current Hermes Catalog business/location owners plus `/es/`. Those nine Catalog URLs are current sitemap owners and production readback returns `200`, self-canonical and `index,follow`; they must not be rewritten or bulk-resubmitted merely because crawling is pending. Catalog remains under its active owner lane/write lock.

Historical Cold Flare indexing tail reconciled against current production:

- `/logistics/resources/broker-setup-packet-checklist/` — current sitemap owner; `200`, self-canonical, `index,follow`.
- `/logistics/resources/new-authority-car-hauler-readiness-checklist/` — current sitemap owner; `200`, self-canonical, `index,follow`.
- `/es/` — current sitemap owner; `200`, self-canonical, `index,follow`.
- `/resources/rpm-calculator/`, `/tools/load-analyzer/`, `/ai-command-center/`, `/unified-inbox/` — no longer current sitemap owners and currently return the deliberate noindex 404 surface; do not resurrect them from historical GSC state alone.
- `/academy/` — stale former hub returning 404 while `/paths/academy/` is the live indexable Academy direction. Current fix: permanent redirect `/academy/ -> /paths/academy/` plus classifier regression coverage.

Current 404 examples are `/academy/`, `/cdn-cgi/l/email-protection`, `/api/auth/forgot-password`, `/month`, `/месяц`, `/dashboard/`, plus one malformed replacement-character path. Only `/academy/` has a proven current public successor. The remaining samples are private/API/malformed/obsolete crawl artifacts and are not candidates for new indexable pages without separate product evidence.

Do not measure success by forcing `227` toward zero. Success is: intended public canonical owners are crawlable/indexable and internally connected; intended private/variant/legacy URLs remain excluded; stale public owners redirect to the current canonical destination; GSC indexed coverage increases as the new 260-owner sitemap is processed.

### Current technical closure receipts

- Production sweep: **260/260 HTML sitemap owners** return `200`, stay on the requested canonical URL, expose the matching self-canonical, and do not carry `noindex`.
- Built-site link graph: **0 orphan sitemap owners**. The nine Catalog state/city/profile owners visible in the current GSC `Discovered` sample are linked through the Catalog hub and state/city hierarchy; no Catalog implementation change is justified from the indexing queue alone.
- Sitemap discovery: `robots.txt` points to `sitemapindex.xml`; the production sitemap index references **11/11 controlled children**, and every child returns `200` with XML content.
- Parent/child sitemap freshness drift was found on SEO-owned static children and corrected: `sitemap.xml` index lastmod → `2026-09-16`, `sitemap-services.xml` → `2026-09-15`, `sitemap-academy.xml` → `2026-09-16`. The regression contract now asserts that an SEO-owned parent sitemap-index date cannot lag the newest dated URL inside its child sitemap.
- `sitemap-business-directory.xml` also has a one-day parent/child timestamp drift (`2026-09-09` parent vs `2026-09-10` newest child). It remains a bounded Catalog-owner handoff because Catalog implementation is write-locked to its active owner lane; this SEO fix does not cross that ownership boundary.
- The single current `Crawled - currently not indexed` example is `/business-growth/`. It is **not** a sitemap owner; production returns `200`, self-canonical and `noindex,follow`. Its GSC sample shows an older Google crawl from August. This is an intentional non-search acquisition/form route waiting for report recrawl/reclassification, not a candidate for Request Indexing.
- The single `Blocked due to access forbidden (403)` row is not evidence of a current public-page block. A production sweep across **340 current built HTML routes using a Googlebot user-agent** returned **0 HTTP 403** and no other fetch failures. Together with the separate 260/260 sitemap-owner sweep, this rules out a current sitewide Cloudflare/WAF block on public HTML. The exact historical/non-owner example can be read once from GSC when browser access is restored, but it does not justify changing WAF/bot policy or bulk-validating anything now.
