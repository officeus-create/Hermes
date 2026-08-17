import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Marketing uses Pearl capability cards with one Obsidian growth console", async ({ page }) => {
  await page.goto("/paths/marketing/");

  await expect(page.locator(".marketing-service-system")).toBeVisible();
  await expect(page.locator(".marketing-service-rails article").first()).toBeVisible();
  await expect(page.locator(".growth-console")).toBeVisible();

  const visual = await page.evaluate(() => {
    const services = document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-system");
    const card = document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-rails article");
    const consoleEl = document.querySelector<HTMLElement>(".detail-page-marketing .growth-console");
    const selected = document.querySelector<HTMLElement>(".detail-page-marketing .growth-stage-list button[aria-selected='true']");
    const panelHeading = document.querySelector<HTMLElement>(".detail-page-marketing .growth-stage-panels h3");
    if (!services || !card || !consoleEl || !selected || !panelHeading) return null;

    return {
      serviceBackground: getComputedStyle(services).backgroundColor,
      cardBackground: getComputedStyle(card).backgroundColor,
      cardColor: getComputedStyle(card).color,
      cardRadius: getComputedStyle(card).borderRadius,
      consoleBackground: getComputedStyle(consoleEl).backgroundColor,
      consoleColor: getComputedStyle(consoleEl).color,
      consoleRadius: getComputedStyle(consoleEl).borderRadius,
      selectedColor: getComputedStyle(selected).color,
      headingColor: getComputedStyle(panelHeading).color,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.serviceBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.cardBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.cardColor).toBe("rgb(11, 13, 18)");
  expect(visual!.cardRadius).toBe("22px");
  expect(visual!.consoleBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.consoleColor).toBe("rgb(255, 255, 255)");
  expect(visual!.consoleRadius).toBe("30px");
  expect(visual!.selectedColor).toBe("rgb(255, 255, 255)");
  expect(visual!.headingColor).toBe("rgb(255, 255, 255)");
  expect(visual!.overflow).toBe(false);
});

test("Marketing public system remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/marketing/");

  await expect(page.locator(".marketing-service-rails article").first()).toBeVisible();
  await expect(page.locator(".growth-console")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-rails article");
    const consoleEl = document.querySelector<HTMLElement>(".detail-page-marketing .growth-console");
    if (!card || !consoleEl) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      cardRadius: getComputedStyle(card).borderRadius,
      consoleRadius: getComputedStyle(consoleEl).borderRadius,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.cardRadius).toBe("22px");
  expect(mobile!.consoleRadius).toBe("22px");
});
