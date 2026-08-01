import assert from "node:assert/strict";
import { evaluateLaneOpportunity } from "../src/data/lane-opportunity.ts";

const evidence = (score, key) => ({
  score,
  sourceIds: [`fixture-${key}-001`],
  reviewedAt: "2026-07-31",
});

const base = {
  origin: { city: "Sample Origin", state: "WI" },
  destination: { city: "Sample Destination", state: "IL" },
  equipment: ["open car hauler"],
  languages: ["en"],
  evidence: {
    mode: "owner_approved_sanitized",
    routeBasis: "completed_history",
    routeEvidence: evidence(2, "route"),
    demandEvidence: evidence(1, "demand"),
    competitionEvidence: evidence(1, "competition"),
    operationalFit: evidence(2, "operations"),
    uniqueLocalValue: evidence(1, "local-value"),
    approvedSources: true,
    privacyReviewed: true,
    crawlablePathAndCta: true,
  },
};

const eligible = evaluateLaneOpportunity(base);
assert.equal(eligible.score, 7);
assert.equal(eligible.maximumScore, 10);
assert.equal(eligible.threshold, 7);
assert.equal(eligible.status, "eligible_for_editorial_review");
assert.deepEqual(eligible.blockers, []);
assert.deepEqual(eligible.breakdown, {
  routeEvidence: 2,
  demandEvidence: 1,
  competitionEvidence: 1,
  operationalFit: 2,
  uniqueLocalValue: 1,
});
assert.ok(eligible.limitations.some((item) => /not publication approval/i.test(item)));
assert.ok(eligible.limitations.some((item) => /automatically becomes published/i.test(item)));

const belowThreshold = evaluateLaneOpportunity({
  ...base,
  evidence: {
    ...base.evidence,
    operationalFit: evidence(1, "operations-low"),
    uniqueLocalValue: evidence(1, "local-value-low"),
  },
});
assert.equal(belowThreshold.score, 6);
assert.equal(belowThreshold.status, "research_only");
assert.ok(belowThreshold.blockers.includes("publication score is below 7/10"));

const syntheticHighScore = evaluateLaneOpportunity({
  ...base,
  evidence: {
    ...base.evidence,
    mode: "synthetic",
    routeEvidence: evidence(2, "synthetic-route"),
    demandEvidence: evidence(2, "synthetic-demand"),
    competitionEvidence: evidence(2, "synthetic-competition"),
    operationalFit: evidence(2, "synthetic-operations"),
    uniqueLocalValue: evidence(2, "synthetic-local-value"),
  },
});
assert.equal(syntheticHighScore.score, 10);
assert.equal(syntheticHighScore.status, "research_only");
assert.ok(syntheticHighScore.blockers.includes("synthetic evidence cannot support public publication"));

const observedOffer = evaluateLaneOpportunity({
  ...base,
  evidence: {
    ...base.evidence,
    routeBasis: "current_offer_observation",
    routeEvidence: evidence(2, "observed-offer"),
    demandEvidence: evidence(2, "observed-demand"),
    competitionEvidence: evidence(2, "observed-competition"),
    operationalFit: evidence(2, "observed-operations"),
    uniqueLocalValue: evidence(2, "observed-local-value"),
  },
});
assert.equal(observedOffer.score, 10);
assert.equal(observedOffer.status, "research_only");
assert.ok(observedOffer.blockers.includes("current load-board observations are not confirmed route evidence"));

const blocked = evaluateLaneOpportunity({
  ...base,
  origin: { city: "", state: "Wisconsin" },
  equipment: [],
  languages: [],
  evidence: {
    ...base.evidence,
    routeEvidence: {
      score: 2,
      sourceIds: [],
      reviewedAt: "31-07-2026",
    },
    approvedSources: false,
    privacyReviewed: false,
    crawlablePathAndCta: false,
  },
});
assert.equal(blocked.status, "blocked_missing_evidence");
assert.ok(blocked.blockers.includes("origin city is missing"));
assert.ok(blocked.blockers.includes("origin state must use a two-letter code"));
assert.ok(blocked.blockers.includes("equipment evidence is missing"));
assert.ok(blocked.blockers.includes("language scope is missing"));
assert.ok(blocked.blockers.includes("route evidence provenance is missing"));
assert.ok(blocked.blockers.includes("route evidence reviewedAt must use a valid YYYY-MM-DD date"));
assert.ok(blocked.blockers.includes("approved source review is required"));
assert.ok(blocked.blockers.includes("privacy review is required"));
assert.ok(blocked.blockers.includes("crawlable path and useful CTA are required"));

const invalidRuntimeScore = evaluateLaneOpportunity({
  ...base,
  evidence: {
    ...base.evidence,
    competitionEvidence: {
      ...base.evidence.competitionEvidence,
      score: 3,
    },
  },
});
assert.equal(invalidRuntimeScore.status, "blocked_missing_evidence");
assert.ok(invalidRuntimeScore.blockers.includes("competition evidence score must be 0, 1, or 2"));
assert.equal(invalidRuntimeScore.breakdown.competitionEvidence, 0);

for (const result of [eligible, belowThreshold, syntheticHighScore, observedOffer, blocked, invalidRuntimeScore]) {
  assert.notEqual(result.status, "published");
}

console.log("lane-opportunity tests passed: evidence, demand, competition, fit, local value, privacy, provenance, and 7/10 gate.");
