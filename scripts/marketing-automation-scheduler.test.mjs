import assert from "node:assert/strict";
import fs from "node:fs";

import {
  createIdempotencyKey,
  getLocalClock,
  isJobDue,
  normalizeObservationStatus,
  selectDueJobs,
  validateRegistry,
} from "./marketing-automation-scheduler.mjs";

const registry = validateRegistry(
  JSON.parse(fs.readFileSync("config/marketing-automation-capabilities.json", "utf8")),
);

assert.equal(registry.schema_version, 1);
assert.ok(registry.jobs.length >= 10, "registry should preserve the baseline marketing job family");
assert.equal(new Set(registry.jobs.map((job) => job.id)).size, registry.jobs.length);

for (const job of registry.jobs) {
  const permission = registry.permission_classes[job.permission_class];
  assert.ok(permission, `permission class must exist for ${job.id}`);
  if (job.public_write) {
    assert.equal(job.permission_class, "LIVE_WRITE_GATED");
    assert.equal(permission.requires_confirmation, true);
  }
}

const summerChicago = getLocalClock("2026-07-06T11:30:00Z", "America/Chicago");
assert.equal(summerChicago.dateKey, "2026-07-06");
assert.equal(summerChicago.weekday, "Mon");
assert.equal(summerChicago.hour, 6);
assert.equal(summerChicago.minute, 30);

const winterChicago = getLocalClock("2026-12-07T12:30:00Z", "America/Chicago");
assert.equal(winterChicago.dateKey, "2026-12-07");
assert.equal(winterChicago.weekday, "Mon");
assert.equal(winterChicago.hour, 6);
assert.equal(winterChicago.minute, 30);

const gscJob = registry.jobs.find((job) => job.id === "gsc_query_page_delta");
assert.ok(gscJob);
assert.equal(
  isJobDue(gscJob, "2026-07-06T11:30:00Z", "America/Chicago", 15),
  true,
  "06:20 local job should be selected by the 06:30 poll window",
);
assert.equal(
  isJobDue(gscJob, "2026-07-06T11:35:00Z", "America/Chicago", 15),
  false,
  "job must not be re-selected after the 15-minute due window",
);

const weeklyJob = registry.jobs.find((job) => job.id === "weekly_competitor_keyword_refresh");
assert.ok(weeklyJob);
assert.equal(
  isJobDue(weeklyJob, "2026-07-06T11:00:00Z", "America/Chicago", 15),
  true,
  "weekly Monday job should be due on Monday at 06:00 local",
);
assert.equal(
  isJobDue(weeklyJob, "2026-07-07T11:00:00Z", "America/Chicago", 15),
  false,
  "weekly Monday job must not be due on Tuesday",
);

const monthlyJob = registry.jobs.find((job) => job.id === "monthly_full_evidence_review");
assert.ok(monthlyJob);
assert.equal(
  isJobDue(monthlyJob, "2026-10-01T11:00:00Z", "America/Chicago", 15),
  true,
  "monthly job should be due on the first local day of the month",
);
assert.equal(
  isJobDue(monthlyJob, "2026-10-02T11:00:00Z", "America/Chicago", 15),
  false,
  "monthly job must not run on a non-configured local day",
);

const fridayDue = selectDueJobs({
  registry,
  businessId: "demo-business",
  locationId: "demo-location",
  timeZone: "America/Chicago",
  now: "2026-07-03T20:00:00Z",
});
assert.ok(
  fridayDue.some((job) => job.job_id === "weekly_action_scorecard"),
  "Friday 15:00 local should select the weekly action scorecard",
);
assert.ok(
  fridayDue.every((job) => job.time_zone === "America/Chicago"),
  "selected jobs must preserve the business-local timezone",
);

assert.throws(
  () =>
    selectDueJobs({
      registry,
      businessId: "",
      locationId: "demo-location",
      timeZone: "America/Chicago",
      now: "2026-07-03T20:00:00Z",
    }),
  /required tenant scope/,
  "missing tenant scope must fail closed even before a provider can run",
);

const dailyBrief = registry.jobs.find((job) => job.id === "daily_marketing_brief");
const firstKey = createIdempotencyKey({
  businessId: "demo-business",
  locationId: "demo-location",
  job: dailyBrief,
  now: "2026-07-06T13:00:00Z",
  timeZone: "America/Chicago",
});
const retryKey = createIdempotencyKey({
  businessId: "demo-business",
  locationId: "demo-location",
  job: dailyBrief,
  now: "2026-07-06T13:10:00Z",
  timeZone: "America/Chicago",
});
assert.equal(firstKey, retryKey, "retries in the same scheduled slot need the same idempotency key");

const otherLocationKey = createIdempotencyKey({
  businessId: "demo-business",
  locationId: "other-location",
  job: dailyBrief,
  now: "2026-07-06T13:00:00Z",
  timeZone: "America/Chicago",
});
assert.notEqual(firstKey, otherLocationKey, "different locations must never share an idempotency key");

assert.equal(normalizeObservationStatus(), "UNKNOWN");
assert.equal(normalizeObservationStatus("deferred"), "DEFERRED");
assert.equal(normalizeObservationStatus("zero"), "ZERO");
assert.throws(
  () => normalizeObservationStatus("0"),
  /not a valid evidence status/,
  "numeric-looking zero must not silently replace a missing evidence state",
);

assert.throws(
  () => getLocalClock("2026-07-06T11:30:00Z", "Not/A_Timezone"),
  /Unsupported IANA timezone/,
);

const unsafeRegistry = structuredClone(registry);
unsafeRegistry.jobs.push({
  id: "unsafe_public_write",
  capability: "marketing.gbp_profile_audit",
  permission_class: "READ_ONLY_AUTOMATIC",
  consumes_budget: false,
  public_write: true,
  provider_preferences: ["google-business-profile"],
  schedule: { cadence: "daily", local_time: "09:00" },
  done_condition: "must fail validation",
});
assert.throws(
  () => validateRegistry(unsafeRegistry),
  /Public-write job unsafe_public_write must use LIVE_WRITE_GATED/,
);

process.stdout.write(
  `marketing automation scheduler contract PASS (${registry.jobs.length} registered jobs)\n`,
);
