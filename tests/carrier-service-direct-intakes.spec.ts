import { expect, test, type Locator, type Page } from "@playwright/test";

const directCarrierIntake = "/logistics/start-car-hauling-dispatch/";
const legacyCarrierDemoIntakes = [
  "/load-board/?role=carrier#carrier-access",
  "/load-board/?role=carrier&equipment=car_hauler#carrier-access",
];

const serviceCases = [
  {
    route: "/logistics/owner-operator-dispatch-support/",
    heading: "Owner-Operator Dispatch Support",
    primaryLabel: "Start owner-operator dispatch review",
    serviceGroup: "owner_operator_dispatch",
    boundary: /does not assign a dispatcher or guarantee acceptance, loads, rates, lanes, mileage, profit, or revenue/i,
  },
  {
    route: "/logistics/fleet-owner-dispatch-support/",
    heading: "Fleet-Owner Dispatch and Operations Support",
    primaryLabel: "Start fleet dispatch review",
    serviceGroup: "fleet_owner_dispatch",
    boundary: /does not assign coverage or guarantee acceptance, loads, utilization, rates, lanes, response time, profit, or revenue/i,
  },
  {
    route: "/logistics/new-authority-car-hauler-support/",
    heading: "New Authority Car Hauler Support",
    primaryLabel: "Start new-authority readiness review",
    serviceGroup: "new_authority_car_hauler",
    boundary: /does not activate an authority, assign a dispatcher, create broker approval, book a load, or guarantee acceptance, rates, lanes, mileage, profit, or revenue/i,
  },
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

for (const serviceCase of serviceCases) {
  test(`${serviceCase.route} routes qualified carriers to the direct review`, async ({ page }) => {
    await page.goto(serviceCase.route);

    await expect(page.getByRole("heading", { level: 1, name: serviceCase.heading })).toBeVisible();
    const primaryActions = page.getByRole("link", { name: serviceCase.primaryLabel });
    await expect(primaryActions).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(primaryActions.nth(index)).toHaveAttribute("href", directCarrierIntake);
    }

    await expect(page.locator('main a[href="/carrier/"]')).toHaveCount(1);
    await expect(page.getByText("Carrier Plans and Packet", { exact: true })).toBeVisible();
    await expect(page.getByText(serviceCase.boundary).first()).toBeVisible();

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
      service_group: serviceCase.serviceGroup,
      page_path: serviceCase.route,
      destination_path: directCarrierIntake,
    }));
  });
}
