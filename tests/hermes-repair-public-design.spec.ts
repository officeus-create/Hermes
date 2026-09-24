import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Repair Shops landing keeps Pearl background and readable public launch offer", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const visual = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(".repair-pilot-page");
    const heading = document.querySelector<HTMLElement>(".repair-pilot-page .repair-live-hero h1");
    const launchHeading = document.querySelector<HTMLElement>(".repair-free-launch h2");
    const launchCta = document.querySelector<HTMLElement>(".repair-free-launch .launch-cta");
    if (!root || !heading || !launchHeading || !launchCta) return null;
    return {
      rootBackgroundColor: getComputedStyle(root).backgroundColor,
      headingColor: getComputedStyle(heading).color,
      launchHeadingColor: getComputedStyle(launchHeading).color,
      launchCtaBackground: getComputedStyle(launchCta).backgroundColor,
      launchCtaColor: getComputedStyle(launchCta).color,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.rootBackgroundColor).toBe("rgb(247, 246, 243)");
  expect(visual!.headingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.launchHeadingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.launchCtaBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.launchCtaColor).toBe("rgb(255, 255, 255)");
});


test("Repair Shops V3 uses progressive disclosure without removing product detail", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const primary = page.locator(".repair-live-hero .repair-primary").first();
  await expect(primary).toBeVisible();
  expect(await primary.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(26, 115, 232)");

  const capabilities = page.locator(".repair-disclosure-card");
  await expect(capabilities).toHaveCount(6);
  await expect(capabilities.first()).not.toHaveAttribute("open", "");
  await capabilities.first().locator("summary").click();
  await expect(capabilities.first()).toHaveAttribute("open", "");
  await expect(capabilities.first().locator(".repair-disclosure-body")).toContainText("simple public path");

  const partner = page.locator(".repair-partner-disclosure");
  await expect(partner).not.toHaveAttribute("open", "");
  await expect(page.locator("#partner-beta-form")).toBeHidden();
  await partner.locator(":scope > summary").click();
  await expect(partner).toHaveAttribute("open", "");
  await expect(page.locator("#partner-beta-form")).toBeVisible();

  const faq = page.locator(".repair-faq-item");
  await expect(faq).toHaveCount(8);
  await faq.nth(3).locator("summary").click();
  await expect(faq.nth(3)).toHaveAttribute("open", "");
  await expect(faq.nth(3)).toContainText("$99 per month");
});

test("Founding Plan does not inherit the legacy full-screen dark hero", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/plan/");

  const visual = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(".plan-page .hero");
    const heading = document.querySelector<HTMLElement>(".plan-page .hero h1");
    const priceCard = document.querySelector<HTMLElement>(".plan-page .price-card");
    const launchHeading = document.querySelector<HTMLElement>(".repair-free-launch h2");
    if (!hero || !heading || !priceCard || !launchHeading) return null;
    const heroStyle = getComputedStyle(hero);
    return {
      heroDisplay: heroStyle.display,
      heroPosition: heroStyle.position,
      heroMinHeight: heroStyle.minHeight,
      heroBackgroundImage: heroStyle.backgroundImage,
      heroColor: heroStyle.color,
      headingColor: getComputedStyle(heading).color,
      priceCardBackground: getComputedStyle(priceCard).backgroundColor,
      launchHeadingColor: getComputedStyle(launchHeading).color,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.heroDisplay).toBe("grid");
  expect(visual!.heroPosition).toBe("relative");
  expect(visual!.heroMinHeight).toBe("0px");
  expect(visual!.heroBackgroundImage).toBe("none");
  expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
  expect(visual!.headingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.priceCardBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.launchHeadingColor).toBe("rgb(11, 13, 18)");
});

test("Repair Shop public shell stays within the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.locator(".repair-free-launch h2")).toBeVisible();
});