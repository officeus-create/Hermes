import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  analyzeSearchRadarRows,
  classifySearchOpportunity,
  findApprovedOwner,
  parseSearchRadarCsv,
  searchRadarContract,
} from "../public/demos/hermes-connect/search-opportunity-radar/radar.mjs";

const csv = `query,page,clicks,impressions,ctr,position,date_range,country_bucket,device_bucket
seo for logistics companies,/services/seo-for-logistics-companies/,0,47,0%,64.83,7d,USA,desktop
hermes connect,/services/hermes-connect/,1,22,4.5%,13.55,7d,USA,desktop
auction vehicle pickup checklist,/logistics/resources/auction-vehicle-pickup-checklist/,1,18,5.6%,14.07,7d,USA,mobile
car hauler capacity checklist,/logistics/resources/car-hauler-capacity-checklist/,1,20,5%,9.9,7d,USA,desktop
car hauler load board,/load-board/,0,15,0%,21.4,7d,USA,desktop
appleton vehicle transport,/logistics/appleton-wi-vehicle-transport/,0,30,0%,18.2,7d,USA,mobile
appleton warehousing services,/logistics/appleton-wi-vehicle-transport/,0,9,0%,38,7d,USA,desktop
seo services,/services/seo/,0,10,0.5%,8,7d,USA,desktop`;

const rows = parseSearchRadarCsv(csv);
assert.equal(rows.length, 8, "Radar must parse all sanitized rows");
assert.equal(rows[0].page, "/services/seo-for-logistics-companies/");
assert.equal(rows[0].ctr, 0, "0% CTR must normalize to decimal zero");
assert.equal(rows[7].ctr, 0.005, "percent-form CTR must normalize to decimal form");

assert.equal(findApprovedOwner("seo for logistics companies")?.owner, "/services/seo-for-logistics-companies/");
assert.equal(findApprovedOwner("trucking seo company")?.owner, "/services/seo-for-logistics-companies/");
assert.equal(findApprovedOwner("Hermes Connect")?.owner, "/services/hermes-connect/");
assert.equal(findApprovedOwner("auction vehicle pickup checklist")?.owner, "/logistics/resources/auction-vehicle-pickup-checklist/");
assert.equal(findApprovedOwner("car hauler capacity checklist")?.owner, "/logistics/resources/car-hauler-capacity-checklist/");
assert.equal(findApprovedOwner("car hauler load board")?.owner, "/load-board/");
assert.equal(findApprovedOwner("appleton vehicle transport")?.owner, "/logistics/appleton-wi-vehicle-transport/");
assert.equal(findApprovedOwner("appleton warehousing services")?.supported, false);
assert.equal(findApprovedOwner("seo services")?.owner, "/services/seo/");

const analyzed = analyzeSearchRadarRows(rows);
const byQuery = new Map(analyzed.map((row) => [row.query, row]));

assert.equal(
  byQuery.get("seo for logistics companies")?.analysis.primaryClass,
  "POSITION_OPPORTUNITY",
  "Commercial logistics SEO impressions should strengthen the existing niche owner before page expansion",
);
assert.equal(
  byQuery.get("hermes connect")?.analysis.primaryClass,
  "POSITION_OPPORTUNITY",
  "Near-page-one Hermes Connect visibility should preserve and strengthen the product hub owner",
);
assert.equal(
  byQuery.get("auction vehicle pickup checklist")?.analysis.primaryClass,
  "POSITION_OPPORTUNITY",
  "Auction checklist visibility should preserve the proven resource owner",
);
assert.equal(
  byQuery.get("car hauler capacity checklist")?.analysis.primaryClass,
  "KEEP_OWNER",
  "A resource owner already on page one with non-low CTR should remain stable",
);
assert.equal(
  byQuery.get("car hauler load board")?.analysis.primaryClass,
  "POSITION_OPPORTUNITY",
  "Near-page-two Load Board demand should be treated as a position opportunity",
);
assert.equal(
  byQuery.get("appleton vehicle transport")?.analysis.primaryClass,
  "POSITION_OPPORTUNITY",
  "Appleton vehicle transport should preserve its approved owner",
);
assert.equal(
  byQuery.get("appleton warehousing services")?.analysis.primaryClass,
  "INTENT_MISMATCH",
  "Unsupported Appleton warehousing demand must be held as an intent mismatch",
);
assert.ok(
  byQuery.get("appleton warehousing services")?.analysis.secondaryClasses.includes("NEW_PAGE_NOT_JUSTIFIED"),
  "Unsupported service visibility must not authorize a new page",
);
assert.equal(
  byQuery.get("seo services")?.analysis.primaryClass,
  "CTR_PROBLEM",
  "Near-page-one generic SEO with low CTR should trigger a CTR review",
);

const wrongOwner = classifySearchOpportunity({
  query: "logistics seo agency",
  page: "/services/seo/",
  clicks: 0,
  impressions: 20,
  ctr: 0,
  position: 42,
});
assert.equal(wrongOwner.primaryClass, "INTENT_MISMATCH");
assert.equal(wrongOwner.expectedOwner, "/services/seo-for-logistics-companies/");
assert.ok(wrongOwner.secondaryClasses.includes("INTERNAL_LINK_GAP"));

const wrongConnectOwner = classifySearchOpportunity({
  query: "Hermes Connect",
  page: "/services/hermes-connect/repair-shops/",
  clicks: 0,
  impressions: 12,
  ctr: 0,
  position: 18,
});
assert.equal(wrongConnectOwner.primaryClass, "INTENT_MISMATCH");
assert.equal(wrongConnectOwner.expectedOwner, "/services/hermes-connect/");
assert.ok(wrongConnectOwner.secondaryClasses.includes("INTERNAL_LINK_GAP"));

const unknown = classifySearchOpportunity({
  query: "unmapped synthetic search phrase",
  page: "/",
  clicks: 0,
  impressions: 4,
  ctr: 0,
  position: 70,
});
assert.equal(unknown.primaryClass, "LOW_PRIORITY");
assert.equal(unknown.expectedOwner, null);
assert.match(unknown.nextAction, /do not auto-create a page/i);

for (const badCsv of [
  `query,page,clicks,impressions,ctr,position,email\nseo services,/services/seo/,0,10,0%,8,test@example.com`,
  `query,page,clicks,impressions,ctr,position,property_id\nseo services,/services/seo/,0,10,0%,8,secret-property`,
  `query,page,clicks,impressions,ctr,position,route\nseo services,/services/seo/,0,10,0%,8,Chicago-Nashville`,
]) {
  assert.throws(() => parseSearchRadarCsv(badCsv), /Private or prohibited column/i);
}
assert.throws(
  () => parseSearchRadarCsv(`query,page,clicks,impressions,ctr\nseo services,/services/seo/,0,10,0%`),
  /Missing required column: position/,
);
assert.throws(
  () => parseSearchRadarCsv(`query,page,clicks,impressions,ctr,position,unexpected\nseo services,/services/seo/,0,10,0%,8,x`),
  /Unsupported column: unexpected/,
);

assert.deepEqual(
  searchRadarContract.requiredHeaders,
  ["query", "page", "clicks", "impressions", "ctr", "position"],
  "Required aggregate input contract changed unexpectedly",
);
for (const ownerRule of ["hermes_connect", "auction_vehicle_pickup_checklist", "car_hauler_capacity_checklist"]) {
  assert.ok(searchRadarContract.approvedOwnerRuleIds.includes(ownerRule), `Missing approved owner rule: ${ownerRule}`);
}
assert.ok(searchRadarContract.classes.includes("NEW_PAGE_NOT_JUSTIFIED"));
assert.ok(searchRadarContract.classes.includes("POSITION_OPPORTUNITY"));

const [pageSource, appSource] = await Promise.all([
  readFile(new URL("../public/demos/hermes-connect/search-opportunity-radar/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/search-opportunity-radar/app.mjs", import.meta.url), "utf8"),
]);
assert.match(pageSource, /<meta name="robots" content="noindex,nofollow">/, "Radar must remain noindex during the MVP");
assert.match(pageSource, /It does not manufacture pages/i, "Radar must expose the no-auto-publish boundary");
assert.match(pageSource, /Browser only/i, "Radar must expose its local-only boundary");
assert.match(appSource, /search_radar_start/);
assert.match(appSource, /search_radar_import_complete/);
assert.match(appSource, /search_radar_classification_view/);
assert.match(appSource, /search_radar_action_selected/);
assert.doesNotMatch(appSource, /\bfetch\s*\(/, "Radar must not upload sanitized query/page rows in Release A");

console.log("Hermes Connect Search Opportunity Radar contract checks passed.");
