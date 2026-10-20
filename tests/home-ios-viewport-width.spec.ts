import { expect, test } from "@playwright/test";

/**
 * Regression for a user-reported real iPhone Safari screenshot (2026-10-21):
 * the fixed header occupied the screen width, but the four Home portal cards
 * occupied only a narrow left column with a large blank strip to the right.
 * Tests use the actual mobile viewport size, not the image's resized pixels.
 */
test("all four Home portals follow the complete iPhone viewport", async ({ browser }, testInfo) => {
  // Fresh mobile contexts are required here. Playwright cannot change a
  // mobile device's screen dimensions merely by resizing the page viewport,
  // so an in-place resize produces misleading innerWidth readings.
  for (const width of [320, 375, 390, 428, 430, 640, 700]) {
    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
      viewport: { width, height: 926 },
      screen: { width, height: 926 },
      deviceScaleFactor: 3,
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator(".home-master-route")).toHaveCount(4);
      const layout = await page.evaluate(() => {
        const widthOf = (selector: string) => {
          const element = document.querySelector(selector);
          if (!element) throw new Error(`Missing selector: ${selector}`);
          return element.getBoundingClientRect().width;
        };
        return {
          viewport: innerWidth,
          pageWidth: document.documentElement.scrollWidth,
          header: widthOf(".site-header"),
          home: widthOf(".home-master"),
          shell: widthOf(".home-master-shell"),
          stage: widthOf(".home-master-stage"),
          cards: [...document.querySelectorAll(".home-master-route")].map((element) => element.getBoundingClientRect().width),
        };
      });
      expect(layout.viewport).toBe(width);
      expect(layout.pageWidth).toBeLessThanOrEqual(width + 1);
      expect(layout.home).toBeGreaterThanOrEqual(width - 1);
      expect(layout.shell).toBeGreaterThanOrEqual(width - 1);
      expect(Math.abs(layout.stage - (width - 24))).toBeLessThanOrEqual(2);
      expect(layout.cards).toHaveLength(4);
      for (const cardWidth of layout.cards) {
        expect(Math.abs(cardWidth - layout.stage)).toBeLessThanOrEqual(2);
      }
      expect(layout.header).toBeGreaterThanOrEqual(width - 20);
    } finally {
      await context.close();
    }
  }
});

test("Home resists a narrower ancestor while header stays viewport-wide", async ({ page }) => {
  await page.setViewportSize({ width: 428, height: 926 });
  await page.goto("/");
  const before = await page.locator(".home-master-stage").boundingBox();
  expect(before?.width).toBeGreaterThan(400);

  // Reproduce the screenshot's geometry without assuming an unverified
  // Safari engine root cause: the shell ancestor becomes approximately half
  // width while the fixed header continues to span the visual viewport.
  await page.locator("main").evaluate((main) => { main.style.width = "54%"; });
  const after = await page.evaluate(() => {
    const stage = document.querySelector(".home-master-stage")!.getBoundingClientRect();
    const header = document.querySelector(".site-header")!.getBoundingClientRect();
    const cards = [...document.querySelectorAll(".home-master-route")].map(node => node.getBoundingClientRect().width);
    return { stage: stage.width, header: header.width, cards, scroll: document.documentElement.scrollWidth };
  });
  expect(after.header).toBeGreaterThan(400);
  expect(after.stage).toBeGreaterThan(400);
  for (const width of after.cards) expect(width).toBeGreaterThan(400);
  expect(after.scroll).toBeLessThanOrEqual(429);
});
