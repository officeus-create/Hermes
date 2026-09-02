import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  aiVisibilityObservations,
  aiVisibilityPrompts,
  aiVisibilityWaveProviders,
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

const expectedProviders = ["chatgpt", "gemini", "copilot", "perplexity", "google_ai_mode"];
assert.deepEqual(
  aiVisibilityWaveProviders.map((item) => item.id),
  expectedProviders,
  "Wave 01 must expose exactly the five governed provider environments",
);

const promptContractText = aiVisibilityPrompts
  .flatMap((item) => [item.prompt, ...item.expectedFacts])
  .join("\n");
assert.ok(!promptContractText.includes("Hermes Business Academy"), "Wave prompts must use the canonical Hermes Academy root entity");
assert.ok(!promptContractText.includes("Hermes IT Development"), "Wave prompts must use the canonical Hermes Technology root entity");

const connectPrompt = aiVisibilityPrompts.find((item) => item.id === "TEC-07");
assert.ok(connectPrompt, "TEC-07 must remain registered");
assert.equal(connectPrompt.canonicalOwner, "/services/hermes-connect/", "Hermes Connect must use its product canonical owner");
assert.ok(connectPrompt.expectedFacts.some((fact) => fact.includes("Repair Shops is the current public live product vertical")), "TEC-07 must use current Hermes Connect product truth");

assert.deepEqual(aiVisibilityObservations, [], "The real baseline must start empty");
assert.ok(syntheticAiVisibilityObservations.every((item) => item.synthetic), "QA observations must be marked synthetic");

const emptyMetrics = calculateAiVisibilityMetrics(aiVisibilityObservations);
assert.deepEqual(emptyMetrics, {
  total: 0,
  mentioned: 0,
  cited: 0,
  recommended: 0,
  factualErrors: 0,
  mentionRate: null,
  citationRate: null,
  recommendationRate: null,
  entityAccuracyRate: null,
  descriptionAccuracyRate: null,
  factualErrorRate: null,
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

const ledger = JSON.parse(readFileSync(new URL("../docs/GEO_AI_OBSERVATION_LEDGER_2026-08-22.json", import.meta.url), "utf8"));
assert.equal(ledger.prompt_count, 48, "The governed ledger must declare 48 prompts");
assert.deepEqual(ledger.providers, expectedProviders, "The governed ledger must use exactly five clean-provider interfaces");
assert.equal(ledger.expected_observation_count, 240, "48 prompts × 5 providers must produce 240 governed slots");
assert.equal(ledger.observation_slots.length, 240, "The ledger must physically contain all 240 slots before measurement");
assert.equal(ledger.completed_observation_count, 0, "An unobserved baseline must not fabricate completed observations");

const promptIds = new Set(ledger.observation_slots.map((slot) => slot.prompt_id));
assert.equal(promptIds.size, 48, "The ledger must contain exactly 48 distinct prompt IDs");
for (const promptId of promptIds) {
  const slots = ledger.observation_slots.filter((slot) => slot.prompt_id === promptId);
  assert.equal(slots.length, 5, `${promptId} must have exactly five provider slots`);
  assert.deepEqual(slots.map((slot) => slot.provider), expectedProviders, `${promptId} must preserve the fixed provider order`);
}

assert.ok(
  ledger.observation_slots.every((slot) => slot.status === "unobserved" && slot.observed_at === null && slot.result === null),
  "Every untouched slot must remain unobserved/null rather than a synthetic negative",
);

const ledgerSchemaText = JSON.stringify(ledger.result_schema).toLowerCase();
for (const prohibitedField of ["password", "token", "cookie", "account_id", "accountid", "email", "phone", "full_conversation", "conversation_text", "lead_pii", "deal_amount", "revenue_amount"]) {
  assert.ok(!ledgerSchemaText.includes(prohibitedField), `Ledger result schema must not expose ${prohibitedField}`);
}

const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
const llmsFull = readFileSync(new URL("../public/llms-full.txt", import.meta.url), "utf8");
const about = readFileSync(new URL("../src/pages/about.astro", import.meta.url), "utf8");
const canonicalFourDirections = "Hermes Logistics, Hermes Marketing, Hermes Academy, and Hermes Technology";

assert.ok(llms.includes(canonicalFourDirections), "llms.txt must publish the canonical Four Directions");
assert.ok(llms.includes("### Hermes Marketing"), "llms.txt must use Hermes Marketing as the root direction");
assert.ok(llms.includes("### Hermes Academy"), "llms.txt must use Hermes Academy as the root direction");
assert.ok(llms.includes("### Hermes Technology"), "llms.txt must use Hermes Technology as the root direction");
assert.ok(!llms.includes("### ProgressoPro / Digital Growth"), "ProgressoPro must not replace Hermes Marketing as a root AI entity");
assert.ok(!llms.includes("### Hermes Business Academy"), "Hermes Business Academy must not replace Hermes Academy as a root AI entity");
assert.ok(!llms.includes("### Hermes IT Development / Hermes Connect"), "IT Development must not replace Hermes Technology as a root AI entity");

assert.ok(llmsFull.includes(canonicalFourDirections), "llms-full.txt must publish the canonical Four Directions");
assert.ok(llmsFull.includes("## 4. Hermes Marketing"), "Extended AI context must use Hermes Marketing as the root direction");
assert.ok(llmsFull.includes("## 5. Hermes Academy"), "Extended AI context must use Hermes Academy as the root direction");
assert.ok(llmsFull.includes("## 6. Hermes Technology and Hermes Connect"), "Extended AI context must use Hermes Technology as the root direction");
assert.ok(!llmsFull.includes("## 4. ProgressoPro / SEO and digital growth"), "ProgressoPro must not own the root Marketing section");
assert.ok(!llmsFull.includes("## 5. Hermes Business Academy"), "Hermes Business Academy must not own the root Academy section");
assert.ok(!llmsFull.includes("## 6. Hermes IT Development and Hermes Connect"), "IT Development must not own the root Technology section");

assert.ok(about.includes(`four practical directions: ${canonicalFourDirections}.`), "About body must use the canonical Four Directions");
assert.ok(about.includes('title="About Hermes | Logistics, Marketing, Academy & IT"'), "This GEO change must preserve the frozen About title");
assert.ok(about.includes('description="Learn how Hermes organizes U.S. logistics, ProgressoPro marketing and SEO, practical business education, and IT development with clear evidence and service boundaries."'), "This GEO change must preserve the frozen About description");

console.log("AI visibility scorecard, 48x5 ledger, and pre-Wave entity context contract passed");