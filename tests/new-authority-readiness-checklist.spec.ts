import { expect, test } from "@playwright/test";

const route = "/logistics/resources/new-authority-car-hauler-readiness-checklist/";

test("new authority readiness checklist is useful, indexable, and connected to carrier intake", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/New Authority Car Hauler Readiness Checklist/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
  await expect(page.getByRole("heading", { level: 1, name: "New Authority Car Hauler Readiness Checklist" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eight checks before active load review." })).toBeVisible();
  await expect(page.getByText("Authority status and age", { exact: true })).toBeVisible();
  await expect(page.getByText("Insurance readiness", { exact: true })).toBeVisible();
  await expect(page.getByText("Carrier control", { exact: true })).toBeVisible();
  await expect(page.getByText(/completed checklist is not a promise of loads or income/i)).toBeVisible();

  const primaryCtas = page.getByRole("link", { name: /carrier readiness review|open carrier intake/i });
  await expect(primaryCtas).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(primaryCtas.nth(index)).toHaveAttribute(
      "href",
      "/load-board/?role=carrier&equipment=car_hauler#carrier-access",
    );
  }

  await expect(page.getByRole("link", { name: "Review new-authority support" })).toHaveAttribute(
    "href",
    "/logistics/new-authority-car-hauler-support/",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toContainText("New Authority Car Hauler Readiness Checklist");
});

test("new authority commercial owner links to the readiness checklist", async ({ page }) => {
  await page.goto("/logistics/new-authority-car-hauler-support/");
  await expect(page.getByRole("link", { name: "New Authority Readiness Checklist" })).toHaveAttribute("href", route);
});