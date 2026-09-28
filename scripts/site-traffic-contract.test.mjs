import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { siteTrafficRouteGroup } from "../functions/api/site-traffic.ts";

assert.equal(siteTrafficRouteGroup("/"), "home");
assert.equal(siteTrafficRouteGroup("/businesses/arkansas/guy/example/"), "catalog");
assert.equal(siteTrafficRouteGroup("/businesses/connect/repair-shop/example-shop/"), "catalog_crm_profile");
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/repair-shops/booking/"), "repair_shop_booking");
assert.equal(siteTrafficRouteGroup("/paths/logistics/"), "logistics");
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/repair-shops/dashboard/"), null);
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/repair-shops/auth/"), null);
assert.equal(siteTrafficRouteGroup("/internal/site-traffic/"), null);
assert.equal(siteTrafficRouteGroup("/api/catalog/companies"), null);
assert.equal(siteTrafficRouteGroup("https://example.com/"), null);

const api = readFileSync(new URL("../functions/api/site-traffic.ts", import.meta.url), "utf8");
const collector = readFileSync(new URL("../src/components/SiteTrafficCollector.astro", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../src/pages/internal/site-traffic.astro", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");

assert.match(api, /requireInternalOwner\(request, env\)/);
assert.match(api, /analytics_consent !== true/);
assert.match(api, /hermes_site_traffic_daily/);
assert.match(api, /PRIMARY KEY\(day, route_group\)/);
assert.doesNotMatch(api, /CF-Connecting-IP|X-Forwarded-For|User-Agent|Referer|client_email|client_phone/);

assert.match(collector, /localStorage\.getItem\(CONSENT_KEY\) === "granted"/);
assert.match(collector, /navigator\.webdriver === true/);
assert.match(collector, /window\.location\.pathname/);
assert.doesNotMatch(collector, /window\.location\.search|document\.referrer|email|phone/);

assert.match(dashboard, /robots="noindex,nofollow"/);
assert.match(dashboard, /fetch\("\/api\/site-traffic"/);
assert.match(dashboard, /consented first-party page views/i);
assert.match(layout, /<SiteTrafficCollector \/>/);

console.log("Owner site traffic counter contract OK");
