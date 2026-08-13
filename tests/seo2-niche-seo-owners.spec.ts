import { expect, test } from "@playwright/test";

for (const scenario of [
  {
    path: "/services/seo-for-logistics-companies/",
    h1: "Logistics SEO for Trucking, Transportation and Freight Companies",
    heroLabel: "Start a logistics SEO review",
    supportingLabel: "Prepare the logistics SEO request",
    intakeHref: "/paths/marketing/?service=logistics_seo#contact",
    serviceGroup: "logistics_seo",
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
    heroLabel: "Start an auto dealer SEO review",
    supportingLabel: "Prepare the dealer SEO request",
    intakeHref: "/paths/marketing/?service=auto_dealer_seo#contact",
    serviceGroup: "auto_dealer_seo",
    evidence: [
      "Inventory-page SEO audit",
      "Local eligibility and market foundation",
      "Mobile search-to-inquiry path",
      "What is included in a car dealership SEO audit?",
    ],
  },
]) {
  test(`${scenario.path} owns its niche intent and keeps the approved SEO funnel context`, async ({ page }) => {
    await page.goto(scenario.path);

    await expect(page.getByRole("heading", { level: 1, name: scenario.h1 })).toBeVisible();
    await expect(page.locator(".digital-breadcrumb").getByRole("link", { name: "Marketing" })).toHaveAttribute(
      "href",
      "/paths/marketing/",
    );

    const heroCta = page.locator(".digital-service-actions").getByRole("link", { name: scenario.heroLabel });
    await expect(heroCta).toHaveAttribute("href", scenario.intakeHref);
    await expect(heroCta).toHaveAttribute("data-service-group", scenario.serviceGroup);

    const supportingCta = page.getByRole("link", { name: scenario.supportingLabel });
    await expect(supportingCta).toHaveAttribute("href", scenario.intakeHref);
    await expect(supportingCta).toHaveAttribute("data-service-group", scenario.serviceGroup);
    await expect(page.locator('select[name="path"]')).toHaveValue("ProgressoPro");

    for (const text of scenario.evidence) {
      await expect(page.getByText(text, { exact: true })).toBeVisible();
    }
  });
}

test("Local SEO keeps the separate current-main local SEO context", async ({ page }) => {
  await page.goto("/services/local-seo/");

  await expect(page.locator(".digital-service-actions").getByRole("link", { name: "Start a local SEO review" })).toHaveAttribute(
    "href",
    "/paths/marketing/?service=local_seo#contact",
  );
  await expect(page.getByRole("link", { name: "Prepare the local SEO request" })).toHaveAttribute(
    "href",
    "/paths/marketing/?service=local_seo#contact",
  );
  await expect(page.locator('select[name="path"]')).toHaveValue("ProgressoPro");
});
