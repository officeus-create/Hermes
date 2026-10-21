import { expect, test } from "@playwright/test";

// The marketing direction is a human-useful niche entry point, not a second
// landing page for logistics/trucking SEO or a new content-permutation owner.
test("Marketing hub routes logistics SEO buyers to its single commercial owner", async ({ page }) => {
  await page.goto("/paths/marketing/");

  const marketingPillars = page.locator("[data-marketing-service-pillars]");
  const nicheLink = marketingPillars.getByRole("link", {
    name: "Logistics SEO for trucking and transportation companies",
  });

  await expect(nicheLink).toBeVisible();
  await expect(nicheLink).toHaveAttribute("href", "/services/seo-for-logistics-companies/");

  await nicheLink.click();
  await expect(page).toHaveURL(/\/services\/seo-for-logistics-companies\/$/);
  await expect(
    page.getByRole("heading", {
      name: "Logistics SEO for Trucking, Transportation and Freight Companies",
      level: 1,
    }),
  ).toBeVisible();
});
