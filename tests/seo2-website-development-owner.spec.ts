import { expect, test } from "@playwright/test";

test("Website Development covers logistics companies without creating a competing niche page", async ({ page }) => {
  await page.goto("/services/website-development/");

  await expect(page).toHaveTitle(/Website Development Services for U\.S\. Businesses/);
  await expect(page.getByRole("heading", {
    level: 1,
    name: "Custom Website Development for U.S. Businesses",
  })).toBeVisible();

  for (const text of [
    "Logistics and operational website architecture",
    "Integrations and phased systems",
    "Can Hermes build a website for a logistics, trucking, dispatch, or freight-broker company?",
    "What should a logistics company website include?",
  ]) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }

  await expect(page.locator(".digital-service-actions").getByRole("link", {
    name: "Start a website project brief",
  })).toHaveAttribute(
    "href",
    "/paths/technology/?project=website_development#project-brief",
  );
  await expect(page.getByRole("link", { name: "SEO for Logistics Companies" })).toHaveAttribute(
    "href",
    "/services/seo-for-logistics-companies/",
  );
  await expect(page.getByRole("link", { name: "Car Hauling Dispatch" })).toHaveAttribute(
    "href",
    "/logistics/car-hauling-dispatch/",
  );
  await expect(page.locator('a[href="/services/website-development-for-logistics-companies/"]')).toHaveCount(0);
});
