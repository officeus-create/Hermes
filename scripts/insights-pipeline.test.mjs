import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registry = JSON.parse(await readFile(new URL("../src/data/insights.generated.json", import.meta.url), "utf8"));
assert.ok(registry.length >= 1, "insights registry must contain at least one approved record");
const routeKeys = new Set();
const sourceUrls = new Set();
for (const post of registry) {
  assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.match(post.sourceUrl, /^https:\/\//);
  assert.match(post.sourcePublishedAt, /^\d{4}-\d{2}-\d{2}$/);
  const analysisLength = post.explanation.join(" ").length;
  assert.ok(analysisLength >= (post.contentTier === "standalone" ? 650 : 120), `${post.id}: original analysis is too thin for ${post.contentTier}`);
  assert.ok(post.takeaways.length >= (post.contentTier === "standalone" ? 3 : 1), `${post.id}: takeaways missing`);
  assert.ok(post.contentTier !== "standalone" || post.faq.length >= 3, `${post.id}: standalone FAQ missing`);
  assert.ok(post.related.length >= (post.contentTier === "standalone" ? 2 : 1) && post.related.every((item) => item.href.startsWith("/")), `${post.id}: internal related links required`);
  assert.ok(post.primaryAction.href.startsWith("/") && post.secondaryAction.href.startsWith("/"), `${post.id}: CTAs must remain internal`);
  const route = `${post.direction}/${post.slug}`;
  assert.ok(!routeKeys.has(route), `${post.id}: duplicate insight route`);
  routeKeys.add(route);
  assert.ok(!sourceUrls.has(post.sourceUrl), `${post.id}: duplicate source should merge or expand instead of creating a competing article`);
  sourceUrls.add(post.sourceUrl);
  if (post.currentMarketClaim) assert.ok(post.sourcePublishedAt, `${post.id}: current claims require source date`);
}
const sitemap = await readFile(new URL("../public/sitemap-insights.xml", import.meta.url), "utf8");
assert.match(sitemap, /https:\/\/hermeslogisticsus\.com\/insights\//);
for (const post of registry.filter((item) => item.contentTier === "standalone")) {
  assert.ok(sitemap.includes(`https://hermeslogisticsus.com/insights/${post.direction}/${post.slug}/`), `${post.id}: sitemap entry missing`);
}
const rss = await readFile(new URL("../src/pages/insights/rss.xml.ts", import.meta.url), "utf8");
assert.ok(rss.includes("application/rss+xml"), "RSS route must emit RSS content type");
console.log(`Insights publication contract passed: ${registry.length} reviewed record(s), ${routeKeys.size} unique route(s).`);
