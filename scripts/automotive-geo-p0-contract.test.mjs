import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [carrierPage, dealerPage, repairEnhancer] = await Promise.all([
  readFile(new URL("../src/pages/logistics/car-hauling-dispatch/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/logistics/dealer-vehicle-transportation/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
]);

const p0Markets = [
  "South Florida / Miami",
  "Atlanta",
  "Orlando / Central Florida",
  "Chicago",
];

for (const market of p0Markets) {
  assert.match(carrierPage, new RegExp(market.replaceAll("/", "\\/")), `carrier owner must include ${market}`);
  assert.match(dealerPage, new RegExp(market.replaceAll("/", "\\/")), `dealer owner must include ${market}`);
  assert.match(repairEnhancer, new RegExp(market.replaceAll("/", "\\/")), `repair owner must include ${market}`);
}

assert.match(carrierPage, /\/logistics\/start-car-hauling-dispatch\//);
assert.match(carrierPage, /\/load-board\/\?role=carrier/);
assert.match(carrierPage, /not Hermes office locations/);

assert.match(dealerPage, /role=dealer&request=dealer_inventory/);
assert.match(dealerPage, /\/services\/seo-for-independent-auto-dealers\//);
assert.match(dealerPage, /\/services\/local-seo\//);
assert.match(dealerPage, /\/services\/website-development\//);
assert.match(dealerPage, /not claims of local Hermes offices/);

assert.match(repairEnhancer, /\/services\/hermes-connect\/repair-shops\/auth\//);
assert.match(repairEnhancer, /\/services\/local-seo\//);
assert.match(repairEnhancer, /\/services\/website-development\//);
assert.match(repairEnhancer, /\/services\/seo\//);
assert.match(repairEnhancer, /independent auto repair/);
assert.match(repairEnhancer, /truck \/ diesel repair/);
assert.match(repairEnhancer, /mobile mechanics/);
assert.match(repairEnhancer, /tire service/);
assert.match(repairEnhancer, /body \/ collision/);

const combined = `${carrierPage}\n${dealerPage}\n${repairEnhancer}`;
assert.doesNotMatch(combined, /href="\/(miami|atlanta|orlando|chicago)-/i, "P0 must not create doorway-style city URLs");

console.log("automotive GEO P0 owner contract: OK");