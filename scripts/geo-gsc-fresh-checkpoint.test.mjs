import assert from "node:assert/strict";
import {
  assertGeoGscCheckpointCannotEnterStandardDelta,
  buildGeoGscCountryOpportunity,
  classifyGeoGscCheckpointWindow,
  geoFreshGscCheckpoint20260819,
  validateGeoGscExactCheckpoint,
} from "../src/data/geo-gsc-fresh-checkpoint.ts";

const checkpoint = validateGeoGscExactCheckpoint(geoFreshGscCheckpoint20260819);
assert.equal(checkpoint.startDate, "2026-07-30");
assert.equal(checkpoint.endDate, "2026-08-16");
assert.equal(checkpoint.inclusiveDays, 18);
assert.equal(checkpoint.clicks, 18);
assert.equal(checkpoint.impressions, 791);
assert.equal(checkpoint.ctr, 2.28);
assert.equal(checkpoint.evidenceClass, "owner_provided_handoff");

const us = checkpoint.countries.find((row) => row.country === "United States");
assert.deepEqual(us, { country: "United States", clicks: 2, impressions: 500, ctr: 0.4, averagePosition: 46.06 });
const ukraine = checkpoint.countries.find((row) => row.country === "Ukraine");
assert.equal(ukraine.clicks, 12);
assert.equal(ukraine.impressions, 53);

const countryOpportunity = buildGeoGscCountryOpportunity(checkpoint);
assert.equal(countryOpportunity[0].country, "United States");
assert.equal(countryOpportunity[0].commercialTarget, true);
assert.equal(countryOpportunity[0].diagnostic, "ranking_and_ctr_review");
assert.ok(countryOpportunity[0].opportunityScore > countryOpportunity[1].opportunityScore);

const logisticsSeo = checkpoint.pages.find((row) => row.canonicalOwner === "/services/seo-for-logistics-companies/");
assert.equal(logisticsSeo.impressions, 242);
assert.equal(logisticsSeo.clicks, null, "Unknown page clicks must remain unknown, not zero");
const generalSeo = checkpoint.pages.find((row) => row.canonicalOwner === "/services/seo/");
assert.equal(generalSeo.impressions, 89);
const carHauling = checkpoint.pages.find((row) => row.canonicalOwner === "/logistics/car-hauling-dispatch/");
assert.equal(carHauling.impressions, 20);
const job = checkpoint.pages.find((row) => row.canonicalOwner === "/careers/car-hauling-dispatcher/");
assert.equal(job.averagePosition, 5.12);
assert.equal(job.impressions, null);
const jobListings = checkpoint.searchAppearances.find((row) => row.appearance === "Job listings");
assert.equal(jobListings.impressions, 7);
assert.equal(jobListings.averagePosition, 2.71);

const classification = classifyGeoGscCheckpointWindow(checkpoint);
assert.equal(classification.state, "exact_checkpoint_held");
assert.equal(classification.windowDays, null);
assert.match(classification.heldReason, /exact_18_day_checkpoint/);
for (const window of [7, 28, 90]) {
  assert.throws(() => assertGeoGscCheckpointCannotEnterStandardDelta(checkpoint, window), new RegExp(`cannot be relabeled as ${window}-day evidence`));
}

assert.throws(() => validateGeoGscExactCheckpoint({ ...checkpoint, inclusiveDays: 28 }), /inclusiveDays mismatch/);
assert.throws(() => validateGeoGscExactCheckpoint({ ...checkpoint, ctr: 3.5 }), /CTR does not reconcile/);
assert.throws(() => validateGeoGscExactCheckpoint({ ...checkpoint, countries: [{ ...us, ctr: 4 }] }), /United States CTR does not reconcile/);

console.log("GEO fresh GSC exact-checkpoint contract passed");
