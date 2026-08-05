# SEO audit reconciliation — 2026-08-05

## Purpose

Reconcile the supplied third-party SEO audit with current `main` before changing production.

## Already resolved or inaccurate in the supplied audit

- The website is built with Astro static generation, not a client-only React/Vue/Angular SPA.
- Canonical URLs, meta descriptions, schema injection, hreflang alternates, and social metadata are present in the shared layout.
- Seven controlled sitemap files are declared in `robots.txt`.
- Sixteen Wisconsin local vehicle-transport URLs are present in the local sitemap.
- Organization, WebSite, Article, BreadcrumbList, FAQPage, Service, and other route-specific structured data are already used where supported.
- Social links, direct contact routes, click-to-call links on logistics routes, breadcrumbs, related-resource modules, case pages, and an About page already exist.
- Public forms use direction-specific qualification fields and protected delivery behavior.

## Real remaining opportunities, from simple to complex

### Small repository improvements

1. Improve the homepage title so it names U.S. Logistics and AI systems while preserving the four-direction brand architecture.
2. Add the public U.S. Logistics phone to the global footer with an explicit department label.
3. Replace realistic MC/USDOT values in public demos with unmistakably synthetic placeholders and enforce this with a regression test.
4. Review selected money-page H1 and introductory copy for search intent without forcing keyword stuffing or arbitrary word counts.
5. Add a bounded mobile logistics action bar only where a staffed call route and relevant direct intake exist.

### Content and trust

6. Build an editorial insights hub from approved resources rather than publishing thin posts on a fixed quota.
7. Add named authors/reviewers only after owner approval and verifiable responsibility.
8. Publish permissioned, sanitized carrier-side and customer/dealer-side cases; do not convert internal records into public proof without consent.
9. Add legitimate testimonials, independent mentions, and partner references only with source and publication rights.

### Authenticated platform work

10. Verify Search Console, Bing, GA4 event receipt, sitemap discovery, index state, and field Core Web Vitals.
11. Reconcile approved NAP and Google Business Profile only if the business is eligible and the address/service-area representation is accurate.
12. Correct external Staff.am, Work.ua, directory, and branded entity profiles from an owner-approved canonical facts sheet.

### Long-term authority

13. Earn relevant links through useful logistics resources, industry relationships, associations, local organizations, and legitimate editorial placements.
14. Build branded search/entity consistency so Hermes Logistics US is distinguished from unrelated Hermes companies.
15. Maintain a measured content program based on indexed demand, qualified inquiries, and evidence quality rather than page volume alone.

## Explicit non-actions

- Do not migrate the current Astro site to Next.js/Nuxt solely because the audit incorrectly labelled it an SPA.
- Do not add `noscript` duplicate content to already statically generated pages.
- Do not add fake offices, USDOT/MC authority, insurance claims, customer logos, reviews, team members, or case results.
- Do not create bulk city pages before authenticated indexing and conversion evidence is reviewed.
- Do not add live chat unless a real team owns response coverage and privacy handling.
- Do not present a rate calculator as a quote or capacity promise; route estimates must remain bounded and clearly qualified.
