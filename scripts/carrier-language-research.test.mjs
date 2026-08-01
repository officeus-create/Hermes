import assert from "node:assert/strict";
import {
  carrierLanguageResearch,
  evaluateCarrierLanguageResearch,
  getCarrierLanguageResearch,
} from "../src/data/carrier-language-research.ts";

assert.equal(carrierLanguageResearch.length, 9);
assert.equal(new Set(carrierLanguageResearch.map((entry) => entry.code)).size, 9);

assert.equal(getCarrierLanguageResearch("en").priority, "primary_research");
for (const code of ["es", "ru", "uk"]) {
  assert.equal(getCarrierLanguageResearch(code).priority, "conditional_research");
}
for (const code of ["ro", "lt", "hi", "pa", "gu"]) {
  const entry = getCarrierLanguageResearch(code);
  assert.equal(entry.priority, "research_only");
  assert.deepEqual(entry.queryHypotheses, []);
  assert.ok(entry.terminologyRules.some((item) => /capable human/i.test(item)));
}

const hypothesisIds = carrierLanguageResearch.flatMap((entry) =>
  entry.queryHypotheses.map((hypothesis) => hypothesis.id),
);
assert.equal(new Set(hypothesisIds).size, hypothesisIds.length);

for (const entry of carrierLanguageResearch) {
  assert.ok(entry.terminologyRules.length >= 4);
  assert.ok(entry.publicationRequirements.length >= 6);
  for (const hypothesis of entry.queryHypotheses) {
    assert.equal(hypothesis.researchOnly, true);
    assert.ok(hypothesis.phrase.trim().length > 0);
    assert.ok(hypothesis.intent.trim().length > 0);
  }
}

assert.ok(
  getCarrierLanguageResearch("en").queryHypotheses.length >
    getCarrierLanguageResearch("es").queryHypotheses.length,
  "English must remain the first carrier-query research priority",
);

const completeEvidence = {
  sourceIds: ["fixture-demand-source-001"],
  reviewedAt: "2026-07-31",
  measurableDemand: true,
  responseCapacityConfirmed: true,
  terminologyReviewedByCapableHuman: true,
  uniqueContentPlan: true,
  canonicalAndHreflangPlan: true,
  usefulCtaAndLanguageDisclosure: true,
};

for (const code of ["en", "es", "ru", "uk"]) {
  const result = evaluateCarrierLanguageResearch(code, completeEvidence);
  assert.equal(result.status, "eligible_for_editorial_review");
  assert.deepEqual(result.blockers, []);
  assert.ok(result.limitations.some((item) => /hypotheses/i.test(item)));
  assert.ok(result.limitations.some((item) => /does not authorize/i.test(item)));
}

for (const code of ["ro", "lt", "hi", "pa", "gu"]) {
  const result = evaluateCarrierLanguageResearch(code, completeEvidence);
  assert.equal(result.status, "research_only");
  assert.ok(result.blockers.some((item) => /owner-approved evidence review/i.test(item)));
}

const blocked = evaluateCarrierLanguageResearch("es", {
  sourceIds: [],
  reviewedAt: "31-07-2026",
  measurableDemand: false,
  responseCapacityConfirmed: false,
  terminologyReviewedByCapableHuman: false,
  uniqueContentPlan: false,
  canonicalAndHreflangPlan: false,
  usefulCtaAndLanguageDisclosure: false,
});
assert.equal(blocked.status, "blocked_missing_evidence");
assert.ok(blocked.blockers.includes("dated demand provenance is required"));
assert.ok(blocked.blockers.includes("reviewedAt must use a valid YYYY-MM-DD date"));
assert.ok(blocked.blockers.includes("measurable language-specific demand is required"));
assert.ok(blocked.blockers.includes("response capacity must be confirmed"));
assert.ok(blocked.blockers.includes("capable-human terminology review is required"));
assert.ok(blocked.blockers.includes("a unique content plan is required"));
assert.ok(blocked.blockers.includes("canonical and hreflang planning is required"));
assert.ok(blocked.blockers.includes("a useful CTA and language disclosure are required"));

assert.throws(() => getCarrierLanguageResearch("xx"), /Unsupported carrier research language/);

for (const code of ["en", "es", "ru", "uk", "ro", "lt", "hi", "pa", "gu"]) {
  const result = evaluateCarrierLanguageResearch(code, completeEvidence);
  assert.notEqual(result.status, "published");
  assert.notEqual(result.status, "page_ready");
}

console.log("carrier-language research tests passed: English-first, evidence-gated multilingual hypotheses, human terminology review, and research-only holds.");
