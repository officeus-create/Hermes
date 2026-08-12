import { expect, test } from "@playwright/test";

test("car hauling dispatch page routes carriers into direct commercial intake with fallbacks", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");

  await expect(page).toHaveTitle("Car Hauling Dispatch Services for Owner-Operators | Hermes Logistics");
  await expect(
    page.getByRole("heading", { name: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets" }),
  ).toBeVisible();

  const actions = page.locator(".commercial-actions");
  const primary = actions.getByRole("link", { name: "Start car-hauling dispatch review" });
  await expect(primary).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");
  await expect(actions.getByRole("link", { name: "Email Logistics Sales" })).toHaveAttribute(
    "href",
    "mailto:officeus@hermeslogisticsus.com",
  );
  await expect(actions.getByRole("link", { name: "+1 (262) 302-3626" })).toHaveAttribute("href", "tel:+12623023626");

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).toContain("You do not get just a dispatcher.");
  expect(publicCopy).toContain("Team 1 · Keep today moving");
  expect(publicCopy).toContain("Team 2 · Build tomorrow's demand");
  expect(publicCopy).toContain("Scope before percentage");
  expect(publicCopy).toContain("Why can the Full Partnership option be 8%?");
  expect(publicCopy).toContain("Can I reject a load?");
  expect(publicCopy).toContain("MC or USDOT number");
  expect(publicCopy).toContain("Does Hermes guarantee loads, rates, or revenue?");
  expect(publicCopy).toContain("No guaranteed lanes or revenue claims.");
  expect(publicCopy).toMatch(/carrier.*final decision/i);
  expect(publicCopy).toContain("fictional product preview");
  expect(publicCopy).toContain("First 24–48 hours after approval");
  expect(publicCopy).toContain("What happens during the first 24–48 hours after approval?");
  expect(publicCopy).toContain("not a guarantee of dispatcher assignment, response time, load availability, booking, rate, mileage, lane consistency, or revenue");
  expect(publicCopy).toContain("Missing documents, market conditions, broker requirements, or carrier changes can extend the sequence.");
  expect(publicCopy).not.toMatch(/guaranteed direct loads|guaranteed rankings|guaranteed customers/i);

  await page.evaluate(() => {
    document.querySelector("[data-commercial-primary-cta]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await primary.click();

  const analyticsEvent = await page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.find((item) => item.event === "commercial_cta_click");
  });
  expect(analyticsEvent).toMatchObject({
    event: "commercial_cta_click",
    cta_type: "carrier_intake",
    audience_type: "carrier",
    page_group: "logistics_service",
    service_group: "car_hauling_dispatch",
    page_path: "/logistics/car-hauling-dispatch/",
    destination_path: "/logistics/start-car-hauling-dispatch/",
  });
  expect(JSON.stringify(analyticsEvent)).not.toMatch(/email|phone|MC\s*\d|USDOT\s*\d|VIN|car_hauler/i);

  await page.goto("/logistics/start-car-hauling-dispatch/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  await expect(page.locator("#dispatch-intake")).toBeVisible();
  await expect(page.locator('input[name="authority_number"]')).toBeVisible();
  await expect(page.locator('input[name="equipment_class"]')).toHaveValue("car_hauler");
  await expect(page.locator('input[name="capacity_units"]')).toHaveAttribute("min", "1");
  await expect(page.getByRole("link", { name: "Email Logistics Sales" }).first()).toHaveAttribute(
    "href",
    "mailto:officeus@hermeslogisticsus.com",
  );
  await expect(page.getByRole("link", { name: "+1 (262) 302-3626" }).first()).toHaveAttribute("href", "tel:+12623023626");
  await expect(page.locator(".dispatch-start-actions").getByRole("link", { name: /Call Logistics Sales/i })).toHaveAttribute(
    "href",
    "tel:+12623023626",
  );
  await expect(page.getByRole("link", { name: /Preview the Load Board demo/i })).toHaveCount(0);
  await expect(page.locator("[data-dispatch-mobile-intake]")).toHaveAttribute("href", "#dispatch-intake");
  await expect(page.locator("[data-dispatch-mobile-call]")).toHaveAttribute("href", "tel:+12623023626");
});

test("Load Board ignores unsupported equipment query values", async ({ page }) => {
  await page.goto("/load-board/?role=carrier&equipment=unknown_equipment#carrier-access");
  await expect(page.locator('select[name="equipment_class"]')).toHaveValue("");
});
