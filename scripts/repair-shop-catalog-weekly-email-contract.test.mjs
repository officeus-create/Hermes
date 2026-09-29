import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const endpoint = readFileSync("functions/api/internal/reports/catalog-weekly.ts", "utf8");
const workflow = readFileSync(".github/workflows/hermes-connect-weekly-inactivity-reminders.yml", "utf8");
const worker = readFileSync("workers/lead-email/src/index.mjs", "utf8");
const schema = readFileSync("functions/api/_lib/repair-shop-schema.mjs", "utf8");

assert.match(endpoint, /verifyGitHubReminderOidcToken/);
assert.match(endpoint, /catalog_opt_in = 1/);
assert.match(endpoint, /s\.role = 'Shop Owner'/);
assert.match(endpoint, /COALESCE\(e\.email_enabled, 1\) = 1/);
assert.match(endpoint, /catalog_business_activity_daily/);
assert.match(endpoint, /catalog_business_inquiries/);
assert.match(endpoint, /repair_shop_bookings/);
assert.match(endpoint, /booking_click/);
assert.match(endpoint, /Clicks show user activity and are not presented as confirmed customers/);
assert.match(endpoint, /next_catalog_report_at/);
assert.match(endpoint, /last_catalog_report_sent_at/);
assert.match(endpoint, /new Date\(now\.getTime\(\) \+ 7 \* DAY_MS\)/);
assert.match(endpoint, /RETRY_MS/);
assert.match(endpoint, /\[HERMES ACCOUNT\] \[CATALOG WEEKLY REPORT\]/);
assert.doesNotMatch(endpoint, /CF-Connecting-IP|X-Forwarded-For|User-Agent|Referer/);

assert.match(workflow, /CATALOG_REPORT_URL/);
assert.match(workflow, /\/api\/internal\/reports\/catalog-weekly/);
assert.match(workflow, /Authorization: Bearer \$\{OIDC_TOKEN\}/);

assert.match(worker, /\[HERMES ACCOUNT\] \[CATALOG WEEKLY REPORT\]/);
assert.match(worker, /Your Hermes Connect shop is waiting for you/);
assert.match(schema, /next_catalog_report_at/);
assert.match(schema, /last_catalog_report_sent_at/);

console.log("Repair Shop Catalog weekly email contract OK");
