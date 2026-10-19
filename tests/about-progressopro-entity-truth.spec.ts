import { expect, test } from "@playwright/test";

// Grounded in the approved public company-facts register and live Marketing direction.
// A marketing service identity is not an automatically proven contracting legal entity.
test("About Hermes identifies active ProgressoPro marketing without historic or legal conflation", async ({ page }) => {
  await page.goto("/about/");

  await expect(page.getByRole("heading", { name: "About Hermes", level: 1 })).toBeVisible();
  await expect(page.getByText("ProgressoPro is its current public-facing marketing services identity", { exact: false })).toBeVisible();
  await expect(page.getByText("the proposal or written agreement identifies the responsible entity", { exact: false })).toBeVisible();
  await expect(page.getByText("ProgressoPro may appear as a subordinate operating or historical marketing label")).toHaveCount(0);

  await page.goto("/company-information/");
  await expect(page.getByRole("heading", { name: "Hermes Logistics LLC — Company Information", level: 1 })).toBeVisible();
});
