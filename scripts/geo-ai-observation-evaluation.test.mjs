import assert from "node:assert/strict";
import {
  buildGeoAiOwnerVisibility,
  evaluateAiVisibilityObservation,
  geoAiOwnerReviewQueue,
  validateAiVisibilityObservationForGeo,
} from "../src/data/geo-ai-observation-evaluation.ts";

const base = {
  promptId: "LOG-01",
  provider: "chatgpt",
  observedAt: "2026-08-18T12:00:00Z",
  reviewer: "Sanitized reviewer",
  brandMentioned: true,
  linkedCitation: true,
  citedPath: "/logistics/car-hauling-dispatch/",
  recommendation: "considered_option",
  entityAccuracy: "accurate",
  descriptionAccuracy: "accurate",
  factualError: false,
  competitors: [],
  correctiveAction: "",
  evidenceReference: "approved-note://geo/log-01",
};

const canonical = { ...base, id: "OBS-CANONICAL" };
const otherOwner = {
  ...base,
  id: "OBS-OTHER-OWNER",
  provider: "gemini",
  citedPath: "/logistics/resources/dispatch-service-vs-self-dispatch/",
};
const unmapped = {
  ...base,
  id: "OBS-UNMAPPED",
  provider: "perplexity",
  citedPath: "/contacts/",
};
const noCitation = {
  ...base,
  id: "OBS-NO-CITE",
  provider: "google_ai_mode",
  linkedCitation: false,
  citedPath: "",
  recommendation: "source_only",
};
const synthetic = { ...canonical, id: "OBS-SYNTHETIC", synthetic: true };

assert.doesNotThrow(() => validateAiVisibilityObservationForGeo(canonical));
assert.equal(evaluateAiVisibilityObservation(canonical).citationAlignment, "canonical_owner");
assert.equal(evaluateAiVisibilityObservation(canonical).requiresOwnerReview, false);
assert.equal(evaluateAiVisibilityObservation(otherOwner).citationAlignment, "other_hermes_owner");
assert.equal(evaluateAiVisibilityObservation(otherOwner).requiresOwnerReview, true);
assert.equal(evaluateAiVisibilityObservation(unmapped).citationAlignment, "unmapped_hermes_path");
assert.equal(evaluateAiVisibilityObservation(unmapped).requiresOwnerReview, true);
assert.equal(evaluateAiVisibilityObservation(noCitation).citationAlignment, "no_linked_citation");
assert.equal(evaluateAiVisibilityObservation(noCitation).requiresOwnerReview, false);

const ownerRows = buildGeoAiOwnerVisibility([canonical, otherOwner, unmapped, noCitation, synthetic]);
const carHauling = ownerRows.find((item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/");
assert.ok(carHauling);
assert.equal(carHauling.observations, 4, "Synthetic QA must be excluded from owner visibility");
assert.equal(carHauling.linkedCitations, 3);
assert.equal(carHauling.canonicalOwnerCitations, 1);
assert.equal(carHauling.otherHermesOwnerCitations, 1);
assert.equal(carHauling.unmappedHermesCitations, 1);
assert.equal(carHauling.ownerCitationRate, 25);
assert.equal(carHauling.citationOwnerAccuracyRate, 33.3);
assert.deepEqual(new Set(carHauling.providersObserved), new Set(["chatgpt", "gemini", "perplexity", "google_ai_mode"]));

const reviewQueue = geoAiOwnerReviewQueue([canonical, otherOwner, unmapped, noCitation, synthetic]);
assert.deepEqual(reviewQueue.map((item) => item.observationId), ["OBS-OTHER-OWNER", "OBS-UNMAPPED"]);

assert.throws(
  () => validateAiVisibilityObservationForGeo({ ...canonical, id: "BAD-PROMPT", promptId: "UNKNOWN" }),
  /Unknown AI visibility prompt/,
);
assert.throws(
  () => validateAiVisibilityObservationForGeo({ ...canonical, id: "BAD-CITE", linkedCitation: true, citedPath: "https://example.com" }),
  /site-relative citedPath/,
);
assert.throws(
  () => validateAiVisibilityObservationForGeo({ ...canonical, id: "BAD-HIDDEN-CITE", linkedCitation: false, citedPath: "/contacts/" }),
  /must not set citedPath/,
);
assert.throws(
  () => validateAiVisibilityObservationForGeo({
    ...canonical,
    id: "BAD-NO-MENTION",
    brandMentioned: false,
    linkedCitation: false,
    citedPath: "",
    recommendation: "none",
    entityAccuracy: "accurate",
    descriptionAccuracy: "not_applicable",
  }),
  /not_applicable accuracy states/,
);

console.log("GEO AI observation evaluation passed");