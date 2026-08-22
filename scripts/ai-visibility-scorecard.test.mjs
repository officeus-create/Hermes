import assert from "node:assert/strict";
import {
  aiVisibilityObservations,
  aiVisibilityPrompts,
  calculateAiVisibilityMetrics,
  syntheticAiVisibilityObservations,
} from "../src/data/ai-visibility-scorecard.ts";

assert.equal(aiVisibilityPrompts.length, 48, "Release A must register exactly 48 prompts");
assert.equal(new Set(aiVisibilityPrompts.map((item) => item.id)).size, 48, "Prompt IDs must be unique");
assert.equal(new Set(aiVisibilityPrompts.map((item) => item.prompt)).size, 48, "Prompt text must be distinct");

for (const direction of ["logistics", "marketing", "academy", "technology"]) {
  assert.equal(
    aiVisibilityPrompts.filter((item) => item.direction === direction).length,
    12,
    `${direction} must own 12 prompts`,
  );
}

assert.ok(aiVisibilityPrompts.some((item) => item.language === "ru"), "Russian prompts are required");
assert.ok(aiVisibilityPrompts.some((item) => item.language === "uk"), "Ukrainian prompts are required");
assert.ok(aiVisibilityPrompts.every((item) => item.canonicalOwner.startsWith("/")), "Every prompt needs a site-relative canonical owner");
assert.ok(aiVisibilityPrompts.every((item) => item.expectedFacts.length > 0), "Every prompt needs expected safe facts");
assert.ok(aiVisibilityPrompts.every((item) => item.prohibitedClaims.length > 0), "Every prompt needs prohibited claims");

const promptContractText = aiVisibilityPrompts
  .flatMap((item) => [item.prompt, item.canonicalOwner, ...item.expectedFacts])
  .join("\n");
assert.ok(!promptContractText.includes("Hermes Business Academy"), "48-prompt contract must use Hermes Academy");
assert.ok(!promptContractText.includes("Hermes IT Development"), "48-prompt contract must use Hermes Technology");
assert.equal(
  aiVisibilityPrompts.find((item) => item.id === "TEC-07")?.canonicalOwner,
  "/services/hermes-connect/",
  "Hermes Connect brand discovery must measure the product-family canonical owner",
);

assert.deepEqual(aiVisibilityObservations, [], "The real baseline must start empty");
assert.ok(syntheticAiVisibilityObservations.every((item) => item.synthetic), "QA observations must be marked synthetic");

const emptyMetrics = calculateAiVisibilityMetrics(aiVisibilityObservations);
assert.deepEqual(emptyMetrics, {
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
});

const syntheticMetrics = calculateAiVisibilityMetrics(syntheticAiVisibilityObservations);
assert.equal(syntheticMetrics.total, 4);
assert.equal(syntheticMetrics.mentionRate, 75);
assert.equal(syntheticMetrics.citationRate, 50);
assert.equal(syntheticMetrics.recommendationRate, 50);
assert.equal(syntheticMetrics.entityAccuracyRate, 66.7);
assert.equal(syntheticMetrics.descriptionAccuracyRate, 66.7);
assert.equal(syntheticMetrics.factualErrorRate, 25);

const observationKeys = Object.keys(syntheticAiVisibilityObservations[0]).join(" ").toLowerCase();
for (const prohibitedField of ["password", "token", "cookie", "accountid", "conversation", "email", "phone"]) {
  assert.ok(!observationKeys.includes(prohibitedField), `Observation contract must not include ${prohibitedField}`);
}

assert.ok(
  syntheticAiVisibilityObservations.some((item) => item.brandMentioned && !item.linkedCitation),
  "Mention and citation must remain separate signals",
);
assert.ok(
  syntheticAiVisibilityObservations.some((item) => item.linkedCitation && item.recommendation === "source_only"),
  "Citation and recommendation must remain separate signals",
);
assert.ok(
  syntheticAiVisibilityObservations.some((item) => item.factualError),
  "Factual error handling must be represented",
);

console.log("AI visibility scorecard contract passed");