import { expect, test } from "@playwright/test";

const expected = [
  ["Product Hub", "/services/hermes-connect/"],
  ["Repair Shops", "/services/hermes-connect/repair-shops/"],
  ["Load Board", "/load-board/"],
  ["AI Command Center", "/services/hermes-connect/ai-command-center/"],
  ["Academy", "/services/hermes-connect/academy/"],
];

test("Hermes Connect product strip keeps current products first and highlights Product Hub", async ({ page }) => {
  await page.goto("/services/hermes-connect/");
  const nav = page.locator("[data-hc-product-context] .hc-family-nav");
  await expect(nav).toHaveAttribute("data-hc-priority-order", "current-products-first");
  const links = nav.locator(":scope > a");
  for (let index = 0; index < expected.length; index += 1) {
    await expect(links.nth(index)).toHaveText(expected[index][0]);
    await expect(links.nth(index)).toHaveAttribute("href", expected[index][1]);
  }
  await expect(nav.getByRole("link", { name: "Product Hub", exact: true })).toHaveAttribute("aria-current", "page");
});

test("canonical Load Board keeps the Hermes Connect product strip and clears the hero from both menus", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/load-board/");
    const context = page.locator("[data-hc-product-context]");
    await expect(context).toBeVisible();
    const nav = context.locator(".hc-family-nav");
    await expect(nav).toHaveAttribute("data-hc-priority-order", "current-products-first");
    await expect(nav.getByRole("link", { name: "Load Board", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(context).toContainText("LOAD BOARD · CURRENT");
    await expect(page.locator("#load-analysis [data-rpm-calculator]")).toBeVisible();

    const geometry = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>("[data-header]");
      const context = document.querySelector<HTMLElement>("[data-hc-product-context]");
      const title = document.querySelector<HTMLElement>(".load-board-hero h1");
      if (!header || !context || !title) return null;
      const h = header.getBoundingClientRect();
      const c = context.getBoundingClientRect();
      const t = title.getBoundingClientRect();
      return {
        headerBottom: h.bottom,
        contextTop: c.top,
        contextBottom: c.bottom,
        titleTop: t.top,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    expect(geometry).not.toBeNull();
    expect(geometry!.contextTop).toBeGreaterThanOrEqual(geometry!.headerBottom - 2);
    expect(geometry!.titleTop).toBeGreaterThan(geometry!.contextBottom + 16);
    expect(geometry!.overflow).toBe(false);
  }
});

test("nested Repair Shop routes keep Repair Shops selected in the product family", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");
  const nav = page.locator("[data-hc-product-context] .hc-family-nav");
  await expect(nav.getByRole("link", { name: "Repair Shops", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.locator(":scope > a").nth(2)).toHaveText("Load Board");
});

test("Academy remains a current product and is selected across its route family", async ({ page }) => {
  await page.goto("/services/hermes-connect/academy/");
  const nav = page.locator("[data-hc-product-context] .hc-family-nav");
  await expect(nav.getByRole("link", { name: "Academy", exact: true })).toHaveAttribute("aria-current", "page");
});

test("product priority labels follow the explicit Russian Connect locale", async ({ page }) => {
  await page.goto("/services/hermes-connect/?lang=ru");
  const nav = page.locator("[data-hc-product-context] .hc-family-nav");
  await expect(nav.locator(":scope > a").nth(0)).toHaveText("Центр продуктов");
  await expect(nav.locator(":scope > a").nth(1)).toHaveText("СТО");
  await expect(nav.locator(":scope > a").nth(2)).toHaveText("Load Board");
  await expect(nav.locator(":scope > a").nth(3)).toHaveText("ИИ-командный центр");
  await expect(nav.locator(":scope > a").nth(4)).toHaveText("Академия");
  await expect(nav.locator(":scope > a").nth(0)).toHaveAttribute("aria-current", "page");
});
