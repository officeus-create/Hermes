import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Logistics hub uses the shared Pearl modules and one Obsidian operating anchor", async ({ page }) => {
  await page.goto("/paths/logistics/");

  await expect(page.locator(".logistics-audience-hub")).toBeVisible();
  await expect(page.locator(".path-engine-shell")).toBeVisible();
  await expect(page.locator(".logistics-audience-load-board")).toContainText("Post a load");

  const visual = await page.evaluate(() => {
    const hub = document.querySelector<HTMLElement>(".detail-page-logistics .logistics-audience-hub");
    const standardCard = document.querySelector<HTMLElement>(".detail-page-logistics .logistics-audience-grid > a:not(.logistics-audience-load-board)");
    const loadBoard = document.querySelector<HTMLElement>(".detail-page-logistics .logistics-audience-load-board");
    const pilot = document.querySelector<HTMLElement>(".detail-page-logistics .logistics-local-pilot");
    const resource = document.querySelector<HTMLElement>(".detail-page-logistics .logistics-resource-library");
    const engine = document.querySelector<HTMLElement>(".detail-page-logistics .path-engine-shell");
    const option = document.querySelector<HTMLElement>(".detail-page-logistics .path-option-card");
    if (!hub || !standardCard || !loadBoard || !pilot || !resource || !engine || !option) return null;

    return {
      hubBackground: getComputedStyle(hub).backgroundColor,
      standardBackground: getComputedStyle(standardCard).backgroundColor,
      standardRadius: getComputedStyle(standardCard).borderRadius,
      loadBoardBackground: getComputedStyle(loadBoard).backgroundColor,
      loadBoardColor: getComputedStyle(loadBoard).color,
      pilotBackground: getComputedStyle(pilot).backgroundColor,
      pilotRadius: getComputedStyle(pilot).borderRadius,
      resourceRadius: getComputedStyle(resource).borderRadius,
      engineRadius: getComputedStyle(engine).borderRadius,
      optionRadius: getComputedStyle(option).borderRadius,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const viewportWidth = page.viewportSize()?.width ?? 1440;
  const expectedPanelRadius = viewportWidth <= 900 ? "22px" : "30px";
  const expectedEngineRadius = viewportWidth <= 620 ? "22px" : "30px";

  expect(visual).not.toBeNull();
  expect(visual!.hubBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.standardBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.standardRadius).toBe("22px");
  expect(visual!.loadBoardBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.loadBoardColor).toBe("rgb(255, 255, 255)");
  expect(visual!.pilotBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.pilotRadius).toBe(expectedPanelRadius);
  expect(visual!.resourceRadius).toBe("22px");
  expect(visual!.engineRadius).toBe(expectedEngineRadius);
  expect(visual!.optionRadius).toBe("12px");
  expect(visual!.overflow).toBe(false);
});

test("Logistics Pearl modules remain usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/logistics/");

  await expect(page.locator(".logistics-audience-grid > a").first()).toBeVisible();
  await expect(page.locator(".path-engine-shell")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const pilot = document.querySelector<HTMLElement>(".detail-page-logistics .logistics-local-pilot");
    const engine = document.querySelector<HTMLElement>(".detail-page-logistics .path-engine-shell");
    if (!pilot || !engine) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      pilotRadius: getComputedStyle(pilot).borderRadius,
      engineRadius: getComputedStyle(engine).borderRadius,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.pilotRadius).toBe("22px");
  expect(mobile!.engineRadius).toBe("22px");
});
