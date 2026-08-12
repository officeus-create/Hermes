import { expect, test } from "@playwright/test";

test("Load Board starts with two plain-language entry choices and keeps demo maturity explicit", async ({ page }) => {
  await page.goto("/load-board/");

  await expect(page.getByRole("heading", { level: 2, name: "What are you here to do?" })).toBeVisible();

  const customer = page.locator('[data-primary-entry="customer"]');
  const carrier = page.locator('[data-primary-entry="carrier"]');
  await expect(customer).toHaveCount(1);
  await expect(carrier).toHaveCount(1);

  await expect(customer).toContainText("I need to move a vehicle");
  await expect(customer).toHaveAttribute("href", "/logistics/request-vehicle-transport/#transport-intake");

  await expect(carrier).toContainText("I have a truck");
  await expect(carrier).toHaveAttribute("href", "?role=carrier#available-loads");
  await expect(carrier).toContainText(/fictional|demo|preview/i);

  await expect(page.locator("[data-primary-entry]")).toHaveCount(2);
  await expect(page.getByText("Customer → Hermes → Carrier", { exact: true })).toBeVisible();
  await expect(page.getByText(/No load shown on this page is live or bookable/i)).toBeVisible();
});

test("broker path remains available without competing with the two primary choices", async ({ page }) => {
  await page.goto("/load-board/");

  const broker = page.getByRole("link", { name: /Broker.*verified carrier capacity/i });
  await expect(broker).toHaveAttribute("href", "/paths/logistics/brokers/carrier-capacity/");
  await expect(page.locator("[data-primary-entry]")).toHaveCount(2);
});
