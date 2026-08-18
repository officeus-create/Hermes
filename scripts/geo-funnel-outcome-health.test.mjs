import assert from "node:assert/strict";
import {
  buildGeoFunnelOutcomeCompleteness,
  buildGeoNestedWindowDiagnostics,
  buildGeoQualifiedDemandRanking,
  geoDeliveryEventRemediationProposals,
} from "../src/data/geo-funnel-outcome-health.ts";

const ownerRecord = ({
  canonicalOwner,
  windowDays,
  cta,
  intake,
  preview,
  handoff,
  delivery,
  reviewed,
  qualified,
  opportunities,
  wins,
  losses,
  reconciled,
  funnelEvidence = ["production_receiver_verified"],
  outcomeEvidence = ["private_operations_verified"],
  status = "complete",
}) => ({
  canonicalOwner,
  windowDays,
  promptCoverage: {
    promptCount: 0,
    promptIds: [],
    directions: [],
    languages: [],
    intents: [],
    geographies: [],
    weeklyPromptCount: 0,
    monthlyPromptCount: 0,
  },
  scorecard: {
    windowDays,
    aiVisibility: {
      total: 0,
      mentioned: 0,
      cited: 0,
      recommended: 0,
      factualErrors: 0,
      mentionRate: 0,
      citationRate: 0,
      recommendationRate: 0,
      entityAccuracyRate: 0,
      descriptionAccuracyRate: 0,
      factualErrorRate: 0,
      observationsInWindow: 0,
    },
    search: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      brandedImpressions: 0,
      brandedClicks: 0,
      brandedCtr: 0,
      nonBrandedImpressions: 0,
      nonBrandedClicks: 0,
      nonBrandedCtr: 0,
    },
    funnel: {
      ctaClicks: cta,
      intakeStarts: intake,
      previewReady: preview,
      handoffReady: handoff,
      deliveryConfirmed: delivery,
      ctaToIntakeRate: 0,
      intakeToPreviewRate: 0,
      previewToHandoffRate: 0,
      handoffToDeliveryRate: 0,
    },
    leadQuality: {
      reviewedInquiries: reviewed,
      qualifiedLeads: qualified,
      opportunities,
      wins,
      losses,
      revenueReconciledWins: reconciled,
      reviewToQualifiedRate: 0,
      qualifiedToOpportunityRate: 0,
      opportunityToWinRate: 0,
      deliveryToQualifiedRate: 0,
    },
    evidence: {
      aiVisibility: [],
      search: [],
      funnel: funnelEvidence,
      outcomes: outcomeEvidence,
    },
    gaps: [],
  },
  reconciliation: {
    status,
    missingLayers: [],
    integrityGaps: [],
  },
});

const ownerA = "/logistics/car-hauling-dispatch/";
const ownerB = "/services/seo/";
const layers = [
  {
    windowDays: 7,
    owners: [
      ownerRecord({
        canonicalOwner: ownerA,
        windowDays: 7,
        cta: 10,
        intake: 8,
        preview: 7,
        handoff: 6,
        delivery: 5,
        reviewed: 5,
        qualified: 4,
        opportunities: 3,
        wins: 2,
        losses: 1,
        reconciled: 1,
      }),
      ownerRecord({
        canonicalOwner: ownerB,
        windowDays: 7,
        cta: 5,
        intake: 4,
        preview: 3,
        handoff: 2,
        delivery: 1,
        reviewed: 2,
        qualified: 1,
        opportunities: 1,
        wins: 0,
        losses: 0,
        reconciled: 0,
        funnelEvidence: ["unverified"],
        outcomeEvidence: ["private_operations_verified"],
        status: "inconsistent",
      }),
    ],
  },
  {
    windowDays: 28,
    owners: [
      ownerRecord({
        canonicalOwner: ownerA,
        windowDays: 28,
        cta: 30,
        intake: 25,
        preview: 22,
        handoff: 18,
        delivery: 15,
        reviewed: 12,
        qualified: 9,
        opportunities: 6,
        wins: 3,
        losses: 2,
        reconciled: 2,
      }),
    ],
  },
  {
    windowDays: 90,
    owners: [
      ownerRecord({
        canonicalOwner: ownerA,
        windowDays: 90,
        cta: 80,
        intake: 70,
        preview: 60,
        handoff: 50,
        delivery: 40,
        reviewed: 35,
        qualified: 25,
        opportunities: 18,
        wins: 8,
        losses: 7,
        reconciled: 6,
      }),
    ],
  },
];

const completeness = buildGeoFunnelOutcomeCompleteness(layers);
const sevenA = completeness.funnel.find((item) => item.canonicalOwner === ownerA && item.windowDays === 7);
assert.equal(sevenA.stageOrderIntegrity, true);
assert.deepEqual(sevenA.presentStages, ["cta", "intake", "preview", "handoff", "delivery"]);
assert.equal(sevenA.missingEvidence, false);

const outcomeA = completeness.outcomes.find((item) => item.canonicalOwner === ownerA && item.windowDays === 7);
assert.equal(outcomeA.deliveredToReviewedIntegrity, true);
assert.equal(outcomeA.stageOrderIntegrity, true);
assert.equal(outcomeA.unresolvedOpportunities, 0);
assert.equal(outcomeA.revenueReconciledWinCoverageRate, 50);

const outcomeB = completeness.outcomes.find((item) => item.canonicalOwner === ownerB && item.windowDays === 7);
assert.equal(outcomeB.deliveredToReviewedIntegrity, false, "reviewed must not exceed receiver-confirmed delivery");
assert.equal(outcomeB.unresolvedOpportunities, 1);

const nested = buildGeoNestedWindowDiagnostics(layers);
const qualifiedA = nested.find((item) => item.canonicalOwner === ownerA && item.metric === "qualified");
assert.deepEqual(
  { seven: qualifiedA.sevenDay, twentyEight: qualifiedA.twentyEightDay, ninety: qualifiedA.ninetyDay, state: qualifiedA.state },
  { seven: 4, twentyEight: 9, ninety: 25, state: "nested_order_consistent" },
);
assert.match(qualifiedA.note, /does not assume the same lead cohort/);
const incompleteB = nested.find((item) => item.canonicalOwner === ownerB && item.metric === "qualified");
assert.equal(incompleteB.state, "insufficient_windows");

const invertedLayers = structuredClone(layers);
invertedLayers[1].owners[0].scorecard.funnel.ctaClicks = 5;
const inversion = buildGeoNestedWindowDiagnostics(invertedLayers).find(
  (item) => item.canonicalOwner === ownerA && item.metric === "cta",
);
assert.equal(inversion.state, "nested_order_inversion");

const ranking = buildGeoQualifiedDemandRanking(layers, 7);
assert.deepEqual(ranking.map((item) => item.canonicalOwner), [ownerA]);
assert.equal(ranking[0].rank, 1);
assert.equal(ranking[0].qualifiedLeads, 4);
assert.equal(ranking[0].revenueReconciledWins, 1);
assert.ok(!ranking.some((item) => item.canonicalOwner === ownerB), "unverified/inconsistent owner must not enter qualified-demand ranking");

assert.deepEqual(geoDeliveryEventRemediationProposals.map((item) => item.family), ["seo", "website_project"]);
assert.ok(geoDeliveryEventRemediationProposals.every((item) => item.status === "proposal_only_not_instrumented"));
assert.ok(geoDeliveryEventRemediationProposals.every((item) => item.runtimeRegistryChanged === false));
assert.ok(geoDeliveryEventRemediationProposals.every((item) => item.requiredProofBeforeInstrumentation.length >= 4));

const serialized = JSON.stringify({ completeness, nested, ranking, proposals: geoDeliveryEventRemediationProposals }).toLowerCase();
for (const forbidden of ["revenue_amount", "email", "phone", "lead_name", "raw_lead", "account_id", "token", "cookie"]) {
  assert.ok(!serialized.includes(`\"${forbidden}\"`));
}

console.log("GEO funnel/outcome health diagnostics passed");
