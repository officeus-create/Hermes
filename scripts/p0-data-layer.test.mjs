import assert from "node:assert/strict";
import { enrichCarrierAuthority, normalizeAuthorityIdentifier } from "../src/lib/carrier-enrichment.ts";
import { buildLogisticsLeadDraft, toAnalyticsDimensions } from "../src/lib/path-lead.ts";
import { groupDuplicateOffers, mayPublishLane, normalizeManualOffer, rankOffer } from "../src/lib/lane-intelligence.ts";

assert.deepEqual(normalizeAuthorityIdentifier("mc-123456"), { kind: "MC", number: "123456", display: "MC 123456" });
assert.deepEqual(normalizeAuthorityIdentifier("USDOT 1234567"), { kind: "USDOT", number: "1234567", display: "USDOT 1234567" });
assert.equal(normalizeAuthorityIdentifier("123456"), null);

const calls = [];
const enrichment = await enrichCarrierAuthority("MC 123456", [
  { name: "Fallback", sourceKind: "fallback", enabled: true, async lookup() { calls.push("fallback"); return { legalName: "Fallback", updatedAt: "2026-07-29" }; } },
  { name: "FMCSA API", sourceKind: "official_api", enabled: true, async lookup() { calls.push("api"); return { legalName: "Verified Carrier", operatingStatus: "ACTIVE", updatedAt: "2026-07-29" }; } },
]);
assert.deepEqual(calls, ["api"]);
assert.equal(enrichment.quality, "verified");
assert.equal(enrichment.record?.sourceKind, "official_api");

const lead = buildLogisticsLeadDraft({
  idempotencyKey: "path_12345678",
  sessionId: "session_12345678",
  selections: { role: "fleet-owner", equipment: ["dry-van", "reefer"], "carrier-need": "fleet-growth" },
  recommendationId: "carrier-fleet-owners",
  resultRoute: "/paths/logistics/carriers/fleet-owners/",
  privacyAccepted: true,
  createdAt: "2026-07-29T12:00:00.000Z",
});
assert.equal(lead.routing.queue, "LOGISTICS_DISPATCH_ONBOARDING");
assert.deepEqual(Object.keys(toAnalyticsDimensions(lead)).sort(), ["direction", "equipmentCategory", "locale", "need", "recommendationId", "resultRoute", "role"].sort());
assert.equal(JSON.stringify(toAnalyticsDimensions(lead)).includes("session_12345678"), false);

const now = new Date("2026-07-29T12:00:00.000Z");
const offerA = normalizeManualOffer({
  provider: "Approved CSV A", providerLoadId: "A-1", equipment: "Car Hauler", cargoCategory: "Vehicles", cargoUnits: 2,
  originMarket: "Chicago, IL", destinationMarket: "Milwaukee, WI", pickupDate: "2026-07-30",
  postedRate: 620, loadedMiles: 92, deadheadMiles: 20, seenAt: "2026-07-29T11:30:00.000Z", expiresAt: "2026-07-30T12:00:00.000Z", status: "new",
});
const offerB = normalizeManualOffer({ ...offerA, provider: "Approved CSV B", providerLoadId: "B-9", postedRate: 650, seenAt: "2026-07-29T11:40:00.000Z" });
const grouped = groupDuplicateOffers([offerA, offerB]);
assert.equal(grouped.length, 1);
assert.equal(grouped[0].sources.length, 2);
const ranked = rankOffer(offerA, { now, costPerMile: 0.85, tollEstimate: 18, reloadProbability: 0.6 });
assert.equal(ranked.active, true);
assert.equal(ranked.totalMiles, 112);
assert.ok(ranked.ratePerTotalMile > 5);
assert.ok(ranked.reasons.length >= 5);
const stale = rankOffer({ ...offerA, status: "expired" }, { now, costPerMile: 0.85 });
assert.equal(stale.active, false);
assert.equal(stale.score, 0);
assert.equal(mayPublishLane("preferred", true), false);
assert.equal(mayPublishLane("observed", true), false);
assert.equal(mayPublishLane("verified", true), true);
assert.equal(mayPublishLane("published", false), false);

console.log("P0 carrier enrichment, CRM payload, and lane-intelligence checks passed.");
