import assert from "node:assert/strict";
import {
  auditDiscoveryHierarchy,
  auditDiscoveryJourneys,
  auditHighPriorityIntentOwnership,
  compareGeoDiscoveryGraphs,
  rankGeoLinkOpportunities,
} from "../src/data/geo-discovery-graph-operations.ts";

const healthyGraph = [
  { path: "/paths/logistics/", kind: "hub", indexable: true, links: ["/logistics/car-hauling-dispatch/"] },
  { path: "/paths/marketing/", kind: "hub", indexable: true, links: ["/services/seo-for-logistics-companies/"] },
  { path: "/logistics/car-hauling-dispatch/", kind: "commercial_owner", indexable: true, links: ["/logistics/start-car-hauling-dispatch/", "/logistics/resources/broker-setup-packet-checklist/"] },
  { path: "/services/seo-for-logistics-companies/", kind: "commercial_owner", indexable: true, links: ["/paths/marketing/?service=logistics_seo#contact", "/resources/logistics-seo-audit-sample/"] },
  { path: "/logistics/start-car-hauling-dispatch/", kind: "intake", indexable: true, links: [] },
  { path: "/paths/marketing/", kind: "intake", indexable: true, links: [] },
  { path: "/logistics/resources/broker-setup-packet-checklist/", kind: "supporting_resource", indexable: true, links: ["/logistics/car-hauling-dispatch/"] },
  { path: "/resources/logistics-seo-audit-sample/", kind: "case", indexable: true, links: ["/services/seo-for-logistics-companies/"] },
  { path: "/demos/fake-load-board/", kind: "demo", indexable: false, links: [] },
];

const owners = [
  { intentKey: "car_hauling_dispatch", canonicalOwner: "/logistics/car-hauling-dispatch/", priority: "high" },
  { intentKey: "logistics_seo", canonicalOwner: "/services/seo-for-logistics-companies/", priority: "high" },
];
assert.deepEqual(auditHighPriorityIntentOwnership(healthyGraph, owners), { ready: true, issues: [] });
const duplicateIntent = auditHighPriorityIntentOwnership(healthyGraph, [
  ...owners,
  { intentKey: "logistics_seo", canonicalOwner: "/services/seo/", priority: "high" },
]);
assert.equal(duplicateIntent.ready, false);
assert.ok(duplicateIntent.issues.some((issue) => issue.includes("logistics_seo:expected_one_owner:2")));

const journey = auditDiscoveryJourneys(healthyGraph, ["/logistics/car-hauling-dispatch/", "/services/seo-for-logistics-companies/"], 2);
assert.equal(journey.ready, true);
assert.deepEqual(journey.deadEnds, []);
assert.deepEqual(journey.excessiveDepth, []);
assert.deepEqual(journey.transactionalDemoLeaks, []);
assert.deepEqual(journey.authorityEdgeGaps, []);
assert.deepEqual(auditDiscoveryHierarchy(healthyGraph), { ready: true, issues: [] });

const brokenGraph = healthyGraph.map((node) => ({ ...node, links: [...node.links] }));
brokenGraph.find((node) => node.path === "/logistics/car-hauling-dispatch/").links = ["/demos/fake-load-board/"];
brokenGraph.find((node) => node.path === "/resources/logistics-seo-audit-sample/").links = [];
brokenGraph.find((node) => node.path === "/paths/marketing/").links = [];
const brokenJourney = auditDiscoveryJourneys(brokenGraph, ["/logistics/car-hauling-dispatch/", "/services/seo-for-logistics-companies/"], 2);
assert.equal(brokenJourney.ready, false);
assert.ok(brokenJourney.deadEnds.includes("/logistics/car-hauling-dispatch/"));
assert.ok(brokenJourney.transactionalDemoLeaks.some((edge) => edge.from === "/logistics/car-hauling-dispatch/"));
assert.ok(brokenJourney.authorityEdgeGaps.includes("/resources/logistics-seo-audit-sample/"));
assert.ok(brokenJourney.excessiveDepth.some((item) => item.owner === "/services/seo-for-logistics-companies/" && item.hub === "/paths/marketing/"));

const ranked = rankGeoLinkOpportunities([
  {
    from: "/resources/logistics-seo-audit-sample/",
    to: "/services/seo-for-logistics-companies/",
    evidenceClass: "owner_provided_handoff",
    searchImpressions: 242,
    commercialPriority: "high",
    evidenceGapSeverity: "medium",
    reason: "Support commercial owner with reviewed resource authority edge.",
  },
  {
    from: "/misc/",
    to: "/low-priority/",
    evidenceClass: "repository_verified",
    searchImpressions: 3,
    commercialPriority: "low",
    evidenceGapSeverity: "none",
    reason: "Low-signal cleanup.",
  },
]);
assert.equal(ranked[0].to, "/services/seo-for-logistics-companies/");
assert.equal(ranked[0].rankingLiftClaimAllowed, false);
assert.ok(ranked[0].priorityScore > ranked[1].priorityScore);

const comparison = compareGeoDiscoveryGraphs(brokenGraph, healthyGraph, ["/logistics/car-hauling-dispatch/", "/services/seo-for-logistics-companies/"]);
assert.ok(comparison.changes.deadEnds < 0);
assert.ok(comparison.changes.transactionalDemoLeaks < 0);
assert.ok(comparison.changes.authorityEdgeGaps < 0);
assert.equal(comparison.rankingImpact, "not_inferred");
assert.match(comparison.note, /ranking lift requires separate/i);

console.log("GEO discovery journey graph operations passed");
