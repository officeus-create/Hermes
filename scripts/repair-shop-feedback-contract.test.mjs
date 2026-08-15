import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const api = await readFile(new URL("../functions/api/repair-shop/feedback.ts", import.meta.url), "utf8");
const schema = await readFile(new URL("../functions/api/_lib/repair-shop-feedback-schema.mjs", import.meta.url), "utf8");
const dashboard = await readFile(new URL("../src/pages/services/hermes-connect/repair-shops/dashboard.astro", import.meta.url), "utf8");
assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /WHERE owner_specialist_id = \?/);
assert.match(api, /specialist\.id/);
assert.match(api, /rating < 1 \|\| rating > 5/);
assert.match(api, /message\.length < 10 \|\| message\.length > 2000/);
assert.match(schema, /retention_until <= \?/);
assert.match(dashboard, /never sent to GA4 or shown on public shop pages/);
assert.match(dashboard, /automatically deleted after 180 days/);
assert.doesNotMatch(api, /gtag|dataLayer|google-analytics/i);
console.log("Repair Shop private feedback contract passed.");
