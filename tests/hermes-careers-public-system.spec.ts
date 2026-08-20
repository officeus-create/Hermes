import { expect, test } from "@playwright/test";

const route = "/careers/car-hauling-dispatcher/";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

test("Car Hauling Dispatcher uses the Hermes Pearl public career system", async ({ page }) => {
  await page.goto(route);
  await expect(page.locator(".career-job-page")).toBeVisible();
  await expect(page.locator(".site-header")).toHaveClass(/site-header-light/);
  await expect(page.locator("[data-external-job-apply]").first()).toHaveAttribute("href", "https://www.work.ua/jobs/7362244/");

  const visual = await page.evaluate(() => {
    const pageRoot=document.querySelector<HTMLElement>(".career-job-page");
    const hero=document.querySelector<HTMLElement>(".career-job-hero");
    const status=document.querySelector<HTMLElement>(".career-job-status-card");
    const finalCard=document.querySelector<HTMLElement>(".career-job-final-card");
    if(!pageRoot||!hero||!status||!finalCard)return null;
    return {
      pageBackground:getComputedStyle(pageRoot).backgroundColor,
      heroColor:getComputedStyle(hero).color,
      statusBackground:getComputedStyle(status).backgroundColor,
      statusRadius:getComputedStyle(status).borderRadius,
      finalBackground:getComputedStyle(finalCard).backgroundColor,
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.pageBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
  expect(visual!.statusRadius).toBe("22px");
  expect(visual!.overflow).toBe(false);
});

test("Car Hauling Dispatcher remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.goto(route);
  await expect(page.locator("[data-external-job-apply]").first()).toBeVisible();
  const mobile=await page.evaluate(() => {
    const action=document.querySelector<HTMLElement>("[data-external-job-apply]");
    const status=document.querySelector<HTMLElement>(".career-job-status-card");
    return {
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      actionWidth:action?.getBoundingClientRect().width ?? 0,
      viewport:document.documentElement.clientWidth,
      statusRadius:status ? getComputedStyle(status).borderRadius : "",
    };
  });
  expect(mobile.overflow).toBe(false);
  expect(mobile.actionWidth).toBeLessThanOrEqual(mobile.viewport);
  expect(mobile.statusRadius).toBe("22px");
});
