import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Academy uses a Pearl learning flow and preserves all five interactive screens", async ({ page }) => {
  await page.goto("/paths/academy/");

  const flow = page.locator("[data-academy-flow]");
  await expect(flow).toBeVisible();
  await expect(page.locator('[data-academy-screen="0"]')).toBeVisible();

  const opening = await page.evaluate(() => {
    const progress = document.querySelector<HTMLElement>(".detail-page-academy .academy-flow-progress");
    const screen = document.querySelector<HTMLElement>('.detail-page-academy [data-academy-screen="0"]');
    if (!progress || !screen) return null;
    return {
      progressBackground: getComputedStyle(progress).backgroundColor,
      progressRadius: getComputedStyle(progress).borderRadius,
      screenBackground: getComputedStyle(screen).backgroundColor,
      screenRadius: getComputedStyle(screen).borderRadius,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const viewportWidth = page.viewportSize()?.width ?? 1440;
  const expectedPanelRadius = viewportWidth <= 900 ? "22px" : "30px";

  expect(opening).not.toBeNull();
  expect(opening!.progressBackground).toBe("rgb(255, 255, 255)");
  expect(opening!.progressRadius).toBe("22px");
  expect(opening!.screenBackground).toBe("rgb(255, 255, 255)");
  expect(opening!.screenRadius).toBe(expectedPanelRadius);
  expect(opening!.overflow).toBe(false);

  await page.locator('[data-academy-next="1"]').click();
  await expect(page.locator('[data-academy-screen="1"]')).toBeVisible();
  await expect(page.locator('[data-academy-screen="0"]')).toBeHidden();

  await page.locator('[data-academy-next="2"]').click();
  await expect(page.locator('[data-academy-screen="2"]')).toBeVisible();

  await page.locator('[data-academy-next="3"]').click();
  await expect(page.locator('[data-academy-screen="3"]')).toBeVisible();

  await page.locator('[data-academy-next="4"]').click();
  await expect(page.locator('[data-academy-screen="4"]')).toBeVisible();
  await expect(page.locator(".academy-ai-lab")).toBeVisible();

  const lab = await page.evaluate(() => {
    const aiLab = document.querySelector<HTMLElement>(".detail-page-academy .academy-ai-lab");
    const mockup = document.querySelector<HTMLElement>(".detail-page-academy .academy-ai-mockup");
    if (!aiLab || !mockup) return null;
    return {
      background: getComputedStyle(aiLab).backgroundColor,
      color: getComputedStyle(aiLab).color,
      radius: getComputedStyle(aiLab).borderRadius,
      mockupRadius: getComputedStyle(mockup).borderRadius,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(lab).not.toBeNull();
  expect(lab!.background).toBe("rgb(11, 13, 18)");
  expect(lab!.color).toBe("rgb(255, 255, 255)");
  expect(lab!.radius).toBe(expectedPanelRadius);
  expect(lab!.mockupRadius).toBe("22px");
  expect(lab!.overflow).toBe(false);
});

test("Academy learning system remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/academy/");

  await expect(page.locator("[data-academy-flow]")).toBeVisible();
  await expect(page.locator('[data-academy-screen="0"]')).toBeVisible();

  const mobile = await page.evaluate(() => {
    const progress = document.querySelector<HTMLElement>(".detail-page-academy .academy-flow-progress");
    const screen = document.querySelector<HTMLElement>('.detail-page-academy [data-academy-screen="0"]');
    if (!progress || !screen) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      progressColumns: getComputedStyle(progress).gridTemplateColumns,
      screenRadius: getComputedStyle(screen).borderRadius,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.progressColumns.split(" ")).toHaveLength(1);
  expect(mobile!.screenRadius).toBe("22px");
});
