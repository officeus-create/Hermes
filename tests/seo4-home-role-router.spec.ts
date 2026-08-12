import { expect, test } from "@playwright/test";

const expectedRoles = [
  ["carrier", "/logistics/start-car-hauling-dispatch/", "Review carrier support"],
  ["transport", "/logistics/request-vehicle-transport/", "Request vehicle transport"],
  ["business", "/business-growth/", "Choose a growth path"],
  ["academy", "/paths/academy/", "Explore the Academy"],
  ["career", "/logistics/careers/", "Review careers"],
] as const;

test("homepage offers a situation-first route before the four ecosystem pillars", async ({ page }) => {
  await page.goto("/");

  const router = page.locator("[data-home-role-router]");
  const pillars = page.locator("#paths");
  await expect(router).toBeVisible();
  await expect(router).toHaveAttribute("id", "start");
  await expect(page.getByRole("heading", { name: "What needs to happen next?" })).toBeVisible();
  await expect(router.locator("[data-home-role-link]")).toHaveCount(5);

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

test("homepage situation click emits only privacy-safe routing context", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("hermes-intro-seen", "1");
  });
  await page.goto("/");
  await page.evaluate(() => {
    window.dataLayer = [];
    document.querySelector('[data-role-id="transport"]')?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });

  await page.locator('[data-role-id="transport"]').click();

  const event = await page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.find((item) => item.event === "homepage_role_click");
  });

  expect(event).toMatchObject({
    event: "homepage_role_click",
    page_group: "homepage_role_router",
    role_id: "transport",
    page_path: "/",
    destination_path: "/logistics/request-vehicle-transport/",
  });
  expect(JSON.stringify(event)).not.toMatch(/email|phone|name|company|MC\s*\d|USDOT\s*\d|VIN|message/i);
});
