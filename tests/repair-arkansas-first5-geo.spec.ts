import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const repair = readFileSync(
  path.join(process.cwd(), "src/components/RepairPartnerOfferEnhancer.astro"),
  "utf8",
);

test("repair GEO follows the canonical Arkansas First-5 pilot instead of car-hauling markets", () => {
  for (const city of ["Little Rock", "Fayetteville", "Fort Smith", "Jonesboro", "Conway"]) {
    expect(repair).toContain(city);
  }
  expect(repair).toContain("Arkansas First-5 pilot");
  expect(repair).toContain("intentionally separate from the car-hauling automotive GEO markets");
  expect(repair).not.toContain("South Florida / Miami");
  expect(repair).not.toContain("Orlando / Central Florida");
  expect(repair).not.toContain("Next validation group:</strong> Phoenix");
});
