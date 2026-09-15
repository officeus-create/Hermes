import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/components/VehicleTransportRequestEnhancer.astro", import.meta.url), "utf8");

assert.match(source, /window\.location\.protocol === "https:" && window\.location\.hostname === "hermeslogisticsus\.com"/);
assert.match(source, /form\.dataset\.leadMode = "live"/);
assert.match(source, /form\.dataset\.leadEndpoint = "\/api\/logistics-lead"/);
assert.match(source, /endpoint\.origin !== window\.location\.origin/);
assert.match(source, /"Idempotency-Key": requestId/);
assert.match(source, /event: "vehicle_transport_delivery_confirmed"/);
assert.match(source, /Delivery was not confirmed/);

console.log("Vehicle transport production handoff contract: PASS");
