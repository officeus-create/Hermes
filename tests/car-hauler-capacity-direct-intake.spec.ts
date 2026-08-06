import { expect, test, type Locator, type Page } from "@playwright/test";

const route = "/logistics/resources/car-hauler-capacity-checklist/";
const directCarrierIntake = "/logistics/start-car-hauling-dispatch/";
const legacyCarrierDemoIntakes = [
  "/load-board/?role=carrier#carrier-access",
  "/load-board/?role=carrier&equipment=car_hauler#carrier-access",
];

async function preventNavigation(locator: Locator) {
  await locator.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { capture: true, once: true });
  });
}

async function commercialEvents(page: Page) {
  return page.evaluate(() => {
    const entries = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
    return entries.filter((entry): entry is Record<string, unknown> => (
      Boolean(entry) && typeof entry === "object" && !Array.isArray(entry) &&
      (entry as { event?: unknown }).event === "commercial_cta_click"
    ));
  });
}

test("car-hauler capacity guide routes carriers to the direct review", async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole("heading", { level: 1, name: "Car Hauler Capacity Checklist" })).toBeVisible();
  const primaryActions = page.locator(`main a[href="${directCarrierIntake}"][data-service-group="carrier_capacity_resource"]`);
  await expect(primaryActions).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Prepare carrier capacity review" })).toHaveAttribute("href", directCarrierIntake);
  await expect(page.getByRole("link", { name: "Open carrier review" })).toHaveAttribute("href", directCarrierIntake);
  await expect(page.locator('main a[href="/carrier/"]')).toHaveCount(1);
  await expect(page.getByText("Carrier plans and packet", { exact: true })).toBeVisible();

  for (const legacyHref of legacyCarrierDemoIntakes) {
    await expect(page.locator(`main a[href="${legacyHref}"]`)).toHaveCount(0);
  }

  await preventNavigation(primaryActions.first());
  await primaryActions.first().click();
  const events = await commercialEvents(page);
  expect(events).toContainEqual(expect.objectContaining({
    event: "commercial_cta_click",
    cta_type: "carrier_intake",
    audience_type: "carrier",
    page_group: "logistics_service",
    service_group: "carrier_capacity_resource",
    page_path: route,
    destination_path: directCarrierIntake,
  }));
});

test("car-hauler capacity guide retains indexable canonical ownership", async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index,follow,max-image-preview:large",
  );

  const sitemapResponse = await page.request.get("/sitemap-services.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).toContain(
    "https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/",
  );
});
