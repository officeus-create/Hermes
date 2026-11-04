import { expect, test } from "@playwright/test";

// Search error matrix E1 / funnel PROOF: each SEO service page shows three already-published proof assets beside
// the single primary CTA. Links only — no new claims, no new URLs.
const routes = [
  "/services/seo-for-logistics-companies/",
  "/services/seo/",
  "/services/local-seo/",
  "/services/seo-for-auto-repair-shops/",
  "/services/seo-for-independent-auto-dealers/",
  "/services/website-development/",
  "/services/website-redesign/",
  "/services/auto-repair-website-design/",
];

for (const route of routes) {
  test(`${route} shows proof beside one primary call to action`, async ({ page, request }) => {
    await page.goto(route);
    const rail = page.locator(".digital-proof-rail");
    await expect(rail).toBeVisible();
    const links = rail.locator("a[href]");
    await expect(links).toHaveCount(3);
    for (const href of await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")!))) {
      expect((await request.get(href)).status()).toBe(200);
    }
    await expect(page.locator(".digital-service-hero .button-primary")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
