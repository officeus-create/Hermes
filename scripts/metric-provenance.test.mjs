import assert from "node:assert/strict";
import {
  assertMetricEvidenceRecord,
  validateMetricEvidenceRecord,
} from "../src/data/metric-provenance.ts";

const base = {
  metricId: "example-metric",
  label: "Example metric",
  value: 42,
  unit: "count",
  period: { kind: "as_of", asOf: "2026-08-05" },
  scope: "Synthetic QA sample",
  sourceType: "repository_contract",
  sourceName: "Hermes reviewed test fixture",
  calculationMethod: "Static synthetic fixture; no production or customer data",
  evidenceClass: "illustrative",
  environment: "illustrative",
  displayLabel: "illustrative_sample",
  lastVerified: "2026-08-05",
  reviewerRole: "Repository reviewer",
  caveat: "Illustrative only; not a business result",
  privacyClass: "public_safe",
  publicationState: "approved",
};

function valid(record) {
  assert.deepEqual(validateMetricEvidenceRecord(record), []);
  assert.equal(assertMetricEvidenceRecord(record), record);
}

function invalid(record, expectedMessages) {
  const errors = validateMetricEvidenceRecord(record);
  for (const expected of expectedMessages) {
    assert(
      errors.some((error) => error.includes(expected)),
      `Expected an error containing ${JSON.stringify(expected)}; received ${JSON.stringify(errors)}`,
    );
  }
  assert.throws(
    () => assertMetricEvidenceRecord(record),
    /Invalid metric evidence record/,
  );
}

valid(base);

valid({
  ...base,
  metricId: "demo-records",
  label: "Demo records",
  value: 4,
  unit: "fictional records",
  scope: "Load Board demonstration dataset",
  sourceType: "synthetic_demo",
  sourceName: "Evergreen Load Board demo generator",
  calculationMethod: "Count of generated fictional records",
  evidenceClass: "illustrative",
  environment: "preview",
  displayLabel: "demo_data",
  caveat: "Fictional and unavailable for booking",
});

valid({
  ...base,
  metricId: "route-screenshot-count",
  label: "Reviewed route screenshots",
  value: 14,
  unit: "PNG files",
  scope: "Seven approved routes across desktop and mobile",
  sourceType: "github_actions_artifact",
  sourceName: "Route screenshot evidence workflow",
  calculationMethod: "Count validated from the reviewed-build artifact manifest",
  evidenceClass: "repository_verified",
  environment: "local_reviewed_build",
  displayLabel: "local_reviewed_build_snapshot",
  caveat: "Local reviewed-build visual QA; not production-domain evidence",
});

valid({
  ...base,
  metricId: "platform-event-count",
  label: "Received platform events",
  value: 8,
  unit: "events",
  period: { kind: "range", start: "2026-08-01", end: "2026-08-05" },
  scope: "Synthetic privacy-safe production verification events",
  sourceType: "authenticated_analytics_property",
  sourceName: "Owner-controlled production analytics property",
  calculationMethod: "Aggregate event count for the controlled verification window",
  evidenceClass: "platform_verified",
  environment: "production",
  displayLabel: "production_verified",
  reviewerRole: "Analytics property owner",
  caveat: "Synthetic verification events excluded from business KPI reporting",
  privacyClass: "aggregate_non_identifying",
});

valid({
  ...base,
  metricId: "field-cwv-status",
  label: "Field Core Web Vitals",
  value: null,
  unit: "status",
  scope: "Canonical production route set",
  sourceType: "field_performance_source",
  sourceName: "Owner-controlled field performance property",
  calculationMethod: "No value reported until sufficient field data exists",
  evidenceClass: "unverified",
  environment: "production",
  displayLabel: "unavailable",
  caveat: "Insufficient field data; Lighthouse lab results are not substituted",
});

valid({
  ...base,
  metricId: "dated-route-status",
  label: "Production route response",
  value: 200,
  unit: "HTTP status",
  period: { kind: "as_of", asOf: "2026-08-05" },
  scope: "Public canonical route",
  sourceType: "read_only_public_verifier",
  sourceName: "Main production verification workflow",
  calculationMethod: "Single dated public HTTP observation with canonical checks",
  evidenceClass: "repository_verified",
  environment: "production",
  displayLabel: "dated_production_snapshot",
  caveat: "Dated observation; not traffic, conversion, or customer-result evidence",
});

invalid(
  { ...base, metricId: "Bad Metric ID" },
  ["metricId must be a lowercase kebab-case identifier"],
);

invalid(
  {
    ...base,
    unit: "",
    sourceName: "",
    calculationMethod: "",
    reviewerRole: "",
    caveat: "",
  },
  [
    "unit is required",
    "sourceName is required",
    "calculationMethod is required",
    "reviewerRole is required",
    "caveat is required",
  ],
);

invalid(
  {
    ...base,
    period: { kind: "range", start: "2026-08-05", end: "2026-08-01" },
  },
  ["period.start must not be after period.end"],
);

invalid(
  {
    ...base,
    evidenceClass: "platform_verified",
    environment: "production",
    displayLabel: "illustrative_sample",
  },
  ["illustrative samples require illustrative evidence and environment"],
);

invalid(
  {
    ...base,
    evidenceClass: "repository_verified",
    environment: "local_reviewed_build",
    displayLabel: "production_verified",
  },
  [
    "production-verified metrics require the production environment",
    "production-verified metrics require receiver, platform, or private-operations evidence",
    "local reviewed-build evidence cannot claim production status",
  ],
);

invalid(
  {
    ...base,
    privacyClass: "private",
    publicationState: "approved",
  },
  ["approved public metrics require a public-safe privacy class"],
);

invalid(
  {
    ...base,
    evidenceClass: "unverified",
    environment: "production",
    displayLabel: "dated_production_snapshot",
  },
  [
    "dated production snapshots require verified evidence",
    "unverified values cannot be approved for public display",
  ],
);

invalid(
  {
    ...base,
    value: 0,
    evidenceClass: "unverified",
    environment: "production",
    displayLabel: "unavailable",
  },
  ["unavailable metrics must use a null value"],
);

invalid(
  {
    ...base,
    value: null,
    evidenceClass: "platform_verified",
    environment: "production",
    displayLabel: "unavailable",
  },
  ["unavailable metrics must use unverified evidence"],
);

invalid(
  {
    ...base,
    evidenceClass: "repository_verified",
    environment: "production",
    displayLabel: "dated_production_snapshot",
    period: { kind: "range", start: "2026-08-01", end: "2026-08-05" },
  },
  ["dated production snapshots require an as-of date"],
);

console.log("Metric provenance contract passed.");
