import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [carrierPage, loadBoardPage, carrierMarkets, dealerPage, repairEnhancer, repairPage] = await Promise.all([
  readFile(new URL("../src/pages/logistics/car-hauling-dispatch/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/load-board.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/data/car-hauler-geo-markets.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/logistics/dealer-vehicle-transportation/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
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
assert.match(loadBoardPage, /href="\/logistics\/car-hauler-loads\/"/, "Load Board must provide a contextual discovery link to the Carrier GEO hub");
assert.match(carrierPage, /label: "Car Hauling Load Board", href: "\/load-board\/"/, "Dispatch owner must provide a descriptive canonical Load Board anchor");
assert.match(carrierPage, /label: "Preview the Load Board Demo", href: "\/load-board\/\?role=carrier&equipment=car_hauler#available-loads"/, "Dispatch owner must preserve the filtered car-hauler demo handoff");

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
assert.match(loadBoardPage, /Car Hauler Load Board \| Review Auto Transport Loads \| Hermes/);
assert.match(loadBoardPage, /car hauling and auto transport load opportunities/);
assert.match(carrierPage, /\/load-board\/\?role=carrier/);
assert.match(carrierPage, /not Hermes office locations/);

assert.match(dealerPage, /role=dealer&request=dealer_inventory/);
assert.match(dealerPage, /\/services\/seo-for-independent-auto-dealers\//);
assert.match(dealerPage, /\/services\/local-seo\//);
assert.match(dealerPage, /\/services\/website-development\//);
assert.match(dealerPage, /not claims of local Hermes offices/);

assert.match(repairPage, /title="Auto Repair Scheduling & Shop Software \| Hermes Connect"/);
assert.match(repairPage, /Online booking & scheduling software for independent auto repair shops\./);
assert.match(repairPage, /Is Hermes Connect an auto repair CRM\?/);
assert.match(repairPage, /includes limited CRM capabilities/);
assert.match(repairPage, /not presented as a full repair-order, inventory, accounting, payroll, or payment-processing suite/);
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