import { expect, test } from "@playwright/test";

const guidePath = "/logistics/resources/car-hauler-jobs-owner-operator-guide/";

test("car-hauler jobs guide separates employment from operating-carrier intent", async ({ page }) => {
  await page.goto(guidePath);

  await expect(page).toHaveTitle("Car Hauler Jobs & Owner-Operator Paths | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/car-hauler-jobs-owner-operator-guide/",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Car Hauler Jobs vs Owner-Operator Carrier Work: Which Path Fits?",
  );

  await expect(page.getByRole("link", { name: "Looking for employment?" })).toHaveAttribute(
    "href",
    "/logistics/careers/",
  );
  await expect(page.getByRole("link", { name: /Open carrier fit review/i }).first()).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );


test("car-hauler jobs guide keeps compensation and availability boundaries explicit", async ({ page }) => {
  await page.goto(guidePath);

  const main = await page.locator("main").innerText();
  expect(main).toContain("Do not compare salary with carrier gross revenue.");
  expect(main).toContain("The carrier intake is a business-to-business review and is not an employment application.");
  expect(main).toContain("does not guarantee acceptance, loads, rates, mileage, utilization, profit, or revenue");
  expect(main).not.toMatch(/guaranteed loads|guaranteed revenue|guaranteed salary/i);

  await expect(page.getByRole("link", { name: /Owner-operator dispatch support/i })).toHaveAttribute(
    "href",
    "/logistics/owner-operator-dispatch-support/",
  );
  await expect(page.getByRole("link", { name: /New-authority readiness/i })).toHaveAttribute(
    "href",
    "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
  );
  await expect(page.getByRole("link", { name: /RPM & profitability calculator/i })).toHaveAttribute(
    "href",
    "/logistics/resources/rpm-calculator/",
  );
});

test("owner-operator commercial owner links back to the early-intent guide", async ({ page }) => {
  await page.goto("/logistics/owner-operator-dispatch-support/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Car Hauler Owner-Operator Dispatch Support");
  await expect(page.getByRole("link", { name: "Car Hauler Jobs vs Owner-Operator Paths" })).toHaveAttribute("href", guidePath);
});