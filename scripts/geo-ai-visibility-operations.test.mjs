import assert from "node:assert/strict";
import { buildGeoAiVisibilityOperations } from "../src/data/geo-ai-visibility-operations.ts";

const observations = [
  {
    id: "ops_obs_log_chatgpt",
    promptId: "LOG-01",
    provider: "chatgpt",
    observedAt: "2026-08-17T12:00:00Z",
    reviewer: "ops_reviewer",
    brandMentioned: true,
    linkedCitation: false,
    citedPath: "",
    recommendation: "considered_option",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: ["Carrier Alpha"],
    correctiveAction: "add source evidence",
    evidenceReference: "evidence-alpha",
  },
  {
    id: "ops_obs_log_gemini",
    promptId: "LOG-01",
    provider: "gemini",
    observedAt: "2026-08-16T12:00:00Z",
    reviewer: "ops_reviewer",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: "/services/seo/",
    recommendation: "source_only",
    entityAccuracy: "partially_accurate",
    descriptionAccuracy: "inaccurate",
    factualError: true,
    competitors: ["Carrier Alpha", "Carrier Beta"],
    correctiveAction: "review owner and facts",
    evidenceReference: "evidence-beta",
  },
  {
    id: "ops_obs_mkt_chatgpt",
    promptId: "MKT-01",
    provider: "chatgpt",
    observedAt: "2026-07-01T12:00:00Z",
    reviewer: "ops_reviewer",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: "/services/seo/",
    recommendation: "explicit_recommendation",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: ["Marketing Gamma"],
    correctiveAction: "",
    evidenceReference: "evidence-gamma",
  },
  {
    id: "synthetic_ignored",
    promptId: "LOG-01",
    provider: "perplexity",
    observedAt: "2026-08-18T10:00:00Z",
    reviewer: "qa_reviewer",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: "/logistics/car-hauling-dispatch/",
    recommendation: "explicit_recommendation",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: [],
    correctiveAction: "",
    evidenceReference: "synthetic-evidence",
    synthetic: true,
  },
];

const report = buildGeoAiVisibilityOperations({
  asOf: "2026-08-18T12:00:00Z",
  observations,
});

assert.equal(report.providers.length, 5);
assert.equal(report.providerCoverage.find((item) => item.provider === "chatgpt").observedPromptChecks, 2);
assert.equal(report.providerCoverage.find((item) => item.provider === "gemini").observedPromptChecks, 1);
assert.equal(report.providerCoverage.find((item) => item.provider === "perplexity").observedPromptChecks, 0, "synthetic observations must not count");
assert.ok(report.cadenceCompliance.totalChecks > 200);
assert.ok(report.missingProviderQueue.some((item) => item.provider === "copilot"));

const logGemini = report.remediationQueue.find((item) => item.observationId === "ops_obs_log_gemini");
assert.ok(logGemini);
assert.ok(logGemini.reasons.includes("factual_error"));
assert.ok(logGemini.reasons.includes("citation_without_recommendation"));
assert.ok(logGemini.reasons.includes("cited_path_mismatch"));
assert.ok(logGemini.reasons.includes("entity_accuracy_issue"));
assert.ok(logGemini.reasons.includes("description_accuracy_issue"));

const logChatgpt = report.remediationQueue.find((item) => item.observationId === "ops_obs_log_chatgpt");
assert.ok(logChatgpt.reasons.includes("mention_without_citation"));
assert.equal(report.factualErrorQueue.length, 1);
assert.equal(report.missingCitationQueue.length, 1);
assert.equal(report.citedPathMismatch.length, 1);

const carrierAlpha = report.competitorFrequencies.find((item) => item.label === "Carrier Alpha");
assert.equal(carrierAlpha.occurrences, 2);
assert.deepEqual(carrierAlpha.providers, ["chatgpt", "gemini"]);

const geminiShare = report.providerEntityMentionShare.find((item) => item.provider === "gemini");
assert.equal(geminiShare.observations, 1);
assert.equal(geminiShare.hermesMentions, 1);
assert.equal(geminiShare.competitorMentionOccurrences, 2);
assert.equal(geminiShare.entityMentionShare, 33.3);

const sevenDayGemini = report.accuracyByProviderWindow.find(
  (item) => item.windowDays === 7 && item.provider === "gemini",
);
assert.equal(sevenDayGemini.observations, 1);
assert.equal(sevenDayGemini.entityAccuracyRate, 0);
assert.equal(sevenDayGemini.descriptionAccuracyRate, 0);
assert.equal(sevenDayGemini.factualErrors, 1);

const staleReference = report.evidenceReferenceHealth.find((item) => item.observationId === "ops_obs_mkt_chatgpt");
assert.equal(staleReference.state, "stale");
assert.ok(staleReference.ageDays > staleReference.cadenceDays);

const logisticsOwner = report.ownerReadiness.find(
  (item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/",
);
assert.ok(logisticsOwner.expectedPromptProviderChecks > logisticsOwner.observedPromptProviderChecks);
assert.equal(logisticsOwner.factualErrors, 1);
assert.equal(logisticsOwner.citationMismatches, 1);
assert.ok(logisticsOwner.remediationItems >= 2);

const future = structuredClone(observations);
future[0].observedAt = "2026-08-19T12:00:00Z";
assert.throws(
  () => buildGeoAiVisibilityOperations({ asOf: "2026-08-18T12:00:00Z", observations: future }),
  /cannot be later than asOf/,
);

const serialized = JSON.stringify(report).toLowerCase();
for (const forbidden of ["response_text", "raw_response", "conversation", "email", "phone", "account_id", "token", "cookie"]) {
  assert.ok(!serialized.includes(`\"${forbidden}\"`), `AI visibility operations must not add ${forbidden}`);
}

console.log("GEO AI visibility operations health passed");
