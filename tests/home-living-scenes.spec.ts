import { expect, test } from "@playwright/test";

test("Home keeps native routes and shows living details without layout overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Four directions." })).toBeVisible();
  await expect(page.locator(".home-scene-detail")).toHaveCount(3);
  // Home keeps a quiet visual chooser: Tech/Academy mini-dashboards are not pasted over art.
  await expect(page.locator('[data-home-pillar-proof="systems"]')).toBeHidden();
  await expect(page.locator('[data-home-pillar-proof="progress"]')).toBeHidden();
  await expect(page.locator('[data-route-id="logistics"] .home-scene-detail')).toHaveCount(0);
  await expect(page.locator('[data-route-id="logistics"] [data-home-cinematic-slot="logistics"]')).toBeVisible();
  await expect(page.locator('.home-master-stage [data-home-cinematic-video="logistics"]')).toHaveCount(1);
  await expect(page.locator('.home-master-stage [data-home-cinematic-video="logistics"] source')).toHaveAttribute(
    "data-cinematic-src",
    "/media/home/logistics-golden-v1.mp4",
  );
  await expect(page.locator(".home-master-stage canvas")).toHaveCount(0);
  await expect(page.locator(".home-master-route")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // The owner-approved motion moves only the premium-green dot, never the letter stem.
  const homeI = page.locator(".home-display-i");
  await expect(homeI).toHaveText("i");
  await expect(page.locator("#home-master-title")).toHaveText("Four directions.");
  await expect(homeI).toHaveCSS("animation-name", "none");
  const dotMotion = await homeI.evaluate((element) => {
    const dot = getComputedStyle(element, "::after");
    return { name: dot.animationName, duration: dot.animationDuration, color: dot.backgroundColor };
  });
  expect(dotMotion).toEqual({ name: "hermes-home-i-dot-bounce", duration: "4.8s", color: "rgb(22, 113, 91)" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".home-display-i")).toHaveCSS("animation-name", "none");
  expect(await page.locator(".home-display-i").evaluate((element) => getComputedStyle(element, "::after").animationName)).toBe("none");
  const livingProofs = page.locator("[data-home-living-motion]");
  await expect(livingProofs).toHaveCount(2);
  for (const proof of await livingProofs.all()) {
    await expect(proof).toHaveAttribute("data-motion-state", "reduced");
  }
  // Approved Marketing V4 removes the decorative story cards: reduced motion must
  // keep its real four-stage SVG scene readable and entirely still.
  await expect(page.locator(".home-story-frame")).toHaveCount(0);
  await expect(page.locator("[data-home-marketing-journey]")).toHaveAttribute("data-journey-motion", "reduced");
  await expect(page.locator(".home-marketing-pulse")).toHaveCSS("animation-name", "none");
});

test("Home update glow follows a dated public Insight and expires after seven days", async ({ page }) => {
  await page.addInitScript(() => { Date.now = () => Date.parse("2026-10-08T12:00:00Z"); });
  await page.goto("/");
  const insights = page.locator('.desktop-products-grid a[data-product="insights"]');
  await expect(insights).toHaveClass(/has-home-update/);
  await expect(insights).toHaveAttribute("aria-describedby", "home-insights-update");
  await expect(page.locator('.desktop-products-grid a[data-product="connect"]')).not.toHaveClass(/has-home-update/);
  await expect(page.locator('.desktop-products-grid a[data-product="catalog"]')).not.toHaveClass(/has-home-update/);
  const futurePage = await page.context().newPage();
  await futurePage.addInitScript(() => { Date.now = () => Date.parse("2026-10-16T12:00:00Z"); });
  await futurePage.goto("/");
  await expect(futurePage.locator('.desktop-products-grid a[data-product="insights"]')).not.toHaveClass(/has-home-update/);
  await futurePage.close();
});


test("Home keeps a visible direction arrow on touch devices", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const arrows = page.locator(".home-master-route-arrow");
    await expect(arrows).toHaveCount(4);
    for (const arrow of await arrows.all()) await expect(arrow).toBeVisible();
  } finally {
    await context.close();
  }
});


test("Home uses Claude 21 October approved four-direction palette without rewriting inner divisions", async ({ page }) => {
  await page.goto("/");
  const palette = await page.evaluate(() => {
    const home = getComputedStyle(document.querySelector(".home-master")!);
    const nav = getComputedStyle(document.querySelector(".site-header")!);
    return {
      home: {
        logistics: home.getPropertyValue("--hermes-logistics").trim(),
        technology: home.getPropertyValue("--hermes-technology").trim(),
        academy: home.getPropertyValue("--hermes-academy").trim(),
        marketing: home.getPropertyValue("--hermes-marketing").trim(),
      },
      header: {
        logistics: nav.getPropertyValue("--nav-logistics").trim(),
        technology: nav.getPropertyValue("--nav-technology").trim(),
        academy: nav.getPropertyValue("--nav-academy").trim(),
        marketing: nav.getPropertyValue("--nav-marketing").trim(),
      },
    };
  });
  // 21 Oct Claude Home v3 approval supersedes the September portal palette.
  const colors = { logistics: "#2f6bf6", technology: "#38b6f5", academy: "#12b886", marketing: "#ff7a59" };
  expect(palette.home).toEqual(colors);
  expect(palette.header).toEqual(colors);
  await page.goto("/paths/technology/");
  await expect(page.locator(".home-master")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
