# Russian car-hauling dispatch SERP gap — 2026-08-02

## Observed query

`диспетчер сервис кархолинг в США`

Google locale observed by owner: Russian UI, Ukraine account/device context.

## Confirmed gap

Hermes currently has an English commercial page at:

- `/logistics/car-hauling-dispatch/`

Its title and H1 target English intent:

- `Car Hauling Dispatch Services for Owner-Operators | Hermes Logistics`
- `Car Hauling Dispatch Services for Owner-Operators and Small Fleets`

The URL is declared in `public/sitemap-services.xml` with `lastmod` 2026-07-31, but independent web search on 2026-08-02 did not surface the Hermes domain or this URL for the Russian query.

Hermes has a general `/ru/` overview, but no dedicated Russian commercial page for car-hauling dispatch and no Russian title/H1/body/FAQ mapped to this query family.

## Why competitors rank first

Current visible competitors use dedicated Russian or Ukrainian pages with:

- exact-language title and H1;
- repeated car-hauler/dispatcher terminology;
- service explanation, FAQ and commercial CTA;
- visible contact routes;
- stronger topical history and external mentions/directories.

## Decision

Make this the first Russian-language revenue SEO pilot after the CI date hotfix and scorecard merge.

Recommended route:

- `/ru/logistics/car-hauling-dispatch/`

Primary query family:

- диспетчер для кархолеров в США
- диспетчерские услуги для кархолеров
- кархолинг диспетчер США
- диспетчерский сервис для автовозов США
- диспетчер для owner-operator car hauler

Proposed metadata:

- Title: `Диспетчер для кархолеров в США | Hermes Logistics`
- H1: `Диспетчерские услуги для кархолеров и автовозов в США`
- Description: `Диспетчерская и back-office поддержка кархолеров в США: поиск и проверка грузов, переговоры с брокерами, документы, инвойсы и контроль решения перевозчиком.`

## Required page contract

- fully Russian page, not mixed-language blocks;
- self-canonical;
- reciprocal `hreflang` with English page (`ru` and `en`), plus `x-default` only if the existing localization contract supports it;
- unique sitemap ownership;
- internal link from `/ru/` and the English commercial page language switcher/related block;
- one dominant CTA to the existing carrier intake:
  `/load-board/?role=carrier&equipment=car_hauler#carrier-access`;
- secondary phone/email fallback using approved Logistics contacts;
- visible qualification requirements: authority stage, insurance readiness, equipment, capacity, operating area and availability;
- FAQ matching Russian commercial intent;
- privacy-safe `logistics_cta_click` and `contact_click` events;
- no guaranteed loads, rates, mileage, revenue, direct freight or response time;
- no fake office, fleet, capacity, reviews, statistics or completed-route claims.

## Revenue KPI

Primary:

1. qualified Russian-language carrier inquiries;
2. organic-session-to-CTA conversion;
3. CTA-to-qualified-inquiry conversion.

Secondary:

1. indexation status;
2. impressions and clicks for the Russian query family;
3. CTR and average position;
4. competing Hermes URLs for the same Russian query.

## Release order

1. Land Issue #93 date hotfix and restore green CI.
2. Merge PR #92 scorecard.
3. Implement this Russian page as one of Issue #94's maximum three immediate conversion fixes.
4. Run build, localization, hreflang, sitemap and desktop/mobile CTA tests.
5. Deploy only after owner-reviewed green CI.
6. Submit the exact URL for indexing and track it in the revenue scorecard.
