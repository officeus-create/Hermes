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

test("Marketing hub provides a contextual path to the Logistics SEO canonical owner", async ({ page }) => {
  await page.goto("/paths/marketing/", { waitUntil: "domcontentloaded" });
  const ownerLink = page.locator('a[data-logistics-seo-owner-link]');
  await expect(ownerLink).toBeVisible();
  await expect(ownerLink).toHaveAttribute("href", "/services/seo-for-logistics-companies/");
  await expect(ownerLink).toContainText(/Logistics SEO/i);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator('a[data-logistics-seo-owner-link]')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
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
  const carrierHandoffs = page.locator('a[data-service-group="carrier_capacity_resource"]');
  await expect(carrierHandoffs.first()).toBeVisible();
  const count = await carrierHandoffs.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expect(carrierHandoffs.nth(index)).toHaveAttribute(
      "href",
      "/logistics/start-car-hauling-dispatch/",
    );
  }
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
