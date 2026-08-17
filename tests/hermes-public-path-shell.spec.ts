import { expect, test } from "@playwright/test";

const directions = ["logistics", "marketing", "academy", "technology"] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

for (const slug of directions) {
  test(`${slug} direction uses the shared Pearl public shell`, async ({ page }) => {
    await page.goto(`/paths/${slug}/`);

    const root = page.locator(`.detail-page-${slug}`);
    await expect(root).toBeVisible();
    await expect(root.locator(".detail-hero h1")).toBeVisible();
    await expect(root.locator(".detail-hero-media")).toBeVisible();

    const visual = await page.evaluate((direction) => {
      const hero = document.querySelector<HTMLElement>(`.detail-page-${direction} .detail-hero`);
      const primary = document.querySelector<HTMLElement>(`.detail-page-${direction} .detail-hero .button-primary`);
      const media = document.querySelector<HTMLElement>(`.detail-page-${direction} .detail-hero-media`);
      const header = document.querySelector<HTMLElement>(".site-header");
      if (!hero || !primary || !media || !header) return null;

      return {
        heroBackground: getComputedStyle(hero).backgroundColor,
        heroColor: getComputedStyle(hero).color,
        primaryBackground: getComputedStyle(primary).backgroundColor,
        primaryColor: getComputedStyle(primary).color,
        primaryRadius: getComputedStyle(primary).borderRadius,
        mediaRadius: getComputedStyle(media).borderRadius,
        headerColor: getComputedStyle(header).color,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    }, slug);

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    const expectedMediaRadius = viewportWidth <= 1040 ? "22px" : "30px";

    expect(visual).not.toBeNull();
    expect(visual!.heroBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
    expect(visual!.primaryBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.primaryColor).toBe("rgb(255, 255, 255)");
    expect(visual!.primaryRadius).toBe("12px");
    expect(visual!.mediaRadius).toBe(expectedMediaRadius);
    expect(visual!.headerColor).toBe("rgb(11, 13, 18)");
    expect(visual!.overflow).toBe(false);
  });
}

test("shared direction shell remains usable on a 390px mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/logistics/");

  await expect(page.locator(".detail-page-logistics .detail-hero h1")).toBeVisible();
  await expect(page.locator(".detail-page-logistics .detail-hero .button-primary")).toBeVisible();
  await expect(page.locator(".detail-page-logistics .detail-hero-media")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const media = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero-media");
    const hero = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero");
    if (!media || !hero) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      mediaRadius: getComputedStyle(media).borderRadius,
      mediaWidth: media.getBoundingClientRect().width,
      heroWidth: hero.getBoundingClientRect().width,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.mediaRadius).toBe("22px");
  expect(mobile!.mediaWidth).toBeLessThanOrEqual(mobile!.heroWidth);
});