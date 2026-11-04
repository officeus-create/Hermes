import { expect, test } from "@playwright/test";

const routes = [
  {
    route: "/resources/logistics-seo-audit-sample/",
    selector: 'a[data-resource-commercial-cta][data-service-group="logistics_seo"]',
    serviceGroup: "logistics_seo",
    audienceType: "business",
    destination: "/paths/marketing/",
  },
  {
    route: "/resources/website-project-brief-template/",
    selector: 'a[data-resource-commercial-cta][data-service-group="website_development"]',
    serviceGroup: "website_development",
    audienceType: "business",
    destination: "/paths/technology/",
  },
  {
    route: "/logistics/resources/",
    selector: 'a[data-resource-commercial-cta][data-service-group="car_hauling_dispatch"]',
    serviceGroup: "car_hauling_dispatch",
    audienceType: "carrier",
    destination: "/logistics/start-car-hauling-dispatch/",
  },
  {
    route: "/logistics/resources/auction-vehicle-pickup-checklist/",
    selector: 'a[data-resource-commercial-cta][data-service-group="auction_vehicle_pickup"]',
    serviceGroup: "auction_vehicle_pickup",
    audienceType: "customer",
    destination: "/logistics/request-vehicle-transport/",
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
    window.dataLayer = [];
  });
});

for (const item of routes) {
  test(`${item.route} emits one resource-to-commercial event on the existing CTA`, async ({ page }) => {
    const response = await page.goto(item.route);
    expect(response?.ok()).toBeTruthy();

    const cta = page.locator(item.selector).first();
    await expect(cta).toBeVisible();
    await cta.evaluate((element) => element.addEventListener("click", (event) => event.preventDefault(), { once: true }));
    await cta.click();

    const events = await page.evaluate(() =>
      (window.dataLayer || []).filter((entry) => entry.event === "commercial_cta_click" && entry.cta_type === "resource_to_commercial_click"),
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event: "commercial_cta_click",
      cta_type: "resource_to_commercial_click",
      audience_type: item.audienceType,
      page_group: "resource",
      service_group: item.serviceGroup,
      page_path: item.route,
      destination_path: item.destination,
    });
  });
}
