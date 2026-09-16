import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("Repair Shop $3 launch promotion is active without inventing an end date or checkout", async () => {
  const [policy, component] = await Promise.all([
    readFile(new URL("../src/data/hermes-connect-repair-shop-launch.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/RepairShopFreeLaunchOffer.astro", import.meta.url), "utf8"),
  ]);
  expect(policy).toContain('id: "repair_shop_launch_promotion_active"');
  expect(policy).toContain("active: true");
  expect(policy).toContain("priceMonthlyUsd: 3");
  expect(policy).toContain("REPAIR_SHOP_ONLINE_BILLING_ENABLED = false");
  expect(policy).not.toMatch(/deadline|September 15|paypal\.com\/sdk/i);
  expect(component).toContain("Repair Shop Launch Promotion: $3/month.");
  expect(component).toContain("No card is collected on this website.");
  expect(component).not.toMatch(/countdown|data-days|September 15|paypal\.com\/sdk/i);
});

test("Repair Shop landing exposes the active $3 promotion and keeps registration available", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("hermes-connect-language"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });
  const offer = page.locator("[data-repair-free-launch]");
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-promotion-active", "true");
  await expect(offer).toContainText("$3/month");
  await expect(offer.getByRole("link", { name: "Register my shop" })).toHaveAttribute(
    "href",
    /^\/services\/hermes-connect\/repair-shops\/auth\/\?mode=register(?:&lang=(?:ru|uk|es|it|fr))?$/,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
