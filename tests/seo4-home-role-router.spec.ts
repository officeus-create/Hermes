import { expect, test } from "@playwright/test";

const expectedRoles = [
  ["carrier", "/logistics/start-car-hauling-dispatch/", "Start dispatch review"],
  ["dealer", "/logistics/dealer-vehicle-transportation/", "Review dealer transport"],
  ["shipper", "/logistics/shipper-dealer/", "Open shipper path"],
  ["seo", "/services/seo-for-logistics-companies/", "Review logistics SEO"],
  ["technology", "/services/website-development/", "Review technology services"],
  ["academy", "/paths/academy/", "Explore the Academy"],
] as const;

test("homepage offers a fast role-first route before the four ecosystem pillars", async ({ page }) => {
  await page.goto("/");

  const router = page.locator("[data-home-role-router]");
  const pillars = page.locator("#paths");
  await expect(router).toBeVisible();
  await expect(page.getByRole("heading", { name: "What do you need to do today?" })).toBeVisible();
  await expect(router.locator("[data-home-role-link]")).toHaveCount(6);

  for (const [role, href, label] of expectedRoles) {
    const link = router.locator(`[data-role-id="${role}"]`);
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toContainText(label);
  }

  const routerBox = await router.boundingBox();
  const pillarsBox = await pillars.boundingBox();
  expect(routerBox).not.toBeNull();
  expect(pillarsBox).not.toBeNull();
  expect(routerBox!.y).toBeLessThan(pillarsBox!.y);
});

test("homepage role click emits only privacy-safe routing context", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.dataLayer = [];
    document.querySelector('[data-role-id="dealer"]')?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });

  await page.locator('[data-role-id="dealer"]').click();

  const event = await page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.find((item) => item.event === "homepage_role_click");
  });

  expect(event).toMatchObject({
    event: "homepage_role_click",
    page_group: "homepage_role_router",
    role_id: "dealer",
    page_path: "/",
    destination_path: "/logistics/dealer-vehicle-transportation/",
  });
  expect(JSON.stringify(event)).not.toMatch(/email|phone|name|company|MC\s*\d|USDOT\s*\d|VIN|message/i);
});
