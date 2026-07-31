# Hermes — U.S. Website Creation and SEO Growth System

Purpose: define what Hermes can sell, how low-competition U.S. markets are researched, what evidence is required, and how future service pages are built without doorway-page duplication or ranking guarantees.

## 1. Website-development service cluster

Approved service families, subject to final scope:

1. New business website discovery and information architecture.
2. Corporate website design and development.
3. Service-business lead-generation websites.
4. Website redesign and conversion-path improvement.
5. Multilingual website foundations.
6. Landing pages tied to a real campaign or service cluster.
7. Contact, qualification, and intake workflows.
8. CRM and operations-system integration planning.
9. Analytics and approved conversion-event implementation.
10. Accessibility, mobile, technical quality, and release QA.
11. Content migration and redirect planning.
12. Ongoing maintenance and improvement where separately agreed.

Do not claim that every project includes branding, copywriting, ecommerce, payments, booking, CRM, AI, hosting, or integrations. Each capability must be listed as included, optional, prototype, or unavailable for the specific project.

## 2. SEO and Local SEO service cluster

Approved service families:

- technical SEO audit and implementation planning;
- crawlability, indexability, canonical, sitemap, robots, and metadata QA;
- search-intent and page-map development;
- content briefs and commercial-page architecture;
- internal-link architecture;
- local-market and niche research;
- Google Business Profile support when access and business eligibility are confirmed;
- on-page optimization;
- schema markup aligned with visible content;
- multilingual and international SEO planning;
- Search Console and GA4 measurement planning;
- content refresh and cannibalization review;
- performance and mobile-search quality improvement.

Boundary:

> Hermes can provide research, implementation, measurement, and ongoing optimization. Search engines control crawling, indexing, rankings, rich results, and traffic. No ranking, lead, revenue, timeline, or return-on-investment result is guaranteed.

## 3. Niche-first U.S. location research rules

Research order:

1. choose a real service with proof or a demonstrable process;
2. choose a specific business niche;
3. identify the business problem and conversion action;
4. identify U.S. markets with enough relevant businesses;
5. review search demand and result quality;
6. score competition, commercial fit, and unique local value;
7. produce one pilot brief;
8. implement only after a 7/10 publication score;
9. inspect indexing and engagement;
10. expand only winning clusters.

Never create a city page only because a keyword tool displays low difficulty.

Required market signals:

- relevant local businesses exist;
- current search results inadequately answer the niche problem;
- Hermes has a real service/process for the need;
- unique local or niche material can be written;
- the page can receive crawlable internal links;
- the page has a useful, honest CTA.

## 4. Website and SEO sales-page content brief

Primary audience: U.S. small and midsize businesses that need a new website, redesign, SEO, or Local SEO.

Required sections:

1. problem-focused headline;
2. who the service is for;
3. website service scope;
4. SEO and Local SEO service scope;
5. how discovery and qualification work;
6. deliverable categories;
7. proof/prototype boundaries;
8. what Hermes does not promise;
9. project information required;
10. direct inquiry CTA;
11. related case study only when factual evidence exists;
12. visible review date after publication.

Suggested primary CTA:

`Describe the business, current website, target U.S. market, services, and the next result the website should support.`

## 5. Multilingual business website brief

Use cases:

- U.S. businesses serving English and Spanish audiences;
- immigrant-owned businesses needing English plus a community language;
- international businesses entering the U.S.;
- businesses whose internal team uses Russian or Ukrainian while customers use English.

Requirements:

- separate URL for each indexable language;
- correct `lang`, canonical, and reciprocal `hreflang`;
- natural market-language copy, not literal bulk translation;
- language-specific CTA and contact expectations;
- consistent service facts and legal boundaries;
- no automatic country targeting based only on a visitor's ethnicity or assumed origin;
- translation review by a capable speaker before publication.

## 6. SEO for logistics companies content brief

Primary audiences:

- car hauling and auto transport companies;
- owner-operator and small-fleet brands;
- dispatch and operations companies;
- brokers and logistics service providers where scope is verified.

Problem families:

- weak service pages;
- no equipment or service-area architecture;
- thin city pages;
- poor carrier/customer segmentation;
- untracked call/email conversion;
- duplicate location content;
- unclear authority and service claims;
- no commercial internal-link path;
- slow or mobile-unfriendly pages.

Required proof boundary:

Hermes may demonstrate its own website architecture, templates, audits, and prototypes. Do not imply client ranking or revenue results without a source, date, baseline, and permission.

## 7. SEO for independent auto dealers content brief

Primary needs:

- inventory and service discoverability;
- local dealership visibility;
- vehicle-acquisition and transport-support pages;
- lead forms and call tracking;
- multilingual customer journeys;
- review and reputation workflow planning;
- technical and mobile quality;
- content around actual dealer services.

Do not imply affiliation with a dealer, auction, marketplace, or vehicle brand without evidence.

Suggested CTA:

`Share the dealership location, inventory model, current website, target customers, and the calls or inquiries the site should generate.`

## 8. Website and SEO lead qualification checklist

Required:

- legal or public business name;
- website URL, or confirmation that no site exists;
- U.S. city/state and service area;
- business category;
- main services/products;
- target customer;
- current lead sources;
- desired customer action;
- website/SEO problem;
- languages needed;
- existing Google Business Profile and Search Console/Analytics access status;
- decision-maker role;
- timeline preference;
- available investment range only when the user chooses to provide it;
- examples/reference sites;
- compliance or platform constraints.

Classification:

- `new_website`;
- `redesign`;
- `technical_seo`;
- `local_seo`;
- `content_architecture`;
- `multilingual`;
- `integration`;
- `audit_only`;
- `needs_discovery`;
- `not_a_fit`.

## 9. Proof, prototype, and case-study requirements

Labels:

- `Live product`: publicly accessible and currently functioning.
- `Working prototype`: demonstrable, but not represented as a connected production system.
- `Build-ready capability`: process/architecture defined; not represented as already delivered.
- `Verified case study`: written permission or approved anonymization, baseline, work performed, dates, and measured outcome.
- `Internal experiment`: not a public result claim.

A case-study result must record:

- client/subject identification or approved anonymization;
- date range;
- baseline and measurement source;
- work performed;
- result metric;
- factors outside Hermes control;
- permission status;
- reviewer.

## 10. U.S. market location scorecard

Score 0–10:

- relevant business density: 0–2;
- weak result-page quality/competition: 0–2;
- commercial need and service fit: 0–2;
- unique niche/local content available: 0–2;
- internal link and conversion path: 0–1;
- documented evidence and review date: 0–1.

Market record:

```ts
export type UsMarketOpportunity = {
  marketId: string;
  city: string;
  state: string;
  niche: string;
  serviceCluster: "website" | "redesign" | "seo" | "local_seo" | "multilingual" | "integration";
  queryFamilies: string[];
  businessEvidence: string[];
  competitionEvidence: string[];
  uniqueContentAngles: string[];
  score: number;
  decision: "reject" | "research" | "brief" | "pilot";
  reviewedAt: string;
  reviewedBy: string;
};
```

## 11. Website service-page implementation plan

Proposed future route:

`/services/website-development/`

Implementation requirements:

- unique title, description, H1, canonical;
- visible service scope and exclusions;
- problem/use-case sections;
- process and qualification;
- evidence labels;
- direct email CTA and approved form behavior;
- Organization/Service/Breadcrumb schema only when visible content supports it;
- internal links from Technology, Marketing, Careers, and relevant cases;
- no city duplication in the first implementation;
- tests for metadata, H1, schema, CTA, and non-guarantee wording.

## 12. SEO/Local SEO service-page implementation plan

Proposed future route:

`/services/seo-local-seo/`

Required sections:

- technical SEO;
- commercial content architecture;
- local-market research;
- Local SEO and GBP boundary;
- multilingual SEO;
- measurement;
- implementation and ongoing improvement;
- explicit search-engine-control disclaimer;
- intake checklist;
- proof boundary.

Do not publish rankings, percentages, or time-to-result estimates without reviewed evidence.

## 13. Niche brief rules

### Beauty and wellness

Focus on service discovery, local visibility, consultation/booking journey, trust content, mobile UX, and compliant claims. Do not provide medical claims or guarantee appointments.

### Education and training businesses

Focus on program pages, age/audience segmentation, location/service area, enrollment inquiry, schedules where verified, multilingual family communication, and local SEO.

### Professional services

Focus on expertise pages, qualification, service area, contact flow, trust/evidence, accessibility, and compliant disclaimers.

### Home services

Focus on service categories, real coverage area, emergency/standard availability boundaries, calls/forms, reviews, and Local SEO. Avoid fake offices and unsupported city coverage.

## 14. Conversion CTA matrix

- New website: `Describe the company, services, audience, and what the new website should help customers do.`
- Redesign: `Share the current website and the pages or conversions that are not working.`
- Technical SEO: `Request a technical review of crawlability, metadata, schema, links, mobile quality, and measurement.`
- Local SEO: `Share the real service area, business profile status, target services, and current local visibility problem.`
- Multilingual website: `List the customer languages, target markets, and who will review each translation.`
- SEO for logistics: `Share the equipment, services, markets, current pages, and qualified inquiries the site should support.`
- Dealer website/SEO: `Share the dealership model, location, inventory/service focus, and current lead process.`

Every CTA starts a review; it does not confirm scope, price, ranking, traffic, leads, completion date, or contract.
