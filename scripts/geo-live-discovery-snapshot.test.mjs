import assert from "node:assert/strict";
import {
  auditDiscoveryHierarchy,
  auditDiscoveryJourneys,
  rankGeoLinkOpportunities,
} from "../src/data/geo-discovery-graph-operations.ts";
import {
  geoLiveDiscoveryEvidence,
  geoLiveDiscoveryKnownSemanticGaps,
  geoLiveDiscoverySnapshot,
  geoLivePriorityOwners,
} from "../src/data/geo-live-discovery-snapshot.ts";

assert.ok(geoLiveDiscoveryEvidence.length >= 9);
assert.equal(new Set(geoLiveDiscoverySnapshot.map((node) => node.path)).size, geoLiveDiscoverySnapshot.length);

const journeys = auditDiscoveryJourneys(geoLiveDiscoverySnapshot, [...geoLivePriorityOwners], 2);
assert.equal(journeys.ready, true);
assert.deepEqual(journeys.deadEnds, []);
assert.deepEqual(journeys.excessiveDepth, []);
assert.deepEqual(journeys.transactionalDemoLeaks, []);
assert.deepEqual(journeys.authorityEdgeGaps, []);

const hierarchy = auditDiscoveryHierarchy(geoLiveDiscoverySnapshot);
assert.equal(hierarchy.ready, true);
assert.deepEqual(hierarchy.issues, []);

const marketing = geoLiveDiscoverySnapshot.find((node) => node.path === "/paths/marketing/");
assert.equal(marketing?.kind, "hub");
assert.equal(marketing?.hasIntake, true, "Marketing direction page is modeled as one URL that also owns the real intake section");

const carOwner = geoLiveDiscoverySnapshot.find((node) => node.path === "/logistics/car-hauling-dispatch/");
assert.ok(carOwner);
assert.ok(carOwner.links.includes("/logistics/start-car-hauling-dispatch/"));
assert.ok(!carOwner.links.includes("/logistics/resources/broker-setup-packet-checklist/"));
assert.ok(!carOwner.links.includes("/logistics/resources/new-authority-car-hauler-readiness-checklist/"));
assert.equal(geoLiveDiscoveryKnownSemanticGaps.length, 2);
assert.ok(geoLiveDiscoveryKnownSemanticGaps.every((gap) => gap.canonicalOwner === "/logistics/car-hauling-dispatch/"));

const brokerResource = geoLiveDiscoverySnapshot.find((node) => node.path === "/logistics/resources/broker-setup-packet-checklist/");
const readinessResource = geoLiveDiscoverySnapshot.find((node) => node.path === "/logistics/resources/new-authority-car-hauler-readiness-checklist/");
assert.ok(brokerResource?.links.includes("/logistics/car-hauling-dispatch/"));
assert.ok(readinessResource?.links.includes("/logistics/car-hauling-dispatch/"));

const seoHub = geoLiveDiscoverySnapshot.find((node) => node.path === "/services/seo/");
const seoOwner = geoLiveDiscoverySnapshot.find((node) => node.path === "/services/seo-for-logistics-companies/");
assert.ok(seoHub?.links.includes("/services/seo-for-logistics-companies/"));
assert.ok(seoOwner?.links.includes("/paths/marketing/"));

const opportunities = rankGeoLinkOpportunities(geoLiveDiscoveryKnownSemanticGaps.map((gap) => ({
  from: gap.canonicalOwner,
  to: gap.missingDirectRelatedOwner,
  evidenceClass: "repository_verified",
  searchImpressions: 20,
  commercialPriority: "high",
  evidenceGapSeverity: "medium",
  reason: "Existing reviewed resource already links back to the car-hauling commercial owner; add the reciprocal owner-side semantic edge only if it remains a bounded non-material navigation change.",
})));
assert.equal(opportunities.length, 2);
assert.ok(opportunities.every((item) => item.rankingLiftClaimAllowed === false));
assert.ok(opportunities.every((item) => item.priorityScore > 0));

console.log("GEO source-backed live discovery snapshot passed");
