import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { join } from "node:path";
import {
  customerDemandMeasurement,
  demandCtaVariants,
  evaluateDemandPublicationCandidate,
  lanePairLinkRules,
} from "../src/data/transport-demand-publication.ts";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const routeToBuiltFile = (route) => join(dist, route.slice(1), "index.html");

assert.equal(demandCtaVariants.length, 4);
assert.equal(new Set(demandCtaVariants.map((cta) => cta.id)).size, 4);
assert.deepEqual(
  demandCtaVariants.map((cta) => cta.audience).sort(),
  ["broker", "dealer", "private_customer", "shipper"],
);
for (const cta of demandCtaVariants) {
  assert.ok(cta.label.trim().length > 0);
  assert.match(cta.disclosure, /begins a manual review/i);
  assert.match(cta.disclosure, /does not create a booking/i);
  assert.match(cta.disclosure, /guarantee a carrier, capacity, rate/i);
  await access(routeToBuiltFile(cta.destination));
}

assert.equal(lanePairLinkRules.length, 1);
const laneRule = lanePairLinkRules[0];
assert.ok(laneRule.requiredSharedEvidence.length >= 5);
assert.ok(laneRule.requiredLinks.length >= 6);
assert.ok(laneRule.prohibitedInterpretations.some((item) => /link proves live capacity/i.test(item)));
assert.ok(laneRule.prohibitedInterpretations.some((item) => /link proves current demand/i.test(item)));

assert.deepEqual(customerDemandMeasurement.ga4Events, ["logistics_cta_click", "contact_click"]);
assert.match(customerDemandMeasurement.qualifiedDemandDefinition, /approved internal aggregate after manual review/i);
assert.match(customerDemandMeasurement.clickBoundary, /click is not a qualified transport request/i);
assert.ok(customerDemandMeasurement.cannibalizationRules.some((item) => /one preferred page/i.test(item)));
assert.ok(customerDemandMeasurement.cannibalizationRules.some((item) => /do not delete or redirect without owner approval/i.test(item)));

for (const prohibited of [
  "name",
  "phone",
  "email",
  "company",
  "exact address",
  "VIN",
  "gate code",
  "account or order number",
  "free-form message",
  "individual rate",
  "shipment document",
  "customer, broker, or carrier identity",
]) {
  assert.ok(customerDemandMeasurement.prohibitedAnalyticsData.includes(prohibited));
}

const dated = (id) => ({ sourceIds: [`fixture-${id}-source-001`], reviewedAt: "2026-07-31" });
const baseCandidate = {
  candidateId: "fixture-demand-publication-001",
  evidenceMode: "owner_approved_sanitized",
  demandIntent: "independent_dealer_transport",
  laneCandidateId: "fixture-lane-001",
  carrierCapacity: {
    ...dated("capacity"),
    status: "manually_confirmed_for_review",
    basis: "manual_capacity_confirmation",
    expiresAt: "2026-08-07",
  },
  localDemand: dated("local-demand"),
  competition: dated("competition"),
  uniqueOperationalGuidance: [
    "Explain the reviewed pickup-market access pattern.",
    "Explain the equipment fit and operability boundary.",
    "Explain the timing and release-information review process.",
  ],
  carrierPagePath: "/logistics/car-hauling-dispatch/",
  demandPagePath: "/logistics/dealer-vehicle-transportation/",
  usefulCtaId: "dealer-demand-review",
  privacyReviewed: true,
  claimsReviewed: true,
};

const eligible = evaluateDemandPublicationCandidate(baseCandidate);
assert.equal(eligible.status, "eligible_for_editorial_review");
assert.deepEqual(eligible.blockers, []);
assert.ok(eligible.limitations.some((item) => /not a public availability promise/i.test(item)));
assert.ok(eligible.limitations.some((item) => /automatically creates a page/i.test(item)));

const synthetic = evaluateDemandPublicationCandidate({
  ...baseCandidate,
  candidateId: "fixture-demand-publication-synthetic",
  evidenceMode: "synthetic",
});
assert.equal(synthetic.status, "research_only");
assert.ok(synthetic.blockers.includes("synthetic publication candidates cannot support public publication"));

const unconfirmed = evaluateDemandPublicationCandidate({
  ...baseCandidate,
  carrierCapacity: {
    ...baseCandidate.carrierCapacity,
    status: "unconfirmed",
  },
});
assert.equal(unconfirmed.status, "blocked_missing_evidence");
assert.ok(unconfirmed.blockers.includes("real carrier capacity must be manually confirmed before editorial review"));

const observedOffer = evaluateDemandPublicationCandidate({
  ...baseCandidate,
  carrierCapacity: {
    ...baseCandidate.carrierCapacity,
    basis: "current_offer_observation",
  },
});
assert.equal(observedOffer.status, "blocked_missing_evidence");
assert.ok(observedOffer.blockers.includes("current offer observations cannot confirm carrier capacity"));

const blocked = evaluateDemandPublicationCandidate({
  ...baseCandidate,
  candidateId: "",
  laneCandidateId: "",
  carrierCapacity: {
    sourceIds: [],
    reviewedAt: "31-07-2026",
    status: "research_only",
    basis: "completed_history",
  },
  localDemand: { sourceIds: [], reviewedAt: "" },
  competition: { sourceIds: [], reviewedAt: "not-a-date" },
  uniqueOperationalGuidance: ["Only one generic point"],
  carrierPagePath: "",
  demandPagePath: "",
  usefulCtaId: "unknown-cta",
  privacyReviewed: false,
  claimsReviewed: false,
});
assert.equal(blocked.status, "blocked_missing_evidence");
for (const expected of [
  "candidateId is required",
  "lane candidate reference is required",
  "carrier page path is required",
  "demand page path is required",
  "approved demand CTA is required",
  "carrier capacity provenance is required",
  "carrier capacity reviewedAt must use a valid YYYY-MM-DD date",
  "local demand provenance is required",
  "local demand reviewedAt must use a valid YYYY-MM-DD date",
  "competition provenance is required",
  "competition reviewedAt must use a valid YYYY-MM-DD date",
  "real carrier capacity must be manually confirmed before editorial review",
  "manual capacity confirmation requires a valid expiry date",
  "at least three unique operational guidance points are required",
  "privacy review is required",
  "claims review is required",
]) {
  assert.ok(blocked.blockers.includes(expected), `missing blocker: ${expected}`);
}

for (const result of [eligible, synthetic, unconfirmed, observedOffer, blocked]) {
  assert.notEqual(result.status, "published");
  assert.notEqual(result.status, "booked");
  assert.notEqual(result.status, "live_capacity");
}

console.log("transport-demand publication tests passed: capacity, dated demand/competition, unique guidance, CTAs, links, analytics privacy, and no automatic publication.");
