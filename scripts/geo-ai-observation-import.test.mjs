import assert from "node:assert/strict";
import {
  importGeoAiObservationBatch,
  importGeoAiObservationRow,
} from "../src/data/geo-ai-observation-import.ts";

const safeRow = {
  id: "OBS_IMPORT_001",
  prompt_id: "LOG-01",
  provider: "chatgpt",
  observed_at: "2026-08-18T10:00:00Z",
  reviewer_label: "reviewer_a",
  brand_mentioned: true,
  linked_citation: true,
  cited_path: "/logistics/car-hauling-dispatch/",
  recommendation: "considered_option",
  entity_accuracy: "accurate",
  description_accuracy: "accurate",
  factual_error: false,
  competitors: ["Alpha Dispatch", "alpha dispatch", "Beta Logistics"],
  corrective_action: "",
  evidence_reference: "approved-note://geo/obs-import-001",
};

const imported = importGeoAiObservationRow(safeRow);
assert.deepEqual(imported, {
  id: "OBS_IMPORT_001",
  promptId: "LOG-01",
  provider: "chatgpt",
  observedAt: "2026-08-18T10:00:00Z",
  reviewer: "reviewer_a",
  brandMentioned: true,
  linkedCitation: true,
  citedPath: "/logistics/car-hauling-dispatch/",
  recommendation: "considered_option",
  entityAccuracy: "accurate",
  descriptionAccuracy: "accurate",
  factualError: false,
  competitors: ["Alpha Dispatch", "Beta Logistics"],
  correctiveAction: "",
  evidenceReference: "approved-note://geo/obs-import-001",
});
assert.equal(imported.synthetic, undefined, "real observation import must never silently mark a row synthetic");

const noMention = importGeoAiObservationRow({
  ...safeRow,
  id: "OBS_IMPORT_002",
  brand_mentioned: false,
  linked_citation: false,
  cited_path: "",
  recommendation: "none",
  entity_accuracy: "not_applicable",
  description_accuracy: "not_applicable",
  competitors: [],
});
assert.equal(noMention.brandMentioned, false);

assert.equal(importGeoAiObservationBatch([safeRow, { ...safeRow, id: "OBS_IMPORT_003", provider: "gemini" }]).length, 2);

assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, raw_response: "full provider answer" }),
  /Raw AI conversation field is forbidden/,
);
assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, email: "private@example.com" }),
  /Unsupported AI visibility import field/,
);
assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, reviewer_label: "Vladimir Viktorovich" }),
  /pseudonymous role\/opaque label/,
);
assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, evidence_reference: "send to private@example.com" }),
  /must not contain an email address/,
);
assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, corrective_action: "Call +1 (262) 555-0199" }),
  /must not contain a phone-like number/,
);
assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, provider: "unknown_engine" }),
  /unsupported value/,
);
assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, prompt_id: "UNKNOWN-PROMPT" }),
  /Unknown AI visibility prompt/,
);
assert.throws(
  () => importGeoAiObservationRow({ ...safeRow, linked_citation: true, cited_path: "https:\/\/example.com\/" }),
  /site-relative citedPath/,
);
assert.throws(
  () => importGeoAiObservationBatch([safeRow, { ...safeRow }]),
  /Duplicate AI visibility observation id/,
);
assert.throws(
  () => importGeoAiObservationBatch([
    safeRow,
    { ...safeRow, id: "OBS_IMPORT_004" },
  ]),
  /Duplicate AI visibility prompt\/provider\/time checkpoint/,
);

const serialized = JSON.stringify(importGeoAiObservationBatch([safeRow])).toLowerCase();
for (const prohibitedKey of ["email", "phone", "conversation", "raw_response", "full_answer", "token", "cookie", "accountid"] ) {
  assert.ok(!serialized.includes(`\"${prohibitedKey}\"`), `imported observations must not add ${prohibitedKey} fields`);
}

console.log("GEO sanitized AI observation import contract passed");
