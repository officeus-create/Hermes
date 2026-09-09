import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import "./logistics-path-indexability.test.mjs";

const root = new URL("../", import.meta.url).pathname;
const verifierFiles = [
  "scripts/check-production-custom-domain.mjs",
  "scripts/check-production-seo-hygiene.mjs",
];

const canonicalSocialImage = new URL("../src/assets/hermes-ecosystem-hero.jpg", import.meta.url);
const retiredPublicHeroImage = new URL("../public/images/hermes-ecosystem-hero.jpg", import.meta.url);
const retiredSocialImage = new URL("../public/images/hermes-social-share-2026.jpg", import.meta.url);
const [layout, homepage] = await Promise.all([
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8"),
  access(canonicalSocialImage),
]);

await assert.rejects(access(retiredSocialImage), undefined, "The redundant social-share JPEG must stay removed.");
await assert.rejects(access(retiredPublicHeroImage), undefined, "The redundant public hero JPEG must stay removed.");
assert.ok(layout.includes('import heroImage from "../assets/hermes-ecosystem-hero.jpg"'), "BaseLayout must import the canonical hero source.");
assert.ok(layout.includes('const useHermesConnectSocialCard = isHermesConnectProductHub && !image;'), "BaseLayout must scope the dedicated Connect social card to the exact hub when no explicit image is supplied.");
assert.ok(layout.includes('const socialImagePath = image ?? (useHermesConnectSocialCard ? HERMES_CONNECT_SOCIAL_CARD.path : heroImage.src);'), "BaseLayout must preserve explicit social images and the canonical Astro hero fallback outside the exact Hermes Connect hub.");
assert.ok(homepage.includes("image: ecosystemHeroUrl"), "Homepage schema must use the canonical Astro asset.");
assert.ok(!layout.includes("hermes-social-share-2026.jpg"), "BaseLayout must not revive the retired social-share duplicate.");
assert.ok(!homepage.includes("hermes-social-share-2026.jpg"), "Homepage schema must not revive the retired social-share duplicate.");
assert.ok(!layout.includes("/images/hermes-ecosystem-hero.jpg"), "BaseLayout must not revive the retired public hero duplicate.");
assert.ok(!homepage.includes("/images/hermes-ecosystem-hero.jpg"), "Homepage schema must not revive the retired public hero duplicate.");

const sitemapHost = "hermeslogisticsus.com";
const childSitemapFiles = [
  "sitemap.xml",
  "sitemap-local.xml",
  "sitemap-services.xml",
  "sitemap-digital-services.xml",
  "sitemap-academy.xml",
  "sitemap-cases.xml",
  "sitemap-trust.xml",
  "sitemap-london.xml",
  "sitemap-business-directory.xml",
];
const expectedCurrentPageUrlCount = 198;
const carrierGeoRoot = `https://${sitemapHost}/logistics/car-hauler-loads/`;
const expectedCarrierGeoCityCount = 25;
const extractLocs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());

const sitemapIndex = await readFile(new URL("../public/sitemapindex.xml", import.meta.url), "utf8");
const sitemapIndexLocs = extractLocs(sitemapIndex);
const expectedChildUrls = childSitemapFiles.map((file) => `https://${sitemapHost}/${file}`);
assert.deepEqual(
  new Set(sitemapIndexLocs),
  new Set(expectedChildUrls),
  `sitemapindex.xml must reference exactly ${childSitemapFiles.length} controlled child sitemaps`,
);
assert.equal(sitemapIndexLocs.length, expectedChildUrls.length, "sitemapindex.xml must not duplicate child sitemap references");

const sitemapPageUrls = [];
for (const file of childSitemapFiles) {
  const xml = await readFile(new URL(`../public/${file}`, import.meta.url), "utf8");
  const locs = extractLocs(xml);
  assert.ok(locs.length > 0, `${file} must contain at least one page URL`);
  sitemapPageUrls.push(...locs);
}

assert.equal(
  sitemapPageUrls.length,
  expectedCurrentPageUrlCount,
  `controlled sitemap inventory changed from ${expectedCurrentPageUrlCount}; reconcile the intentional delta before merging`,
);
assert.equal(new Set(sitemapPageUrls).size, sitemapPageUrls.length, "controlled child sitemaps must not contain duplicate page URLs");

const serviceSitemap = await readFile(new URL("../public/sitemap-services.xml", import.meta.url), "utf8");
const carrierGeoUrls = extractLocs(serviceSitemap).filter((url) => url.startsWith(carrierGeoRoot));
const carrierGeoCityUrls = carrierGeoUrls.filter((url) => url !== carrierGeoRoot);
assert.ok(carrierGeoUrls.includes(carrierGeoRoot), "carrier GEO sitemap inventory must include the market hub");
assert.equal(
  carrierGeoCityUrls.length,
  expectedCarrierGeoCityCount,
  `carrier GEO launch must stay bounded to exactly ${expectedCarrierGeoCityCount} city pages`,
);
assert.equal(
  carrierGeoUrls.length,
  expectedCarrierGeoCityCount + 1,
  "carrier GEO sitemap inventory must contain exactly one hub plus 25 city pages",
);

for (const value of sitemapPageUrls) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:", `sitemap URL must use HTTPS: ${value}`);
  assert.equal(url.hostname, sitemapHost, `sitemap URL must stay on canonical host: ${value}`);
  assert.equal(url.search, "", `sitemap URL must not contain query parameters: ${value}`);
  assert.equal(url.hash, "", `sitemap URL must not contain a fragment: ${value}`);
  const lastSegment = url.pathname.split("/").filter(Boolean).at(-1) ?? "";
  assert.ok(!lastSegment.includes(".") || /\.html?$/i.test(lastSegment), `sitemap must contain HTML pages only, not assets: ${value}`);
}

for (const file of verifierFiles) {
  const check = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(check.status, 0, `${file} must parse cleanly: ${check.stderr}`);
}

const productionVerifier = await readFile(new URL("../scripts/check-production-seo-hygiene.mjs", import.meta.url), "utf8");
assert.ok(productionVerifier.includes("sitemapindex.xml"), "production SEO verifier must inspect the sitemap index");
assert.ok(productionVerifier.includes("sitemap-business-directory.xml"), "production SEO verifier must inspect the business directory sitemap");
assert.ok(productionVerifier.includes("robots.txt"), "production SEO verifier must inspect robots.txt");
assert.ok(productionVerifier.includes("llms.txt"), "production SEO verifier must inspect llms.txt");

console.log("Production SEO hygiene contract passed.");
