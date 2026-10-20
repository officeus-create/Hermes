import { expect, test } from "@playwright/test";

test("homepage keeps four Claude v3 cinematic routes and the canonical social preview", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /https:\/\/hermeslogisticsus\.com\/_astro\/hermes-ecosystem-hero\.[^/]+\.jpg/,
  );

  const routes = page.locator(".home-master-route");
  await expect(routes).toHaveCount(4);
  await expect(page.locator(".home-master-core")).toHaveCount(0);

  const visual = await routes.evaluateAll((nodes) =>
    nodes.map((node) => {
      const element = node as HTMLElement;
      return {
        accent: element.style.getPropertyValue("--route-accent"),
        href: element.getAttribute("href"),
      };
    }),
  );

  expect(new Set(visual.map((item) => item.accent)).size).toBe(4);
  expect(visual.map((item) => item.href)).toEqual([
    "/paths/logistics/",
    "/paths/technology/",
    "/paths/academy/",
    "/paths/marketing/",
  ]);

  await expect(page.locator('link[rel="preload"][href*="hermes-ecosystem-hero"]')).toHaveCount(0);
  await expect(page.locator(".hero-media picture")).toHaveCount(0);
  // The two older architectural <picture> placeholders have been replaced by
  // source-matched local films with accessible poster fallback.
  await expect(page.locator(".home-portal-art picture")).toHaveCount(0);
  for (const id of ["technology", "academy"]) {
    const stage = page.locator(`[data-home-${id}-cinematic]`);
    await expect(stage).toHaveCount(1);
    await expect(stage.locator("img")).toHaveAttribute("src", `/media/home/${id}-claude-v3-poster.jpg`);
    await expect(stage.locator("source")).toHaveAttribute("data-mobile-src", `/media/home/${id}-claude-v3.mp4`);
  }
  await expect(page.locator("[data-home-logistics-scene-image]")).toHaveCount(1);
  await expect(page.locator("[data-home-logistics-scene-image]")).toHaveAttribute("src", "/images/logistics-living/car-hauler-512.webp");
  // Owner-directed living Marketing has a real local scene instead of a visible mock dashboard.
  await expect(page.locator('[data-home-marketing-cinematic]')).toHaveCount(1);
  await expect(page.locator('[data-home-marketing-cinematic] img')).toHaveAttribute('src','/media/home/marketing-team-poster.jpg');
  await expect(page.locator('[data-home-marketing-journey]')).toBeHidden();
  await expect(page.locator('.home-moving-leaves')).toHaveCount(0);
  await expect(page.locator('.home-master-stage [data-home-cinematic-video="logistics"]')).toHaveCount(1);
  await expect(page.locator('.home-master-stage [data-home-cinematic-video="logistics"] source')).toHaveAttribute(
    "data-cinematic-src",
    "/media/home/logistics-golden-v1.mp4",
  );
  await expect(page.locator(".home-master-stage canvas")).toHaveCount(0);
});


test("touch-width Safari-like viewports keep all four portals full-width", async ({ browser }, testInfo) => {
  for (const width of [390, 701, 710, 760, 820]) {
    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
      viewport: { width, height: 900 },
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto("/");
      const result = await page.evaluate(() => {
        const stage = document.querySelector(".home-master-stage");
        const routes = [...document.querySelectorAll(".home-master-route")];
        const stageWidth = stage?.getBoundingClientRect().width ?? 0;
        return {
          columns: getComputedStyle(stage!).gridTemplateColumns.split(" ").length,
          widths: routes.map(route => route.getBoundingClientRect().width),
          stageWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(result.columns, `Expected one portal column at ${width}px`).toBe(1);
      expect(result.widths).toHaveLength(4);
      expect(result.widths.every(w => w >= result.stageWidth * .95), `No half-width cards at ${width}px`).toBe(true);
      expect(result.overflow).toBe(false);
    } finally {
      await context.close();
    }
  }
});

test("desktop tablet still keeps two-column portal layout", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 760, height: 900 },
    hasTouch: false,
    isMobile: false,
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const result = await page.locator(".home-master-stage").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(result).toBe(2);
  } finally {
    await context.close();
  }
});
