import { expect, test } from "@playwright/test";

test("Marketing portal shows one causal scene without decorative leaves or invented metrics", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const route = page.locator('[data-route-id="marketing"]');
  const scene = route.locator('[data-home-marketing-journey]');
  await expect(scene).toHaveCount(1);
  await expect(route.locator("[data-home-marketing-human]")).toHaveCount(0);
  await expect(route.locator(".home-portal-art img")).toHaveCount(0);
  // The selected scene keeps the causal workflow without the retired botanical legacy artwork.
  await expect(scene.locator("[data-marketing-stage]")).toHaveCount(4);
  await expect(scene.locator(".home-marketing-card")).toHaveCount(0);
  for (const label of ["CANONICAL CONTENT", "DISTRIBUTION", "WEBSITE ACTION", "CRM EVIDENCE"]) {
    await expect(scene).toContainText(label);
  }
  await expect(page.locator(".home-moving-leaves")).toHaveCount(0);
  await expect(page.locator(".home-story-board")).toHaveCount(0);
  await expect(route).toHaveAttribute("href", "/paths/marketing/");
  await expect(route).toHaveAttribute("aria-label", /Example flow: canonical content, search \+ social, website action, crm evidence/i);
  await route.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-journey-motion", "running");
  await expect(scene.locator(".home-marketing-pulse")).toHaveCSS("animation-name", "home-marketing-current");
  await route.hover();
  // New live scene replaces the duplicate legacy workflow overlay.
  await expect(route.locator('[data-home-explainer="marketing"]')).toHaveCSS("display", "none");
  await expect(scene).toHaveCSS("opacity", "1");
  for (const selector of [".home-marketing-distribution small", ".home-marketing-inquiry small"]) {
    const label = scene.locator(selector);
    expect(await label.evaluate(node => node.scrollWidth > node.clientWidth + 1)).toBe(false);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Marketing mobile stations retain readable clearances at 390 and 430 px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const scene = page.locator("[data-home-marketing-journey]");
    await expect(scene).toBeVisible();
    await expect(scene.locator(".home-marketing-distribution > em")).toBeHidden();
    const spacing = await scene.evaluate(node => {
      const bounds = (selector: string) => {
        const element = node.querySelector(selector);
        if (!element) throw new Error(`Marketing child missing: ${selector}`);
        return element.getBoundingClientRect();
      };
      return {
        channelsToWebsite: bounds(".home-marketing-site small").top - bounds(".home-marketing-channels").bottom,
        browserToCrm: bounds(".home-marketing-inquiry small").top - bounds(".home-marketing-browser").bottom,
        sceneBottom: node.getBoundingClientRect().bottom,
        lastStepBottom: bounds(".home-marketing-inquiry .home-marketing-evidence-row:last-child").bottom,
      };
    });
    expect(spacing.channelsToWebsite, `${width}px channels → website collision`).toBeGreaterThanOrEqual(5);
    expect(spacing.browserToCrm, `${width}px website → CRM collision`).toBeGreaterThanOrEqual(6);
    expect(spacing.lastStepBottom, `${width}px CRM exceeds Marketing visual corridor`).toBeLessThanOrEqual(spacing.sceneBottom + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test("Marketing scene is static for reduced motion and keeps native links without JS", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto("/");
  const route = page.locator('[data-route-id="marketing"]');
  const scene = route.locator('[data-home-marketing-journey]');
  await expect(scene).toBeVisible();
  await expect(scene.locator("[data-marketing-stage]")).toHaveCount(4);
  await expect(scene.locator(".home-marketing-pulse")).toHaveCSS("animation-name", "none");
  await expect(route.locator('[data-home-explainer="marketing"]')).toContainText("CRM evidence");
  for (const selector of [".home-marketing-distribution small", ".home-marketing-inquiry small"]) {
    const label = scene.locator(selector);
    expect(await label.evaluate(node => node.scrollWidth > node.clientWidth + 1)).toBe(false);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await route.click();
  await expect(page).toHaveURL(/\/paths\/marketing\/$/);
  await context.close();
});

test("Marketing motion stops when outside viewport and respects live preference change", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const scene = page.locator('[data-home-marketing-journey]');
  await page.locator("#paths").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-journey-motion", "running");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-journey-motion", "paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene).toHaveAttribute("data-journey-motion", "reduced");
  await expect(scene.locator(".home-marketing-pulse")).toHaveCSS("animation-name", "none");
});

test("tablet four-direction layout uses readable two-column scenes while desktop stays four columns", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  const stage = page.locator(".home-master-stage");
  const countColumns = () => stage.evaluate(node => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length);
  expect(await countColumns()).toBe(2);
  for (const id of ["logistics", "technology", "academy"]) {
    const route = stage.locator(`[data-route-id="${id}"]`);
    // Logistics keeps one coherent local fallback image; no independent road/truck layers.
    const image = id === "logistics"
      ? route.locator("[data-home-logistics-scene-image]")
      : route.locator(".home-portal-art img");
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute("sizes", /\(min-width:701px\) and \(max-width:1000px\)/);
  }
  await expect(stage.locator('[data-route-id="logistics"] [data-home-logistics-road-plate]')).toHaveCount(0);
  await expect(stage.locator('[data-route-id="logistics"] [data-home-logistics-truck-layer]')).toHaveCount(0);
  await expect(stage.locator('[data-route-id="logistics"] [data-home-cinematic-slot="logistics"]')).toHaveCount(1);
  await expect(stage.locator('[data-route-id="marketing"] .home-portal-art img')).toHaveCount(0);
  await expect(stage.locator('[data-route-id="academy"] .home-portal-art img')).toHaveCount(1);
  await expect(stage.locator('[data-route-id="academy"] .home-portal-art img')).toHaveAttribute("src", "/images/home-20261001/academy-512.webp");
  await expect(stage.locator("[data-home-route]")).toHaveCount(4);
  const tabletCards = await stage.locator("[data-home-route]").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()));
  expect(tabletCards[0].top).toBe(tabletCards[1].top);
  expect(tabletCards[2].top).toBeGreaterThan(tabletCards[0].bottom);
  const labelPx = await page.locator("[data-home-marketing-journey] .home-marketing-stage small")
    .first().evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  expect(labelPx).toBeGreaterThanOrEqual(10);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.setViewportSize({ width: 1024, height: 900 });
  expect(await countColumns()).toBe(4);
});
