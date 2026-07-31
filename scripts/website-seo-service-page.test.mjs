import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const serviceHtml = await readFile(new URL("../dist/marketing/websites-seo/index.html", import.meta.url), "utf8");
const marketingHtml = await readFile(new URL("../dist/paths/marketing/index.html", import.meta.url), "utf8");
const technologyHtml = await readFile(new URL("../dist/paths/technology/index.html", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

assert.match(serviceHtml, /<title>Website Development &amp; SEO for U\.S\. Businesses \| Hermes<\/title>/);
assert.match(serviceHtml, /<link rel="canonical" href="https:\/\/hermeslogisticsus\.com\/marketing\/websites-seo\/"/);
assert.match(serviceHtml, /Website development and SEO built as one practical growth system/);
assert.match(serviceHtml, /No guaranteed rankings, traffic, leads, or revenue/);
assert.match(serviceHtml, /Mass-produced city pages are not part of the approach/);
assert.match(serviceHtml, /Reviewed July 31, 2026/);
assert.match(serviceHtml, /mailto:officeus@hermeslogisticsus\.com\?subject=Website%20and%20SEO%20Project%20Inquiry/);
assert.match(serviceHtml, /"@type":"Service"/);
assert.match(serviceHtml, /"@type":"BreadcrumbList"/);
assert.match(serviceHtml, /"@type":"FAQPage"/);
assert.equal((serviceHtml.match(/<details>/g) ?? []).length, 5);
assert.equal(/guarantee first-page rankings/i.test(serviceHtml), true);
assert.equal(/guarantee.*first page|guaranteed first page/i.test(serviceHtml), false);

assert.match(marketingHtml, /href="\/marketing\/websites-seo\/"/);
assert.match(technologyHtml, /href="\/marketing\/websites-seo\/"/);
assert.match(sitemap, /https:\/\/hermeslogisticsus\.com\/marketing\/websites-seo\//);
assert.equal((sitemap.match(/https:\/\/hermeslogisticsus\.com\/marketing\/websites-seo\//g) ?? []).length, 1);

console.log("Website development and SEO commercial page checks passed.");
