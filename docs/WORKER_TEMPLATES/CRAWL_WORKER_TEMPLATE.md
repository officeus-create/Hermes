# Bounded Worker Template: Crawl Worker

**Worker Role**: Local Build Audit & Static Route Crawling  
**Parent Supervisor**: Antigravity  
**Lead Lead/Reviewer**: Codex

---

## 1. Required Input
- Path to compiled `dist/` directory.
- List of declared sitemaps (`sitemapindex.xml`).
- Audit ruleset script (e.g. `scripts/audit-seo-production.mjs`).

## 2. Allowed Project and File Scope
- Read-Only: `dist/`, `public/sitemap*.xml`.
- Read/Write: Audit script (`scripts/audit-seo-production.mjs`), generated CSV output files.
- Prohibited: Modifying production source code in `src/`, external web crawling outside `dist/`.

## 3. Expected Output Artifact
- Standardized CSV audit dataset (e.g. `SEO_TECHNICAL_CRAWL_YYYY-MM-DD.csv`).
- Summary of indexable vs non-indexable routes and severity distribution.

## 4. Allowed Commands / Tests
- `node scripts/audit-seo-production.mjs`
- Read-only inspection scripts.

## 5. Stop Condition
- Immediately stop after all static HTML files in `dist/` are parsed and CSV dataset is written.

## 6. Prohibited External Actions
- No live network HTTP requests to external domains, no Search Console API writes, no creation of new sitemaps without review.

## 7. Handoff Fields (Back to Antigravity & Codex)
```text
WORKER_ID: crawl-worker
STATUS: [SUCCESS | FAIL]
TOTAL_HTML_PARSED: <number>
INDEXABLE_CANONICAL_URLS: <number>
QUARANTINED_NOINDEX_URLS: <number>
HIGH_SEVERITY_ISSUES: <number>
CSV_OUTPUT_PATH: <path>
```
