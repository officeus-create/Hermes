import { expect, test } from "@playwright/test";

const expectedDirections = [
  [/Hermes Logistics/i, "/paths/logistics/"],
  [/Hermes Marketing/i, "/paths/marketing/"],
  [/Hermes Technology/i, "/paths/technology/"],
  [/Hermes Academy/i, "/paths/academy/"],
] as const;

test("homepage presents one semantic four-direction system", async ({ page }) => {
  await page.goto("/");

  const stage = page.locator("#paths.home-master-stage");
  await expect(stage).toBeVisible();
  await expect(stage.locator(".home-master-route")).toHaveCount(4);
  await expect(page.locator("[data-home-role-router]")).toHaveCount(0);

  for (const [label, href] of expectedDirections) {
    await expect(page.locator("#paths").getByRole("link", { name: label })).toHaveAttribute("href", href);
  }
});

test("homepage does not expose a second competing routing layer", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".home-master-ink-note")).toContainText("One Hermes ecosystem.");
  await expect(page.locator(".home-role-router")).toHaveCount(0);
  await expect(page.locator(".path-pillars")).toHaveCount(0);
  await expect(page.locator(".product-showcase")).toHaveCount(0);
});


test("homepage direction events are queryable by name without changing navigation", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    (window as any).__homeDirectionEvents = [];
    window.addEventListener("hermes:analytics", (event) => {
      (window as any).__homeDirectionEvents.push((event as CustomEvent).detail);
    });
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("a[data-home-route]")) event.preventDefault();
    }, true);
  });

  await page.locator('a[data-home-route][data-route-id="logistics"]').click();
  const events = await page.evaluate(() => (window as any).__homeDirectionEvents);
  const names = events.map((item: { name: string }) => item.name);
  expect(names).toContain("track_selected");
  expect(names).toContain("cta_clicked");
  expect(names).toContain("home_direction_logistics_selected");
  const directionEvent = events.find((item: { name: string }) => item.name === "home_direction_logistics_selected");
  expect(directionEvent.page_group).toBe("home");
  expect(Object.keys(directionEvent).sort()).toEqual(["name", "page_group", "ts"]);
  await expect(page).toHaveURL(/\/$/);
});
