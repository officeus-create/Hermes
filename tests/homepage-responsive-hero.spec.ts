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
    await expect(stage.locator("img")).toHaveAttribute("src", `/media/home/${id}-film-v2-poster.jpg`);
    await expect(stage.locator("source")).toHaveAttribute("data-mobile-src", `/media/home/${id}-film-v2-540.mp4`);
  }
  await expect(page.locator("[data-home-logistics-scene-image]")).toHaveCount(1);
  await expect(page.locator("[data-home-logistics-scene-image]")).toHaveAttribute("src", "/images/logistics-living/car-hauler-512.webp");
  // Owner-directed living Marketing has a real local scene instead of a visible mock dashboard.
  await expect(page.locator('[data-home-marketing-cinematic]')).toHaveCount(1);
  await expect(page.locator('[data-home-marketing-cinematic] img')).toHaveAttribute('src','/media/home/marketing-film-v2-poster.jpg');
  await expect(page.locator('[data-home-marketing-journey]')).toBeHidden();
  await expect(page.locator('.home-moving-leaves')).toHaveCount(0);
  await expect(page.locator('.home-master-stage [data-home-cinematic-video="logistics"]')).toHaveCount(1);
  await expect(page.locator('.home-master-stage [data-home-cinematic-video="logistics"] source')).toHaveAttribute(
    "data-cinematic-src",
    "/media/home/logistics-film-v2-540.mp4",
  );
  await expect(page.locator(".home-master-stage canvas")).toHaveCount(0);
});


test("approved English Home v3 is an accessible four-choice entrance followed by Contact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Four directions." })).toBeVisible();
  await expect(page.locator("[data-home-route]")).toHaveCount(4);
  await expect(page.locator("[data-home-proof-decision]")).toHaveCount(0);
  await expect(page.locator(".home-traffic-inline-section")).toHaveCount(0);
  await expect(page.locator("#contact [data-home-primary-contact]")).toHaveAttribute("href", "/contacts/");
  await expect(page.locator("#contact [data-home-contact-fallback]")).toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("touch tablet at 760px uses whole-width clickable portals without affecting mouse layout", async ({ browser }, testInfo) => {
  for (const touch of [true, false]) {
    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
      viewport: { width: 760, height: 900 },
      isMobile: touch, hasTouch: touch, reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto("/");
      const geometry = await page.locator(".home-master-stage").evaluate((stage) => ({
        columns: getComputedStyle(stage).gridTemplateColumns.trim().split(/\s+/).length,
        width: stage.getBoundingClientRect().width,
        cards: [...stage.querySelectorAll(".home-master-route")].map(card => card.getBoundingClientRect().width),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      expect(geometry.columns).toBe(touch ? 1 : 2);
      expect(geometry.cards).toHaveLength(4);
      expect(geometry.overflow).toBe(false);
      if (touch) expect(geometry.cards.every(width => width >= geometry.width * .95)).toBe(true);
    } finally { await context.close(); }
  }
});


test("Home navigation stays fixed while scrolling past the four directions to Contact", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator(".site-header")).toBeVisible();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    const nav = await page.locator(".site-header").evaluate(element => {
      const rect = element.getBoundingClientRect();
      return {
        position: getComputedStyle(element).position,
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: innerHeight,
      };
    });
    expect(nav.position).toBe("fixed");
    expect(nav.top).toBeGreaterThanOrEqual(-1);
    expect(nav.bottom).toBeLessThan(nav.viewportHeight);
    await expect(page.locator(".site-header .wordmark")).toHaveAttribute("href", "/#top");
  }
});


test("desktop Products unfolds downward and stays visible on Home and Directions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["/", "/paths/logistics/"]) {
    await page.goto(path);
    const products = page.locator(".desktop-products-menu");
    const summary = products.locator("summary");
    await summary.click();
    await expect(products).toHaveAttribute("open", "");
    const relation = await products.evaluate((details) => {
      const trigger = details.querySelector("summary")!.getBoundingClientRect();
      const menu = details.querySelector(".desktop-products-grid")!.getBoundingClientRect();
      return {
        triggerBottom: trigger.bottom,
        menuTop: menu.top,
        menuLeft: menu.left,
        menuRight: menu.right,
        windowWidth: innerWidth,
      };
    });
    expect(relation.menuTop).toBeGreaterThanOrEqual(relation.triggerBottom - 1);
    expect(relation.menuLeft).toBeGreaterThanOrEqual(0);
    expect(relation.menuRight).toBeLessThanOrEqual(relation.windowWidth + 1);
    await page.keyboard.press("Escape");
    await expect(products).not.toHaveAttribute("open", "");
  }
  await page.goto("/");
  const products = page.locator(".desktop-products-menu");
  await products.locator("summary").click();
  const links = products.locator(".desktop-products-grid a");
  expect(await links.evaluateAll(nodes => nodes.map(n => n.getAttribute("href")))).toEqual([
    "/services/hermes-connect/", "/businesses/", "/insights/", "/opportunities/",
  ]);
  await page.keyboard.press("Escape");
  await expect(products).not.toHaveAttribute("open", "");
});

test("visible desktop technology scene plays autonomously and pointer movement does not freeze it", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 1440, height: 900 },
    isMobile: false, hasTouch: false,
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const stage = page.locator("[data-home-technology-cinematic]");
    const video = stage.locator("video");
    await stage.scrollIntoViewIfNeeded();
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused), { timeout: 10000 }).toBe(false);
    await expect(stage).toHaveAttribute("data-media-state", "ready");
    expect(await stage.locator("source").getAttribute("src")).toBe("/media/home/technology-film-v2-540.mp4");
    const t0 = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
    await page.mouse.move(0, 0);
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime), { timeout: 5000 }).toBeGreaterThan(t0 + 0.05);
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  } finally { await context.close(); }
});

test("four-window desktop entrance avoids DPR-only HD escalation while Save-Data remains poster-only", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, isMobile: false, hasTouch: false,
  });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", downlink: 10, saveData: false },
    }));
    await page.goto("/");
    const stage = page.locator("[data-home-academy-cinematic]");
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute("data-video-quality", "standard");
    await expect(stage.locator("source")).toHaveAttribute("src", "/media/home/academy-film-v2-540.mp4");
  } finally {
    await context.close();
  }

  const saveDataContext = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 1440, height: 900 },
    isMobile: false, hasTouch: false,
  });
  try {
    const page = await saveDataContext.newPage();
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", downlink: 10, saveData: true },
    }));
    await page.goto("/");
    const stage = page.locator("[data-home-academy-cinematic]");
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute("data-media-state", "poster");
    await expect(stage.locator("source")).not.toHaveAttribute("src", /.+/);
  } finally {
    await saveDataContext.close();
  }
});
