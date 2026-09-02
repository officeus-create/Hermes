import { expect, test } from "@playwright/test";

const directions = [
  { slug: "logistics", hex: "#1e88ff" },
  { slug: "marketing", hex: "#00c853" },
  { slug: "academy", hex: "#7c5cff" },
  { slug: "technology", hex: "#ff7a00" },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

for (const direction of directions) {
  test(`${direction.slug} direction uses the approved Hermes color identity`, async ({ page }) => {
    await page.goto(`/paths/${direction.slug}/`);

    const root = page.locator(`.detail-page-${direction.slug}`);
    const hero = root.locator(".detail-hero");
    const heading = hero.locator("h1");
    const primary = hero.locator(".button-primary");
    const media = root.locator(".detail-hero-media");

    await expect(root).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(heading).toBeVisible();
    await expect(primary).toBeVisible();
    await expect(media).toBeVisible();

    const visual = await page.evaluate(({ slug }) => {
      const root = document.querySelector<HTMLElement>(`.detail-page-${slug}`);
      const hero = root?.querySelector<HTMLElement>(".detail-hero");
      const heading = hero?.querySelector<HTMLElement>("h1");
      const primary = hero?.querySelector<HTMLElement>(".button-primary");
      const media = root?.querySelector<HTMLElement>(".detail-hero-media");
      const header = document.querySelector<HTMLElement>(".site-header");
      if (!root || !hero || !heading || !primary || !media || !header) return null;

      const rootStyle = getComputedStyle(root);
      const heroStyle = getComputedStyle(hero);
      const headingRect = heading.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const mediaRect = media.getBoundingClientRect();

      return {
        pathSignal: rootStyle.getPropertyValue("--path-signal").trim().toLowerCase(),
        heroColor: heroStyle.color,
        heroBackgroundImage: heroStyle.backgroundImage,
        primaryBackgroundImage: getComputedStyle(primary).backgroundImage,
        primaryColor: getComputedStyle(primary).color,
        primaryRadius: getComputedStyle(primary).borderRadius,
        mediaRadius: getComputedStyle(media).borderRadius,
        headerColor: getComputedStyle(header).color,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        headingInsideHero:
          headingRect.left >= heroRect.left - 1 &&
          headingRect.right <= heroRect.right + 1 &&
          headingRect.top >= heroRect.top - 1 &&
          headingRect.bottom <= heroRect.bottom + 1,
        mediaHasArea: mediaRect.width > 0 && mediaRect.height > 0,
      };
    }, { slug: direction.slug });

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    const expectedMediaRadius = viewportWidth <= 1040 ? "22px" : "30px";

    expect(visual).not.toBeNull();
    expect(visual!.pathSignal).toBe(direction.hex);
    expect(visual!.heroColor).toBe("rgb(255, 255, 255)");
    expect(visual!.heroBackgroundImage).not.toBe("none");
    expect(visual!.primaryBackgroundImage).not.toBe("none");
    expect(visual!.primaryColor).toBe("rgb(7, 16, 26)");
    expect(visual!.primaryRadius).toBe("12px");
    expect(visual!.mediaRadius).toBe(expectedMediaRadius);
    expect(visual!.headerColor).toBe("rgb(11, 13, 18)");
    expect(visual!.overflow).toBe(false);
    expect(visual!.headingInsideHero).toBe(true);
    expect(visual!.mediaHasArea).toBe(true);
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
    const heading = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero h1");
    if (!media || !hero || !heading) return null;
    const mediaRect = media.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      mediaRadius: getComputedStyle(media).borderRadius,
      mediaWidth: mediaRect.width,
      heroWidth: heroRect.width,
      headingInsideViewport: headingRect.left >= 0 && headingRect.right <= document.documentElement.clientWidth,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.mediaRadius).toBe("22px");
  expect(mobile!.mediaWidth).toBeLessThanOrEqual(mobile!.heroWidth);
  expect(mobile!.headingInsideViewport).toBe(true);
});

test("Logistics hero title remains contained on a 1440px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/paths/logistics/");

  const geometry = await page.evaluate(() => {
    const heading = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero h1");
    const hero = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero");
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
