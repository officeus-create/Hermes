import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/catalog/activity.ts", "utf8");
const tracker = readFileSync("public/catalog-business-activity.js", "utf8");
const staticConcept = readFileSync("src/components/CatalogWebsiteConcept.astro", "utf8");
const dynamicProfile = readFileSync("functions/businesses/connect/repair-shop/[slug].ts", "utf8");

assert.match(api, /catalog_business_activity_daily/);
assert.match(api, /PRIMARY KEY\(day, business_id, action\)/);
assert.match(api, /analytics_consent !== true/);
assert.match(api, /profile_view/);
assert.match(api, /call_click/);
assert.match(api, /maps_click/);
assert.match(api, /website_click/);
assert.doesNotMatch(api, /CF-Connecting-IP|X-Forwarded-For|User-Agent|Referer|email|phone/);
assert.match(tracker, /hermes-analytics-consent/);
assert.match(tracker, /data-catalog-action/);
assert.doesNotMatch(tracker, /location\.search|document\.referrer|navigator\.userAgent/);
assert.match(staticConcept, /data-catalog-business-id/);
assert.match(staticConcept, /catalog-business-activity\.js/);
assert.match(dynamicProfile, /data-catalog-business-id/);
assert.match(dynamicProfile, /catalog-business-activity\.js/);
console.log("Catalog business activity privacy/telemetry contract OK");
