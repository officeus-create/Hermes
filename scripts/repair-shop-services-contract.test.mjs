import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/services/index.ts", "utf8");
const deleteApi = readFileSync("functions/api/services/[id].ts", "utf8");
const page = readFileSync("src/pages/services/hermes-connect/repair-shops/services.astro", "utf8");
const nav = readFileSync("src/components/RepairShopOwnerNavEnhancer.astro", "utf8");

assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /resolveServiceRequestContext/);
assert.match(api, /listServicesForContext/);
assert.match(api, /createServiceForContext/);
assert.match(api, /findDuplicateServiceForContext/);
assert.match(api, /durationMinutes < 5 \|\| durationMinutes > 720/);
assert.doesNotMatch(api, /CREATE TABLE/i, "Services workspace must reuse existing service storage");
assert.match(deleteApi, /getAuthenticatedSpecialist/);
assert.match(deleteApi, /serviceHasUsageForContext/);
assert.match(deleteApi, /service_has_bookings/);
assert.doesNotMatch(deleteApi, /onRequestPut|onRequestPatch/, "Do not expose fake edit semantics without a backend contract");

assert.match(page, /robots="noindex,nofollow"/);
assert.match(page, /requestJson\("\/api\/services"/);
assert.match(page, /method:"POST"/);
assert.match(page, /method:"DELETE"/);
assert.match(page, /service_has_bookings/);
assert.match(page, /servicesTitle:"Services"/);
assert.match(page, /servicesTitle:"Услуги"/);
assert.doesNotMatch(page, /method:"PATCH"|method:"PUT"/, "UI must match the current API truth");

assert.match(nav, /repairShopRoot\}\/services/);
assert.match(nav, /services:"Services"/);
assert.match(nav, /services:"Услуги"/);
assert.match(nav, /href:withLocale\(`\$\{repairShopRoot\}\/services\/`\)/);

console.log("Repair Shop Services contract OK");
