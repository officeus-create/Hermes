import assert from "node:assert/strict";
import {
  buildGeoAnswerSchema,
  validateGeoAnswerSurface,
} from "../src/data/geo-answer-contract.ts";
import { geoAnswerSurfaceDemo } from "../src/data/geo-answer-surface-demo.ts";

assert.doesNotThrow(() => validateGeoAnswerSurface(geoAnswerSurfaceDemo));

const schema = buildGeoAnswerSchema(geoAnswerSurfaceDemo);
assert.equal(schema["@context"], "https://schema.org");
assert.equal(schema["@type"], "WebPage");
assert.equal(schema.url, "https://hermeslogisticsus.com/demos/geo-answer-surface/");
assert.equal(schema.mainEntity["@type"], "Question");
assert.equal(schema.mainEntity.acceptedAnswer["@type"], "Answer");
assert.equal(schema.mainEntity.acceptedAnswer.text, geoAnswerSurfaceDemo.layers.shortAnswer);
assert.equal(schema.about.length, geoAnswerSurfaceDemo.entities.length);
assert.equal(schema.isBasedOn, undefined, "Demo-only evidence must not be emitted as a public citation");

const longQuestionnaire = {
  ...geoAnswerSurfaceDemo,
  guidedPath: {
    ...geoAnswerSurfaceDemo.guidedPath,
    questions: Array.from({ length: 8 }, (_, index) => ({
      id: `q-${index}`,
      prompt: `Question ${index}`,
      options: [
        { id: `q-${index}-a`, label: "A", realization: "A", outcomeId: "control-route" },
        { id: `q-${index}-b`, label: "B", realization: "B", outcomeId: "control-route" },
      ],
    })),
    startQuestionId: "q-0",
  },
};
assert.throws(() => validateGeoAnswerSurface(longQuestionnaire), /progressive disclosure/);

const danglingEvidence = {
  ...geoAnswerSurfaceDemo,
  claims: geoAnswerSurfaceDemo.claims.map((claim, index) =>
    index === 0 ? { ...claim, truthLabel: "verified_fact", evidenceIds: ["missing-evidence"] } : claim,
  ),
};
assert.throws(() => validateGeoAnswerSurface(danglingEvidence), /missing evidence/);

const unlabeledDemo = {
  ...geoAnswerSurfaceDemo,
  evidence: geoAnswerSurfaceDemo.evidence.map((evidence, index) =>
    index === 0 ? { ...evidence, truthLabel: "verified_fact" } : evidence,
  ),
};
assert.throws(() => validateGeoAnswerSurface(unlabeledDemo), /demo origin must be labeled demo/);

const serialized = JSON.stringify(geoAnswerSurfaceDemo).toLowerCase();
for (const prohibitedField of [
  "email",
  "phone",
  "password",
  "token",
  "cookie",
  "accountid",
  "streamid",
  "conversation",
  "customername",
]) {
  assert.ok(!serialized.includes(`\"${prohibitedField}\"`), `GEO answer contract must not contain ${prohibitedField} fields`);
}

assert.equal(geoAnswerSurfaceDemo.guidedPath.questions.length, 2);
assert.ok(
  geoAnswerSurfaceDemo.guidedPath.questions.every((question) => question.options.length >= 2 && question.options.length <= 5),
  "Guided path must stay small and choice-oriented",
);
assert.ok(
  geoAnswerSurfaceDemo.guidedPath.outcomes.every((outcome) => outcome.nextAction.href.startsWith("/")),
  "Every personalized outcome needs a site-relative next action",
);

console.log("GEO answer contract passed");