import assert from "node:assert/strict";
import {
  buildGeoAiReviewPlan,
  defaultGeoAiReviewProviders,
  dueGeoAiReviewChecks,
} from "../src/data/geo-ai-review-plan.ts";

const asOf = "2026-08-18T12:00:00Z";
const baseObservation = {
  reviewer: "Sanitized reviewer label",
  brandMentioned: true,
  linkedCitation: true,
  citedPath: "/logistics/car-hauling-dispatch/",
  recommendation: "considered_option",
  entityAccuracy: "accurate",
  descriptionAccuracy: "accurate",
  factualError: false,
  competitors: [],
  correctiveAction: "",
  evidenceReference: "approved-note://geo/review-plan",
};

const observations = [
  {
    ...baseObservation,
    id: "REVIEW-LOG-WEEKLY",
    promptId: "LOG-01",
    provider: "chatgpt",
    observedAt: "2026-08-10T12:00:00Z",
  },
  {
    ...baseObservation,
    id: "REVIEW-MKT-MONTHLY",
    promptId: "MKT-02",
    provider: "gemini",
    citedPath: "/services/website-development/",
    observedAt: "2026-08-08T12:00:00Z",
  },
  {
    ...baseObservation,
    id: "REVIEW-SYNTHETIC-RECENT",
    promptId: "LOG-01",
    provider: "chatgpt",
    observedAt: "2026-08-18T11:00:00Z",
    synthetic: true,
  },
];

const plan = buildGeoAiReviewPlan({
  asOf,
  observations,
  providers: ["chatgpt", "gemini"],
});

assert.equal(plan.providers.length, 2);
assert.equal(plan.summary.totalChecks, 96, "48 prompts × 2 explicitly reviewed providers must be scheduled");
assert.equal(plan.summary.neverObserved, 94);
assert.equal(plan.summary.overdue, 1);
assert.equal(plan.summary.current, 1);
assert.ok(plan.summary.weeklyChecks > 0);
assert.ok(plan.summary.monthlyChecks > 0);

const weekly = plan.queue.find((item) => item.promptId === "LOG-01" && item.provider === "chatgpt");
assert.ok(weekly);
assert.equal(weekly.reviewPeriodDays, 7);
assert.equal(weekly.status, "overdue", "synthetic observations must not reset a real review due date");
assert.equal(weekly.lastObservedAt, "2026-08-10T12:00:00.000Z");
assert.equal(weekly.nextDueAt, "2026-08-17T12:00:00.000Z");
assert.equal(weekly.daysUntilDue, -1);
assert.equal(weekly.canonicalOwner, "/logistics/car-hauling-dispatch/");

const monthly = plan.queue.find((item) => item.promptId === "MKT-02" && item.provider === "gemini");
assert.ok(monthly);
assert.equal(monthly.reviewPeriodDays, 28);
assert.equal(monthly.status, "current");
assert.equal(monthly.daysSinceObservation, 10);
assert.equal(monthly.canonicalOwner, "/services/website-development/");

const neverObserved = plan.queue.find((item) => item.promptId === "LOG-01" && item.provider === "gemini");
assert.ok(neverObserved);
assert.equal(neverObserved.status, "never_observed");
assert.equal(neverObserved.lastObservedAt, null);

const due = dueGeoAiReviewChecks(plan);
assert.equal(due.length, plan.summary.neverObserved + plan.summary.overdue + plan.summary.dueSoon);
assert.ok(due.every((item) => item.status !== "current"));

assert.deepEqual(defaultGeoAiReviewProviders, [
  "chatgpt",
  "gemini",
  "copilot",
  "perplexity",
  "google_ai_mode",
]);

assert.throws(
  () => buildGeoAiReviewPlan({ asOf, observations, providers: [] }),
  /at least one provider/,
);
assert.throws(
  () => buildGeoAiReviewPlan({ asOf, observations, providers: ["chatgpt", "chatgpt"] }),
  /providers must be unique/,
);
assert.throws(
  () => buildGeoAiReviewPlan({ asOf, observations, providers: ["chatgpt"], dueSoonDays: 8 }),
  /between 0 and 7/,
);
assert.throws(
  () => buildGeoAiReviewPlan({
    asOf,
    providers: ["chatgpt"],
    observations: [
      {
        ...baseObservation,
        id: "REVIEW-UNKNOWN",
        promptId: "UNKNOWN-PROMPT",
        provider: "chatgpt",
        observedAt: "2026-08-18T10:00:00Z",
      },
    ],
  }),
  /Unknown AI visibility prompt/,
);
assert.throws(
  () => buildGeoAiReviewPlan({
    asOf,
    providers: ["chatgpt"],
    observations: [
      {
        ...baseObservation,
        id: "REVIEW-FUTURE",
        promptId: "LOG-01",
        provider: "chatgpt",
        observedAt: "2026-08-19T10:00:00Z",
      },
    ],
  }),
  /cannot be later than asOf/,
);

const serialized = JSON.stringify(plan).toLowerCase();
for (const prohibitedField of ["email", "phone", "mc", "usdot", "vin", "token", "cookie", "accountid", "conversation"]) {
  assert.ok(!serialized.includes(`\"${prohibitedField}\"`), `review queue must not add ${prohibitedField} fields`);
}

console.log("GEO manual AI visibility review scheduler passed");
