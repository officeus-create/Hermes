import assert from "node:assert/strict";
import {
  assertGeoEvidenceGraphReady,
  buildGeoEvidenceGraph,
} from "../src/data/geo-evidence-graph.ts";
import { geoAnswerSurfaceDemo } from "../src/data/geo-answer-surface-demo.ts";
import { geoCarHaulingAnswerCandidate } from "../src/data/geo-car-hauling-answer-candidate.ts";

const demoGraph = buildGeoEvidenceGraph(geoAnswerSurfaceDemo);
assert.deepEqual(demoGraph.answerClaimIds, geoAnswerSurfaceDemo.layers.evidenceClaimIds);
assert.deepEqual(demoGraph.publicAnswerCitationUrls, [], "Demo evidence must never become a public answer citation");
assert.deepEqual(demoGraph.unusedEvidenceIds, []);
assert.deepEqual(demoGraph.unexposedClaimIds, []);
assert.deepEqual(demoGraph.publicSourceWithoutUrlIds, []);
assert.doesNotThrow(() => assertGeoEvidenceGraphReady(geoAnswerSurfaceDemo));

const carGraph = assertGeoEvidenceGraphReady(geoCarHaulingAnswerCandidate);
assert.deepEqual(carGraph.unusedEvidenceIds, []);
assert.deepEqual(carGraph.unexposedClaimIds, []);
assert.deepEqual(carGraph.publicSourceWithoutUrlIds, []);
assert.deepEqual(carGraph.publicAnswerCitationUrls, [
  "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
]);
assert.ok(
  carGraph.usage.every((item) => item.supportsVisibleAnswerClaim),
  "Every current car-hauling evidence item must support a visible answer claim",
);

const orphanEvidence = {
  ...geoCarHaulingAnswerCandidate,
  evidence: [
    ...geoCarHaulingAnswerCandidate.evidence,
    {
      id: "unused-public-source",
      title: "Unused source",
      sourceName: "Reviewed public source",
      origin: "public_source",
      truthLabel: "verified_fact",
      summary: "Valid source metadata that is intentionally not connected to any claim, entity, or relationship for this test.",
      url: "https://hermeslogisticsus.com/",
      verifiedAt: "2026-08-18T12:00:00Z",
    },
  ],
};
assert.deepEqual(buildGeoEvidenceGraph(orphanEvidence).unusedEvidenceIds, ["unused-public-source"]);
assert.throws(() => assertGeoEvidenceGraphReady(orphanEvidence), /Unused GEO evidence/);

const hiddenClaim = {
  ...geoCarHaulingAnswerCandidate,
  claims: [
    ...geoCarHaulingAnswerCandidate.claims,
    {
      id: "hidden-claim",
      text: "A valid but intentionally unexposed test claim.",
      truthLabel: "verified_fact",
      evidenceIds: ["car-hauling-public-owner"],
    },
  ],
};
assert.deepEqual(buildGeoEvidenceGraph(hiddenClaim).unexposedClaimIds, ["hidden-claim"]);
assert.throws(() => assertGeoEvidenceGraphReady(hiddenClaim), /not exposed in the human answer evidence layer/);

const publicSourceWithoutUrl = {
  ...geoCarHaulingAnswerCandidate,
  evidence: geoCarHaulingAnswerCandidate.evidence.map((evidence) => ({ ...evidence, url: undefined })),
};
assert.deepEqual(buildGeoEvidenceGraph(publicSourceWithoutUrl).publicSourceWithoutUrlIds, ["car-hauling-public-owner"]);
assert.throws(() => assertGeoEvidenceGraphReady(publicSourceWithoutUrl), /missing reviewed URL/);

console.log("GEO answer evidence graph diagnostics passed");
