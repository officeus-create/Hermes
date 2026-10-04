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
const wisconsinOwnerOperators = await readFile(join(dist, "careers/wisconsin-owner-operators/index.html"), "utf8");

assert.ok(academy.includes("U.S. Logistics Operations"));
assert.ok(academy.includes("Marketing"));
assert.ok(academy.includes("five Hermes Academy tracks"));
assert.ok(academy.includes("Paid cohort"));
assert.ok(academy.includes("Free practice opportunity"));
assert.ok(academy.includes("No fixed price is published"));
assert.ok(academy.includes("employment, income, clients, certification, promotion"));
assert.ok(academy.includes("optional exercise inside the Marketing learning track, not a separate learning track"));
assert.ok(academy.includes("COO / Operations"));
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
assert.deepEqual(academyService.serviceType, ["U.S. Logistics Operations", "Marketing", "IT & AI", "Sales", "COO / Operations"]);

assert.equal(publicVacancyRegistry.length, 2);
assert.equal(verifiedOpenVacancies.length, 1);
assert.ok(careers.includes("Verified public vacancies are open."));
assert.ok(careers.includes("1</strong>"));
assert.ok(!careers.includes('href="/careers/car-hauling-dispatcher/"'));
assert.ok(careers.includes('href="/careers/wisconsin-owner-operators/"'));
assert.ok(careers.includes('href="https://100hires.com/j/G4ek3eN"'));
assert.ok(careers.includes("View on 100Hires"));
assert.ok(careers.includes('href="/logistics/apply/?for=career"'));
assert.ok(careers.includes("does not guarantee review timing, interview, training access, team placement, employment"));
assert.ok(!careers.includes('"@type":"JobPosting"'));
assert.ok(!careers.includes('"@type": "JobPosting"'));
assert.ok(careerPublicBoundaries.length >= 5);
assert.ok(careerPublicBoundaries.some((item) => /real submission URL/i.test(item)));

const jobSchemas = [...carHaulingDispatcher.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
const jobPostings = jobSchemas.filter((entity) => entity?.["@type"] === "JobPosting");
assert.equal(jobPostings.length, 0);
assert.ok(carHaulingDispatcher.includes("Publication review due"));
assert.ok(carHaulingDispatcher.includes("suppresses JobPosting schema and active vacancy CTAs"));
assert.ok(carHaulingDispatcher.includes("Remote worldwide"));
assert.ok(carHaulingDispatcher.includes("U.S. Central Time schedule"));
assert.ok(!carHaulingDispatcher.includes('href="https://www.work.ua/jobs/7362244/"'));
assert.ok(!carHaulingDispatcher.includes("Prepare Hermes application preview"));
assert.ok(carHaulingDispatcher.includes("Check current vacancies"));
assert.ok(!carHaulingDispatcher.includes("source=hermes_careers"));
assert.ok(carHaulingDispatcher.includes("awaiting a fresh recruiting review"));
assert.ok(!carHaulingDispatcher.includes("Submit through the current Work.ua vacancy."));
assert.ok(carHaulingDispatcher.includes("do not submit through the expired Work.ua listing"));
assert.ok(!carHaulingDispatcher.includes("@ProgressoPro"));
assert.ok(!carHaulingDispatcher.includes("one of the highest"));

const ownerOperatorSchemas = [...wisconsinOwnerOperators.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
const ownerOperatorJobPostings = ownerOperatorSchemas.filter((entity) => entity?.["@type"] === "JobPosting");
assert.equal(ownerOperatorJobPostings.length, 1);
assert.equal(ownerOperatorJobPostings[0].employmentType, "CONTRACTOR");
assert.equal(ownerOperatorJobPostings[0].directApply, false);
assert.equal(ownerOperatorJobPostings[0].sameAs, "https://100hires.com/j/G4ek3eN");
assert.ok(wisconsinOwnerOperators.includes("Verified live source · updated October 3, 2026"));
assert.ok(wisconsinOwnerOperators.includes("exact 100Hires vacancy link is the only external source verified live"));
assert.ok(wisconsinOwnerOperators.includes('href="https://100hires.com/j/G4ek3eN"'));
assert.ok(wisconsinOwnerOperators.includes('href="https://100hires.com/c/hermeslogisticsus-com"'));
assert.ok(wisconsinOwnerOperators.includes("employer-profile reference and not as a complete vacancy directory"));
assert.ok(wisconsinOwnerOperators.includes("There are no active job postings right now"));
assert.ok(wisconsinOwnerOperators.includes("does not update static HTML automatically between builds"));
assert.ok(wisconsinOwnerOperators.includes('href="tel:+14142697377"'));
assert.ok(wisconsinOwnerOperators.includes("+1 (414) 269-7377"));
assert.deepEqual(
  [...wisconsinOwnerOperators.matchAll(/href="tel:([^"]+)"/g)].map((match) => match[1]),
  ["+14142697377", "+14142697377"],
);
assert.ok(wisconsinOwnerOperators.includes("No forced dispatch"));
assert.ok(wisconsinOwnerOperators.includes("Power Only — trailer and operating arrangement reviewed individually"));
assert.ok(wisconsinOwnerOperators.includes("Trailer and equipment eligibility are therefore confirmed individually"));
assert.ok(wisconsinOwnerOperators.includes("does not guarantee"));
assert.ok(!wisconsinOwnerOperators.includes("guaranteed loads"));
assert.ok(!wisconsinOwnerOperators.includes("guaranteed income"));

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
  submissionUrl: "https://example.com/jobs/fixture-role-001/apply",
  ownerApprovedForPublication: true,
};
assert.equal(isVacancyEligibleForJobPosting(syntheticVacancy, "2026-08-15"), true);
assert.equal(isVacancyEligibleForJobPosting(syntheticVacancy, "2026-09-01"), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, ownerApprovedForPublication: false }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, status: "unverified" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, expiresAt: "" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, datePosted: "" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, applicationPath: "" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, submissionUrl: "" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, submissionUrl: "http://example.com/apply" }), false);
assert.equal(isVacancyEligibleForJobPosting({ ...syntheticVacancy, submissionUrl: "not-a-url" }), false);

assert.equal(growthReleaseWatchlist.length, 10);
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

console.log("academy/careers growth governance passed: five learning tracks, one current Wisconsin owner-operator source, truthful JobPosting lifecycle, privacy-safe recruiting routes, watchlist, scorecards, and owner release approval.");
