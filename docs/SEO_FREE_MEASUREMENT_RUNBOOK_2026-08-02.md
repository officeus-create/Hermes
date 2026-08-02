# Hermes SEO Free Measurement Runbook

**Date:** 2026-08-02  
**Scope:** Google Search Console, GA4, Bing Webmaster Tools, and free reporting  
**Purpose:** establish trustworthy measurement before expanding SEO page count or starting paid tooling

## 1. Ownership and access register

Record access in the private company credential system. Do not commit credentials, verification tokens, backup codes, or account screenshots to this repository.

Required roles:

| System | Minimum role | Owner/status |
|---|---|---|
| Google Search Console | Verified owner for Domain property | `NEEDS_CONFIRMATION` |
| Google Analytics 4 | Editor or Administrator | `NEEDS_CONFIRMATION` |
| Bing Webmaster Tools | Site owner/admin | `NEEDS_CONFIRMATION` |
| Looker Studio | Report editor | `NEEDS_CONFIRMATION` |
| Cloudflare | Read access to production analytics/deployments | existing access must be confirmed privately |

## 2. Google Search Console

Official references:

- [Verify site ownership](https://support.google.com/webmasters/answer/9008080?hl=en)
- [Sitemaps report](https://support.google.com/webmasters/answer/7451001?hl=en)

### Setup

1. Create or confirm a **Domain property** for `hermeslogisticsus.com`.
2. Verify by DNS at the domain provider. A Domain property covers protocol and subdomain variations.
3. Keep at least two verified company owners to reduce lockout risk.
4. Confirm the production host resolves to HTTPS and that no unexpected `www`, HTTP, preview, or staging URL is treated as primary.

### Submit canonical sitemaps

Submit only sitemaps that are live, HTTPS, and referenced by `robots.txt`:

- `https://hermeslogisticsus.com/sitemap.xml`
- `https://hermeslogisticsus.com/sitemap-local.xml`
- `https://hermeslogisticsus.com/sitemap-services.xml`
- `https://hermeslogisticsus.com/sitemap-digital-services.xml`
- `https://hermeslogisticsus.com/sitemap-cases.xml`

For each sitemap record:

- submitted date;
- last read date;
- status;
- discovered URL count;
- errors/warnings;
- owner who reviewed it;
- next review date.

### Priority URL inspection

Inspect after each verified production release:

1. `/logistics/car-hauling-dispatch/`
2. `/paths/logistics/carriers/car-hauling/`
3. `/paths/logistics/carriers/owner-operators/`
4. `/paths/logistics/carriers/fleet-owners/`
5. `/services/website-development/`
6. `/services/website-redesign/`
7. `/services/seo/`
8. `/services/seo-for-logistics-companies/`
9. `/services/seo-for-independent-auto-dealers/`
10. `/logistics/appleton-wi-vehicle-transport/`

Record:

- URL available to Google;
- indexing allowed;
- user-declared canonical;
- Google-selected canonical;
- last crawl;
- rendered-page or mobile issues;
- request-indexing date, only when appropriate.

### Weekly Search Console export

Export or record by page and query:

- impressions;
- clicks;
- CTR;
- average position;
- country = United States where useful;
- device;
- branded vs non-branded query group;
- landing page;
- competing pages for the same query;
- changes against the previous 7 and 28 days.

Do not treat average position or impressions as revenue.

## 3. Google Analytics 4

Official references:

- [About key events](https://support.google.com/analytics/answer/9267568?hl=en)
- [Mark events as key events](https://support.google.com/analytics/answer/13128484?hl=en-SG)
- [Create or modify key events](https://support.google.com/analytics/answer/12844695?hl=en)

The website currently loads GA4 measurement ID `G-RY26321PVW`. Confirm privately that this is the intended production property before changing configuration.

### Event rules

Allowed event parameters are coarse, non-identifying dimensions such as:

- `page_group`;
- `service_group`;
- `audience_type`;
- `cta_type`;
- `handoff_method`;
- `preview_status`;
- `pathname` when it contains no submitted data;
- `device_category` as provided by GA4.

Never send:

- name;
- email;
- phone;
- USDOT or MC number;
- VIN;
- exact address;
- exact route;
- rate or revenue expectation;
- company documents;
- free-form message;
- clipboard content;
- any value entered in a lead form.

### Required funnel events

#### Shared

- `commercial_cta_click`

#### Car hauling

- `carrier_intake_start`
- `carrier_intake_preview_ready`
- `carrier_handoff_ready`

#### Website development

- `website_project_intake_start`
- `website_project_preview_ready`
- `marketing_handoff_ready`

#### SEO services

- `seo_intake_start`
- `seo_intake_preview_ready`
- `seo_handoff_ready`

### Key-event policy

Mark only handoff-ready events as GA4 key events initially:

- `carrier_handoff_ready`;
- `marketing_handoff_ready`;
- `seo_handoff_ready`.

Intake starts and preview-ready events remain diagnostic funnel events. This avoids inflating conversions with low-intent clicks.

### Verification

For every new event:

1. trigger it on the approved preview or production environment;
2. verify it in Realtime/DebugView;
3. inspect parameters for PII;
4. confirm the event fires once per intended action;
5. verify it does not fire on validation errors or page load;
6. allow processing time before relying on standard reports;
7. record implementation commit and verification date.

## 4. Bing Webmaster Tools

Official reference:

- [Bing Webmaster Tools — Sitemaps](https://www4.bing.com/webmasters/help/sitemaps-3b5cf6ed)

### Setup

1. Add `hermeslogisticsus.com`.
2. Import verified ownership from Google Search Console when appropriate, or verify independently.
3. Submit the same canonical sitemap set used in Search Console.
4. Record processing status and discovered URL count.
5. Review crawl errors, blocked URLs, index coverage, search queries, and inbound links weekly.
6. Inspect the same priority commercial URLs listed above.

Do not create Bing-only pages or metadata. The canonical site architecture remains shared.

## 5. Free reporting layer

Official reference:

- [Create a Looker Studio report](https://support.google.com/looker-studio/answer/06292570)

### Minimum report pages

#### Executive summary

- reviewed qualified inquiries;
- handoff-ready events;
- organic landing sessions;
- organic CTA rate;
- intake-start rate;
- handoff-ready rate;
- organic clicks;
- CTR;
- indexed priority URLs.

#### Car hauling

- `/logistics/car-hauling-dispatch/` organic performance;
- carrier CTA → intake → preview → handoff;
- query groups by car hauling, dispatcher, owner-operator, equipment/capacity;
- reviewed qualified carrier outcome entered only as aggregate counts.

#### Website projects

- Website Development and Redesign landing performance;
- project-need category;
- CTA → project intake → preview → handoff;
- reviewed qualified project outcome as aggregate counts.

#### SEO services

- general SEO and vertical SEO landing performance;
- national/local/vertical category;
- CTA → SEO intake → preview → handoff;
- reviewed qualified SEO outcome as aggregate counts.

#### Technical health

- indexed/not-indexed priority URLs;
- sitemap status;
- Core Web Vitals field status when available;
- 404/5xx trends;
- canonical conflicts;
- orphan-page audit status;
- latest green production commit.

### Null and zero policy

- `0` means measurement exists and no activity occurred.
- blank/null means the metric is unavailable, not connected, not reviewed, or not applicable.
- never replace missing data with zero.
- never invent historical baselines.

## 6. Weekly operating review

Every week record:

1. What changed in production?
2. Which pages gained or lost impressions and clicks?
3. Did query ownership become clearer or more fragmented?
4. Did CTA, intake, preview, or handoff rates change?
5. How many handoffs were reviewed as qualified?
6. Which technical defects block discovery or conversion?
7. Which page receives the next improvement and why?
8. Which proposed page is rejected because evidence is insufficient?

## 7. Release measurement schedule

For every commercial release:

- Day 0: production and analytics verification;
- Day 7: indexing, event integrity, crawl errors;
- Day 28: query/page fit, CTR, funnel progression;
- Day 90: qualified outcomes, consolidation/expansion decision.

Do not interpret early ranking volatility as a stable result.

## 8. Completion criteria

The free measurement foundation is complete when:

- Domain property ownership is confirmed;
- all canonical sitemaps are processed in Google and Bing;
- priority URLs have recorded indexing/canonical status;
- GA4 receives the approved funnel events without PII;
- handoff-ready events are marked as key events;
- a report distinguishes null from zero;
- reviewed qualified outcomes can be associated with landing-page and service groups in aggregate;
- weekly review has an owner and recurring schedule.
