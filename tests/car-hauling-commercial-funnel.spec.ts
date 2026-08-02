import { expect, test } from "@playwright/test";

test("car hauling dispatch page routes carriers into structured intake with direct fallbacks", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");

  await expect(page).toHaveTitle("Car Hauling Dispatch Services for Owner-Operators | Hermes Logistics");
  await expect(
    page.getByRole("heading", { name: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets" }),
  ).toBeVisible();

  const primary = page.getByRole("link", { name: "Request car-hauling dispatch review" });
  await expect(primary).toHaveAttribute("href", "/load-board/?role=carrier#carrier-access");
  await expect(page.getByRole("link", { name: "Email Logistics Sales" })).toHaveAttribute(
    "href",
    "mailto:freight_301@hermeslogisticsus.com",
  );
  await expect(page.getByRole("link", { name: "+1 (262) 302-3626" })).toHaveAttribute("href", "tel:+12623023626");

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).toContain("one vehicle through multi-car capacity");
  expect(publicCopy).toContain("MC or USDOT number");
  expect(publicCopy).toMatch(/does not.*guarantee.*load/i);
  expect(publicCopy).toMatch(/carrier.*final decision/i);

  await page.evaluate(() => {
    document.querySelector("[data-commercial-primary-cta]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await primary.click();

  const analyticsEvent = await page.evaluate(() =>
    window.dataLayer?.find((item: Record<string, unknown>) => item.event === "commercial_cta_click"),
  );
  expect(analyticsEvent).toMatchObject({
    event: "commercial_cta_click",
    cta_type: "carrier_intake",
    audience_type: "carrier",
    page_group: "logistics_service",
    service_group: "car_hauling_dispatch",
    page_path: "/logistics/car-hauling-dispatch/",
    destination_path: "/load-board/",
  });
  expect(JSON.stringify(analyticsEvent)).not.toMatch(/email|phone|MC\s*\d|USDOT\s*\d|VIN/i);

  await page.goto("/load-board/?role=carrier#carrier-access");
  await expect(page.locator("#carrier-access")).toBeVisible();
  await expect(page.getByRole("link", { name: /Carrier or owner-operator/ })).toHaveAttribute("aria-current", "page");
  await expect(page.locator('input[name="authority_number"]')).toBeVisible();
  await expect(page.locator('select[name="equipment_class"]')).toBeVisible();
  await expect(page.locator('input[name="capacity_units"]')).toHaveAttribute("min", "1");
});
