import { expect, test, type Page } from "@playwright/test";

async function commercialEvents(page: Page) {
  return page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.filter((item) => item.event === "commercial_cta_click") ?? [];
  });
}

async function preventTestNavigation(page: Page) {
  await page.evaluate(() => {
    document.addEventListener(
      "click",
      (event) => {
        const source = event.target;
        if (source instanceof Element && source.closest("a[data-commercial-primary-cta]")) {
          event.preventDefault();
        }
      },
      { capture: true },
    );
  });
}

test.use({ viewport: { width: 390, height: 844 } });

test("Wisconsin mobile money-page actions emit one controlled commercial CTA event", async ({ page }) => {
  const cases = [
    {
      path: "/logistics/appleton-wi-vehicle-transport/",
      serviceGroup: "appleton_vehicle_transport",
      audienceType: "customer",
      requestType: "vehicle_transport",
    },
    {
      path: "/logistics/wisconsin-vehicle-transport/",
      serviceGroup: "wisconsin_local_vehicle_transport",
      audienceType: "customer",
      requestType: "vehicle_transport",
    },
    {
      path: "/logistics/green-bay-wi-vehicle-transport/",
      serviceGroup: "wisconsin_local_vehicle_transport",
      audienceType: "customer",
      requestType: "vehicle_transport",
    },
    {
      path: "/logistics/wisconsin-dealer-vehicle-transport/",
      serviceGroup: "wisconsin_dealer_vehicle_transport",
      audienceType: "dealer",
      requestType: "dealer_inventory",
    },
  ];

  for (const item of cases) {
    await page.goto(item.path);
    await page.evaluate(() => {
      window.dataLayer = [];
    });
    await preventTestNavigation(page);

    const cta = page.locator(".money-page-action-primary");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("data-service-group", item.serviceGroup);
    await cta.click();

    await expect.poll(async () => (await commercialEvents(page)).length).toBe(1);
    const events = await commercialEvents(page);
    expect(events[0]).toMatchObject({
      event: "commercial_cta_click",
      cta_type: "vehicle_transport_intake",
      audience_type: item.audienceType,
      page_group: "logistics_service",
      service_group: item.serviceGroup,
      request_type: item.requestType,
      page_path: item.path,
      destination_path: "/logistics/request-vehicle-transport/",
    });

    expect(JSON.stringify(events)).not.toMatch(/name|email|phone|company|origin|destination|vehicle|vin|rate|budget/i);
  }
});

test("existing dealer hero CTA keeps route-fallback analytics coverage", async ({ page }) => {
  await page.goto("/logistics/dealer-vehicle-transportation/");
  await page.evaluate(() => {
    window.dataLayer = [];
  });
  await preventTestNavigation(page);

  const heroCta = page.locator("[data-commercial-primary-cta]").first();
  await expect(heroCta).not.toHaveAttribute("data-service-group", /.+/);
  await heroCta.click();

  await expect.poll(async () => (await commercialEvents(page)).length).toBe(1);
  expect((await commercialEvents(page))[0]).toMatchObject({
    event: "commercial_cta_click",
    cta_type: "vehicle_transport_intake",
    audience_type: "dealer",
    service_group: "dealer_vehicle_transport",
    request_type: "dealer_inventory",
    page_path: "/logistics/dealer-vehicle-transportation/",
    destination_path: "/logistics/request-vehicle-transport/",
  });
});
