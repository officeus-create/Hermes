import { expect, test } from "@playwright/test";

const canonical = (route: string) => `https://hermeslogisticsus.com${route}`;

test("Logistics SEO niche owner remains canonical and linked from general SEO", async ({ page }) => {
  await page.goto("/services/seo-for-logistics-companies/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonical("/services/seo-for-logistics-companies/"),
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/logistics|trucking|transportation/i);

  await page.goto("/services/seo/", { waitUntil: "domcontentloaded" });
  const nicheLink = page.locator('a[href="/services/seo-for-logistics-companies/"]').first();
  await expect(nicheLink).toBeVisible();
  await expect(nicheLink).not.toHaveText(/^(learn more|read more|more)$/i);
});

test("Auction checklist preserves its direct vehicle-transport handoff", async ({ page }) => {
  await page.goto("/logistics/resources/auction-vehicle-pickup-checklist/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonical("/logistics/resources/auction-vehicle-pickup-checklist/"),
  );
  await expect(page.locator("a[data-auction-direct-intake]")).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?request=auction_pickup#transport-intake",
  );
});

test("Car Hauler Capacity checklist preserves its carrier handoff", async ({ page }) => {
  await page.goto("/logistics/resources/car-hauler-capacity-checklist/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonical("/logistics/resources/car-hauler-capacity-checklist/"),
  );
  await expect(page.locator('a[data-service-group="carrier_capacity_resource"]')).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );
});

test("Appleton owner keeps direct transport intake as its primary commercial action", async ({ page }) => {
  await page.goto("/logistics/appleton-wi-vehicle-transport/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonical("/logistics/appleton-wi-vehicle-transport/"),
  );
  await expect(page.locator("a[data-appleton-direct-intake]")).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake",
  );
});
