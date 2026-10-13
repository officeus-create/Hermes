import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMetricEvidenceRecord } from "../src/data/metric-provenance.ts";
import { technologyDashboardMetrics } from "../src/data/technology-concept-metrics.ts";

assert.equal(technologyDashboardMetrics.length, 5);
assert.equal(
  new Set(technologyDashboardMetrics.map((metric) => metric.metricId)).size,
  technologyDashboardMetrics.length,
);

for (const metric of technologyDashboardMetrics) {
  assert.deepEqual(validateMetricEvidenceRecord(metric), []);
  assert.equal(metric.displayLabel, "illustrative_sample");
  assert.equal(metric.evidenceClass, "illustrative");
  assert.equal(metric.environment, "illustrative");
  assert.equal(metric.privacyClass, "public_safe");
  assert.equal(metric.publicationState, "approved");
  assert.equal(metric.sourceType, "synthetic_interface_concept");
  assert.equal(metric.period.kind, "as_of");
  assert.equal(metric.period.asOf, "2026-08-05");
  assert.match(metric.caveat, /synthetic|illustrative/i);
}

assert.deepEqual(
  technologyDashboardMetrics.map(({ label, value, uiNote }) => [label, value, uiNote]),
  [
    ["Leads", "184", "+12% sample"],
    ["Conversions", "28", "15.2% sample"],
    ["Active Tasks", "46", "8 due today"],
    ["Risks", "7", "Needs review"],
    ["Revenue Pipeline", "$284K", "Illustrative"],
  ],
);

const componentSource = readFileSync(
  new URL("../src/components/TechnologySolutionMockups.astro", import.meta.url),
  "utf8",
);
assert.match(componentSource, /technologyDashboardMetrics\.map/);
assert.doesNotMatch(componentSource, /const dashboardMetrics\s*=/);
assert.doesNotMatch(componentSource, /\["Revenue Pipeline",\s*"\$284K"/);

const partnershipSource = readFileSync(
  new URL("../src/components/TechnologyPartnershipShowcase.astro", import.meta.url),
  "utf8",
);
assert.match(partnershipSource, /status:\s*"Source-gated live \+ preview"/);
assert.match(partnershipSource, /approved active records may appear when source, permission, freshness, and visibility gates pass/i);
assert.match(partnershipSource, /preview examples remain clearly labeled and non-bookable/i);
assert.match(partnershipSource, /proof:\s*"Open the source-gated Load Board"/);
assert.doesNotMatch(partnershipSource, /status:\s*"Local preview"/);
assert.doesNotMatch(partnershipSource, /A Load Board preview with carrier identity/);

console.log("Technology concept metric provenance passed.");
