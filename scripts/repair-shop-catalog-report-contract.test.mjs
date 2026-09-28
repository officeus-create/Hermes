import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/repair-shop/catalog-report.ts", "utf8");
assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /catalog_business_activity_daily/);
assert.match(api, /catalog_business_inquiries/);
assert.match(api, /repair_shop_bookings/);
assert.match(api, /repair-shop-crm:/);
assert.match(api, /repair-shop:/);
assert.match(api, /profile_views/);
assert.match(api, /call_clicks/);
assert.match(api, /maps_clicks/);
assert.match(api, /website_clicks/);
assert.match(api, /booking_clicks/);
assert.match(api, /inquiries_received/);
assert.match(api, /bookings_created/);
assert.doesNotMatch(api, /client_email|client_phone|contact_email|CF-Connecting-IP|User-Agent|Referer/);
console.log("Repair Shop Catalog weekly report contract OK");
