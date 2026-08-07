import { expect, test } from "@playwright/test";

const commercialHref = "/logistics/car-hauling-dispatch/";

for (const route of [
  "/paths/logistics/carriers/car-hauling/",
  "/paths/logistics/carriers/owner-operators/",
  "/paths/logistics/carriers/fleet-owners/",
]) {
  test(`${route} links contextually to the national car-hauling commercial page`, async ({ page }) => {
    await page.goto(route);
    const commercialLink = page.getByRole("link", { name: "Review car-hauling dispatch support" });
    await expect(commercialLink).toHaveAttribute("href", commercialHref);
    await expect(commercialLink).toHaveCount(1);
  });
}

test("capacity checklist connects service research to dispatch support and carrier intake", async ({ page }) => {
  await page.goto("/logistics/resources/car-hauler-capacity-checklist/");
  const heroActions = page.locator(".logistics-audience-actions");
  await expect(heroActions.getByRole("link", { name: "Review dispatch support" })).toHaveAttribute("href", commercialHref);
  await expect(heroActions.getByRole("link", { name: /Prepare carrier capacity review/ })).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );
});

test("unrelated equipment audience does not receive a repeated car-hauling commercial link", async ({ page }) => {
  await page.goto("/paths/logistics/carriers/hotshot/");
  await expect(page.locator('[data-car-hauling-commercial-link]')).toHaveCount(0);
});
