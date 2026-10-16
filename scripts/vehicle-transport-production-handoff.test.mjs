import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const source = await readFile(new URL("../src/components/VehicleTransportRequestEnhancer.astro", import.meta.url), "utf8");

assert.doesNotMatch(source, /canonicalProductionHost/);
assert.doesNotMatch(source, /form\.dataset\.leadMode\s*=\s*"live"/);
assert.match(source, /declaredLive = form\.dataset\.leadMode === "live"/);
assert.match(source, /endpoint\.pathname === "\/api\/logistics-lead"/);
assert.match(source, /form\.dataset\.leadMode = configuredLive \? "live" : "preview"/);
assert.match(source, /endpoint\.origin !== window\.location\.origin/);
assert.match(source, /"Idempotency-Key": requestId/);
assert.match(source, /event: "vehicle_transport_submitted"/);
assert.doesNotMatch(source, /event: "vehicle_transport_delivery_confirmed"/);
assert.match(source, /requireSubmittedReceipt\(response, requestId\)/);
assert.match(source, /data-transport-mode-note/);
assert.match(source, /Delivery was not confirmed/);

console.log("Vehicle transport production handoff contract: PASS");
execFileSync(process.execPath, ["--experimental-strip-types", "scripts/logistics-submission-receipt.test.mjs"], { stdio: "inherit" });
