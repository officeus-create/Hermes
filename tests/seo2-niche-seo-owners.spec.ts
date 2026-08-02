import { expect, test } from "@playwright/test";

const seoIntakeHref = "/paths/marketing/?service=seo#contact";

for (const scenario of [
  {
    path: "/services/seo-for-logistics-companies/",
    h1: "SEO for Logistics, Trucking and Dispatch Companies",
    evidence: [
      "Trucking, dispatch and freight-broker query map",
      "Logistics website SEO audit",
      "Search-to-qualified-inquiry measurement",
      "Does Hermes provide SEO for trucking and dispatch companies?",
    ],
  },
  {
    path: "/services/seo-for-independent-auto-dealers/",
    h1: "SEO for Independent and Used Car Dealers",
    evidence: [
      "Inventory-page SEO audit",
      "Local eligibility and market foundation",
      "Mobile search-to-inquiry path",
      "What is included in a car dealership SEO audit?",
    ],
  },
]) {
  test(`${scenario.path} owns its niche intent and routes into SEO intake`, async ({ page }) => {
    await page.goto(scenario.path);

    await expect(page.getByRole("heading", { level: 1, name: scenario.h1 })).toBeVisible();
    await expect(page.locator(".digital-breadcrumb").getByRole("link", { name: "Marketing & SEO" })).toHaveAttribute(
      "href",
      "/paths/marketing/",
    );
    await expect(page.locator(".digital-service-actions").getByRole("link", {
      name: "Start an SEO review request",
    })).toHaveAttribute("href", seoIntakeHref);
    await expect(page.getByRole("link", { name: "Prepare the SEO request" })).toHaveAttribute("href", seoIntakeHref);
    await expect(page.locator('select[name="path"]')).toHaveValue("ProgressoPro");

    for (const text of scenario.evidence) {
      await expect(page.getByText(text, { exact: true })).toBeVisible();
    }
  });
}

test("Local SEO remains outside the bounded niche-owner routing change", async ({ page }) => {
  await page.goto("/services/local-seo/");

  await expect(page.locator(".digital-service-actions").getByRole("link", { name: "Discuss this service" })).toHaveAttribute(
    "href",
    "#contact",
  );
  await expect(page.locator("[data-seo-service-cta]")).toHaveCount(0);
  await expect(page.locator('select[name="path"]')).toHaveValue("IT Development");
});
