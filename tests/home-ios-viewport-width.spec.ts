import { expect, test } from "@playwright/test";

/**
 * Regression for a user-reported real iPhone Safari screenshot (2026-10-21):
 * the fixed header occupied the screen width, but the four Home portal cards
 * occupied only a narrow left column with a large blank strip to the right.
 * Tests use the actual mobile viewport size, not the image's resized pixels.
 */
test("all four Home portals follow the full iPhone viewport after sizing and navigation", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 428, height: 926 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".home-master-route")).toHaveCount(4);

    const readLayout = () => page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing selector: ${selector}`);
        const bounds = element.getBoundingClientRect();
        return { x: bounds.x, width: bounds.width };
      };
      return {
        viewport: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        header: rect(".site-header"),
        home: rect(".home-master"),
        shell: rect(".home-master-shell"),
        stage: rect(".home-master-stage"),
        cards: [...document.querySelectorAll(".home-master-route")].map((element) => element.getBoundingClientRect().width),
      };
    });
    const assertMobile = async (expectedWidth: number) => {
      const layout = await readLayout();
      expect(layout.viewport).toBe(expectedWidth);
      expect(layout.pageWidth).toBeLessThanOrEqual(expectedWidth + 1);
      expect(layout.home.width).toBeGreaterThanOrEqual(expectedWidth - 1);
      expect(layout.shell.width).toBeGreaterThanOrEqual(expectedWidth - 1);
      expect(Math.abs(layout.stage.width - (expectedWidth - 24))).toBeLessThanOrEqual(2);
      expect(layout.cards).toHaveLength(4);
      for (const width of layout.cards) {
        expect(Math.abs(width - layout.stage.width)).toBeLessThanOrEqual(2);
      }
      expect(layout.header.width).toBeGreaterThanOrEqual(expectedWidth - 20);
    };

    await assertMobile(428);

    // Rotations, Safari in-app browser bar changes and bfcache reloads can
    // change the effective viewport without reloading the entire document.
    for (const width of [390, 375, 320, 430, 640, 700, 428]) {
      await page.setViewportSize({ width, height: 926 });
      await assertMobile(width);
    }
    await page.reload();
    await assertMobile(428);
  } finally {
    await context.close();
  }
});
