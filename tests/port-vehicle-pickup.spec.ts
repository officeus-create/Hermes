import { expect, test } from "@playwright/test";

const route = "/logistics/port-vehicle-pickup/";

test("port vehicle pickup owner is indexable, bounded, and routes to the existing intake", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/Port Vehicle Pickup/i);
  await expect(page.locator("h1")).toHaveText(/Port Vehicle Pickup & Inland Transport/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/port-vehicle-pickup/",
  );
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);

  const primary = page.locator("[data-commercial-primary-cta]").first();
  await expect(primary).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=business&request=other#transport-intake",
  );

  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  expect(body).toMatch(/does not represent itself as a customs broker/i);
  expect(body).toMatch(/does not create a booking|does not guarantee a carrier|does not guarantee.*capacity/i);
  expect(body).not.toMatch(/Hermes (clears customs|files your CBP entry|guarantees customs release)/i);

  await expect(page.getByRole("link", { name: "Port Pickup Qualification" })).toHaveAttribute(
    "href",
    "/paths/logistics/customers/port-pickup/",
  );
  await expect(page.getByRole("link", { name: "Dealer Vehicle Transportation" })).toBeVisible();
});

test("port vehicle pickup owner stays within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const primary = page.locator("[data-commercial-primary-cta]").first();
  const box = await primary.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});
