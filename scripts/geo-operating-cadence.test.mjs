import assert from "node:assert/strict";
import {
  auditGeoCurrentStateEntrypoints,
  buildGeoCadenceState,
  buildGeoOperatingCadenceQueue,
  classifyGeoEvidenceWindow,
  compareGeoEvidenceWindows,
  evaluateGeoNextGrowthWaveGate,
  geoCanonicalCurrentStateEntrypoint,
} from "../src/data/geo-operating-cadence.ts";

assert.deepEqual(classifyGeoEvidenceWindow("2026-08-01", "2026-08-07"), {
  startDate: "2026-08-01",
  endDate: "2026-08-07",
  inclusiveDays: 7,
  standardWindow: 7,
  comparisonClass: "standard_comparable",
});
assert.equal(classifyGeoEvidenceWindow("2026-07-30", "2026-08-16").inclusiveDays, 18);
assert.equal(classifyGeoEvidenceWindow("2026-07-30", "2026-08-16").standardWindow, null);
assert.equal(classifyGeoEvidenceWindow("2026-07-30", "2026-08-16").comparisonClass, "exact_checkpoint_only");

assert.deepEqual(buildGeoCadenceState({ lastCheckedAt: null, asOf: "2026-08-19T12:00:00Z", cadenceDays: 7 }), {
  state: "never_checked",
  ageDays: null,
  overdueDays: null,
});
assert.equal(buildGeoCadenceState({ lastCheckedAt: "2026-08-18T12:00:00Z", asOf: "2026-08-19T12:00:00Z", cadenceDays: 7 }).state, "current");
assert.equal(buildGeoCadenceState({ lastCheckedAt: "2026-08-13T12:00:00Z", asOf: "2026-08-19T12:00:00Z", cadenceDays: 7 }).state, "due");
assert.equal(buildGeoCadenceState({ lastCheckedAt: "2026-08-10T12:00:00Z", asOf: "2026-08-19T12:00:00Z", cadenceDays: 7 }).state, "overdue");

const comparable = compareGeoEvidenceWindows(
  {
    canonicalOwner: "/services/seo/",
    startDate: "2026-08-01",
    endDate: "2026-08-28",
    scopeKey: "us_owner",
    evidenceClass: "platform_verified",
  },
  {
    canonicalOwner: "/services/seo/",
    startDate: "2026-07-01",
    endDate: "2026-07-28",
    scopeKey: "us_owner",
    evidenceClass: "platform_verified",
  },
);
assert.equal(comparable.comparable, true);
assert.deepEqual(comparable.reasons, []);
const notComparable = compareGeoEvidenceWindows(
  {
    canonicalOwner: "/services/seo/",
    startDate: "2026-08-01",
    endDate: "2026-08-18",
    scopeKey: "worldwide_owner",
    evidenceClass: "owner_provided_handoff",
  },
  {
    canonicalOwner: "/services/seo/",
    startDate: "2026-07-01",
    endDate: "2026-07-28",
    scopeKey: "us_owner",
    evidenceClass: "platform_verified",
  },
);
assert.equal(notComparable.comparable, false);
assert.ok(notComparable.reasons.includes("window_length_changed"));
assert.ok(notComparable.reasons.includes("scope_changed"));
assert.ok(notComparable.reasons.includes("evidence_class_changed"));

const cadence = buildGeoOperatingCadenceQueue([
  {
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    commercialPriority: "high",
    lastEvidenceHealthAt: "2026-08-10T12:00:00Z",
    last28DayComparisonAt: null,
    last90DayComparisonAt: "2026-08-18T12:00:00Z",
  },
  {
    canonicalOwner: "/services/seo-for-logistics-companies/",
    commercialPriority: "high",
    lastEvidenceHealthAt: "2026-08-18T12:00:00Z",
    last28DayComparisonAt: null,
    last90DayComparisonAt: null,
  },
], "2026-08-19T12:00:00Z");
assert.equal(cadence.length, 6);
assert.equal(cadence[0].state, "overdue");
assert.equal(cadence[0].canonicalOwner, "/logistics/car-hauling-dispatch/");
assert.ok(cadence.some((item) => item.lane === "primary_28_day_comparison" && item.state === "never_checked"));
assert.ok(cadence.some((item) => item.lane === "authority_90_day_trend" && item.state === "never_checked"));

assert.equal(geoCanonicalCurrentStateEntrypoint, "docs/GEO_CURRENT_STATE.md");
assert.deepEqual(auditGeoCurrentStateEntrypoints([
  { path: "docs/GEO_CURRENT_STATE.md", current: true },
  { path: "docs/GEO_AI_VISIBILITY_ARCHITECTURE.md", current: false },
]), {
  ready: true,
  current: ["docs/GEO_CURRENT_STATE.md"],
  issues: [],
});
assert.equal(auditGeoCurrentStateEntrypoints([
  { path: "docs/GEO_CURRENT_STATE.md", current: true },
  { path: "docs/GEO_AI_VISIBILITY_ARCHITECTURE.md", current: true },
]).ready, false);

const blockedGrowth = evaluateGeoNextGrowthWaveGate({
  evidenceTrigger: false,
  canonicalOwner: null,
  measurableOutcomeDefined: false,
  distinctEvidenceAvailable: false,
  conflictsWithOpenHigherPriorityGap: true,
  proposedMaterialVisualChange: true,
  ceoVisualApprovalPresent: false,
});
assert.equal(blockedGrowth.mayStart, false);
assert.ok(blockedGrowth.blockers.includes("evidence_trigger_missing"));
assert.ok(blockedGrowth.blockers.includes("higher_priority_measurement_or_qualification_gap_open"));
assert.ok(blockedGrowth.blockers.includes("ceo_visual_approval_missing"));

const allowedGrowth = evaluateGeoNextGrowthWaveGate({
  evidenceTrigger: true,
  canonicalOwner: "/services/seo-for-logistics-companies/",
  measurableOutcomeDefined: true,
  distinctEvidenceAvailable: true,
  conflictsWithOpenHigherPriorityGap: false,
  proposedMaterialVisualChange: false,
  ceoVisualApprovalPresent: false,
});
assert.equal(allowedGrowth.mayStart, true);
assert.deepEqual(allowedGrowth.blockers, []);
assert.match(allowedGrowth.rule, /verified evidence/i);

console.log("GEO operating cadence and next growth gate passed");
