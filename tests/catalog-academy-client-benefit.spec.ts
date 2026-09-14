import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

for (const path of ["/paths/technology/", "/paths/marketing/", "/businesses/"]) {
  test(`Catalog bonus has a clear scope and a working handoff on ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    const benefit = page.locator("[data-catalog-benefit]");
    await expect(benefit).toHaveCount(1);
    await expect(benefit).toContainText("no additional listing or initial setup fee");
    await expect(benefit).toContainText("With your approval");
    await expect(benefit).toContainText("not unlimited ongoing SEO/GEO");
    await expect(benefit.getByRole("link", { name: "Explore Hermes Catalog" })).toHaveAttribute("href", "/businesses/");
    const handoff = await benefit.getByRole("link", { name: "Discuss my Catalog profile" }).getAttribute("href");
    const url = new URL(handoff!, "https://hermeslogisticsus.com");
    expect(url.pathname).toBe("/businesses/request/");
    expect(url.searchParams.get("type")).toBe("catalog-growth");
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`https://hermeslogisticsus.com${path}`);
    expect((await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ")).not.toContain('"JobPosting"');
    if (path === "/paths/marketing/") {
      mkdirSync("/tmp/hermes-catalog-evidence", { recursive: true });
      await benefit.screenshot({ path: `/tmp/hermes-catalog-evidence/bonus-${testInfo.project.name}.png` });
    }
  });
}

for (const path of ["/paths/academy/", "/academy/marketing/", "/ua/academy/marketing/"]) {
  test(`Academy separates recruitment goals from current roles on ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    const network = page.locator("[data-academy-network]");
    await expect(network).toHaveCount(1);
    await expect(network.locator(".academy-network__metrics strong")).toHaveText(["110", "3", "50"]);
    await expect(network.locator("[data-network-track]")).toHaveCount(4);
    await expect(network.locator('[data-network-track="logistics"] a')).toHaveAttribute("href", /\/academy\/apply\/\?program=us-logistics-operations/);
    await expect(network.locator('[data-network-track="marketing"] a')).toHaveAttribute("href", /\/academy\/apply\/\?program=marketing/);
    await expect(network.locator('[data-network-track="operations"] a')).toHaveAttribute("href", /^mailto:/);
    await expect(network.locator('[data-network-track="sales"] a')).toHaveAttribute("href", /^mailto:/);
    await expect(network.locator('.academy-network__markets a')).toHaveAttribute("href", "/businesses/#global-markets");
    if (path.startsWith("/ua/")) {
      await expect(network).toContainText("Тримісячне онлайн-навчання");
      await expect(network).toContainText("не поточний штат");
    } else {
      await expect(network).toContainText("Three-month online training");
      await expect(network).toContainText("not 50 positions in every country");
      await expect(network).toContainText("not current headcount or guaranteed vacancies");
    }
    expect(await network.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    if (path === "/paths/academy/") {
      mkdirSync("/tmp/hermes-catalog-evidence", { recursive: true });
      await network.screenshot({ path: `/tmp/hermes-catalog-evidence/academy-${testInfo.project.name}.png` });
    }
  });
}

test("marketing recruitment link preserves the supported program choice", async ({ page }) => {
  await page.goto("/academy/marketing/");
  await page.locator('[data-network-track="marketing"] a').click();
  await expect(page).toHaveURL(/\/academy\/apply\/\?program=marketing/);
  await expect(page.locator('select[name="academy_program"]')).toHaveValue("marketing");
});

test("promotions support explicit pause and do not resume after focus leaves", async ({ page }) => {
  await page.goto("/businesses/");
  const rail = page.locator("[data-promo-rail]");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-promo-ready", "true");
  const toggle = rail.locator("[data-promo-toggle]");
  await toggle.click();
  await expect(toggle).toHaveText("Resume promotions");
  await rail.locator('[data-promo-dot="1"]').click();
  await expect(rail.locator('[data-promo-slide]:not([hidden])')).toContainText("Add SEO / GEO");
  await page.locator("[data-catalog-input]").focus();
  await expect(rail).toHaveAttribute("data-promo-rotation", "paused");
  await expect(rail.locator('[data-promo-dot="1"]')).toHaveAttribute("aria-current", "true");
  const box = await rail.locator('[data-promo-dot="1"]').boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test("reduced motion disables auto rotation but keeps manual slides", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/businesses/");
  const rail = page.locator("[data-promo-rail]");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-promo-rotation", "paused");
  await expect(rail.locator("[data-promo-toggle]")).toBeDisabled();
  await rail.locator('[data-promo-dot="2"]').click();
  await expect(rail.locator('[data-promo-slide]:not([hidden])')).toContainText("Hermes Connect CRM");
});

test("no-JavaScript visitors can read the bonus and all promotion messages", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${process.env.HERMES_E2E_PORT ?? "4321"}/businesses/`);
  await expect(page.locator('[data-promo-slide]:visible')).toHaveCount(4);
  await expect(page.locator('[data-catalog-benefit]')).toContainText("Initial SEO/GEO preparation");
  await context.close();
});
