# Hermes traffic release protocol — first 72 hours

## Context

This batch is designed to improve discovery and create measurable visits quickly. It does not guarantee ranking or indexing within 72 hours. Search engines decide crawl and indexing timing.

The release adds:

- direct homepage links to the Appleton vehicle transport page and two logistics checklists;
- a crawlable Wisconsin vehicle transport directory on the main Logistics page;
- a valid `#logistics-resources` fragment target;
- a public IndexNow ownership file;
- a manual, owner-controlled IndexNow workflow;
- regression checks for homepage links, Wisconsin links, sitemap presence, and the offline IndexNow payload.

No Google Search Console action, IndexNow submission, merge, deployment, DNS change, secret, or billing action is performed automatically by this branch.

## Release order

This traffic batch does not overlap with the `package.json` work in PRs #83 and #85. It can be reviewed and merged independently before those two PRs.

Required order:

1. Owner approves and merges this traffic PR.
2. Wait for the normal production deployment to finish.
3. Verify the five priority URLs and the IndexNow key file on the live domain.
4. Run the manual IndexNow workflow once.
5. Request recrawl for the five priority URLs in Google Search Console.
6. Publish the three prepared distribution posts below.

## Hour 0–2: production verification

Verify HTTP 200, self-canonical, indexable robots metadata, visible content, and working internal links for:

1. `https://hermeslogisticsus.com/`
2. `https://hermeslogisticsus.com/paths/logistics/`
3. `https://hermeslogisticsus.com/logistics/appleton-wi-vehicle-transport/`
4. `https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/`
5. `https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/`

Verify the ownership file displays only its key:

`https://hermeslogisticsus.com/8e3c1f6a9d4b72c5e0a8f31d67b2c94e.txt`

Do not run IndexNow until the key file and all submitted URLs are live.

## Hour 2–3: IndexNow

Open GitHub Actions and run **Submit priority URLs to IndexNow** with the URL input left blank.

The workflow submits only the five priority URLs. It has `contents: read`, uses no secret, and does not alter the repository or production environment.

Success means the endpoint accepted the notification. It does not guarantee crawling, indexing, or ranking.

## Hour 2–6: Google Search Console

Use URL Inspection and request indexing for the five priority URLs. Submit or resubmit the current sitemap through Search Console.

Do not repeatedly request indexing for the same URL. Repeated submissions do not make crawling faster.

Record for each URL:

- inspection date and time;
- Google-selected canonical;
- indexing status;
- last crawl date;
- request-indexing result.

## Hour 4–24: direct distribution

Use one canonical URL per post. UTM parameters are allowed for measurement, while each page keeps its self-canonical.

### Post 1 — Appleton vehicle transport

**Suggested copy**

Shipping a vehicle to or from Appleton or Fox Valley? The route is only part of the request. Vehicle condition, pickup access, timing, open or enclosed equipment, auction release status, and delivery restrictions can all affect the plan. We published a practical Appleton vehicle transport guide for dealers, auction buyers and sellers, businesses, private customers, and carriers.

Link:

`https://hermeslogisticsus.com/logistics/appleton-wi-vehicle-transport/?utm_source=social&utm_medium=organic&utm_campaign=traffic_72h&utm_content=appleton`

### Post 2 — auction pickup checklist

**Suggested copy**

Bought or sold a vehicle at auction? Before transport is requested, confirm release status, the correct pickup gate, storage deadline, vehicle condition, keys, facility hours, loading restrictions, and delivery access. This public checklist helps identify missing information before a carrier is asked to act.

Link:

`https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/?utm_source=social&utm_medium=organic&utm_campaign=traffic_72h&utm_content=auction_checklist`

### Post 3 — car hauler capacity checklist

**Suggested copy**

“Truck available” is not enough for a useful vehicle-transport match. A practical capacity update should include equipment, available spaces, current area, preferred route, dates, authority, vehicle restrictions, and realistic access limits. We published a checklist for car haulers and carrier teams.

Link:

`https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/?utm_source=social&utm_medium=organic&utm_campaign=traffic_72h&utm_content=carrier_checklist`

Publish to the active Hermes channels where the audience already exists. Do not mass-post to unrelated groups or use unsolicited messaging.

## Day 2: measure and reinforce

Review GA4 by landing page and source/medium for the five priority URLs.

Check:

- users and sessions;
- engaged sessions;
- average engagement time;
- CTA clicks;
- organic social sessions;
- referral sessions;
- search impressions and clicks when Search Console data becomes available.

Re-share the best-performing guide with a different opening sentence. Do not create duplicate pages for the same intent.

## Day 3: decision gate

Continue only from observed data.

- If Appleton receives impressions but weak clicks, test its title and meta description in a separate reviewed batch.
- If a checklist receives social visits and engagement, add one relevant contextual link from the strongest related logistics page.
- If pages remain undiscovered, verify deployment, canonical, robots, sitemap submission, and Search Console inspection before creating more content.
- If traffic arrives but CTA interaction is weak, improve the visible CTA and proof near the first screen rather than publishing more near-duplicate city pages.

## KPI

Primary 72-hour KPI:

- five priority URLs live and verified;
- IndexNow notification accepted once;
- five Search Console indexing requests recorded;
- at least three tracked distribution posts published;
- first measurable sessions and engaged sessions attributed to the priority landing pages.

Secondary KPI:

- reduced crawl depth for the Wisconsin cluster;
- all seventeen Wisconsin service and city routes linked from the Logistics hub;
- all priority URLs retained in the sitemap union;
- zero broken internal links and no regression in build, static, SEO, performance, or browser tests.
