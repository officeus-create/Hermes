import { expect, test } from "@playwright/test";

test("Marketing living window has local poster and never loads video in reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const stage = page.locator("[data-home-marketing-cinematic]");
  await expect(stage).toHaveCount(1);
  await expect(stage.locator("img")).toHaveAttribute("src", "/media/home/marketing-film-v2-poster.jpg");
  await stage.scrollIntoViewIfNeeded();
  await expect(stage.locator("source")).not.toHaveAttribute("src", /.+/);
  await expect(stage.locator("video")).toBeHidden();
  await expect(page.locator(".home-master-route")).toHaveCount(4);
  await expect(page.locator('.home-master-route-marketing')).toHaveAttribute("href", "/paths/marketing/");
});

test("Marketing living window selects only Hermes-hosted media when visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const stage = page.locator("[data-home-marketing-cinematic]");
  await stage.scrollIntoViewIfNeeded();
  await expect.poll(async () => stage.locator("source").getAttribute("src"), { timeout: 10000 })
    .toMatch(/^\/media\/home\/marketing-film-v2-540\.mp4$/);
});

test("Marketing honors Save-Data before assigning any video source", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true, addEventListener() {} } });
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const mediaCalls: string[] = [];
  page.on("request", request => { if (request.url().includes("/media/home/marketing-film-v2-540.mp4")) mediaCalls.push(request.url()); });
  await page.goto("/");
  const stage = page.locator("[data-home-marketing-cinematic]");
  await stage.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await expect(stage.locator("img")).toBeVisible();
  await expect(stage.locator("source")).not.toHaveAttribute("src", /.+/);
  expect(mediaCalls).toHaveLength(0);
});
