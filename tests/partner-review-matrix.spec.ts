import { expect, test } from "@playwright/test";

const route = "/paths/logistics/agency-partners/";

test("agency-partner recommendation explains evidence-gated partner review", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/Agency Partner Fit Assessment/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
  const matrix = page.locator("[data-partner-review-matrix]");
  await expect(matrix).toBeVisible();
  await expect(matrix.getByRole("heading", { name: "Different partnership requests require different evidence." })).toBeVisible();

  for (const category of [
    "Agency operator",
    "Insurance or risk services",
    "Factoring or payment services",
    "ELD, telematics, or technology",
    "Compliance, safety, or professional service",
    "Other logistics vendor",
  ]) {
    await expect(matrix.getByRole("heading", { name: category })).toBeVisible();
  }

  for (const boundary of [
    "A review is not an endorsement or commercial approval.",
    "does not create a partnership, agency, franchise, territory, exclusivity, preferred-vendor status",
    "customer or carrier access, lead access, data access, integration, purchase",
    "permission to use Hermes names and logos",
    "requires separate written scope, responsibilities, privacy and security terms, commercial terms, and termination conditions",
  ]) {
    await expect(matrix.getByText(boundary, { exact: false }).first()).toBeVisible();
  }
});

test("partner matrix does not leak into unrelated logistics recommendations", async ({ page }) => {
  for (const unrelatedRoute of [
    "/paths/logistics/carriers/owner-operators/",
    "/paths/logistics/customers/vehicle-transport/",
    "/paths/logistics/brokers/carrier-capacity/",
  ]) {
    await page.goto(unrelatedRoute);
    await expect(page.locator("[data-partner-review-matrix]")).toHaveCount(0);
  }
});
