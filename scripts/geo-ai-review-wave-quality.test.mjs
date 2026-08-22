import assert from "node:assert/strict";
import {
  buildGeoAiPromptRegistryFingerprint,
  buildGeoAiReviewWaveReport,
  compareGeoAiReviewWaveReports,
  geoAiReviewWaveVersion,
  importGeoAiReviewWave,
} from "../src/data/geo-ai-review-wave-quality.ts";

const observation = (id, promptId, provider, observedAt, overrides = {}) => ({
  id,
  promptId,
  provider,
  observedAt,
  reviewer: "reviewer-alpha",
  brandMentioned: true,
  linkedCitation: true,
  citedPath: promptId === "LOG-01" ? "/logistics/car-hauling-dispatch/" : "/services/seo/",
  recommendation: "considered_option",
  entityAccuracy: "accurate",
  descriptionAccuracy: "accurate",
  factualError: false,
  competitors: [],
  correctiveAction: "none",
  evidenceReference: `evidence-${id}`,
  synthetic: false,
  ...overrides,
});

const previousObservations = [
  observation("prev-log-chatgpt", "LOG-01", "chatgpt", "2026-08-03T12:00:00Z", { competitors: ["Competitor A"] }),
  observation("prev-log-gemini", "LOG-01", "gemini", "2026-08-04T12:00:00Z", {
    citedPath: "/services/seo/",
    entityAccuracy: "partially_accurate",
    descriptionAccuracy: "inaccurate",
    factualError: true,
  }),
  observation("prev-mkt-chatgpt", "MKT-01", "chatgpt", "2026-08-05T12:00:00Z", { linkedCitation: false, citedPath: "" }),
  observation("prev-mkt-gemini", "MKT-01", "gemini", "2026-08-06T12:00:00Z", { citedPath: "/unmapped-hermes-path/" }),
];

const currentObservations = [
  observation("curr-log-chatgpt", "LOG-01", "chatgpt", "2026-08-10T12:00:00Z"),
  observation("curr-log-gemini", "LOG-01", "gemini", "2026-08-11T12:00:00Z"),
  observation("curr-mkt-chatgpt", "MKT-01", "chatgpt", "2026-08-12T12:00:00Z"),
  observation("curr-mkt-gemini", "MKT-01", "gemini", "2026-08-13T12:00:00Z", { competitors: ["Competitor B"] }),
];

const registryFingerprint = buildGeoAiPromptRegistryFingerprint();
assert.match(registryFingerprint, /^fnv1a64:[0-9a-f]{16}$/);
assert.equal(registryFingerprint, buildGeoAiPromptRegistryFingerprint(), "Prompt registry fingerprint must be deterministic");

const waveInput = (waveId, observedFrom, observedTo, reviewedAt, observations) => ({
  schema_version: geoAiReviewWaveVersion,
  wave_id: waveId,
  observed_from: observedFrom,
  observed_to: observedTo,
  reviewed_at: reviewedAt,
  prompt_registry_fingerprint: registryFingerprint,
  provider_receipts: [
    { provider: "chatgpt", reviewer_label: "reviewer-alpha", reviewed_at: reviewedAt, evidence_reference: `${waveId}-chatgpt` },
    { provider: "gemini", reviewer_label: "reviewer-beta", reviewed_at: reviewedAt, evidence_reference: `${waveId}-gemini` },
  ],
  observation_reviews: observations.map((item) => ({
    observation_id: item.id,
    factual_error_severity: item.factualError ? "high" : "none",
    evidence_support_state: item.id === "prev-log-gemini" ? "unsupported" : "supported",
    prohibited_claim_indexes: item.id === "prev-log-gemini" ? [0] : [],
  })),
});

const previousWave = importGeoAiReviewWave(
  waveInput("wave-prev", "2026-08-01", "2026-08-07", "2026-08-08T12:00:00Z", previousObservations),
  previousObservations,
);
const currentWave = importGeoAiReviewWave(
  waveInput("wave-current", "2026-08-08", "2026-08-14", "2026-08-15T12:00:00Z", currentObservations),
  currentObservations,
);

assert.equal(previousWave.schemaVersion, geoAiReviewWaveVersion);
assert.equal(previousWave.providerReceipts.length, 2);
const previousReport = buildGeoAiReviewWaveReport(previousWave, previousObservations);
const currentReport = buildGeoAiReviewWaveReport(currentWave, currentObservations);
assert.equal(previousReport.windowDays, 7);
assert.ok(previousReport.providerCoverageDebt.length > 0, "Partial prompt/provider review must create provider coverage debt");
assert.ok(previousReport.staleEvidencePriority.some((item) => item.riskScore > 0), "Wrong citation/factual risk must enter remediation priority");

const previousGemini = previousReport.providerRows.find((item) => item.provider === "gemini");
assert.equal(previousGemini.wrongHermesOwnerCitations, 1);
assert.equal(previousGemini.unmappedHermesPathCitations, 1);
assert.equal(previousGemini.factualErrors, 1);
assert.equal(previousGemini.prohibitedClaimOccurrences, 1);
assert.ok(previousGemini.factualSeverityScore > 0);
const previousChatgpt = previousReport.providerRows.find((item) => item.provider === "chatgpt");
assert.equal(previousChatgpt.mentionWithoutCitation, 1);

const comparison = compareGeoAiReviewWaveReports(previousReport, currentReport);
assert.equal(comparison.state, "comparable");
assert.equal(comparison.reasons.length, 0);
assert.equal(comparison.providerTrends.length, 2);
assert.ok(comparison.providerTrends.every((item) => Number.isFinite(item.entityAccuracyRateDelta)));

const changedProviderWave = importGeoAiReviewWave({
  ...waveInput("wave-provider-change", "2026-08-15", "2026-08-21", "2026-08-22T12:00:00Z", [
    observation("changed-log-chatgpt", "LOG-01", "chatgpt", "2026-08-17T12:00:00Z"),
    observation("changed-mkt-chatgpt", "MKT-01", "chatgpt", "2026-08-18T12:00:00Z"),
  ]),
  provider_receipts: [{ provider: "chatgpt", reviewer_label: "reviewer-alpha", reviewed_at: "2026-08-22T12:00:00Z", evidence_reference: "wave-provider-change-chatgpt" }],
}, [
  observation("changed-log-chatgpt", "LOG-01", "chatgpt", "2026-08-17T12:00:00Z"),
  observation("changed-mkt-chatgpt", "MKT-01", "chatgpt", "2026-08-18T12:00:00Z"),
]);
const changedProviderReport = buildGeoAiReviewWaveReport(changedProviderWave, [
  observation("changed-log-chatgpt", "LOG-01", "chatgpt", "2026-08-17T12:00:00Z"),
  observation("changed-mkt-chatgpt", "MKT-01", "chatgpt", "2026-08-18T12:00:00Z"),
]);
assert.equal(compareGeoAiReviewWaveReports(currentReport, changedProviderReport).state, "not_comparable");

assert.throws(() => importGeoAiReviewWave({ ...waveInput("bad-raw", "2026-08-01", "2026-08-07", "2026-08-08T12:00:00Z", previousObservations), conversation: "blocked" }, previousObservations), /unsupported field: conversation/i);
assert.throws(() => importGeoAiReviewWave({ ...waveInput("bad-fingerprint", "2026-08-01", "2026-08-07", "2026-08-08T12:00:00Z", previousObservations), prompt_registry_fingerprint: "fnv1a64:0000000000000000" }, previousObservations), /prompt_registry_fingerprint/);
assert.throws(() => importGeoAiReviewWave(waveInput("bad-synthetic", "2026-08-01", "2026-08-07", "2026-08-08T12:00:00Z", [{ ...previousObservations[0], id: "synthetic-one", synthetic: true }]), [{ ...previousObservations[0], id: "synthetic-one", synthetic: true }]), /Synthetic observation/);

console.log("GEO AI review-wave quality contract passed");
