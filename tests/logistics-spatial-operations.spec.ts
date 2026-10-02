import { expect, test } from "@playwright/test";

test("logistics spatial operations explains a controlled path without changing the canonical owner", async ({ page }) => {
  await page.goto("/paths/logistics/");

  const scene = page.locator("[data-logistics-spatial-operations]");
  await expect(scene).toBeVisible();
  await expect(scene.locator(".logistics-spatial-ambient")).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("heading", { name: "See how a logistics request moves from context to a controlled handoff." })).toBeVisible();
  await expect(scene).toContainText("Illustrative workflow — not live load, rate, capacity, demand, vehicle, telemetry, or ETA data.");

  const expected = [
    ["Request context", "REQUEST CONTEXT"],
    ["Route + equipment fit", "ROUTE / EQUIPMENT FIT"],
    ["Source + capacity boundary", "SOURCE BOUNDARY"],
    ["Human review", "HUMAN REVIEW"],
    ["Controlled handoff", "CONTROLLED HANDOFF"],
  ];

  for (const [label, state] of expected) {
    const step = scene.getByRole("button", { name: label, exact: false });
    await step.click();
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(scene.locator("[data-logistics-spatial-state]")).toHaveText(state);
  }

  await expect(scene.locator('a[href="#find-your-path"]')).toBeVisible();
  await expect(scene.locator('a[href="/load-board/"]')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/paths/logistics/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
});

test.describe("logistics spatial operations mobile contract", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("keeps the route explanation and human-control boundary readable at 390px", async ({ page }) => {
    await page.goto("/paths/logistics/");
    const scene = page.locator("[data-logistics-spatial-operations]");
    await expect(scene).toBeVisible();

    await scene.getByRole("button", { name: "Human review", exact: false }).tap();
    await expect(scene.locator("[data-logistics-spatial-state]")).toHaveText("HUMAN REVIEW");
    await expect(scene).toContainText("Human control remains explicit before a real commitment.");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});


test("logistics ambient motion is decorative, deliberate, and reduced-motion safe", async ({ page }) => {
  await page.goto("/paths/logistics/");

  const motion = await page.evaluate(() => {
    const grid = document.querySelector<HTMLElement>(".logistics-spatial-grid");
    const ambient = document.querySelector<HTMLElement>(".logistics-spatial-ambient");
    const route = document.querySelector<SVGPathElement>(".logistics-spatial-route-live");
    const node = document.querySelector<HTMLElement>(".logistics-spatial-node-context");
    if (!grid || !ambient || !route || !node) return null;
    return {
      grid: getComputedStyle(grid).animationName,
      ambient: getComputedStyle(ambient).animationName,
      route: getComputedStyle(route).animationName,
      nodeHalo: getComputedStyle(node, "::after").animationName,
      ambientPointerEvents: getComputedStyle(ambient).pointerEvents,
    };
  });

  expect(motion).not.toBeNull();
  expect(motion!.grid).toContain("logistics-grid-drift");
  expect(motion!.ambient).toContain("logistics-ambient-drift");
  expect(motion!.route).toContain("logistics-route-flow");
  expect(motion!.route).toContain("logistics-route-glow");
  expect(motion!.nodeHalo).toContain("logistics-node-wake");
  expect(motion!.ambientPointerEvents).toBe("none");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const reduced = await page.evaluate(() => {
    const grid = document.querySelector<HTMLElement>(".logistics-spatial-grid");
    const ambient = document.querySelector<HTMLElement>(".logistics-spatial-ambient");
    const route = document.querySelector<SVGPathElement>(".logistics-spatial-route-live");
    const node = document.querySelector<HTMLElement>(".logistics-spatial-node-context");
    if (!grid || !ambient || !route || !node) return null;
    return {
      grid: getComputedStyle(grid).animationName,
      ambient: getComputedStyle(ambient).animationName,
      route: getComputedStyle(route).animationName,
      nodeHalo: getComputedStyle(node, "::after").animationName,
    };
  });

  expect(reduced).not.toBeNull();
  expect(reduced).toEqual({
    grid: "none",
    ambient: "none",
    route: "none",
    nodeHalo: "none",
  });
});
