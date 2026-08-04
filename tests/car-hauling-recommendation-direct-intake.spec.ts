import { expect, test } from "@playwright/test";

const route = "/paths/logistics/carriers/car-hauling/";
const directIntake = "/logistics/start-car-hauling-dispatch/";
const demo = "/load-board/?role=carrier&equipment=car_hauler#available-loads";

test("car-hauling recommendation uses the direct dispatch intake and keeps demo secondary", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Car Hauler Dispatch & Load Access Path | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);

  const primaryLinks = page.locator("[data-recommendation-primary], [data-recommendation-primary-bottom]");
  await expect(primaryLinks).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(primaryLinks.nth(index)).toHaveAttribute("href", directIntake);
    await expect(primaryLinks.nth(index)).toContainText("Start car-hauling dispatch review");
  }

  await expect(page.locator("[data-recommendation-demo]")).toHaveAttribute("href", demo);
  await expect(page.locator("[data-recommendation-demo]")).toHaveText("Preview carrier Load Board demo");
  await expect(page.locator("[data-car-hauling-direct-intake]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Use direct intake for a real car-hauling dispatch review." })).toBeVisible();
  await expect(page.getByText(/does not create an account, assign a dispatcher, publish a load, guarantee acceptance, or book freight/i)).toBeVisible();

  const primaryDemoLinks = page.locator(
    '[data-recommendation-primary][href*="/load-board/"], [data-recommendation-primary-bottom][href*="/load-board/"]',
  );
  await expect(primaryDemoLinks).toHaveCount(0);
});

test("direct dispatch intake remains explicitly car-hauler specific", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page.locator('input[name="equipment_class"]')).toHaveValue("car_hauler");
  await expect(page.getByRole("heading", { level: 1, name: "Start a Car-Hauling Dispatch Review" })).toBeVisible();
});

test("generic carrier recommendations are not silently redirected into the car-hauler intake", async ({ page }) => {
  for (const unrelatedRoute of [
    "/paths/logistics/carriers/hotshot/",
    "/paths/logistics/carriers/box-truck/",
    "/paths/logistics/carriers/reefer/",
  ]) {
    await page.goto(unrelatedRoute);
    await expect(page.locator('[data-recommendation-primary][href="/logistics/start-car-hauling-dispatch/"]')).toHaveCount(0);
    await expect(page.locator("[data-car-hauling-direct-intake]")).toHaveCount(0);
  }
});
