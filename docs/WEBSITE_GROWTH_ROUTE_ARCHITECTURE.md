# Hermes Website Growth Route Architecture

Purpose: define implementation-ready routes for website creation, SEO, multilingual marketing, Academy, Careers, and logistics growth without producing doorway pages or publishing unsupported claims.

## Global publication rule

A route is created only when it has:

- a distinct audience and search intent;
- an approved service that Hermes can currently deliver;
- unique substantive copy, process, FAQ, CTA, internal links, metadata, schema, and evidence;
- a reviewed source record and publication score of at least 7/10;
- no conflict with an existing canonical page;
- no unsupported ranking, income, hiring, load, direct-customer, insurance, financing, or approval promise.

Location and language records remain research-only until demand, competition, response-language capacity, payment/compliance eligibility, and service fit are verified.

## 1. Logistics routes

### Existing or approved commercial hubs

- `/logistics/car-hauling-dispatch/`
- `/logistics/dealer-vehicle-transportation/`

### Future carrier routes

Start with problem/equipment hubs before any geo expansion:

- `/logistics/car-hauling-dispatch/new-authority/`
- `/logistics/car-hauling-dispatch/backhaul-planning/`
- `/logistics/car-hauling-dispatch/open-car-haulers/`
- `/logistics/car-hauling-dispatch/enclosed-car-haulers/`
- `/logistics/car-hauling-dispatch/hotshot-car-haulers/`
- `/logistics/car-hauling-dispatch/multi-car-trailers/`

A location or lane route may be proposed only from a verified historical route and paired demand record:

- `/logistics/lanes/{origin-state}-{destination-state}/{intent}/`

Do not create one page per carrier, city, ZIP, remembered location, or unverified route.

### Future customer-demand routes

- `/logistics/dealer-vehicle-transportation/independent-dealers/`
- `/logistics/dealer-vehicle-transportation/auction-pickup/`
- `/logistics/dealer-vehicle-transportation/remarketing/`
- `/logistics/vehicle-transport/classic-luxury/`
- `/logistics/vehicle-transport/port-storage-pickup/`

These routes require matching operational capacity and must not imply warehousing, customs clearance, guaranteed pickup, or guaranteed delivery.

## 2. U.S. website and SEO service routes

Create national service hubs before niche/location pages:

- `/it-development/websites/`
- `/it-development/website-redesign/`
- `/it-development/multilingual-websites/`
- `/marketing/seo/`
- `/marketing/local-seo/`
- `/marketing/seo/logistics-companies/`
- `/marketing/seo/independent-auto-dealers/`

A niche page requires proof, a distinct workflow, and a useful industry-specific deliverable. A U.S. location page additionally requires verified local demand and weak competition:

- `/marketing/seo/{niche}/{city-state}/`
- `/it-development/websites/{niche}/{city-state}/`

Do not produce generic `agency in city` pages or duplicate national copy with a replaced location name.

## 3. Russian- and Ukrainian-language marketing routes

Begin with language hubs after response capacity and compliance review:

- `/ru/marketing-services/`
- `/ua/marketing-services/`

Possible child routes after evidence validation:

- `/ru/marketing-services/websites/`
- `/ru/marketing-services/seo/`
- `/ru/marketing-services/social-media/`
- `/ua/marketing-services/websites/`
- `/ua/marketing-services/seo/`
- `/ua/marketing-services/social-media/`

Country/city routes are allowed only when language demand, commercial need, payment eligibility, sanctions/compliance, weak competition, and unique local value are all documented.

Target by preferred language and business problem, never by ethnicity or assumed wealth.

## 4. Academy routes

Only two program families are approved for planning:

- `/academy/us-logistics/`
- `/academy/marketing/`

Supporting routes after program facts are approved:

- `/academy/eligibility/`
- `/academy/corporate-training/`
- `/academy/apply/`

Do not publish `$999`, `$400/month`, or `$600/month` concepts until the written program, schedule, deliverables, refund/cancellation policy, payment entity, country eligibility, and disclaimers are approved.

No employment, income, client, load, ranking, view, or lead guarantees.

## 5. Careers routes

- `/careers/`
- `/careers/sales-websites-seo-us/`
- `/careers/logistics-sales/`
- `/careers/marketing-sales/`

A dedicated vacancy route requires an approved title, responsibilities, location/remote policy, language expectations, application process, privacy notice, employment type, compensation facts when applicable, and review date.

`JobPosting` schema is allowed only when the vacancy is currently open and every required fact is accurate. Remove or expire schema when the role closes.

## 6. Required page contract

Every indexable commercial route must include:

1. unique title, meta description, canonical, H1, and social metadata;
2. visible breadcrumb and `BreadcrumbList` schema;
3. appropriate `Service`, `Course`, `Organization`, or `JobPosting` schema only when facts support it;
4. audience, problem, scope, process, boundaries, FAQ, and CTA;
5. internal links to one parent hub, one related service, and one safe conversion path;
6. reviewed date and evidence owner for operational content;
7. responsive images with dimensions, modern formats where useful, and no avoidable LCP regressions;
8. keyboard, mobile, tap-target, reduced-motion, and screen-reader checks;
9. sitemap inclusion only when canonical and indexable;
10. GA4 events without names, emails, phones, free text, addresses, or other PII.

## 7. Implementation order

1. synchronize the growth branch with current `main` while preserving merged Claude work;
2. reconcile `package.json` and `public/sitemap.xml` with PR #13;
3. finish evidence registries and automated publication gates;
4. implement national website/SEO hubs with approved proof;
5. implement Academy overview routes with pricing hidden until approved;
6. implement dedicated Careers routes only for approved open roles;
7. research and score logistics lanes and multilingual markets;
8. publish only records that pass evidence, competition, uniqueness, service-fit, compliance, and CI gates;
9. measure impressions, queries, conversions, and cannibalization before expanding the next batch.
