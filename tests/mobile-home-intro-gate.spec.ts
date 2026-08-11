import { expect, test } from "@playwright/test";

test("mobile first visit opens the revenue homepage directly without the premium intro gate", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true });
  const page = await context.newPage();

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).not.toHaveClass(/intro-pending/);
  await expect(page.locator("[data-site-intro]")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Four directions. One way forward." })).toBeVisible();
  await expect(page.locator("#main-content")).toBeVisible();

  await context.close();
});

test("desktop first visit preserves the premium intro experience", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveClass(/intro-pending/);
  await expect(page.locator("[data-site-intro]")).toBeVisible();
  await expect(page.getByRole("button", { name: /Open Home/ })).toBeVisible();

  await context.close();
});
