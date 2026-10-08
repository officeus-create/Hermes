import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { siteTrafficRouteGroup } from "../functions/api/site-traffic.ts";

assert.equal(siteTrafficRouteGroup("/"), "home");
assert.equal(siteTrafficRouteGroup("/businesses/arkansas/guy/example/"), "catalog");
assert.equal(siteTrafficRouteGroup("/businesses/ukraine/chaiky/example/"), "catalog_international");
assert.equal(siteTrafficRouteGroup("/businesses/connect/repair-shop/example-shop/"), "catalog_crm_profile");
assert.equal(siteTrafficRouteGroup("/businesses/connect/academy/example-academy/"), "catalog_crm_profile");
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/repair-shops/booking/"), "repair_shop_booking");
assert.equal(siteTrafficRouteGroup("/paths/logistics/"), "logistics");
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/repair-shops/dashboard/"), null);
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/access/"), null);
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/repair-shops/auth/"), null);
assert.equal(siteTrafficRouteGroup("/services/hermes-connect/academy/business/workspace/"), null);
assert.equal(siteTrafficRouteGroup("/internal/site-traffic/"), null);
assert.equal(siteTrafficRouteGroup("/api/catalog/companies"), null);
assert.equal(siteTrafficRouteGroup("https://example.com/"), null);

const api = readFileSync(new URL("../functions/api/site-traffic.ts", import.meta.url), "utf8");
const publicApi = readFileSync(new URL("../functions/api/site-traffic-public.ts", import.meta.url), "utf8");
const collector = readFileSync(new URL("../src/components/SiteTrafficCollector.astro", import.meta.url), "utf8");
const publicCounter = readFileSync(new URL("../src/components/PublicTrafficCounter.astro", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../src/pages/internal/site-traffic.astro", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");

assert.match(api, /requireInternalOwner\(request, env\)/);
assert.match(api, /analytics_consent !== true/);
assert.match(api, /hermes_site_traffic_daily/);
assert.match(api, /PRIMARY KEY\(day, route_group\)/);
assert.match(api, /sessions INTEGER NOT NULL DEFAULT 0/);
assert.match(api, /ALTER TABLE hermes_site_traffic_daily ADD COLUMN sessions/);
assert.doesNotMatch(api, /CF-Connecting-IP|X-Forwarded-For|User-Agent|Referer|client_email|client_phone/);

assert.doesNotMatch(publicApi, /requireInternalOwner/);
assert.match(publicApi, /page_views_today/);
assert.match(publicApi, /page_views_month/);
assert.match(publicApi, /sessions_today/);
assert.match(publicApi, /sessions_month/);
assert.match(publicApi, /MAX\(updated_at\) AS updated_at/);
assert.match(publicApi, /monthStart/);
assert.match(publicApi, /Visitor sessions are consented browser sessions, not unique people/);
assert.doesNotMatch(publicApi, /groups:|daily:|CF-Connecting-IP|X-Forwarded-For|User-Agent|Referer|client_email|client_phone/);

assert.match(collector, /localStorage\.getItem\(CONSENT_KEY\) === "granted"/);
assert.match(collector, /navigator\.webdriver === true/);
assert.match(collector, /window\.location\.pathname/);
assert.match(collector, /sessionStorage\.getItem\(SESSION_KEY\)/);
assert.match(collector, /session_start: sessionStart/);
assert.doesNotMatch(collector, /window\.location\.search|document\.referrer|email|phone/);

assert.match(dashboard, /robots="noindex,nofollow"/);
assert.match(dashboard, /fetch\("\/api\/site-traffic"/);
assert.match(dashboard, /consented first-party traffic/i);
assert.match(dashboard, /Browser sessions · 28 days/);
assert.match(dashboard, /International Catalog \/ SEO-GEO discovery/);
assert.match(publicCounter, /\/api\/site-traffic-public/);
assert.match(publicCounter, /visitor sessions today/i);
assert.match(publicCounter, /views today/i);
assert.match(publicCounter, /visitor sessions this month/i);
assert.match(publicCounter, /views this month/i);
assert.match(publicCounter, /Updated .* UTC/);
assert.match(publicCounter, /localStaticHost/);
assert.match(publicCounter, /browser sessions are not unique people/i);
assert.doesNotMatch(publicCounter, />Live site traffic</i);
assert.match(layout, /<SiteTrafficCollector \/>/);
assert.doesNotMatch(layout, /<PublicTrafficCounter\s*\/>/, "Shared layout must not display site-wide totals as a public overlay");
assert.doesNotMatch(layout, /showPublicTrafficCounter/);

console.log("Owner site traffic counter contract OK");
