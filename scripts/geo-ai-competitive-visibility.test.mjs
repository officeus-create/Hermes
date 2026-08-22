import assert from "node:assert/strict";
import {
  buildGeoAiCompetitiveSummary,
  buildGeoAiCompetitiveVisibility,
} from "../src/data/geo-ai-competitive-visibility.ts";

const carOwner = "/logistics/car-hauling-dispatch/";
const base = {
  observedAt: "2026-08-18T10:00:00Z",
  reviewer: "Sanitized reviewer label",
  recommendation: "none",
  entityAccuracy: "accurate",
  descriptionAccuracy: "accurate",
  factualError: false,
  correctiveAction: "",
  evidenceReference: "approved-note://geo/competitive",
};

const observations = [
  {
    ...base,
    id: "COMP-1",
    promptId: "LOG-01",
    provider: "chatgpt",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: carOwner,
    competitors: ["Alpha Dispatch", "Beta Logistics", "alpha dispatch"],
  },
  {
    ...base,
    id: "COMP-2",
    promptId: "LOG-01",
    provider: "chatgpt",
    brandMentioned: false,
    linkedCitation: false,
    citedPath: "",
    entityAccuracy: "not_applicable",
    descriptionAccuracy: "not_applicable",
    competitors: ["Beta Logistics"],
  },
  {
    ...base,
    id: "COMP-3",
    promptId: "LOG-01",
    provider: "gemini",
    brandMentioned: true,
    linkedCitation: false,
    citedPath: "",
    competitors: [],
  },
  {
    ...base,
    id: "COMP-SYNTHETIC",
    promptId: "LOG-01",
    provider: "perplexity",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: carOwner,
    competitors: ["Synthetic Rival"],
    synthetic: true,
  },
];

const summary = buildGeoAiCompetitiveSummary(observations);
assert.equal(summary.observations, 3, "synthetic observations must not enter competitive reporting");
assert.equal(summary.hermesMentions, 2);
assert.equal(summary.observationsWithCompetitors, 2);
assert.equal(summary.competitorMentionOccurrences, 3, "duplicate competitor labels in one answer must be deduplicated");
assert.deepEqual(summary.uniqueCompetitors.sort(), ["Alpha Dispatch", "Beta Logistics"].sort());
assert.equal(summary.hermesPresenceRate, 66.7);
assert.equal(summary.competitorInclusionRate, 66.7);
assert.equal(summary.entityMentionShare, 40, "entity mention share is Hermes mentions divided by reviewed entity mention occurrences");

const records = buildGeoAiCompetitiveVisibility(observations);
const all = records.find((item) => item.canonicalOwner === carOwner && item.provider === "all");
const chatgpt = records.find((item) => item.canonicalOwner === carOwner && item.provider === "chatgpt");
const gemini = records.find((item) => item.canonicalOwner === carOwner && item.provider === "gemini");

assert.ok(all);
assert.equal(all.observations, 3);
assert.equal(all.entityMentionShare, 40);
assert.ok(chatgpt);
assert.equal(chatgpt.observations, 2);
assert.equal(chatgpt.hermesPresenceRate, 50);
assert.equal(chatgpt.competitorInclusionRate, 100);
assert.ok(gemini);
assert.equal(gemini.observations, 1);
assert.equal(gemini.hermesPresenceRate, 100);
assert.equal(gemini.entityMentionShare, 100);

assert.throws(
  () => buildGeoAiCompetitiveVisibility([
    { ...observations[0], id: "COMP-UNKNOWN", promptId: "UNKNOWN-PROMPT" },
  ]),
  /Unknown AI visibility prompt/,
  "competitive metrics must not silently accept ungoverned prompts",
);

const serialized = JSON.stringify(records).toLowerCase();
for (const prohibitedField of ["email", "phone", "mc", "usdot", "vin", "token", "cookie", "accountid"]) {
  assert.ok(!serialized.includes(`\"${prohibitedField}\"`), `competitive visibility output must not add ${prohibitedField} fields`);
}

console.log("GEO AI competitive visibility contract passed");
