import { expect, test } from "@playwright/test";

const childSitemaps = [
  "https://hermeslogisticsus.com/sitemap.xml",
  "https://hermeslogisticsus.com/sitemap-local.xml",
  "https://hermeslogisticsus.com/sitemap-services.xml",
  "https://hermeslogisticsus.com/sitemap-digital-services.xml",
  "https://hermeslogisticsus.com/sitemap-academy.xml",
  "https://hermeslogisticsus.com/sitemap-cases.xml",
  "https://hermeslogisticsus.com/sitemap-trust.xml",
  "https://hermeslogisticsus.com/sitemap-london.xml",
];

test("sitemap index exposes each declared public child sitemap exactly once", async ({ page }) => {
  const response = await page.request.get("/sitemapindex.xml");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"] ?? "").toMatch(/xml|text\/plain|application\/octet-stream/);
  const body = await response.text();

  expect(body).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  expect(body).not.toContain("<urlset");

  for (const sitemap of childSitemaps) {
    expect(body.split(`<loc>${sitemap}</loc>`)).toHaveLength(2);
  }

  const locCount = (body.match(/<loc>/g) ?? []).length;
  expect(locCount).toBe(childSitemaps.length);
});

test("robots advertises the sitemap index and current child sitemaps", async ({ page }) => {
  const response = await page.request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();

  expect(body).toContain("Sitemap: https://hermeslogisticsus.com/sitemapindex.xml");
  for (const sitemap of childSitemaps) {
    expect(body).toContain(`Sitemap: ${sitemap}`);
  }
});
