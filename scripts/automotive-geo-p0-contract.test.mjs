import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [carrierPage, carrierMarkets, dealerPage, repairEnhancer] = await Promise.all([
  readFile(new URL("../src/pages/logistics/car-hauling-dispatch/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/data/car-hauler-geo-markets.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/logistics/dealer-vehicle-transportation/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
]);

// Carrier GEO is now owned by the owner-approved 2026 operating-history batch:
// one hub plus exactly 25 carrier-acquisition/search markets. Do not reintroduce
// the superseded Miami/Atlanta/Orlando carrier hypothesis as a hard requirement.
const carrierMarketSlugs = [...carrierMarkets.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);
assert.equal(carrierMarketSlugs.length, 25, "carrier GEO registry must contain exactly 25 markets");
assert.equal(new Set(carrierMarketSlugs).size, 25, "carrier GEO registry slugs must be unique");
for (const requiredSlug of [
  "colorado-springs-co",
  "puyallup-wa",
  "denver-co",
  "springfield-mo",
  "kansas-city-mo-ks",
  "chicago-il",
  "fremont-ca",
]) {
  assert.ok(carrierMarketSlugs.includes(requiredSlug), `carrier GEO registry must include ${requiredSlug}`);
}
assert.match(carrierPage, /25-market carrier GEO launch/);
assert.match(carrierPage, /Colorado Front Range/);
assert.match(carrierPage, /Puget Sound/);
assert.match(carrierPage, /Missouri\/Kansas/);
assert.match(carrierPage, /Chicago-area markets/);
assert.match(carrierPage, /Fremont \/ the Bay Area/);
assert.match(carrierPage, /\/logistics\/car-hauler-loads\//);

// Dealer/shipper acquisition remains a separate owner until that funnel is
// intentionally migrated. This carrier launch must not silently rewrite it.
const dealerP0Markets = [
  "South Florida / Miami",
  "Atlanta",
  "Orlando / Central Florida",
  "Chicago",
];
for (const market of dealerP0Markets) {
  assert.match(dealerPage, new RegExp(market.replaceAll("/", "\\/")), `dealer owner must include ${market}`);
}

const repairPilotMarkets = ["Little Rock", "Fayetteville", "Fort Smith", "Jonesboro", "Conway"];
for (const market of repairPilotMarkets) {
  assert.match(repairEnhancer, new RegExp(market), `Repair First-5 owner must include ${market}`);
}

assert.match(carrierPage, /\/logistics\/start-car-hauling-dispatch\//);
assert.match(carrierPage, /\/load-board\/\?role=carrier/);
assert.match(carrierPage, /not Hermes office locations/);

assert.match(dealerPage, /role=dealer&request=dealer_inventory/);
assert.match(dealerPage, /\/services\/seo-for-independent-auto-dealers\//);
assert.match(dealerPage, /\/services\/local-seo\//);
assert.match(dealerPage, /\/services\/website-development\//);
assert.match(dealerPage, /not claims of local Hermes offices/);

assert.match(repairEnhancer, /Arkansas First-5 pilot/);
assert.match(repairEnhancer, /intentionally separate from the car-hauling automotive GEO markets/);
assert.match(repairEnhancer, /\/services\/hermes-connect\/repair-shops\/auth\//);
assert.match(repairEnhancer, /\/services\/local-seo\//);
assert.match(repairEnhancer, /\/services\/website-development\//);
assert.match(repairEnhancer, /\/services\/seo\//);
assert.match(repairEnhancer, /independent auto repair/);
assert.match(repairEnhancer, /truck \/ diesel repair/);
assert.match(repairEnhancer, /mobile mechanics/);
assert.match(repairEnhancer, /tire service/);
assert.match(repairEnhancer, /body \/ collision/);
for (const market of dealerP0Markets) {
  assert.doesNotMatch(repairEnhancer, new RegExp(market.replaceAll("/", "\\/")), `Repair First-5 must not inherit ${market}`);
}

const combined = `${carrierPage}\n${dealerPage}\n${repairEnhancer}`;
assert.doesNotMatch(combined, /href="\/(miami|atlanta|orlando|chicago|little-rock|fayetteville|fort-smith|jonesboro|conway)-/i, "legacy GEO evidence must not create old doorway-style city URLs");

console.log("automotive + Repair pilot GEO owner contract: OK");
