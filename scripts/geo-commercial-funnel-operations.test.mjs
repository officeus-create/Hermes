import assert from "node:assert/strict";
import {
  assertGeoCommercialFunnelPrivacySafe,
  buildGeoAiReferralAttributionHealth,
  buildGeoAnalyticsExactOnceGate,
  buildGeoCommercialNextActionQueue,
  buildGeoOwnerCommercialChain,
  compareGeoOwnerCommercialFunnels,
  findOwnersMissingReceiverDelivery,
  summarizeGeoLeadQuality,
} from "../src/data/geo-commercial-funnel-operations.ts";

const verified = {
  canonicalOwner: "/logistics/car-hauling-dispatch/",
  windowDays: 28,
  cta: 100,
  intake: 50,
  delivery: 45,
  reviewed: 40,
  qualified: 20,
  opportunity: 10,
  won: 4,
  revenueReconciledWin: 4,
  funnelEvidenceClass: "production_receiver_verified",
  outcomeEvidenceClass: "private_operations_verified",
};
const verifiedChain = buildGeoOwnerCommercialChain(verified);
assert.equal(verifiedChain.state, "verified_chain");
assert.equal(verifiedChain.commercialValueConclusion, "verified_aggregate_chain");
assert.deepEqual(verifiedChain.missingStages, []);
assert.equal(verifiedChain.conversions.ctaToIntake, 50);
assert.equal(verifiedChain.conversions.deliveryToReviewed, 88.9);
assert.equal(verifiedChain.conversions.reviewedToQualified, 50);
assert.equal(verifiedChain.conversions.opportunityToWon, 40);
assert.equal(verifiedChain.conversions.revenueReconciledCoverage, 100);

const ownerReported = {
  ...verified,
  outcomeEvidenceClass: "owner_provided_handoff",
};
const ownerReportedChain = buildGeoOwnerCommercialChain(ownerReported);
assert.equal(ownerReportedChain.state, "owner_reported_chain");
assert.equal(ownerReportedChain.commercialValueConclusion, "owner_reported_not_verified");

const trafficWithoutQualification = {
  ...verified,
  delivery: 20,
  reviewed: null,
  qualified: null,
  opportunity: null,
  won: null,
  revenueReconciledWin: null,
};
const incomplete = buildGeoOwnerCommercialChain(trafficWithoutQualification);
assert.equal(incomplete.state, "incomplete");
assert.equal(incomplete.commercialValueConclusion, "unknown_due_to_missing_evidence");
assert.ok(incomplete.missingStages.includes("qualified"));
assert.notEqual(incomplete.commercialValueConclusion, "zero_commercial_value");

const inconsistent = buildGeoOwnerCommercialChain({
  ...verified,
  intake: 30,
  delivery: 31,
});
assert.equal(inconsistent.state, "inconsistent");
assert.equal(inconsistent.commercialValueConclusion, "blocked_by_integrity");
assert.ok(inconsistent.integrityIssues.length > 0);

const deliveryGaps = findOwnersMissingReceiverDelivery([
  { ...trafficWithoutQualification, delivery: null, funnelEvidenceClass: "owner_provided_handoff" },
  { ...verified, canonicalOwner: "/services/seo/", funnelEvidenceClass: "owner_provided_handoff" },
  verified,
]);
assert.equal(deliveryGaps.length, 2);
assert.ok(deliveryGaps.some((row) => row.gap === "delivery_count_missing"));
assert.ok(deliveryGaps.some((row) => row.gap === "receiver_verification_missing"));

const exactReceipt = {
  schemaVersion: "geo_analytics_receipt_v1",
  referenceId: "receipt-carrier-delivery-001",
  canonicalOwner: "/logistics/car-hauling-dispatch/",
  eventPagePath: "/logistics/start-car-hauling-dispatch/",
  eventName: "carrier_delivery_confirmed",
  observedAt: "2026-08-19T09:00:00.000Z",
  receiptState: "observed_once",
  synthetic: false,
  parameterKeys: ["audience_type", "page_group", "page_path", "preview_status", "service_group"],
  evidenceClass: "platform_verified",
  supersedesReferenceId: null,
  unexpectedParameterKeys: [],
  missingRequiredParameterKeys: [],
  exactOnceVerified: true,
};
const exactGate = buildGeoAnalyticsExactOnceGate([exactReceipt]);
assert.equal(exactGate.ready, true);
assert.equal(exactGate.exactOnceVerifiedCount, 1);
assert.match(exactGate.rule, /platform_verified observed_once/);

const duplicateGate = buildGeoAnalyticsExactOnceGate([{ ...exactReceipt, referenceId: "receipt-dup", receiptState: "observed_multiple", exactOnceVerified: false }]);
assert.equal(duplicateGate.ready, false);
assert.equal(duplicateGate.duplicateCount, 1);

const referrals = buildGeoAiReferralAttributionHealth([
  {
    windowDays: 28,
    canonicalOwner: "/services/seo/",
    attributionState: "provider_identified",
    provider: "chatgpt",
    landingSessions: 10,
    ctaSessions: 4,
    intakeSessions: 2,
    evidenceClass: "platform_verified",
  },
  {
    windowDays: 28,
    canonicalOwner: "/services/seo/",
    attributionState: "ai_referral_unresolved",
    provider: null,
    landingSessions: 5,
    ctaSessions: 1,
    intakeSessions: 1,
    evidenceClass: "platform_verified",
  },
], 28);
assert.equal(referrals.providerAttributionComplete, false);
assert.equal(referrals.unresolvedProviderSessions, 5);
assert.match(referrals.rule, /never guessed/);
assert.ok(referrals.byProvider.some((row) => row.key === "unresolved_ai_referral"));

const quality = summarizeGeoLeadQuality([
  verified,
  trafficWithoutQualification,
], 28);
assert.equal(quality[0].qualificationState, "private_operations_verified");
assert.equal(quality[1].qualificationState, "qualification_evidence_missing");
assert.equal(quality[1].reviewedToQualifiedRate, null);

const comparable = compareGeoOwnerCommercialFunnels({ ...verified, won: 5, revenueReconciledWin: 5 }, verified);
assert.equal(comparable.state, "comparable");
assert.equal(comparable.deltas.won, 1);
const wrongWindow = compareGeoOwnerCommercialFunnels({ ...verified, windowDays: 7 }, verified);
assert.equal(wrongWindow.state, "not_comparable");
assert.ok(wrongWindow.reasons.includes("window_changed"));
const wrongEvidence = compareGeoOwnerCommercialFunnels({ ...verified, outcomeEvidenceClass: "owner_provided_handoff" }, verified);
assert.equal(wrongEvidence.state, "not_comparable");
assert.ok(wrongEvidence.reasons.includes("outcome_evidence_class_changed"));

const actions = buildGeoCommercialNextActionQueue([
  { ...verified, canonicalOwner: "/broken/", intake: 30, delivery: 31 },
  { ...trafficWithoutQualification, canonicalOwner: "/needs-qualification/" },
  { ...verified, canonicalOwner: "/needs-delivery/", delivery: null, funnelEvidenceClass: "owner_provided_handoff" },
  verified,
]);
assert.equal(actions[0].priority, 1);
assert.ok(actions.some((row) => row.action === "repair_integrity"));
assert.ok(actions.some((row) => row.action === "verify_receiver_delivery"));
assert.ok(actions.some((row) => row.action === "collect_private_qualification_aggregate"));
assert.ok(actions.some((row) => row.action === "observe_comparable_window"));

assert.equal(assertGeoCommercialFunnelPrivacySafe({
  canonicalOwner: "/services/seo/",
  qualified: 3,
  opportunities: 1,
  evidenceClass: "private_operations_verified",
}), true);
assert.throws(() => assertGeoCommercialFunnelPrivacySafe({ email: "private@example.com" }), /prohibited user-level\/private field token: email/);
assert.throws(() => assertGeoCommercialFunnelPrivacySafe({ revenue_amount: 1000 }), /revenue_amount/);

console.log("GEO commercial funnel operations passed");
