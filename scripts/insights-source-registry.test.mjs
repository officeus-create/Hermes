import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { scoreInsightCandidate } from "./score-insight-candidate.mjs";

const sources = JSON.parse(
  await readFile(new URL("../src/data/insights-source-registry.json", import.meta.url), "utf8"),
);

assert.ok(Array.isArray(sources) && sources.length >= 3, "source registry must contain governed sources");

const ids = new Set();
const forbiddenKeyPattern = /(secret|password|token|webhook|api[_-]?key)/i;
const forbiddenValuePattern = /(bearer\s+[a-z0-9._-]+|sk-[a-z0-9_-]{8,})/i;

const walk = (value, path = []) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, [...path, String(index)]));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!forbiddenKeyPattern.test(key), `source registry must not contain secret-bearing key: ${[...path, key].join(".")}`);
    if (typeof child === "string") {
      assert.ok(!forbiddenValuePattern.test(child), `source registry appears to contain a secret at ${[...path, key].join(".")}`);
    }
    walk(child, [...path, key]);
  }
};

for (const source of sources) {
  assert.match(source.id, /^[A-Z0-9-]+$/, `${source.id}: invalid source id`);
  assert.ok(!ids.has(source.id), `${source.id}: duplicate source id`);
  ids.add(source.id);
  assert.ok(source.label && source.sourceType && source.status, `${source.id}: identity/status fields required`);
  assert.ok(["public", "strict_private"].includes(source.privacyClass), `${source.id}: unknown privacy class`);
  if (source.privacyClass === "strict_private") {
    assert.notEqual(source.publicUse, "raw_republish", `${source.id}: private source cannot allow raw republication`);
  }
  if (source.sourceType.startsWith("telegram_export") || source.sourceType === "gmail_internal_signal") {
    assert.equal(source.currentTruth, false, `${source.id}: historical/private signal must not be treated as current public truth`);
  }
}
walk(sources);

const strongHistorical = scoreInsightCandidate({
  signals: {
    freshness: 18,
    authority: 18,
    firstPartyEvidence: 18,
    historicalComparison: 15,
    searchValue: 14,
    internalLinkFit: 10,
  },
});
assert.equal(strongHistorical.score, 93);
assert.equal(strongHistorical.recommendation, "standalone_historical");

const privateUnverified = scoreInsightCandidate({
  signals: {
    freshness: 15,
    authority: 12,
    firstPartyEvidence: 16,
    historicalComparison: 8,
    searchValue: 10,
    internalLinkFit: 8,
    privacyRisk: 30,
    unverifiedCurrentClaim: 25,
  },
});
assert.ok(privateUnverified.score < 40);
assert.equal(privateUnverified.recommendation, "hold");

console.log(`Insights source registry contract passed: ${sources.length} governed source(s).`);
