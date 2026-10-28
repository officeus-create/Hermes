import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const dealerPage = readFileSync(
  path.join(root, "src/pages/logistics/dealer-vehicle-transportation/index.astro"),
  "utf8",
);
const dispatchPage = readFileSync(
  path.join(root, "src/pages/logistics/car-hauling-dispatch/index.astro"),
  "utf8",
);
const carrierDispatchIntake = readFileSync(
  path.join(root, "src/components/CarrierDispatchIntake.astro"),
  "utf8",
);
const logisticsRecommendationPage = readFileSync(
  path.join(root, "src/pages/paths/logistics/[...result].astro"),
  "utf8",
);

test("dealer transport page describes the Load Board as source-gated live plus separate demo", () => {
  expect(dealerPage).toContain("approved source-gated live freight");
  expect(dealerPage).toContain("fictional demo data remains separate and non-bookable");
  expect(dealerPage).toContain("Open the Car Hauling Load Board");
  expect(dealerPage).not.toContain("Load Board remains a fictional product preview");
  expect(dealerPage).not.toContain("Preview the Load Board Demo");
});

test("dispatch owner does not label the canonical Load Board as demo-only", () => {
  expect(dispatchPage).toContain("source-gated live + demo discovery product");
  expect(dispatchPage).toContain("Open the Car Hauling Load Board");
  expect(dispatchPage).not.toContain("Preview the Load Board Demo");
});


test("carrier dispatch intake keeps commercial intake separate without calling canonical Load Board fictional", () => {
  expect(carrierDispatchIntake).toContain("approved active");
  expect(carrierDispatchIntake).toContain("source-gated");
  expect(carrierDispatchIntake).toContain("may be zero");
  expect(carrierDispatchIntake).toContain("preview examples cannot be booked");
  expect(carrierDispatchIntake).not.toContain("separate from the fictional Load Board demo");
});


test("recommendation pages do not call the canonical Load Board fictional", () => {
  expect(logisticsRecommendationPage).toContain("source-gated active records");
  expect(logisticsRecommendationPage).toContain("may be zero");
  expect(logisticsRecommendationPage).toContain("non-bookable market examples");
  expect(logisticsRecommendationPage).not.toContain("The Load Board remains a fictional product demonstration");
});
