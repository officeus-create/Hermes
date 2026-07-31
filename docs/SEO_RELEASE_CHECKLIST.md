# Hermes SEO Release Checklist

Use this checklist for every new indexable page, template change, metadata update, localization release, or structured-data change.

## 1. Business evidence and intent

- [ ] Page has one primary audience and one primary search intent.
- [ ] The service is actually supported by Hermes or clearly labeled as coordination, planning, training, preview, or development.
- [ ] Every number, timeframe, coverage claim, testimonial, result, certification, partnership, fleet claim, and operational claim has an approved evidence source.
- [ ] No guarantee is made for revenue, employment, rankings, loads, capacity, pickup, delivery, transit time, customer acquisition, or safety outcomes.
- [ ] The page states where the carrier or customer retains final operational control when relevant.
- [ ] Private shipment details, customer names, phones, exact addresses, VINs, documents, and API credentials are excluded from public copy and analytics.

## 2. Search intent and content

- [ ] Unique page purpose is documented before writing.
- [ ] Title, description, H1, introduction, service scope, process, FAQ, and CTA align with the same intent.
- [ ] Content is materially different from neighboring pages; it is not a doorway or city-name substitution page.
- [ ] The page explains what Hermes does, what information is required, what happens next, and what is not guaranteed.
- [ ] FAQ answers are visible in the page body before FAQ structured data is added.
- [ ] Internal links connect to a parent hub, related services/resources, contact/intake, and one logical next step.
- [ ] Anchor text describes the destination instead of using repeated generic text such as “learn more.”

## 3. Metadata and canonicalization

- [ ] Exactly one `<title>` is rendered.
- [ ] Exactly one non-empty meta description is rendered.
- [ ] Exactly one visible H1 is rendered.
- [ ] Exactly one absolute self-referencing HTTPS canonical is rendered in `<head>`.
- [ ] Canonical contains no query string or fragment.
- [ ] Canonical host is `hermeslogisticsus.com`.
- [ ] `og:url` matches canonical.
- [ ] Open Graph title, description, image, image alt, and Twitter card are present.
- [ ] Indexable pages use `index,follow,max-image-preview:large`.
- [ ] 404, private preview, test, and non-search demo pages use `noindex` and are excluded from sitemap.

## 4. Multilingual SEO

- [ ] Page language matches `<html lang>`.
- [ ] Canonical points to the same-language version.
- [ ] Reciprocal hreflang links exist for every released counterpart.
- [ ] `x-default` points to the agreed default experience.
- [ ] Ukrainian public URL uses `/ua/`; `/uk/` is not linked publicly.
- [ ] Navigation, headings, CTA, form labels, error messages, and structured data are translated consistently.
- [ ] Approved logistics terms follow `docs/SEO_TRANSLATION_GLOSSARY.md`.
- [ ] Localized page is useful on its own; translation is not limited to header/footer chrome.

## 5. Structured data

- [ ] JSON-LD parses successfully.
- [ ] Markup represents visible content only.
- [ ] Stable Organization/WebSite `@id` values are reused.
- [ ] Deep pages use BreadcrumbList only when the hierarchy is accurate.
- [ ] Service markup uses verified service names and scope.
- [ ] FAQPage is used only for visible FAQs and does not promise rich-result display.
- [ ] URLs inside schema are absolute HTTPS URLs.
- [ ] Rich Results Test has no critical errors.

## 6. Sitemap, robots, and links

- [ ] New canonical URL is added to the root sitemap only when the page is intended for indexing.
- [ ] Sitemap URL exactly matches rendered canonical.
- [ ] Sitemap contains no redirect, noindex, query-string, fragment, HTTP, `www`, demo, or missing page URL.
- [ ] Multilingual alternates are added to sitemap after route parity is verified.
- [ ] `robots.txt` continues to allow public content and references the canonical root sitemap.
- [ ] Internal links return real generated pages and do not point to 404s.
- [ ] Page is reachable through at least one contextual internal link; it is not orphaned.

## 7. Performance and mobile UX

- [ ] Above-the-fold LCP image is identified.
- [ ] Only the true LCP image is eager/preloaded.
- [ ] Below-the-fold images are lazy-loaded.
- [ ] Images have width, height, useful alt text, responsive sizes, and modern formats where available.
- [ ] No unnecessary client JavaScript is introduced.
- [ ] Mobile navigation, forms, buttons, phone links, focus order, and keyboard interactions work.
- [ ] Failure states preserve direct email/phone contact.

## 8. Automated verification

Run:

```bash
npm run build
npm test
npm run test:e2e
```

Confirm:

- [ ] Astro check/build succeeds.
- [ ] Static output validation succeeds.
- [ ] SEO growth audit succeeds.
- [ ] Reciprocal hreflang audit succeeds.
- [ ] Playwright desktop and mobile tests succeed.
- [ ] No credential, personal data, private address, or unsupported claim appears in diff, build output, test artifacts, or logs.

## 9. Preview and publication

- [ ] Review the preview deployment on desktop and mobile.
- [ ] Inspect rendered source, not only the browser DOM.
- [ ] Validate canonical, robots, hreflang, Open Graph, JSON-LD, CTA, phone, email, and all internal links.
- [ ] Merge only after green CI and owner approval.
- [ ] Confirm the production deployment completed from the intended commit.
- [ ] Re-run a production URL check after cache/CDN propagation.

## 10. Search Console and measurement

- [ ] Inspect the production URL in Google Search Console.
- [ ] Confirm Google can retrieve the page and the declared canonical is correct.
- [ ] Request indexing only for priority pages after production verification.
- [ ] Confirm the sitemap was read after the URL was added.
- [ ] Confirm GA4 records privacy-safe page views and approved CTA/conversion events.
- [ ] Record publication date, target query cluster, baseline impressions/clicks/position, and next review date.
- [ ] Review performance after 7, 28, and 90 days without treating early volatility as a guarantee.
