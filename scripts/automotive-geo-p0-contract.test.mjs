import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [carrierPage, loadBoardPage, carrierMarkets, carrierGeoPage, dealerPage, repairEnhancer, repairPage] = await Promise.all([
  readFile(new URL("../src/pages/logistics/car-hauling-dispatch/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/load-board.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/data/car-hauler-geo-markets.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/components/CarHaulerGeoPage.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/logistics/dealer-vehicle-transportation/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
]);

// Preserve the existing 25 market URLs as a published research library while the
// current carrier-acquisition priority is driven by fresh operating evidence. Do not
// delete/noindex the legacy market set blindly, and do not turn it back into today's
// business-priority claim.
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
assert.match(carrierPage, /Current operating-market priority/);
assert.match(carrierPage, /Western \/ Upstate New York/);
assert.match(carrierPage, /Rochester, Buffalo, Le Roy, Akron/);
assert.match(carrierPage, /Atlanta \/ North Georgia/);
assert.match(carrierPage, /existing 25 market pages remain a published research library/i);
assert.doesNotMatch(carrierPage, /current 25-market GEO launch|25-market carrier GEO launch/);
assert.match(carrierPage, /\/logistics\/car-hauler-loads\//);
assert.match(loadBoardPage, /href="\/logistics\/car-hauler-loads\/"/, "Load Board must provide a contextual discovery link to the Carrier GEO hub");
assert.match(carrierGeoPage, /data-carrier-geo-related-markets/, "market owners must cross-link useful nearby published markets");
assert.match(carrierGeoPage, /carHaulerGeoMarkets/, "related market links must resolve from the canonical registry");
assert.match(carrierPage, /label: "Car Hauling Load Board", href: "\/load-board\/"/, "Dispatch owner must provide a descriptive canonical Load Board anchor");
assert.match(carrierPage, /label: "Open the Car Hauling Load Board", href: "\/load-board\/\?role=carrier&equipment=car_hauler#available-loads"/, "Dispatch owner must preserve the filtered car-hauler Load Board handoff without demo-only labeling");


const evidenceWave1Slugs = [
  "denver-co",
  "colorado-springs-co",
  "seattle-wa",
  "kansas-city-mo-ks",
  "chicago-il",
];
const marketBlock = (slug) => {
  const start = carrierMarkets.indexOf(`slug: "${slug}"`);
  assert.ok(start >= 0, `evidence wave market must exist: ${slug}`);
  const next = carrierMarkets.indexOf("\n  {\n    slug:", start + 1);
  return carrierMarkets.slice(start, next >= 0 ? next : carrierMarkets.indexOf("\n];", start));
};
for (const slug of evidenceWave1Slugs) {
  const block = marketBlock(slug);
  assert.match(block, /localOperatingNotes:\s*\[/, `${slug} must publish distinct local operating notes`);
  assert.match(block, /officialSources:\s*\[/, `${slug} must publish source-backed local evidence`);
  assert.ok((block.match(/\{ label:/g) ?? []).length >= 2, `${slug} must carry at least two public source links`);
  assert.doesNotMatch(block, /@[a-z0-9.-]+\.[a-z]{2,}/i, `${slug} must not leak an email from private operations evidence`);
  assert.doesNotMatch(block, /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/, `${slug} must not leak a phone number from private operations evidence`);
  assert.doesNotMatch(block, /\b(?:VIN|MC#|USDOT|customer name|cell#)\b/i, `${slug} must not expose private operations identifiers`);
  assert.match(
    block,
    /(not public live inventory|not exposed as live load inventory|current availability|live availability remain private|does not represent today's inventory)/i,
    `${slug} must explicitly separate historical/local evidence from current load availability`,
  );
}
assert.match(carrierMarkets, /CDOT — I-270 freight-corridor decision, Sept\. 2026/);
assert.match(carrierMarkets, /WSDOT — Central Puget Sound I-405 freight corridor/);
assert.match(carrierMarkets, /MoDOT — Kansas City District Freight Plan/);
assert.match(carrierMarkets, /CMAP — Chicago-region freight and rail network/);

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
assert.match(loadBoardPage, /Car Hauler Load Board \| Search Auto Transport Loads \| Hermes/);
assert.match(loadBoardPage, /car hauling and auto transport load opportunities/);
assert.match(carrierPage, /\/load-board\/\?role=carrier/);
assert.match(carrierPage, /local Hermes offices|Hermes office locations/);

assert.match(dealerPage, /role=dealer&request=dealer_inventory/);
assert.match(dealerPage, /\/services\/seo-for-independent-auto-dealers\//);
assert.match(dealerPage, /\/services\/local-seo\//);
assert.match(dealerPage, /\/services\/website-development\//);
assert.match(dealerPage, /not claims of local Hermes offices/);

assert.match(repairPage, /title="Auto Repair Shop Software & Scheduling \| Hermes Connect"/);
assert.match(repairPage, /Auto repair shop software for bookings, customers, and availability\./);
assert.match(repairPage, /Is Hermes Connect an auto repair CRM\?/);
assert.match(repairPage, /includes limited CRM capabilities/);
assert.match(repairPage, /not presented as a full repair-order, inventory, accounting, payroll, or payment-processing suite/);
assert.match(repairEnhancer, /Arkansas First-5 pilot/);
assert.match(repairEnhancer, /intentionally separate from the car-hauling automotive GEO markets/);
assert.match(repairEnhancer, /\/services\/hermes-connect\/repair-shops\/auth\//);
assert.match(repairEnhancer, /\/services\/local-seo\//);
assert.match(repairEnhancer, /\/services\/auto-repair-website-design\//);
assert.match(repairEnhancer, /\/services\/seo-for-auto-repair-shops\//);
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
