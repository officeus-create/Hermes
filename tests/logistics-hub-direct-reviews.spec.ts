import { expect, test, type Locator, type Page } from "@playwright/test";

type AnalyticsEvent = Record<string, unknown> & { event?: string };

async function preventNavigation(locator: Locator) {
  await locator.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { capture: true, once: true });
  });
}

async function commercialEvents(page: Page) {
  return page.evaluate(() => {
    const entries = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
    return entries.filter((entry): entry is AnalyticsEvent => (
      Boolean(entry) && typeof entry === "object" && !Array.isArray(entry) &&
      (entry as { event?: unknown }).event === "commercial_cta_click"
    ));
  });
}

test("Logistics hub prioritizes direct carrier and customer reviews", async ({ page }) => {
  await page.goto("/paths/logistics/");

  const directReviews = page.locator("[data-logistics-direct-reviews]");
  await expect(directReviews).toBeVisible();
  await expect(directReviews.getByText("Choose the direct review that matches your role.", { exact: true })).toBeVisible();

  const carrierReview = directReviews.getByRole("link", { name: "Start carrier review" });
  const transportReview = directReviews.getByRole("link", { name: "Prepare transport request" });
  await expect(carrierReview).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");
  await expect(transportReview).toHaveAttribute("href", "/logistics/request-vehicle-transport/#transport-intake");
  await expect(directReviews.getByRole("link", { name: /Carrier proposal and packet/i })).toHaveAttribute("href", "/carrier/");
  await expect(directReviews.getByRole("link", { name: "General Logistics contact" })).toHaveAttribute("href", "/contacts/");
  await expect(directReviews.locator('a[href^="/load-board/"]')).toHaveCount(0);

  await preventNavigation(carrierReview);
  await carrierReview.click();
  await preventNavigation(transportReview);
  await transportReview.click();

  const events = await commercialEvents(page);
  expect(events).toContainEqual(expect.objectContaining({
    event: "commercial_cta_click",
    cta_type: "carrier_intake",
    audience_type: "carrier",
    page_group: "logistics_path",
    service_group: "logistics_hub_carrier_review",
    page_path: "/paths/logistics/",
    destination_path: "/logistics/start-car-hauling-dispatch/",
  }));
  expect(events).toContainEqual(expect.objectContaining({
    event: "commercial_cta_click",
    cta_type: "vehicle_transport_intake",
    audience_type: "customer",
    page_group: "logistics_path",
    service_group: "logistics_hub_vehicle_transport",
    request_type: "vehicle_transport",
    page_path: "/paths/logistics/",
    destination_path: "/logistics/request-vehicle-transport/",
  }));

  const serialized = JSON.stringify(events);
  expect(serialized).not.toMatch(/email|phone|name|address|VIN|MC\s*\d|USDOT\s*\d|pickup|delivery/i);
});
