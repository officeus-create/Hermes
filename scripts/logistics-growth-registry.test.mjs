import assert from "node:assert/strict";
import {
  carrierKeywordHypotheses,
  getLanguageEligibility,
  logisticsLanguageEligibility,
} from "../src/data/logistics-growth-registry.ts";

assert.equal(logisticsLanguageEligibility.length, 9);
assert.equal(new Set(logisticsLanguageEligibility.map((item) => item.code)).size, 9);

assert.equal(getLanguageEligibility("en").priority, "primary");
assert.equal(getLanguageEligibility("es").priority, "secondary");
assert.equal(getLanguageEligibility("ru").priority, "secondary");
assert.equal(getLanguageEligibility("uk").priority, "secondary");
assert.equal(getLanguageEligibility("ro").priority, "research_only");
assert.equal(getLanguageEligibility("lt").priority, "research_only");
assert.equal(getLanguageEligibility("hi").priority, "research_only");
assert.equal(getLanguageEligibility("pa").priority, "research_only");
assert.equal(getLanguageEligibility("gu").priority, "research_only");

for (const language of logisticsLanguageEligibility) {
  assert.ok(language.publishRequirements.length >= 3);
  assert.ok(language.publishRequirements.every((item) => item.trim().length > 0));
}

assert.ok(carrierKeywordHypotheses.length >= 9);
assert.equal(
  new Set(carrierKeywordHypotheses.map((item) => item.id)).size,
  carrierKeywordHypotheses.length,
);

for (const hypothesis of carrierKeywordHypotheses) {
  assert.equal(hypothesis.researchOnly, true);
  assert.ok(hypothesis.phrases.length > 0);
  assert.ok(hypothesis.phrases.every((phrase) => phrase.trim().length > 0));
  assert.ok(logisticsLanguageEligibility.some((item) => item.code === hypothesis.language));
}

console.log("logistics-growth-registry tests passed");
