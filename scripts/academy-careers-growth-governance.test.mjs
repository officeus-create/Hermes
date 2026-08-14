import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  careerPublicBoundaries,
  isVacancyEligibleForJobPosting,
  publicVacancyRegistry,
  verifiedOpenVacancies,
} from "../src/data/careers-governance.ts";
import {
  finalGrowthReadinessChecklist,
  growthReleaseWatchlist,
  isReleaseReadyForInspection,
  monthlyGrowthScorecard,
  weeklyGrowthScorecard,
} from "../src/data/growth-release-governance.ts";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const academy = await readFile(join(dist, "paths/academy/index.html"), "utf8");
const careers = await readFile(join(dist, "logistics/careers/index.html"), "utf8");
const carHaulingDispatcher = await readFile(join(dist, "careers/car-hauling-dispatcher/index.html"), "utf8");

assert.ok(academy.includes("U.S. Logistics Operations"));
assert.ok(academy.includes("Marketing"));
assert.ok(academy.includes("Two public programs"));
assert.ok(academy.includes("Paid cohort"));
assert.ok(academy.includes("Free practice opportunity"));
assert.ok(academy.includes("No fixed price is published"));
assert.ok(academy.includes("employment, income, clients, certification, promotion"));
assert.ok(academy.includes("optional exercise inside the Marketing program, not a third Academy program"));
assert.ok(!academy.includes("COO / Multi-business leadership"));
assert.ok(!academy.includes("3 tracks"));
for (const prohibitedPrice of ["$999", "$400/month", "$600/month"]) {
  assert.ok(!academy.includes(prohibitedPrice), `Academy must not publish ${prohibitedPrice}`);
}
assert.ok(!/<form\b[^>]*action=/i.test(academy), "Academy must not contain an unreviewed form action");
assert.ok(academy.includes('data-contact-mode="preview"'));
assert.ok(academy.includes('href="mailto:officeus@hermeslogisticsus.com"'));
assert.ok(!academy.includes('href="tel:'));

const academySchemas = [...academy.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
const academyService = academySchemas.find((entity) => entity?.["@type"] === "Service");
assert.ok(academyService, "Academy Service schema is required");
assert.deepEqual(academyService.serviceType, ["U.S. Logistics Operations", "Marketing"]);

assert.equal(publicVacancyRegistry.length, 1);
assert.equal(verifiedOpenVacancies.length, 1);
assert.equal(verifiedOpenVacancies[0]?.slug, "car-hauling-dispatcher");
assert.ok(careers.includes("Verified public vacancies are open."));
assert.ok(careers.includes("1</strong>"));
assert.ok(careers.includes("Car Hauling Dispatcher — Remote / U.S. Market"));
assert.ok(careers.includes('href="/careers/car-hauling-dispatcher/"'));
assert.ok(careers.includes('href="/logistics/apply/?for=career"'));
assert.ok(careers.includes("does not guarantee review timing, interview, training access, team placement, employment"));
assert.ok(!careers.includes('"@type":"JobPosting"'));
assert.ok(!careers.includes('"@type": "JobPosting"'));
assert.ok(careerPublicBoundaries.length >= 5);

const jobSchemas = [...carHaulingDispatcher.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
const jobPostings = jobSchemas.filter((entity) => entity?.["@type"] === "JobPosting");
assert.equal(jobPostings.length, 1);
assert.equal(jobPostings[0].title, "Car Hauling Dispatcher — Remote / U.S. Market");
assert.equal(jobPostings[0].employmentType, "FULL_TIME");
assert.equal(jobPostings[0].jobLocationType, "TELECOMMUTE");
assert.equal(jobPostings[0].datePosted, "2026-02-26");
assert.equal(jobPostings[0].validThrough, "2026-09-14T23:59:59Z");
assert.ok(carHaulingDispatcher.includes("Remote worldwide"));
assert.ok(carHaulingDispatcher.includes("U.S. Central Time schedule"));
assert.ok(carHaulingDispatcher.includes("source=hermes_careers"));
assert.ok(!carHaulingDispatcher.includes("@ProgressoPro"));
assert.ok(!carHaulingDispatcher.includes("one of the highest"));

const syntheticVacancy = {
  id: "fixture-role-001",
  slug: "fixture-role-001",
  title: "Synthetic Test Role",
  status: "verified_open",
  employmentType: "FULL_TIME",
  locationType: "remote",
  locationLabel: "United States",
  descriptionSourceIds: ["fixture-role-description-001"],
  compensationSourceIds: [],
  datePosted: "2026-07-30",
  reviewedAt: "2026-07-31",
  expiresAt: "2026-08-31",
  applicationPath: "/logistics/apply/?for=career&role=fixture-role-001",
  ownerApprovedForPublication: true,
};
assert.equal(isVacancyEligibleForJobPosting(syntheticVacancy), true);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, ownerApprovedForPublication: false }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, status: "unverified" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, expiresAt: "" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, datePosted: "" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, applicationPath: "" }), false);

assert.equal(growthReleaseWatchlist.length, 8);
assert.equal(new Set(growthReleaseWatchlist.map((item) => item.url)).size, growthReleaseWatchlist.length);
for (const item of growthReleaseWatchlist) {
  assert.equal(item.releaseStatus, "owner_merge_required");
  assert.equal(item.searchConsoleStatus, "not_requested");
  assert.equal(item.deploymentVerifiedAt, null);
  assert.equal(item.inspectionRequestedAt, null);
  assert.equal(item.indexedAt, null);
  assert.equal(item.impressions7d, null);
  assert.equal(item.clicks7d, null);
  assert.equal(item.averagePosition7d, null);
  assert.equal(item.qualifiedInquiries7d, null);
  assert.equal(isReleaseReadyForInspection(item), false);
  assert.match(item.nextAction, /owner merge approval/i);
}

assert.equal(weeklyGrowthScorecard.cadence, "weekly");
assert.equal(monthlyGrowthScorecard.cadence, "monthly");
assert.ok(weeklyGrowthScorecard.decisionRules.some((item) => /Do not populate Search Console or inquiry values/i.test(item)));
assert.ok(monthlyGrowthScorecard.decisionRules.some((item) => /Do not delete, redirect, merge, deploy/i.test(item)));
assert.ok(finalGrowthReadinessChecklist.length >= 12);
assert.ok(finalGrowthReadinessChecklist.some((item) => /Academy exposes only U.S. Logistics Operations and Marketing/i.test(item)));
assert.ok(finalGrowthReadinessChecklist.some((item) => /JobPosting is absent when none are verified open/i.test(item)));
assert.ok(finalGrowthReadinessChecklist.some((item) => /Owner separately approves merge and production deployment/i.test(item)));

console.log("academy/careers growth governance passed: two programs, verified vacancy registry, canonical JobPosting gate, privacy-safe recruiting route, watchlist, scorecards, and owner release approval.");
