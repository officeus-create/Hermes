import { expect, test } from "@playwright/test";

test("Marketing shows a real creative collaboration video without decorative HUD or fake results", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const route = page.locator('[data-route-id="marketing"]');
  const scene = route.locator("[data-home-marketing-cinematic]");
  await expect(scene).toHaveCount(1);
  await expect(scene.locator("video")).toHaveCount(1);
  await expect(route.locator("[data-home-marketing-journey]")).toBeHidden();
  await expect(route.locator(".home-moving-leaves")).toHaveCount(0);
  await expect(route).toHaveAttribute("href", "/paths/marketing/");
  await expect(route).toHaveAttribute("aria-label", /Example flow: content \+ news, search \+ social, website action, crm evidence/i);
  await scene.scrollIntoViewIfNeeded();
  await expect.poll(() => scene.getAttribute("data-media-state")).toBe("ready");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Marketing is usable without JavaScript, with the poster and native route", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width: 390, height: 844 }, reducedMotion: "reduce", javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const route = page.locator('[data-route-id="marketing"]');
  const scene = route.locator("[data-home-marketing-cinematic]");
  await expect(scene.locator("img")).toBeVisible();
  await expect(scene.locator("source")).not.toHaveAttribute("src",/.+/);
  await expect(route.locator('[data-home-explainer="marketing"]')).toHaveCSS("display", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await route.click();
  await expect(page).toHaveURL(/\/paths\/marketing\/$/);
  await context.close();
});

test("tablet keeps four routes in two columns; Marketing retains cinematic source and poster", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  const stage = page.locator(".home-master-stage");
  const countColumns = () => stage.evaluate(node => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length);
  expect(await countColumns()).toBe(2);
  const marketing=stage.locator('[data-route-id="marketing"]');
  await expect(marketing.locator("[data-home-marketing-cinematic]")).toHaveCount(1);
  await expect(marketing.locator("img")).toHaveAttribute("src","/media/home/marketing-team-poster.jpg");
  for (const id of ["logistics", "technology", "academy"]) {
    const route = stage.locator(`[data-route-id="${id}"]`);
    const image = id === "logistics" ? route.locator("[data-home-logistics-scene-image]") : route.locator(".home-portal-art img");
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute("sizes", /\(min-width:701px\) and \(max-width:1000px\)/);
  }
  await expect(stage.locator('[data-route-id="logistics"] [data-home-logistics-road-plate]')).toHaveCount(0);
  await expect(stage.locator('[data-route-id="academy"] .home-portal-art img')).toHaveAttribute("src","/images/home-20261001/academy-512.webp");
  await expect(stage.locator("[data-home-route]")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.setViewportSize({ width: 1024, height: 900 });
  expect(await countColumns()).toBe(4);
});
