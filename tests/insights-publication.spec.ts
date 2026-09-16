import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const base = "https://hermeslogisticsus.com";
const registry = JSON.parse(readFileSync(new URL("../src/data/insights.generated.json", import.meta.url), "utf8")) as Array<{
  direction: string;
  slug: string;
  contentTier: string;
}>;
const insightUrl = (post: { direction: string; slug: string }) =>
  `${base}/insights/${post.direction}/${post.slug}/`;

test("Insights discovery exposes URLs only for standalone articles", async ({ page }) => {
  await page.goto("/insights/");

  const schemas = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "null");
  const itemList = schemas.find((schema: { "@type": string }) => schema["@type"] === "ItemList");
  expect(itemList).toBeTruthy();

  const listed = itemList.itemListElement as Array<{ position: number; url: string }>;
  const standalone = registry.filter((post) => post.contentTier === "standalone");
  const unpublished = registry.filter((post) => post.contentTier !== "standalone");
  expect(listed.map((item) => item.position)).toEqual(standalone.map((_, index) => index + 1));
  expect(listed.map((item) => item.url).sort()).toEqual(standalone.map(insightUrl).sort());

  const sitemapResponse = await page.request.get("/sitemap-insights.xml");
  const feedResponse = await page.request.get("/insights/rss.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(feedResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  const feed = await feedResponse.text();

  for (const post of standalone) {
    const url = insightUrl(post);
    expect(sitemap).toContain(`<loc>${url}</loc>`);
    expect(feed).toContain(`<link>${url}</link>`);
  }
  for (const post of unpublished) {
    const url = insightUrl(post);
    expect(listed.map((item) => item.url)).not.toContain(url);
    expect(sitemap).not.toContain(url);
    expect(feed).not.toContain(url);
  }
});
