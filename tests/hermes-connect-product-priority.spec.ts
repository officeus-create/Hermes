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
