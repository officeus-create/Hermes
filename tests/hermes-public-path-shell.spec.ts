import { expect, test } from "@playwright/test";

const directions = [
  { slug: "logistics", accent: "rgb(47, 107, 246)", tone: "rgb(19, 42, 71)" },
  { slug: "technology", accent: "rgb(56, 182, 245)", tone: "rgb(10, 42, 62)" },
  { slug: "academy", accent: "rgb(18, 184, 134)", tone: "rgb(10, 51, 40)" },
  { slug: "marketing", accent: "rgb(255, 122, 89)", tone: "rgb(59, 30, 22)" },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

for (const direction of directions) {
  test(`${direction.slug} direction uses the approved Claude Directions hero without changing route ownership`, async ({ page }) => {
    await page.goto(`/paths/${direction.slug}/`);

    const root = page.locator(`.detail-page-${direction.slug}`);
    const hero = root.locator(".detail-hero-approved");
    const heading = hero.locator("h1");
    const primary = hero.locator(".button-primary");
    const window = hero.locator(".detail-hero-window");

    await expect(root).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(heading).toBeVisible();
    await expect(primary).toBeVisible();
    await expect(window).toBeVisible();
    await expect(window.locator("[data-direction-video]")).toHaveCount(1);

    const visual = await page.evaluate(({ slug }) => {
      const root = document.querySelector<HTMLElement>(`.detail-page-${slug}`);
      const hero = root?.querySelector<HTMLElement>(".detail-hero-approved");
      const heading = hero?.querySelector<HTMLElement>("h1");
      const primary = hero?.querySelector<HTMLElement>(".button-primary");
      const window = hero?.querySelector<HTMLElement>(".detail-hero-window");
      const accent = window?.querySelector<HTMLElement>("figcaption small i");
      if (!root || !hero || !heading || !primary || !window || !accent) return null;

      const headingRect = heading.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const windowRect = window.getBoundingClientRect();

      return {
        heroColor: getComputedStyle(hero).color,
        heroBackground: getComputedStyle(hero).backgroundColor,
        primaryBackground: getComputedStyle(primary).backgroundColor,
        primaryColor: getComputedStyle(primary).color,
        primaryRadius: getComputedStyle(primary).borderRadius,
        windowRadius: getComputedStyle(window).borderRadius,
        windowBackground: getComputedStyle(window).backgroundColor,
        accentBackground: getComputedStyle(accent).backgroundColor,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        headingInsideHero:
          headingRect.left >= heroRect.left - 1 &&
          headingRect.right <= heroRect.right + 1 &&
          headingRect.top >= heroRect.top - 1 &&
          headingRect.bottom <= heroRect.bottom + 1,
        windowHasArea: windowRect.width > 0 && windowRect.height > 0,
      };
    }, { slug: direction.slug });

    expect(visual).not.toBeNull();
    // Canonical Hermes Obsidian #0b0d12 (src/styles/hermes-brand-system.css).
    expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
    expect(visual!.heroBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.primaryBackground).toBe("rgb(10, 22, 79)");
    expect(visual!.primaryColor).toBe("rgb(255, 255, 255)");
    expect(visual!.primaryRadius).toBe("12px");
    const narrow = (page.viewportSize()?.width ?? 1280) <= 430;
    expect(visual!.windowRadius).toBe(narrow ? "26px" : "34px");
    expect(visual!.windowBackground).toBe(direction.tone);
    expect(visual!.accentBackground).toBe(direction.accent);
    expect(visual!.overflow).toBe(false);
    expect(visual!.headingInsideHero).toBe(true);
    expect(visual!.windowHasArea).toBe(true);
  });
}

test("shared Claude Directions shell remains usable on a 390px mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/logistics/");

  await expect(page.locator(".detail-page-logistics .detail-hero-approved h1")).toBeVisible();
  await expect(page.locator(".detail-page-logistics .detail-hero-approved .button-primary")).toBeVisible();
  await expect(page.locator(".detail-page-logistics .detail-hero-window")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const window = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero-window");
    const hero = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero-approved");
    const heading = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero-approved h1");
    if (!window || !hero || !heading) return null;
    const windowRect = window.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      windowRadius: getComputedStyle(window).borderRadius,
      windowWidth: windowRect.width,
      heroWidth: heroRect.width,
      headingInsideViewport: headingRect.left >= 0 && headingRect.right <= document.documentElement.clientWidth,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.windowRadius).toBe("26px");
  expect(mobile!.windowWidth).toBeLessThanOrEqual(mobile!.heroWidth);
  expect(mobile!.headingInsideViewport).toBe(true);
});

test("Logistics hero title remains contained on a 1440px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/paths/logistics/");

  const geometry = await page.evaluate(() => {
    const heading = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero-approved h1");
    const hero = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero-approved");
    if (!heading || !hero) return null;
    const headingRect = heading.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    return {
      headingLeft: headingRect.left,
      headingRight: headingRect.right,
      heroLeft: heroRect.left,
      heroRight: heroRect.right,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.headingLeft).toBeGreaterThanOrEqual(geometry!.heroLeft - 1);
  expect(geometry!.headingRight).toBeLessThanOrEqual(geometry!.heroRight + 1);
  expect(geometry!.headingRight).toBeLessThanOrEqual(geometry!.viewportWidth);
});
