import assert from "node:assert/strict";
import {
  auditCarHaulingMobileSemanticParity,
  auditCarHaulingOwnerReadiness,
  buildCarHaulingWrongOwnerCitationQueue,
  carHaulingCanonicalOwner,
  carHaulingPrimaryAction,
  currentCarHaulingProductionSnapshot,
  detectPositiveCarHaulingGuarantees,
  routeCarHaulingVisualChange,
} from "../src/data/geo-car-hauling-owner-readiness.ts";

const readiness = auditCarHaulingOwnerReadiness();
assert.equal(readiness.canonicalOwner, carHaulingCanonicalOwner);
assert.equal(readiness.searchEvidence.exactWindowDays, 18);
assert.equal(readiness.searchEvidence.impressions, 20);
assert.equal(readiness.searchEvidence.clicks, null);
assert.equal(readiness.searchEvidence.ctr, null);
assert.equal(readiness.searchEvidence.averagePosition, null);
assert.equal(readiness.searchEvidence.usScoped, false);
assert.equal(readiness.searchEvidence.performanceConclusionAllowed, false);
assert.equal(readiness.answerEvidence.freshnessState, "fresh");
assert.equal(readiness.audienceCoverage.ownerOperator, true);
assert.equal(readiness.audienceCoverage.smallFleet, true);
assert.equal(readiness.audienceCoverage.newAuthorityConditional, true);
assert.equal(readiness.nextAction.consistent, true);
assert.equal(readiness.nextAction.productionHref, carHaulingPrimaryAction);
assert.deepEqual(readiness.relatedOwners.missing.sort(), [
  "/logistics/resources/broker-setup-packet-checklist/",
  "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
].sort());
assert.equal(readiness.relatedOwners.complete, false);
assert.equal(readiness.positiveGuarantees.length, 0);
assert.equal(readiness.readinessScore, 86);
assert.match(readiness.readinessMeaning, /not search ranking/i);
assert.equal(readiness.visualDecision.routeToCeoVisualQueue, false);

const completedLinks = auditCarHaulingOwnerReadiness({
  ...currentCarHaulingProductionSnapshot,
  relatedOwners: [
    ...currentCarHaulingProductionSnapshot.relatedOwners,
    "/logistics/resources/broker-setup-packet-checklist/",
    "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
  ],
});
assert.equal(completedLinks.relatedOwners.complete, true);
assert.equal(completedLinks.readinessScore, 100);

const weakNewAuthority = auditCarHaulingOwnerReadiness({
  ...currentCarHaulingProductionSnapshot,
  faqText: ["New authorities can start active dispatch immediately."],
});
assert.equal(weakNewAuthority.audienceCoverage.newAuthorityConditional, false);
assert.equal(weakNewAuthority.readinessChecks.audienceTruthful, false);

assert.deepEqual(detectPositiveCarHaulingGuarantees([
  "Hermes does not guarantee loads, rates, lanes, customers, or revenue.",
  "No guaranteed lanes or revenue claims are made.",
]), []);
const positive = detectPositiveCarHaulingGuarantees([
  "Hermes guarantees loads for approved carriers.",
  "The service provides guaranteed revenue after onboarding.",
]);
assert.equal(positive.length, 2);
assert.deepEqual(positive.map((item) => item.term).sort(), ["loads", "revenue"]);

const wrongOwnerQueue = buildCarHaulingWrongOwnerCitationQueue([
  {
    id: "obs-log01-wrong-owner",
    promptId: "LOG-01",
    provider: "chatgpt",
    observedAt: "2026-08-19T09:00:00Z",
    reviewer: "reviewer-01",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: "/paths/logistics/",
    recommendation: "source_only",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: [],
    correctiveAction: "Review canonical citation owner.",
    evidenceReference: "ai-review:log01:chatgpt:20260819",
  },
  {
    id: "obs-log01-canonical",
    promptId: "LOG-01",
    provider: "gemini",
    observedAt: "2026-08-19T09:05:00Z",
    reviewer: "reviewer-01",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: carHaulingCanonicalOwner,
    recommendation: "source_only",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: [],
    correctiveAction: "None.",
    evidenceReference: "ai-review:log01:gemini:20260819",
  },
  {
    id: "obs-log01-synthetic",
    promptId: "LOG-01",
    provider: "perplexity",
    observedAt: "2026-08-19T09:10:00Z",
    reviewer: "qa",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: "/unknown-hermes-path/",
    recommendation: "source_only",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: [],
    correctiveAction: "Synthetic only.",
    evidenceReference: "synthetic:log01",
    synthetic: true,
  },
]);
assert.equal(wrongOwnerQueue.length, 1);
assert.equal(wrongOwnerQueue[0].observationId, "obs-log01-wrong-owner");
assert.equal(wrongOwnerQueue[0].alignment, "other_hermes_owner");
assert.equal(wrongOwnerQueue[0].action, "strengthen_canonical_owner_answer_and_internal_signals");

const semantic = {
  h1: currentCarHaulingProductionSnapshot.h1,
  shortAnswer: "Hermes can support dispatch and back-office work while the carrier keeps final booking control.",
  primaryActionHref: carHaulingPrimaryAction,
  carrierControlStatement: "The carrier reviews and approves every load before booking.",
  noGuaranteeStatement: "Hermes does not guarantee loads, rates, lanes, customers, or revenue.",
};
assert.deepEqual(auditCarHaulingMobileSemanticParity(semantic, { ...semantic }), {
  semanticParity: true,
  mismatches: [],
  requiresRedesign: false,
});
const mobileMismatch = auditCarHaulingMobileSemanticParity(semantic, { ...semantic, primaryActionHref: "/contacts/" });
assert.equal(mobileMismatch.semanticParity, false);
assert.deepEqual(mobileMismatch.mismatches, ["primaryActionHref"]);
assert.equal(mobileMismatch.requiresRedesign, false);

assert.deepEqual(routeCarHaulingVisualChange({ material: false }), {
  state: "bounded_nonvisual_change",
  queueIssue: null,
  productionAllowed: true,
});
assert.deepEqual(routeCarHaulingVisualChange({ material: false, changesHero: true }), {
  state: "preview_required",
  queueIssue: 694,
  productionAllowed: false,
});

console.log("GEO car-hauling owner readiness passed");
