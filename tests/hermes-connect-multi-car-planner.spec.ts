import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/multi-car-planner/";

test("Multi-Car Planner prepares a standard review without promising capacity", async ({ page }) => {
  const writeRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET" && request.method() !== "HEAD") writeRequests.push(`${request.method()} ${request.url()}`);
  });

  await page.goto(route);
  await expect(page).toHaveTitle("Multi-Car Transport Planner · Hermes Connect");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { level: 1, name: "Multi-Car Transport Planner" })).toBeVisible();
  await expect(page.getByText("No rate or one-truck promise.")).toBeVisible();
  await expect(page.locator('[data-multi-car-output="tier"]')).toHaveText("STANDARD REVIEW");
  await expect(page.locator('[data-multi-car-output="vehicles"]')).toHaveText("5");
  await expect(page.locator('[data-multi-car-output="arrangement"]')).toContainText("does not guarantee one truck");
  await expect(page.locator("[data-readiness-list]")).toContainText("Prepare a complete unit list for all 5 vehicles");
  expect(writeRequests).toEqual([]);
});

test("Multi-Car Planner escalates complex entered facts transparently", async ({ page }) => {
  await page.goto(route);
  await page.locator('input[name="vehicleCount"]').fill("9");
  await page.locator('input[name="inoperableCount"]').fill("2");
  await page.locator('input[name="pickupLocations"]').fill("2");
  await page.locator('input[name="deliveryLocations"]').fill("3");
  await page.locator('select[name="timing"]').selectOption("narrow");
  await page.locator('select[name="equipmentPreference"]').selectOption("enclosed");
  await page.locator('select[name="facilityAccess"]').selectOption("restricted");
  await page.locator('select[name="movementType"]').selectOption("repeat");
  await page.getByRole("button", { name: "Build planning checklist" }).click();

  await expect(page.locator('[data-multi-car-output="tier"]')).toHaveText("COMPLEX REVIEW");
  await expect(page.locator('[data-multi-car-output="inoperable"]')).toHaveText("2");
  await expect(page.locator('[data-multi-car-output="arrangement"]')).toContainText("one-versus-multiple equipment or staged coordination");
  await expect(page.locator("[data-readiness-list]")).toContainText("Flag the 2 inoperable vehicles");
  await expect(page.locator("[data-readiness-list]")).toContainText("restricted access");
  await expect(page.locator("[data-readiness-list]")).toContainText("repeat movements");

  const analytics = await page.evaluate(() => JSON.stringify((window as any).dataLayer ?? []));
  expect(analytics).toContain("multi_car_planner_start");
  expect(analytics).toContain("multi_car_planner_complete");
  expect(analytics).not.toContain("9");
  expect(analytics).not.toContain("inoperableCount");
});

test("Multi-Car Planner rejects impossible vehicle counts and keeps approved handoff", async ({ page }) => {
  await page.goto(route);
  await page.locator('input[name="vehicleCount"]').fill("3");
  await page.locator('input[name="inoperableCount"]').fill("4");
  await page.getByRole("button", { name: "Build planning checklist" }).click();
  await expect(page.locator("[data-multi-car-error]")).toContainText("inoperableCount cannot exceed vehicleCount");

  await expect(page.locator('a[data-multi-car-handoff]').first()).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/request-vehicle-transport/?request=other&equipment=multi_car#transport-intake",
  );
});
