import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Repair Shops landing keeps Pearl background and one visible pricing story", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const visual = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(".repair-pilot-page");
    const heading = document.querySelector<HTMLElement>(".repair-pilot-page .repair-live-hero h1");
    const price = document.querySelector<HTMLElement>(".repair-plan-price");
    if (!root || !heading || !price) return null;
    return {
      rootBackgroundColor: getComputedStyle(root).backgroundColor,
      headingColor: getComputedStyle(heading).color,
      priceBackground: getComputedStyle(price).backgroundColor,
      priceColor: getComputedStyle(price).color,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.rootBackgroundColor).toBe("rgb(247, 246, 243)");
  expect(visual!.headingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.priceBackground).toBe("rgb(23, 32, 51)");
  expect(visual!.priceColor).toBe("rgb(255, 255, 255)");
  await expect(page.locator("[data-repair-free-launch]:visible")).toHaveCount(0);
  const pilotSurface = page.locator(".repair-geo-growth");
  await expect(pilotSurface).toBeVisible();
  expect(await pilotSurface.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(247, 246, 243)");
});


test("Repair Shops V3 uses progressive disclosure without removing product detail", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const primary = page.locator(".repair-live-hero .repair-primary").first();
  await expect(primary).toBeVisible();
  expect(await primary.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(26, 115, 232)");

  const secondary = page.locator(".repair-live-hero .repair-secondary").first();
  await expect(secondary).toContainText("See pricing & plans");
  await expect(secondary).toHaveAttribute("href", "/services/hermes-connect/repair-shops/plan/");

  const ownerLogin = page.locator("[data-repair-owner-quick-login]");
  await expect(ownerLogin).toBeVisible();
  const ownerToggle = ownerLogin.locator("[data-repair-owner-login-toggle]");
  const ownerForm = ownerLogin.locator("[data-repair-owner-login-form]");
  await expect(ownerToggle).toBeVisible();
  await expect(ownerToggle).toHaveAttribute("aria-expanded", "false");
  await expect(ownerForm).toBeHidden();
  await ownerToggle.click();
  await expect(ownerToggle).toHaveAttribute("aria-expanded", "true");
  await expect(ownerForm).toBeVisible();

  const heroSequence = await page.locator(".repair-hero-copy > *").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("class") || node.tagName.toLowerCase()),
  );
  expect(heroSequence.indexOf("repair-actions")).toBeLessThan(heroSequence.indexOf("repair-owner-quick-login"));
  expect(heroSequence.indexOf("repair-owner-quick-login")).toBeLessThan(heroSequence.indexOf("repair-trust"));

  const readablePublicCopy = await page.evaluate(() => {
    const selectors = [
      ".repair-outcome-grid span",
      ".repair-capability-copy small",
      ".repair-disclosure-body p",
      ".repair-plan-copy > p",
      ".repair-path-grid p",
      ".repair-partner-disclosure > summary span:not(.repair-partner-open)",
      ".repair-faq-item summary span",
      ".repair-faq-item p",
      ".repair-geo-summary",
    ];
    return selectors.map((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      return { selector, fontSize: element ? Number.parseFloat(getComputedStyle(element).fontSize) : 0 };
    });
  });
  for (const sample of readablePublicCopy) {
    expect(sample.fontSize, `${sample.selector} should stay at least 16px`).toBeGreaterThanOrEqual(16);
  }

  const capabilities = page.locator(".repair-disclosure-card");
  await expect(capabilities).toHaveCount(5);
  await expect(capabilities.first()).not.toHaveAttribute("open", "");
  await capabilities.first().locator("summary").click();
  await expect(capabilities.first()).toHaveAttribute("open", "");
  await expect(capabilities.first().locator(".repair-disclosure-body")).toContainText("simple public path");
  const disclosureEvents = await page.evaluate(() => (window as any).dataLayer || []);
  expect(disclosureEvents).toEqual(expect.arrayContaining([
    expect.objectContaining({
      event: "repair_disclosure_open",
      product: "repair_shops",
      section: "capability",
      label: "One booking link",
    }),
  ]));

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
  await page.addInitScript(() => localStorage.removeItem("hermes-analytics-consent"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.locator(".repair-plan-card")).toBeVisible();

  const secondary = page.locator(".repair-live-hero .repair-secondary").first();
  await expect(secondary).toBeVisible();
  const consent = page.locator(".tracking-consent-banner");
  await expect(consent).toBeVisible();
  const secondaryBox = await secondary.boundingBox();
  const consentBox = await consent.boundingBox();
  expect(secondaryBox).not.toBeNull();
  expect(consentBox).not.toBeNull();
  expect(secondaryBox!.y + secondaryBox!.height).toBeLessThanOrEqual(consentBox!.y);
});