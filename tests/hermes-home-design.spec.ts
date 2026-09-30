import { expect, test } from "@playwright/test";

const routes = [
  [/Open Hermes Logistics/i, "/paths/logistics/"],
  [/Open Hermes Marketing/i, "/paths/marketing/"],
  [/Open Hermes Technology/i, "/paths/technology/"],
  [/Open Hermes Academy/i, "/paths/academy/"],
] as const;

test("Hermes homepage is one connected four-direction operating scene", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /One Hermes system\. Four operating directions\./ })).toBeVisible();
  await expect(page.locator(".home-master-stage .home-master-route")).toHaveCount(4);
  await expect(page.locator(".home-master-core")).toHaveCount(1);
  await expect(page.locator(".home-role-router")).toHaveCount(0);
  await expect(page.locator(".product-showcase")).toHaveCount(0);
  await expect(page.locator(".home-technology-preview")).toHaveCount(0);

  for (const [label, href] of routes) {
    await expect(page.getByRole("link", { name: label })).toHaveAttribute("href", href);
  }

  await expect(page.locator(".home-master-route-number")).toHaveText(["01", "02", "03", "04"]);

  const visual = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>(".home-master-stage");
    const routeNodes = [...document.querySelectorAll<HTMLElement>(".home-master-route")];
    if (!stage || routeNodes.length !== 4) return null;

    return {
      radius: getComputedStyle(stage).borderRadius,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      accents: routeNodes.map((route) => route.style.getPropertyValue("--route-accent")),
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.overflow).toBe(false);
  const expectedRadius = (page.viewportSize()?.width ?? 1280) <= 700 ? "26px" : "34px";
  expect(visual!.radius).toBe(expectedRadius);
  expect(new Set(visual!.accents).size).toBe(4);
});

test("V4 homepage keeps direct routing and usable geometry on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator(".home-master-route")).toHaveCount(4);
  await expect(page.getByRole("link", { name: /Open Hermes Logistics/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Hermes Technology/i })).toBeVisible();

  const geometry = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>(".home-master-stage");
    const routeNodes = [...document.querySelectorAll<HTMLElement>(".home-master-route")];
    if (!stage || routeNodes.length !== 4) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      radius: getComputedStyle(stage).borderRadius,
      routeHeights: routeNodes.map((route) => route.getBoundingClientRect().height),
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.overflow).toBe(false);
  expect(geometry!.radius).toBe("26px");
  expect(Math.min(...geometry!.routeHeights)).toBeGreaterThanOrEqual(86);
});


for (const width of [390, 430, 768, 1024, 1440]) {
  test(`V4 Home Master Scene holds its routing contract at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");

    await expect(page.locator(".home-master-stage")).toBeVisible();
    await expect(page.locator(".home-master-route")).toHaveCount(4);

    const state = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>(".home-master-stage");
      const routes = [...document.querySelectorAll<HTMLAnchorElement>(".home-master-route")];
      return {
        hasStage: Boolean(stage && stage.getBoundingClientRect().width > 0),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        routeIds: routes.map((route) => route.dataset.routeId),
        routeWidths: routes.map((route) => route.getBoundingClientRect().width),
      };
    });

    expect(state.hasStage).toBe(true);
    expect(state.overflow).toBe(false);
    expect(state.routeIds).toEqual(["logistics", "marketing", "technology", "academy"]);
    expect(Math.min(...state.routeWidths)).toBeGreaterThan(120);
  });
}
