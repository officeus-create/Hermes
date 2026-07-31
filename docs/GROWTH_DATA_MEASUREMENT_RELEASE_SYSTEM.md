# Hermes Growth — Data, Measurement, and Release System

Purpose: turn route, language, niche, and location ideas into traceable research records; prevent cannibalization and PII leakage; define measurement and quality gates for every future page.

## 1. Historical-route import specification

Accepted source formats:

- CSV;
- XLSX export converted through a reviewed import step;
- Google Sheets export;
- structured JSON;
- manually reviewed table for a small pilot.

Required import behavior:

1. preserve source filename, source row, import date, and version;
2. never overwrite the raw source;
3. map source columns explicitly;
4. quarantine rows with missing direction, conflicting location data, or unclear equipment;
5. remove or tokenize private carrier/customer identifiers from the SEO copy dataset;
6. normalize cities/states without guessing;
7. create directional and corridor lane keys;
8. deduplicate with an audit trail;
9. record reviewer and review date;
10. export only verified, publication-safe aggregate opportunities.

Import errors must be reported by row and field. A partial import may not silently drop invalid rows.

## 2. Lane opportunity dataset schema

```ts
export type EvidenceRef = {
  sourceType: "historical_route" | "search_console" | "keyword_research" | "public_business_research" | "owner_approved_internal";
  sourceId: string;
  capturedAt: string;
  reviewedAt?: string;
  note?: string;
};

export type LaneOpportunity = {
  id: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  directionalKey: string;
  corridorKey: string;
  equipmentClasses: string[];
  audienceSides: ("carrier" | "dealer" | "shipper" | "broker" | "private_customer")[];
  languageCandidates: string[];
  evidence: EvidenceRef[];
  score: number;
  decision: "reject" | "research" | "brief" | "pilot" | "published";
  privacyReviewed: boolean;
  claimsReviewed: boolean;
  lastReviewedAt: string;
};
```

No lane becomes `pilot` or `published` without at least one historical/commercial evidence reference and one competition/demand evidence reference.

## 3. Low-competition research evidence template

```md
# Opportunity: [niche/service/language/location]

- Research date:
- Researcher:
- Intended audience:
- Service fit:
- Primary query family:
- Supporting queries:
- Search geography/device/language:
- Search-demand evidence:
- Current result-page observations:
- Strong competitors:
- Weaknesses/gaps in current results:
- Relevant local businesses or demand signals:
- Unique Hermes value:
- Unique content available:
- Internal link source:
- CTA destination:
- Claim risks:
- Privacy risks:
- Score /10:
- Decision: reject / research / brief / pilot
- Recheck date:
```

A keyword-tool difficulty number is supporting evidence only. It is not the final competition decision.

## 4. Country and language eligibility matrix

Required fields:

```ts
export type MarketEligibility = {
  countryCode: string;
  countryName: string;
  cityOrRegion?: string;
  audienceLanguage: string;
  programOrService: "logistics" | "website_seo" | "marketing" | "academy_logistics" | "academy_marketing";
  paymentStatus: "eligible" | "requires_review" | "unavailable";
  complianceStatus: "eligible" | "requires_review" | "excluded";
  serviceLanguageCapacity: "confirmed" | "limited" | "not_confirmed";
  demandEvidence: string[];
  competitionEvidence: string[];
  internetOrDeliveryEvidence?: string[];
  score: number;
  reviewedAt: string;
  sourceDates: string[];
  decision: "reject" | "research" | "brief" | "pilot";
};
```

Do not use public labels that insult or stigmatize countries or people. Eligibility decisions are based on law, compliance, payment, service capacity, safety, and business evidence.

## 5. Query-to-page mapping template

For every new page:

- canonical URL;
- primary audience;
- primary intent;
- primary query family;
- secondary query families;
- location/language modifier;
- page type: hub, service, lane, market, resource, course, career;
- existing competing Hermes URLs;
- differentiating value;
- internal inbound links;
- outbound related links;
- CTA;
- schema type;
- evidence register entry;
- review date.

One primary intent should have one clear canonical owner page.

## 6. Cannibalization prevention checklist

Before creating a page:

- search current repository routes and titles;
- inspect Search Console landing pages for the query family when available;
- compare audience and funnel stage;
- compare location and language intent;
- decide whether to expand an existing page instead;
- avoid synonyms that create the same commercial promise on different URLs;
- ensure internal anchor text points consistently to the intended owner page;
- document redirects if a page is replaced;
- avoid indexable filters, searches, previews, and duplicate translated fragments;
- recheck after publication using impressions and ranking URLs.

## 7. Privacy-safe GA4 event plan

Allowed common fields:

- event name;
- page path;
- direction/service key;
- audience key;
- language key;
- CTA/action key;
- component key;
- result category that contains no user-entered value.

Events:

```js
{ event: "logistics_contact", audience: "carrier", action: "call", page_path: "/..." }
{ event: "service_interest", service: "website", action: "email", page_path: "/..." }
{ event: "service_interest", service: "seo_local_seo", action: "open_intake", page_path: "/..." }
{ event: "academy_interest", program: "logistics", action: "open_requirements", page_path: "/..." }
{ event: "career_action", role_key: "website_seo_sales", action: "start_email_application", page_path: "/careers/" }
```

Never send names, emails, phones, addresses, route text entered by users, company names entered in forms, message content, resumes, VINs, MC/DOT entered by users, or full external URLs containing personal identifiers.

## 8. Search Console exports

Required exports once connector/access is available:

- queries by page;
- pages by query;
- country;
- device;
- date;
- clicks;
- impressions;
- CTR;
- average position;
- search appearance where available.

Review windows:

- last 28 days versus previous 28 days;
- last 3 months versus previous period;
- last 12 months for seasonality when data exists.

Prioritization groups:

- high impressions, low CTR;
- positions 4–15;
- multiple Hermes pages for the same query;
- pages with falling clicks/impressions;
- new pages with no impressions after a reasonable crawl/index review;
- language/country opportunities with proven impressions.

## 9. Monthly editorial and refresh queue

Columns:

- priority;
- URL or planned URL;
- direction;
- audience;
- query/intent;
- issue/opportunity;
- action: refresh, consolidate, expand, build, redirect, noindex, measure;
- evidence source;
- owner;
- reviewer;
- deadline;
- status;
- published date;
- inspection date;
- next measurement date.

Priority order:

1. technical/indexing failures;
2. pages with real impressions near first-page visibility;
3. high-commercial-intent carrier/dealer/website/SEO pages;
4. content refreshes with measurable decline;
5. new research pilots;
6. speculative opportunities last.

## 10. Reviewed-date and reviewer rules

Visible reviewed dates are recommended for:

- operational checklists;
- course requirements;
- pricing/terms pages;
- compliance-sensitive guidance;
- route/market pages with changing facility or market information;
- career pages;
- articles that use current statistics.

Internal record must include:

- created date;
- last factual review;
- content reviewer;
- operational reviewer when relevant;
- source dates;
- next review date;
- changes made.

Do not invent expert biographies. Author/reviewer attribution must represent a real person or an accurately described team role.

## 11. Image requirements

For every new page:

- use modern formats where practical: AVIF/WebP with compatible fallback when needed;
- provide correct intrinsic width/height;
- provide meaningful alt text when the image communicates content;
- use empty alt only for truly decorative images;
- define responsive `srcset`/`sizes` for major content images;
- preload only the actual above-the-fold LCP image;
- use eager/high priority only for the LCP image;
- lazy-load below-the-fold images;
- avoid text embedded in images as the only source of information;
- record license/source for third-party media.

## 12. Page weight and Core Web Vitals budgets

Initial launch budgets for a normal content/service page:

- generated HTML: target under 150 KB uncompressed;
- page-specific JavaScript: target under 100 KB compressed where practical;
- page-specific CSS growth: reviewed when a template adds more than 30 KB compressed;
- LCP image: target under 250 KB for mobile delivery where visually acceptable;
- individual below-fold image: target under 200 KB for common viewport delivery;
- no unexpected layout shift from missing dimensions;
- no unnecessary third-party script added without owner and privacy review.

Performance targets are measurement goals, not public promises. Validate production with current field/lab tools after deployment.

## 13. Mobile and keyboard QA

Required:

- logical heading order;
- skip/main-content access;
- menu opens/closes by keyboard;
- Escape closes modal/menu where applicable;
- visible focus;
- tap targets approximately 44×44 CSS pixels where practical;
- no horizontal overflow at common mobile widths;
- phone/email links remain usable;
- form labels and errors are associated and understandable;
- reduced-motion preference is respected;
- content works without hover;
- CTA is not obscured by fixed UI;
- localized text does not break layout.

## 14. Launch regression requirements

Every indexable launch must verify:

- one title;
- one meta description;
- one visible H1;
- absolute self-canonical;
- correct robots directive;
- sitemap membership;
- no sitemap URL that fails to build;
- correct language and reciprocal hreflang for localized clusters;
- parseable JSON-LD that matches visible content;
- breadcrumb UI/schema on deep commercial pages;
- no broken internal links;
- at least one crawlable inbound internal link;
- direct fallback contact;
- non-guarantee boundaries;
- privacy-safe analytics;
- desktop/mobile smoke test;
- page-weight review;
- evidence and reviewed-date record.
