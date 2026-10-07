# Search indexing and mobile performance release — 2026-10-07

## Owner-observed baseline

Google Search Console domain property `hermeslogisticsus.com` was read through the authenticated owner account on 2026-10-07. Its Page indexing report was last updated on 2026-10-04 and showed 140 indexed URLs and 301 excluded URLs across seven reason groups. Core Web Vitals had insufficient Chrome field data for both mobile and desktop, so current performance evidence must use repeatable Lighthouse lab measurements until CrUX has enough real visits.

The 301 exclusions are not 301 broken public pages. The report contains expected duplicate, redirect and private-route exclusions together with 172 pages Google has discovered but has not selected for indexing yet.

## Fresh GSC evidence and classification

The complete 172-URL `Discovered — currently not indexed` owner export is preserved in `data/seo/gsc-discovered-not-indexed-2026-10-07.json`. A bounded live audit of every exported URL is preserved in `data/seo/gsc-discovered-live-audit-2026-10-07.json`.

- 172/172 returned HTTP 200.
- No URL unexpectedly redirected.
- No canonical owner mismatch was found.
- Every page had exactly one H1.
- 132 URLs are current sitemap owners with `index,follow`.
- 39 URLs are intentionally excluded with `noindex`.
- One indexable runtime Catalog profile requires runtime sitemap monitoring rather than a static-file edit.

The triage classifier had one real defect: the public Repair Shop plan/pricing owner was incorrectly grouped with private dashboard routes. The classifier and its regression test now recognize `/services/hermes-connect/repair-shops/plan/` as a public current owner.

The smaller GSC groups were also checked in the authenticated UI and reconciled in `data/seo/gsc-small-exclusions-2026-10-07.json`:

- The historical `http://www` 403 now resolves to the HTTPS non-www canonical and HTTP 200. GSC validation started 2026-10-07.
- The single crawled-not-indexed URL is `/business-growth/`, which intentionally returns `noindex,follow` and routes users to current growth owners. GSC validation started 2026-10-07.
- Of seven historical 404 examples, `/academy/` now redirects, three malformed legacy paths return 410 with `noindex,nofollow`, the password endpoint returns the correct 405 with `noindex,nofollow`, and the Cloudflare email-protection path is blocked from crawling. This release also retires the remaining malformed U+FFFC root URL with 410 and `noindex,nofollow`.
- The 61 canonical variants are query-string context URLs with a proper clean canonical. Their exclusion is correct and prevents duplicate indexing.

## Crawl and internal-link changes

The post-build link graph is preserved in `data/seo/gsc-discovered-link-graph-2026-10-07.json`. All 25 published car-hauler market owners now show nearby published markets when a registry match exists. This creates useful reciprocal crawl paths and gives carriers a real way to compare adjacent search areas. The market owners now receive between 1 and 11 unique internal source-page links; isolated markets without a published nearby counterpart remain linked from the canonical market hub.

The change does not create new city pages or claim local Hermes offices. It strengthens the existing, bounded 25-market research library.

## Mobile performance change

The exact production baseline workflow on main completed before the release with median mobile Performance 74, FCP 2.98 seconds, LCP 5.11 seconds, TBT 9 ms, CLS 0.0036 and SEO 100. Desktop Performance was 97. The mobile LCP was the first car-hauler scene; the page also downloaded the next full freight scene before it was visible.

This release:

- adds 768px responsive variants for all six changing logistics scenes;
- reduces the initial car-hauler candidate from 196,494 bytes to 94,842 bytes on the tested mobile viewport;
- stops preloading the next approximately 198 KB freight scene before rotation;
- makes non-LCP portal artwork lazy;
- adds 160px and 256px responsive decorative-leaf variants;
- serializes production Lighthouse jobs and retries one transient Chrome launch failure.

A local mobile Lighthouse run of the release build produced Performance 85, Accessibility 100, Best Practices 96, SEO 100, FCP 2.42 seconds, LCP 3.93 seconds, TBT 0 ms, CLS 0.0013 and total transfer 563,963 bytes. This local run is directional evidence and is not directly comparable to the GitHub-hosted production baseline. The production workflow must be rerun after deployment for an exact-host comparison.

## Bing owner evidence

The latest owner export dated 2026-10-05 remains the authoritative Bing snapshot in `data/seo/bing-owner-snapshot-2026-10-05.json`: 5 clicks and 107 impressions for the selected range; the sitemap was successful with 302 discovered URLs. Bing's aggregate scan reported 2 errors, 22 warnings and 2 notices, but the export did not contain affected URLs. The reported missing-meta, missing-alt, long-title and multiple-H1 patterns did not reproduce in the current production audit, so no unrelated pages were mass-edited from aggregate counts alone.

IndexNow remains controlled by the canonical repository submitter. Cloudflare Crawler Hints was disabled in the authenticated owner account on 2026-10-07 and immediately read back as off. The receipt is preserved in `data/seo/indexnow-crawler-hints-setting-2026-10-07.json`. This prevents broad duplicate submission noise from competing with the reviewed HTML-only release feed.

## Verification

- `npm run build`: 399 pages, zero errors.
- Full repository `npm test`: passed.
- Media provenance: 62/62 public assets registered and hash-verified.
- Local mobile Lighthouse: 85 / 100 / 96 / 100.
- GSC live audit: 172/172 HTTP 200 with no canonical mismatch.

Indexing and ranking remain search-engine decisions. The release removes verified technical causes, improves crawl paths and reduces initial mobile transfer; traffic impact must be measured after recrawl rather than promised in advance.
