import assert from "node:assert/strict";
import { evaluateLaneOpportunity } from "../src/data/lane-opportunity.ts";

const base = {
  origin: { city: "Verified Origin", state: "WI" },
  destination: { city: "Verified Destination", state: "IL" },
  equipment: ["open car hauler"],
  languages: ["en"],
  evidence: {
    sourceIds: ["internal-route-export-row-1"],
    reviewedAt: "2026-07-31",
    routeEvidence: 2,
    competitionEvidence: 1,
    serviceFit: 2,
    uniqueLocalValue: 1,
    crawlablePathAndCta: 1,
    approvedSource: 1,
  },
};

const eligible = evaluateLaneOpportunity(base);
assert.equal(eligible.score, 8);
assert.equal(eligible.threshold, 7);
assert.equal(eligible.status, "eligible_for_editorial_review");
assert.deepEqual(eligible.blockers, []);

const researchOnly = evaluateLaneOpportunity({
  ...base,
  evidence: {
    ...base.evidence,
    routeEvidence: 1,
    competitionEvidence: 1,
    serviceFit: 1,
    uniqueLocalValue: 1,
    crawlablePathAndCta: 1,
    approvedSource: 1,
  },
});
assert.equal(researchOnly.score, 6);
assert.equal(researchOnly.status, "research_only");
assert.match(researchOnly.blockers[0], /below 7\/10/);

const blocked = evaluateLaneOpportunity({
  ...base,
  evidence: {
    ...base.evidence,
    sourceIds: [],
    reviewedAt: "31-07-2026",
  },
});
assert.equal(blocked.status, "blocked_missing_source");
assert.ok(blocked.blockers.includes("no evidence source is attached"));
assert.ok(blocked.blockers.includes("reviewedAt must use YYYY-MM-DD"));

const incomplete = evaluateLaneOpportunity({
  ...base,
  origin: { city: "", state: "" },
  equipment: [],
});
assert.equal(incomplete.status, "blocked_missing_source");
assert.ok(incomplete.blockers.includes("origin is incomplete"));
assert.ok(incomplete.blockers.includes("equipment evidence is missing"));

console.log("lane-opportunity tests passed");
