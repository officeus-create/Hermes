import { expect, test } from "@playwright/test";

const commercialHeroTitle = "Move freight. Grow demand. Build capability. Build systems.";

test("first homepage visit shows the commercial page immediately", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-site-intro]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: commercialHeroTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: "Find the right next step" })).toBeVisible();

  const state = await page.evaluate(() => ({
    introPending: document.documentElement.classList.contains("intro-pending"),
    inertCount: [...document.body.children].filter((element) => element.hasAttribute("inert")).length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  expect(state.introPending).toBe(false);
  expect(state.inertCount).toBe(0);
  expect(state.overflow).toBe(false);
});

test("fresh mobile visit keeps the homepage immediately usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("[data-site-intro]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: commercialHeroTitle })).toBeVisible();

  const primary = page.getByRole("link", { name: "Find the right next step" });
  await primary.focus();
  await expect(primary).toBeFocused();

  const state = await page.evaluate(() => ({
    introPending: document.documentElement.classList.contains("intro-pending"),
    inertCount: [...document.body.children].filter((element) => element.hasAttribute("inert")).length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  expect(state.introPending).toBe(false);
  expect(state.inertCount).toBe(0);
  expect(state.overflow).toBe(false);
});

test("hash entry points still bypass directly to the requested homepage section", async ({ page }) => {
  await page.goto("/#contact");

  await expect(page.locator("[data-site-intro]")).toHaveCount(0);
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/intro-pending/);
});
