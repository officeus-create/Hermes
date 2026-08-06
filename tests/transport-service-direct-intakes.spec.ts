import { expect, test, type Locator, type Page } from "@playwright/test";

type DataLayerEntry = Record<string, unknown> & { event?: string };

const cases = [
  {
    route: "/logistics/multi-car-transport/",
    heading: "Multi-Car Transport Services",
    primaryLabel: "Prepare multi-car transport request",
    equipment: "multi_car",
    serviceGroup: "multi_car_transport",
  },
  {
    route: "/logistics/open-vehicle-transport/",
    heading: "Open Vehicle Transport Services",
    primaryLabel: "Prepare open transport request",
    equipment: "open",
    serviceGroup: "open_vehicle_transport",
  },
  {
    route: "/logistics/enclosed-vehicle-transport/",
    heading: "Enclosed Vehicle Transport Services",
    primaryLabel: "Prepare enclosed transport request",
    equipment: "enclosed",
    serviceGroup: "enclosed_vehicle_transport",
  },
  {
    route: "/logistics/inoperable-vehicle-transport/",
    heading: "Inoperable Vehicle Transport Services",
    primaryLabel: "Prepare inoperable transport request",
    equipment: "winch_required",
    serviceGroup: "inoperable_vehicle_transport",
  },
];

const expectedHref = (equipment: string) =>
  `/logistics/request-vehicle-transport/?request=other&equipment=${equipment}#transport-intake`;

async function preventNavigation(locator: Locator) {
  await locator.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { capture: true, once: true });
  });
}

async function commercialEvents(page: Page) {
  return page.evaluate(() => {
    const entries = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
    return entries.filter((entry): entry is DataLayerEntry => (
      Boolean(entry) && typeof entry === "object" && !Array.isArray(entry) &&
      (entry as { event?: unknown }).event === "commercial_cta_click"
    ));
  });
}

for (const serviceCase of cases) {
  test(`${serviceCase.route} opens a specialized direct request`, async ({ page }) => {
    await page.goto(serviceCase.route);
    await expect(page.getByRole("heading", { level: 1, name: serviceCase.heading })).toBeVisible();

    const primaryActions = page.getByRole("link", { name: serviceCase.primaryLabel });
    await expect(primaryActions).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(primaryActions.nth(index)).toHaveAttribute("href", expectedHref(serviceCase.equipment));
    }
    await expect(page.locator(`main a[href="${expectedHref(serviceCase.equipment)}"]`)).toHaveCount(3);
    await expect(page.locator('main a[href^="/load-board/?role=shipper"]')).toHaveCount(0);

    await preventNavigation(primaryActions.first());
    await primaryActions.first().click();
    const events = await commercialEvents(page);
    expect(events).toContainEqual(expect.objectContaining({
      event: "commercial_cta_click",
      cta_type: "vehicle_transport_intake",
      audience_type: "customer",
      page_group: "logistics_service",
      service_group: serviceCase.serviceGroup,
      request_type: "other",
      page_path: serviceCase.route,
      destination_path: "/logistics/request-vehicle-transport/",
    }));

    await page.goto(expectedHref(serviceCase.equipment));
    await expect(page.locator('select[name="request_type"]')).toHaveValue("other");
    await expect(page.locator('select[name="equipment_preference"]')).toHaveValue(serviceCase.equipment);
    await expect(page.locator('select[name="submitter_type"]')).toHaveValue("");

    const url = new URL(page.url());
    expect([...url.searchParams.keys()].sort()).toEqual(["equipment", "request"]);
  });
}

test("unsupported equipment query values do not prefill the transport form", async ({ page }) => {
  await page.goto("/logistics/request-vehicle-transport/?request=other&equipment=private-secret#transport-intake");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("other");
  await expect(page.locator('select[name="equipment_preference"]')).toHaveValue("not_sure");
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("");
});
