# Hermes SEO Release Checklist

Use this checklist for every new indexable page, template change, metadata update, localization release, or structured-data change. Completion of code does not authorize merge or deployment.

## 1. Business evidence and intent

- [ ] Page has one primary audience and one primary search intent.
- [ ] The service is actually supported by Hermes or clearly labeled as coordination, planning, training, preview, or development.
- [ ] Every factual claim is Approved or Qualified in `docs/SEO_CLAIMS_EVIDENCE_REGISTER.md` or a private reviewed evidence record.
- [ ] Every number, timeframe, coverage claim, testimonial, result, certification, partnership, fleet claim, and operational claim has an approved evidence source.
- [ ] No guarantee is made for revenue, employment, rankings, loads, capacity, pickup, delivery, transit time, customer acquisition, or safety outcomes.
- [ ] The page states where the carrier or customer retains final operational control when relevant.
- [ ] The page does not imply Hermes owns trucks, warehouses, terminals, auctions, dealerships, or other assets without evidence.
- [ ] Private shipment details, customer names, phones, exact addresses, VINs, documents, and API credentials are excluded from public copy and analytics.

## 2. Search intent and content

- [ ] Unique page purpose is documented before writing.
- [ ] Title, description, H1, introduction, service scope, process, FAQ, and CTA align with the same intent.
- [ ] Content is materially different from neighboring pages; it is not a doorway or city-name substitution page.
- [ ] The page explains what Hermes does, what information is required, what happens next, and what is not guaranteed.
- [ ] Onboarding, qualification, equipment, documentation, timing, and decision requirements are explained where relevant.
- [ ] FAQ answers are visible in the page body before FAQ structured data is added.
- [ ] CTA copy describes the next real action and follows `docs/SEO_CONVERSION_COPY_MATRIX.md`.
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
- [ ] Robots metadata follows `docs/SEO_INDEXATION_POLICY.md`.
- [ ] Indexable pages use `index,follow,max-image-preview:large` and appear in the primary sitemap.
- [ ] Error, noindex, redirected, duplicate, private-preview, test, and non-search demo pages are excluded from sitemap.

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
- [ ] Deep commercial pages contain visible breadcrumb navigation and matching `BreadcrumbList`.
- [ ] `Service` markup uses a verified service name, scope, provider, URL, and service area.
- [ ] `FAQPage` is used only for visible FAQs and does not promise rich-result display.
- [ ] URLs inside schema are absolute HTTPS URLs.
- [ ] Ratings, reviews, prices, offers, availability, awards, counts, and absolute coverage claims are absent unless evidenced.
- [ ] Rich Results Test has no critical errors.

## 6. Sitemap, robots, and internal architecture

- [ ] New canonical URL is added to the root sitemap only when the page is intended for indexing.
- [ ] Sitemap URL exactly matches rendered canonical.
- [ ] Sitemap contains no redirect, noindex, query-string, fragment, HTTP, `www`, demo, or missing page URL.
- [ ] Multilingual alternates are added to sitemap after route parity is verified.
- [ ] `robots.txt` continues to allow public content and references the canonical root sitemap.
- [ ] Internal links return real generated pages and do not point to 404s or unintended redirects.
- [ ] Page has at least one crawlable inbound HTML link from an indexable hub or related page.
- [ ] Page is reachable from the homepage link graph at a reasonable click depth.
- [ ] Commercial pages link to contact or intake; supporting resources link to the commercial page they support.
- [ ] The build-level internal-link audit reports zero orphan or unreachable indexable sitemap routes.

## 7. Conversion, analytics, and privacy

- [ ] Phone and email fallbacks work on mobile and desktop.
- [ ] A preview form clearly states that it does not send or store information.
- [ ] A live form requires explicit consent, validates input, and displays success and failure states.
- [ ] No interface silently loses a request.
- [ ] Approved analytics events include only method, audience/category, status, and pathname where applicable.
- [ ] Names, emails, phones, MC/USDOT, VINs, addresses, routes, rates, document contents, and messages are absent from analytics and URL parameters.
- [ ] The privacy notice accurately describes the current live form and analytics behavior.

## 8. Performance and mobile UX

- [ ] Above-the-fold LCP image is identified.
- [ ] Only the true LCP image is eager and preloaded.
- [ ] Below-the-fold images are lazy-loaded.
- [ ] Images have width, height, useful alt text, responsive sizes, and modern formats where available.
- [ ] Generated HTML, CSS, JavaScript, image, and total-site sizes pass CI performance budgets.
- [ ] No unnecessary client JavaScript or hydration is introduced.
- [ ] Mobile navigation, forms, buttons, phone links, focus order, and keyboard interactions work.
- [ ] Failure states preserve direct email and phone contact.

## 9. Automated verification

Run:

```bash
npm run build
npm test
npm run test:e2e
```

Confirm:

- [ ] Astro check/build succeeds.
- [ ] Static output validation succeeds.
- [ ] SEO growth, hreflang, entity-schema, internal-link, performance-budget, and commercial-page audits succeed.
- [ ] Existing unit checks succeed.
- [ ] Playwright desktop and mobile tests succeed.
- [ ] GitHub Actions is green on the final PR head.
- [ ] No credential, personal data, private address, or unsupported claim appears in diff, build output, test artifacts, or logs.

## 10. Preview, publication, and measurement

- [ ] Review the preview deployment on desktop and mobile.
- [ ] Inspect rendered source, not only the browser DOM.
- [ ] Validate canonical, robots, hreflang, Open Graph, JSON-LD, CTA, phone, email, and all internal links.
- [ ] Merge only after green CI and owner approval.
- [ ] Confirm the production deployment completed from the intended commit.
- [ ] Re-run a production URL check after cache/CDN propagation.
- [ ] Inspect the production URL in Google Search Console.
- [ ] Confirm Google can retrieve the page and the declared canonical is correct.
- [ ] Request indexing only for priority pages after production verification.
- [ ] Confirm the sitemap was read after the URL was added.
- [ ] Confirm GA4 records privacy-safe page views and approved CTA/conversion events.
- [ ] Record publication date, target query cluster, baseline impressions/clicks/position, and next review date.
- [ ] Review performance after 7, 28, and 90 days without treating early volatility as a guarantee.
