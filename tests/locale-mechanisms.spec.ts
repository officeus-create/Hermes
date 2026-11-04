import { expect, test, type Page } from "@playwright/test";

// Two different locale mechanisms (docs/DESIGN_INTEGRATION_CONTRACT.md → "Locale mechanisms"):
// 1. /ru/ and /ua/ are server-rendered locales with their own canonical owners.
// 2. Catalog ?lang=uk is a browser-side interface switch on the same canonical Catalog owner.
// Neither may create new canonical/hreflang URLs or change the server-rendered link graph.

const origin = "https://hermeslogisticsus.com";

async function chromeHrefs(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>(".site-header a[href], .site-footer a[href]")]
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => Boolean(href))
      .sort(),
  );
}

async function navLabel(page: Page, tone: string) {
  return (await page.locator(`.site-header .desktop-nav a[data-nav-tone="${tone}"]`).first().textContent())?.trim();
}

for (const [path, lang, logistics] of [
  ["/", "en", "Logistics"],
  ["/ru/", "ru", "Логистика"],
  ["/ua/", "uk", "Логістика"],
] as const) {
  test(`${path} is a server-rendered ${lang} locale with its own canonical and no query-string alternates`, async ({ page, request }) => {
    const html = await (await request.get(path)).text();
    expect(html).toMatch(new RegExp(`<html[^>]*lang="${lang}`));
    expect(html).toContain(`<link rel="canonical" href="${origin}${path}"`);
    expect(html).not.toMatch(/rel="(?:canonical|alternate)"[^>]*href="[^"]*\?lang=/);
    // Header labels are already in the page language in the server HTML (no runtime dependency).
    expect(html).toContain(`>${logistics}<`);

    await page.goto(path);
    expect(await navLabel(page, "logistics")).toBe(logistics);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("Catalog ?lang=uk switches visible labels in the browser without a new URL owner or link-graph change", async ({ page, request }) => {
  const englishHtml = await (await request.get("/businesses/")).text();
  const ukrainianHtml = await (await request.get("/businesses/?lang=uk")).text();
  // Same static document: the query string never becomes a second server-rendered owner.
  expect(ukrainianHtml).toBe(englishHtml);
  expect(englishHtml).toContain(`<link rel="canonical" href="${origin}/businesses/"`);
  expect(englishHtml).not.toMatch(/rel="(?:canonical|alternate)"[^>]*href="[^"]*\?lang=/);

  await page.goto("/businesses/");
  const englishHrefs = await chromeHrefs(page);
  expect(await navLabel(page, "logistics")).toBe("Logistics");
  await expect(page.locator('[data-direction-product-nav="catalog"] [data-direction-product-link="search"]')).toContainText("Search");

  await page.goto("/businesses/?lang=uk");
  expect(await navLabel(page, "logistics")).toBe("Логістика");
  await expect(page.locator('[data-direction-product-nav="catalog"] [data-direction-product-link="search"]')).toContainText("Пошук");
  expect(await chromeHrefs(page)).toEqual(englishHrefs);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}/businesses/`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("RU/UA routes without an explicit template locale translate labels but keep the English link graph", async ({ page, request }) => {
  // The footer keeps the English owner hrefs it always rendered on this route; only labels are Russian.
  const html = await (await request.get("/ru/gb/london/")).text();
  expect(html).toMatch(/<a href="\/about\/"[^>]*>О Hermes</);
  expect(html).toMatch(/<a href="\/paths\/logistics\/"[^>]*>Логистика \(EN\)</);

  await page.goto("/ru/gb/london/");
  expect(await navLabel(page, "logistics")).toBe("Логистика");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
