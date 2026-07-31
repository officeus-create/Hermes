import assert from "node:assert/strict";
import {
  canPublishCarrierRecord,
  canPublishDemandRecord,
  canPublishInternationalMarketingRecord,
  canPublishWebsiteSeoRecord,
  carrierPageResearchRecords,
  dealerShipperDemandRecords,
  internationalMarketingMarketRecords,
  sourceReferences,
  websiteSeoMarketResearchRecords,
} from "../src/data/growth-research-registry.ts";

assert.deepEqual(sourceReferences, []);
assert.deepEqual(carrierPageResearchRecords, []);
assert.deepEqual(dealerShipperDemandRecords, []);
assert.deepEqual(websiteSeoMarketResearchRecords, []);
assert.deepEqual(internationalMarketingMarketRecords, []);

const strong = {
  strength: "strong",
  summary: "Verified evidence",
  sourceIds: ["source-1"],
};

const weak = {
  strength: "weak",
  summary: "Unverified hypothesis",
  sourceIds: [],
};

const carrierBase = {
  id: "carrier-record-1",
  laneId: "lane-1",
  origin: { city: "Origin", state: "AA" },
  destination: { city: "Destination", state: "BB" },
  equipment: "open_car_hauler",
  audience: "owner_operator",
  language: "en",
  routeEvidence: strong,
  demandEvidence: strong,
  competitionEvidence: strong,
  serviceFitEvidence: strong,
  uniqueLocalValue: ["Verified lane-specific value"],
  sourceIds: ["source-1"],
  reviewStatus: "approved",
  publicationStatus: "approved_for_publish",
};

assert.equal(canPublishCarrierRecord(carrierBase), true);
assert.equal(canPublishCarrierRecord({ ...carrierBase, routeEvidence: weak }), false);
assert.equal(canPublishCarrierRecord({ ...carrierBase, uniqueLocalValue: [] }), false);
assert.equal(canPublishCarrierRecord({ ...carrierBase, publicationStatus: "research_only" }), false);

const demandBase = {
  id: "demand-record-1",
  linkedLaneIds: ["lane-1"],
  market: { city: "Market", state: "AA" },
  audience: "independent_dealer",
  demandType: "dealer_transfer",
  demandEvidence: strong,
  carrierCapacityEvidence: strong,
  competitionEvidence: strong,
  operationalFitEvidence: strong,
  sourceIds: ["source-1"],
  reviewStatus: "approved",
  publicationStatus: "approved_for_publish",
};

assert.equal(canPublishDemandRecord(demandBase), true);
assert.equal(canPublishDemandRecord({ ...demandBase, linkedLaneIds: [] }), false);
assert.equal(canPublishDemandRecord({ ...demandBase, carrierCapacityEvidence: weak }), false);

const websiteBase = {
  id: "website-record-1",
  country: "US",
  market: { city: "Market", state: "AA" },
  niche: "logistics",
  service: "website_creation",
  demandEvidence: strong,
  competitionEvidence: strong,
  serviceFitEvidence: strong,
  proofAvailable: ["Approved prototype"],
  sourceIds: ["source-1"],
  reviewStatus: "approved",
  publicationStatus: "approved_for_publish",
};

assert.equal(canPublishWebsiteSeoRecord(websiteBase), true);
assert.equal(canPublishWebsiteSeoRecord({ ...websiteBase, proofAvailable: [] }), false);
assert.equal(canPublishWebsiteSeoRecord({ ...websiteBase, competitionEvidence: weak }), false);

const marketingBase = {
  id: "marketing-record-1",
  countryCode: "XX",
  city: "City",
  language: "ru",
  audienceNeed: "seo",
  languageDemandEvidence: strong,
  commercialDemandEvidence: strong,
  competitionEvidence: strong,
  paymentEligibilityEvidence: strong,
  complianceEvidence: strong,
  serviceCapacityEvidence: strong,
  sourceIds: ["source-1"],
  reviewStatus: "approved",
  publicationStatus: "approved_for_publish",
};

assert.equal(canPublishInternationalMarketingRecord(marketingBase), true);
assert.equal(
  canPublishInternationalMarketingRecord({ ...marketingBase, complianceEvidence: weak }),
  false,
);
assert.equal(
  canPublishInternationalMarketingRecord({ ...marketingBase, languageDemandEvidence: weak }),
  false,
);

console.log("growth-research-registry tests passed");
