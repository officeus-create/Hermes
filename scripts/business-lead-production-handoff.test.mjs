import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/components/BusinessLeadForm.astro", import.meta.url), "utf8");

assert.match(source, /new Set\(\["hermeslogisticsus\.com", "www\.hermeslogisticsus\.com"\]\)/);
assert.match(source, /window\.location\.protocol === "https:" && productionHosts\.has\(window\.location\.hostname\)/);
assert.match(source, /form\.dataset\.contactMode = "live"/);
assert.match(source, /fetch\("\/api\/business-lead"/);
assert.match(source, /"Idempotency-Key": payload\.request_id/);
assert.match(source, /if \(!response\.ok\) throw new Error\("delivery_failed"\)/);
assert.match(source, /form\.dataset\.contactMode !== "live"/);

console.log("Business lead production handoff contract: PASS");
