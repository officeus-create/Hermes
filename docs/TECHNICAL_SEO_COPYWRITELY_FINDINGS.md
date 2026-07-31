# Technical SEO follow-up: Copywritely homepage audit

Date: 2026-07-30
Source: user-provided Copywritely audit for `https://hermeslogisticsus.com/`

## Findings confirmed from repository code

- Canonical metadata is generated in `src/layouts/BaseLayout.astro`.
- OpenGraph and Twitter Card metadata are already present in repository code; Copywritely's “OpenGraph not found” result is likely a crawler/rendering false negative and should be verified against rendered production HTML.
- Language alternates include English, Ukrainian (`/ua/`), Russian, Spanish, Italian, French, and `x-default`.
- The repository uses locale code `uk` internally while the public Ukrainian route is `/ua/`; this is valid. Public links must not point to `/uk/`.
- The homepage hero image is requested with explicit dimensions, `fetchpriority="high"`, and async decoding.

## Safe implementation changes in this branch

- Explicitly mark the hero as eager-loaded and declare its viewport sizing.
- Emit OpenGraph alternate locale tags for supported localized homepages.
- Preserve existing canonical, hreflang, favicon, robots, schema, GA4, and social metadata.

## Infrastructure checks still required outside repository code

- `www` to apex redirect behavior.
- `/index.html`, `/index.php`, and localized index-file behavior.
- Actual production response headers and redirect chain.
- Image transcoding or responsive derivative generation, because no alternate image assets were confirmed during this connector-only pass.

## Non-issues from the audit

- H1 does not need to exactly duplicate the title tag.
- Missing image `title` attributes are not a priority when meaningful `alt` text exists.
- Instagram returning a 302 is expected third-party behavior.
- URL case sensitivity is not a defect unless duplicate case variants return indexable 200 responses.
