import assert from "node:assert/strict";
import {
  buildGeoAiWaveOperatingSummary,
  buildNextGeoAiManualReviewPlan,
  standardGeoAiReviewProviders,
  validateGeoAiWaveComparisonDiscipline,
} from "../src/data/geo-ai-wave-operations.ts";

const standardPlan = buildNextGeoAiManualReviewPlan();
assert.equal(standardPlan.length, 240, "48 governed prompts x 5 standard providers must create 240 review pairs");
assert.equal(new Set(standardPlan.map((item) => `${item.promptId}|${item.provider}`)).size, 240);
assert.equal(standardGeoAiReviewProviders.length, 5);
assert.throws(() => buildNextGeoAiManualReviewPlan(["chatgpt", "chatgpt"]), /unique/);

const partialPlan = buildNextGeoAiManualReviewPlan(["chatgpt", "gemini"]);
const partialReport = {
  schemaVersion: "geo_ai_review_wave_v1",
  waveId: "wave-2026-08-19",
  observedFrom: "2026-08-12",
  observedTo: "2026-08-18",
  windowDays: 7,
  reviewedAt: "2026-08-19T09:00:00Z",
  promptRegistryFingerprint: "fnv1a64:test",
  providers: ["chatgpt", "gemini"],
  observationIds: ["obs1", "obs2"],
  coverageKeys: [partialPlan[0] && `${partialPlan[0].promptId}|${partialPlan[0].provider}`, partialPlan[1] && `${partialPlan[1].promptId}|${partialPlan[1].provider}`].filter(Boolean),
  providerRows: [
    {
      provider: "chatgpt",
      observations: 1,
      mentions: 1,
      linkedCitations: 1,
      canonicalOwnerCitations: 0,
      wrongHermesOwnerCitations: 1,
      unmappedHermesPathCitations: 0,
      mentionWithoutCitation: 0,
      citationMatchRate: 0,
      wrongHermesOwnerCitationRate: 100,
      unmappedHermesPathCitationRate: 0,
      noCitationMentionRate: 0,
      factualErrors: 1,
      factualSeverityScore: 7,
      evidenceSupportedRate: 0,
      prohibitedClaimOccurrences: 1,
      competitorInclusionRate: 100,
      entityAccuracyRate: 0,
      descriptionAccuracyRate: 0,
    },
    {
      provider: "gemini",
      observations: 1,
      mentions: 1,
      linkedCitations: 0,
      canonicalOwnerCitations: 0,
      wrongHermesOwnerCitations: 0,
      unmappedHermesPathCitations: 0,
      mentionWithoutCitation: 1,
      citationMatchRate: 0,
      wrongHermesOwnerCitationRate: 0,
      unmappedHermesPathCitationRate: 0,
      noCitationMentionRate: 100,
      factualErrors: 0,
      factualSeverityScore: 0,
      evidenceSupportedRate: 100,
      prohibitedClaimOccurrences: 0,
      competitorInclusionRate: 0,
      entityAccuracyRate: 100,
      descriptionAccuracyRate: 100,
    },
  ],
  providerCoverageDebt: [
    {
      canonicalOwner: "/logistics/car-hauling-dispatch/",
      expectedPairs: 2,
      missingPairs: [{ promptId: "LOG-01", provider: "gemini" }],
      debtCount: 1,
    },
  ],
  staleEvidencePriority: [
    {
      canonicalOwner: "/logistics/car-hauling-dispatch/",
      promptId: "LOG-01",
      provider: "chatgpt",
      ageDays: 12,
      cadenceDays: 7,
      overdueDays: 5,
      riskScore: 20,
    },
  ],
};

const summary = buildGeoAiWaveOperatingSummary(partialReport, partialPlan);
assert.equal(summary.promptCount, 48);
assert.equal(summary.providerCount, 2);
assert.equal(summary.expectedPromptProviderPairs, 96);
assert.equal(summary.observedPromptProviderPairs, 2);
assert.equal(summary.coverageRate, 2.1);
assert.equal(summary.evidenceWorkOpen, true);
assert.equal(summary.cosmeticWorkBlockedByEvidence, true);
assert.equal(summary.remediation[0].priority, 1);
assert.ok(summary.remediation.some((item) => item.category === "truth_error" && item.provider === "chatgpt"));
assert.ok(summary.remediation.some((item) => item.category === "citation_owner" && item.provider === "chatgpt"));
assert.ok(summary.remediation.some((item) => item.category === "citation_owner" && item.provider === "gemini"));
assert.ok(summary.remediation.some((item) => item.category === "coverage"));
assert.ok(summary.remediation.some((item) => item.category === "freshness" && item.priority === 1));
assert.equal(summary.remediation.at(-1).category, "cosmetic");
assert.match(summary.remediation.at(-1).detail, /remain behind truth/i);

const fullCoverageKeys = partialPlan.map((item) => `${item.promptId}|${item.provider}`);
const cleanSummary = buildGeoAiWaveOperatingSummary({
  ...partialReport,
  waveId: "clean-wave",
  observationIds: [],
  coverageKeys: fullCoverageKeys,
  providerRows: partialReport.providerRows.map((row) => ({
    ...row,
    observations: 0,
    mentions: 0,
    linkedCitations: 0,
    canonicalOwnerCitations: 0,
    wrongHermesOwnerCitations: 0,
    unmappedHermesPathCitations: 0,
    mentionWithoutCitation: 0,
    citationMatchRate: 0,
    wrongHermesOwnerCitationRate: 0,
    unmappedHermesPathCitationRate: 0,
    noCitationMentionRate: 0,
    factualErrors: 0,
    factualSeverityScore: 0,
    evidenceSupportedRate: 100,
    prohibitedClaimOccurrences: 0,
  })),
  providerCoverageDebt: [],
  staleEvidencePriority: [],
}, partialPlan);
assert.equal(cleanSummary.coverageRate, 100);
assert.equal(cleanSummary.evidenceWorkOpen, false);
assert.equal(cleanSummary.cosmeticWorkBlockedByEvidence, false);
assert.equal(cleanSummary.remediation.length, 1);
assert.equal(cleanSummary.remediation[0].category, "cosmetic");

assert.deepEqual(validateGeoAiWaveComparisonDiscipline({ state: "comparable", reasons: [] }), {
  deltasAllowed: true,
  reasons: [],
});
assert.deepEqual(validateGeoAiWaveComparisonDiscipline({ state: "not_comparable", reasons: ["provider_set_changed"] }), {
  deltasAllowed: false,
  reasons: ["provider_set_changed"],
});

console.log("GEO AI review-wave operations passed");
