import { expect, test } from "@playwright/test";

const variants = [
  ["/services/seo/", "general", "Query × page evidence", "Qualified inquiry path"],
  ["/services/local-seo/", "local", "Service + location eligibility", "Call · directions · approved inquiry"],
  ["/services/seo-for-logistics-companies/", "logistics", "Buyer intent × service page", "Qualified logistics inquiry"],
  ["/services/seo-for-auto-repair-shops/", "repair", "Repair service × eligible area", "Call · directions · booking path"],
  ["/services/seo-for-independent-auto-dealers/", "dealer", "Market × inventory/service intent", "Qualified dealer inquiry"],
] as const;

for (const [route, variant, demand, action] of variants) {
  test(`${route} renders the truthful SEO evidence replay for ${variant}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route);

    const proof = page.locator("[data-seo-proof]");
    await proof.scrollIntoViewIfNeeded();
    await expect(proof).toBeVisible();
    await expect(proof).toHaveAttribute("data-seo-proof-variant", variant);
    await expect(proof.locator("[data-seo-proof-stage]")).toHaveCount(6);
    await expect(proof).toContainText("EVIDENCE REPLAY");
    await expect(proof).toContainText("NO RANKING GUARANTEE");
    await expect(proof).toContainText(demand);
    await expect(proof).toContainText(action);
    await expect(proof).toContainText("Production readback");
    await expect(proof).toContainText("Visibility, indexing, ranking, clicks, inquiries, sales and revenue are different outcomes.");
    await expect(proof.locator(".seo-proof-packet")).toHaveCSS("animation-name", "seo-proof-packet");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test("Logistics SEO proof stays static and readable at 390px reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/seo-for-logistics-companies/");

  const proof = page.locator("[data-seo-proof]");
  await proof.scrollIntoViewIfNeeded();
  await expect(proof).toBeVisible();
  await expect(proof).toHaveAttribute("data-seo-proof-variant", "logistics");
  await expect(proof.locator("[data-seo-proof-stage]")).toHaveCount(6);
  await expect(proof.locator(".seo-proof-packet")).toHaveCSS("animation-name", "none");
  await expect(proof).toContainText("Logistics canonical owner");
  await expect(proof).toContainText("Submission ≠ indexing ≠ ranking");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
