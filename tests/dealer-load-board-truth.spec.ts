import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const dealerPage = readFileSync(
  path.join(root, "src/pages/logistics/dealer-vehicle-transportation/index.astro"),
  "utf8",
);

test("dealer transport page describes the Load Board as source-gated live plus separate demo", () => {
  expect(dealerPage).toContain("approved source-gated live freight");
  expect(dealerPage).toContain("fictional demo data remains separate and non-bookable");
  expect(dealerPage).toContain("Open the Car Hauling Load Board");
  expect(dealerPage).not.toContain("Load Board remains a fictional product preview");
  expect(dealerPage).not.toContain("Preview the Load Board Demo");
});
