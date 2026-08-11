import { expect, test } from "@playwright/test";

const route = "/logistics/direct-vehicle-transport-network/";

test("direct demand network is a canonical public page with real customer and carrier handoffs", async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://hermeslogisticsus.com${route}`,
  );
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("heading", { level: 1, name: /Direct Vehicle Transport Network/i })).toBeVisible();

  const customerLinks = page.locator('a[href="/logistics/request-vehicle-transport/#transport-intake"]');
  await expect(customerLinks.first()).toBeVisible();
  await expect(page.locator('a[href="/logistics/car-hauling-dispatch/"]')).toBeVisible();
  await expect(page.locator('a[href="/logistics/start-car-hauling-dispatch/"]')).toBeVisible();
});

test("direct demand network separates real request flow from the fictional Load Board and avoids guarantees", async ({ page }) => {
  await page.goto(route);

  await expect(page.getByText(/The public Load Board is a fictional product preview/i)).toBeVisible();
  await expect(page.getByText(/does not guarantee direct loads, customer demand, a route page, ranking, rate, mileage, utilization, or revenue/i)).toBeVisible();
  await expect(page.getByText(/Private carrier lanes and shipment records are not automatically published/i)).toBeVisible();

  const body = await page.locator("main").innerText();
  expect(body).not.toMatch(/guaranteed direct loads|guaranteed rankings|rank in 2.?3 months|get direct loads in 2.?3 months/i);
});

test("carrier and dealer commercial pages link to the direct demand explanation", async ({ page }) => {
  for (const source of [
    "/logistics/car-hauling-dispatch/",
    "/logistics/dealer-vehicle-transportation/",
  ]) {
    await page.goto(source);
    await expect(page.locator(`a[href="${route}"]`).first()).toBeVisible();
  }
});

test("llms public contract identifies direct demand as reviewed workflow rather than live inventory", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();

  expect(body).toContain("https://hermeslogisticsus.com/logistics/direct-vehicle-transport-network/");
  expect(body).toContain("reviewed customer/dealer/shipper request");
  expect(body).toContain("It is not live load inventory");
  expect(body).toContain("private carrier/customer/shipment rows are never automatically published");
});
