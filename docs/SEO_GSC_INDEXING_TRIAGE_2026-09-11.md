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
