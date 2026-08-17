import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Technology alternates Pearl public explanation with contained Obsidian product moments", async ({ page }) => {
  await page.goto("/paths/technology/");

  await expect(page.locator(".technology-build-pulse")).toBeVisible();
  await expect(page.locator(".technology-capability-catalog")).toBeVisible();
  await expect(page.locator(".technology-solution-mockups")).toBeVisible();
  await expect(page.locator(".it-flow-screens")).toBeVisible();
  await expect(page.locator(".it-project-brief")).toBeVisible();

  const visual = await page.evaluate(() => {
    const build = document.querySelector<HTMLElement>(".detail-page-technology .technology-build-pulse");
    const track = document.querySelector<HTMLElement>(".detail-page-technology .technology-build-track");
    const catalog = document.querySelector<HTMLElement>(".detail-page-technology .technology-capability-catalog");
    const card = document.querySelector<HTMLElement>(".detail-page-technology .technology-solution-grid article");
    const mockups = document.querySelector<HTMLElement>(".detail-page-technology .technology-solution-mockups");
    const flow = document.querySelector<HTMLElement>(".detail-page-technology .it-flow-screens");
    const screen = document.querySelector<HTMLElement>(".detail-page-technology .it-screen > .shell");
    const brief = document.querySelector<HTMLElement>(".detail-page-technology .it-brief-tool");
    if (!build || !track || !catalog || !card || !mockups || !flow || !screen || !brief) return null;

    return {
      buildBackground: getComputedStyle(build).backgroundColor,
      buildColor: getComputedStyle(build).color,
      trackRadius: getComputedStyle(track).borderRadius,
      catalogBackground: getComputedStyle(catalog).backgroundColor,
      cardBackground: getComputedStyle(card).backgroundColor,
      cardRadius: getComputedStyle(card).borderRadius,
      mockupsBackground: getComputedStyle(mockups).backgroundColor,
      mockupsColor: getComputedStyle(mockups).color,
      flowBackground: getComputedStyle(flow).backgroundColor,
      screenBackground: getComputedStyle(screen).backgroundColor,
      screenRadius: getComputedStyle(screen).borderRadius,
      briefBackground: getComputedStyle(brief).backgroundColor,
      briefRadius: getComputedStyle(brief).borderRadius,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const viewportWidth = page.viewportSize()?.width ?? 1440;
  const expectedPanelRadius = viewportWidth <= 900 ? "22px" : "30px";

  expect(visual).not.toBeNull();
  expect(visual!.buildBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.buildColor).toBe("rgb(255, 255, 255)");
  expect(visual!.trackRadius).toBe("22px");
  expect(visual!.catalogBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.cardBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.cardRadius).toBe("22px");
  expect(visual!.mockupsBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.mockupsColor).toBe("rgb(255, 255, 255)");
  expect(visual!.flowBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.screenBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.screenRadius).toBe(expectedPanelRadius);
  expect(visual!.briefBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.briefRadius).toBe(expectedPanelRadius);
  expect(visual!.overflow).toBe(false);
});

test("Technology public system remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/technology/");

  await expect(page.locator(".technology-build-pulse")).toBeVisible();
  await expect(page.locator(".technology-solution-grid article").first()).toBeVisible();
  await expect(page.locator(".it-flow-screens")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>(".detail-page-technology .it-screen > .shell");
    const brief = document.querySelector<HTMLElement>(".detail-page-technology .it-brief-tool");
    const solutions = document.querySelector<HTMLElement>(".detail-page-technology .technology-solution-grid");
    if (!screen || !brief || !solutions) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      screenRadius: getComputedStyle(screen).borderRadius,
      briefRadius: getComputedStyle(brief).borderRadius,
      columns: getComputedStyle(solutions).gridTemplateColumns,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.screenRadius).toBe("22px");
  expect(mobile!.briefRadius).toBe("22px");
  expect(mobile!.columns.split(" ")).toHaveLength(1);
});
