import { expect, test } from "@playwright/test";

const directions = [
  ["logistics", "Hermes Logistics", "Move freight"],
  ["marketing", "Hermes Marketing", "Grow demand"],
  ["technology", "Hermes Technology", "Build systems"],
  ["academy", "Hermes Academy", "Build capability"],
] as const;

test("Home exposes goal-based navigation and direct routes without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  const navigation = page.getByRole("navigation", { name: "Hermes operating directions" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link")).toHaveCount(4);
  for (const [id, brand, goal] of directions) {
    const link = navigation.getByRole("link", { name: new RegExp(`Open ${brand}: ${goal}`) });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", `/paths/${id}/`);
    await expect(link).toContainText(goal);
  }
  await navigation.getByRole("link", { name: /Open Hermes Logistics/ }).click();
  await expect(page).toHaveURL(/\/paths\/logistics\/$/);
  await context.close();
});

test("Home keyboard order matches the four direction choices and Enter navigates", async ({ page }) => {
  await page.goto("/");
  const links = page.locator(".home-master-route");
  await links.first().focus();
  for (let index = 0; index < directions.length; index++) {
    if (index) await page.keyboard.press("Tab");
    await expect(links.nth(index)).toBeFocused();
    const outline = await links.nth(index).evaluate((node) => {
      const style = getComputedStyle(node);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
    });
    expect(outline.style).toBe("solid");
    expect(outline.width).toBeGreaterThanOrEqual(3);
  }
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/paths\/academy\/$/);
});

for (const width of [390, 430, 768, 1024, 1440]) {
  test(`Home has a bounded motion budget and useful public copy at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const motion = await page.locator(".home-master-core-ring").evaluateAll((rings) => rings.map((ring) => {
      const style = getComputedStyle(ring);
      return { name: style.animationName, count: style.animationIterationCount, duration: parseFloat(style.animationDuration) };
    }));
    for (const ring of motion) {
      if (width <= 980) expect(ring.name).toBe("none");
      else {
        expect(ring.name).not.toBe("none");
        expect(ring.count).toBe("1");
        expect(ring.duration).toBeLessThanOrEqual(2);
      }
    }
    await expect(page.locator(".home-master-note")).toHaveText("Choose a direction to explore services and find the right team for your next step.");
    if (width === 390 || width === 1440) {
      await test.info().attach(`home-v4-${width}px`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
    }
  });
}

test("Home reduced motion keeps the scene and routes fully static and usable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const rings = await page.locator(".home-master-core-ring").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationName));
  expect(rings).toEqual(["none", "none"]);
  const link = page.locator(".home-master-route").first();
  await link.focus();
  const motion = await link.evaluate((node) => ({
    transform: getComputedStyle(node).transform,
    duration: getComputedStyle(node).transitionDuration,
  }));
  expect(motion).toEqual({ transform: "none", duration: "0s" });
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/paths\/logistics\/$/);
});
