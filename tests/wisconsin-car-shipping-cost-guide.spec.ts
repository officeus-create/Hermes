import { expect, test } from "@playwright/test";

const route = "/logistics/resources/wisconsin-car-shipping-cost-guide/";

test("Wisconsin cost guide is indexable, useful, and connected to direct intake", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/Wisconsin Car Shipping Cost Guide/i);
  await expect(page.locator("h1")).toContainText(/Car shipping cost in Wisconsin/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/wisconsin-car-shipping-cost-guide/",
  );
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);

  const intake = page.locator("[data-cost-guide-direct-intake]");
  await expect(intake).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake",
  );
  await expect(page.getByRole("link", { name: /Auction vehicle pickup checklist/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Dealer vehicle transportation/i })).toBeVisible();

  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  expect(body).not.toMatch(/\$\s?\d{2,}/);
  expect(body).toMatch(/does not publish a rate|does not publish a load/i);
});

test("Wisconsin cost guide stays within the 390px mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const primary = page.locator("[data-cost-guide-direct-intake]");
  const box = await primary.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});
