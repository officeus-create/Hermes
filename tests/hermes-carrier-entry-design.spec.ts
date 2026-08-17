import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

test("carrier agreement entry uses the shared Hermes public system", async ({ page }) => {
  await page.goto("/carrier/");
  await expect(page.locator(".carrier-signing-entry")).toBeVisible();
  await expect(page.locator(".carrier-next-card")).toBeVisible();

  await expect(page.locator("a[href='/logistics/carrier-onboarding/']").first()).toBeVisible();
  await expect(page.locator("a[href='/logistics/carrier-offer/']")).toBeVisible();
  await expect(page.locator("a[href='/logistics/carrier-agreement/']")).toBeVisible();

  const visual = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.querySelector<HTMLElement>(".carrier-entry-hero");
    const next = document.querySelector<HTMLElement>(".carrier-next-card");
    const primary = document.querySelector<HTMLElement>(".carrier-entry-actions .carrier-primary");
    const confidence = document.querySelector<HTMLElement>(".confidence-grid article");
    const finalCard = document.querySelector<HTMLElement>(".carrier-final-card");
    if (!header || !hero || !next || !primary || !confidence || !finalCard) return null;
    return {
      headerColor: getComputedStyle(header).color,
      heroBackground: getComputedStyle(hero).backgroundColor,
      heroColor: getComputedStyle(hero).color,
      nextBackground: getComputedStyle(next).backgroundColor,
      nextRadius: getComputedStyle(next).borderRadius,
      primaryBackground: getComputedStyle(primary).backgroundColor,
      primaryColor: getComputedStyle(primary).color,
      primaryRadius: getComputedStyle(primary).borderRadius,
      confidenceBackground: getComputedStyle(confidence).backgroundColor,
      confidenceRadius: getComputedStyle(confidence).borderRadius,
      finalBackground: getComputedStyle(finalCard).backgroundColor,
      finalRadius: getComputedStyle(finalCard).borderRadius,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const expectedPanelRadius=(page.viewportSize()?.width??1440)<=900?"22px":"30px";
  expect(visual).not.toBeNull();
  expect(visual!.headerColor).toBe("rgb(11, 13, 18)");
  expect(visual!.heroBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
  expect(visual!.nextBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.nextRadius).toBe(expectedPanelRadius);
  expect(visual!.primaryBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.primaryColor).toBe("rgb(255, 255, 255)");
  expect(visual!.primaryRadius).toBe("12px");
  expect(visual!.confidenceBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.confidenceRadius).toBe("22px");
  expect(visual!.finalBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.finalRadius).toBe(expectedPanelRadius);
  expect(visual!.overflow).toBe(false);
});

test("carrier agreement entry remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.goto("/carrier/");
  await expect(page.locator(".carrier-entry-actions .carrier-primary")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const next = document.querySelector<HTMLElement>(".carrier-next-card");
    const finalCard = document.querySelector<HTMLElement>(".carrier-final-card");
    const primary = document.querySelector<HTMLElement>(".carrier-entry-actions .carrier-primary");
    if (!next || !finalCard || !primary) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      nextRadius: getComputedStyle(next).borderRadius,
      finalRadius: getComputedStyle(finalCard).borderRadius,
      primaryRight: primary.getBoundingClientRect().right,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.nextRadius).toBe("22px");
  expect(mobile!.finalRadius).toBe("22px");
  expect(mobile!.primaryRight).toBeLessThanOrEqual(mobile!.viewportWidth);
});
