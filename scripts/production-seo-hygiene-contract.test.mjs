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
];
const intentionalRussianDirectionOwners = [
  `https://${sitemapHost}/ru/paths/logistics/`,
  `https://${sitemapHost}/ru/paths/marketing/`,
  `https://${sitemapHost}/ru/paths/technology/`,
  `https://${sitemapHost}/ru/paths/academy/`,
];
const controlledInventoryBaseline = 168;
const expectedCurrentPageUrlCount = controlledInventoryBaseline + intentionalRussianDirectionOwners.length;
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
const sitemapPagesByFile = new Map();
for (const file of childSitemapFiles) {
  const xml = await readFile(new URL(`../public/${file}`, import.meta.url), "utf8");
  const locs = extractLocs(xml);
  assert.ok(locs.length > 0, `${file} must contain at least one page URL`);
  sitemapPagesByFile.set(file, locs);
  sitemapPageUrls.push(...locs);
}

assert.equal(
  sitemapPageUrls.length,
  expectedCurrentPageUrlCount,
  `controlled sitemap inventory must equal baseline ${controlledInventoryBaseline} plus ${intentionalRussianDirectionOwners.length} approved Russian direction owners; reconcile any other delta before merging`,
);
assert.equal(new Set(sitemapPageUrls).size, sitemapPageUrls.length, "controlled child sitemaps must not contain duplicate page URLs");

const primarySitemapUrls = sitemapPagesByFile.get("sitemap.xml") ?? [];
for (const ownerUrl of intentionalRussianDirectionOwners) {
  assert.equal(
    primarySitemapUrls.filter((value) => value === ownerUrl).length,
    1,
    `approved Russian direction owner must appear exactly once in sitemap.xml: ${ownerUrl}`,
  );
}

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
  assert.equal(check.status, 0, `${file} must pass node --check: ${check.stderr || check.stdout}`);
}

const verifier = await readFile(new URL("./check-production-custom-domain.mjs", import.meta.url), "utf8");
for (const required of [
  '"/sitemapindex.xml"',
  '"/sitemap-london.xml"',
  '"/llms.txt"',
  '"/business-growth/"',
  '"/logistics/auction-vehicle-pickup/"',
  '"/logistics/appleton-wi-vehicle-transport/"',
  '"/services/website-development/"',
  '"/academy/us-logistics-operations/"',
  '"/__hermes-seo-healthcheck-nonexistent__/"',
  "finalUrlMatches",
  "exactControlledChildren",
  "hasMarkdownLinks",
  "isReal404",
]) {
  assert.ok(verifier.includes(required), `production verifier must preserve ${required}`);
}
assert.ok(
  !/\b(?:all|exactly)\s+eight\s+controlled child sitemaps\b/i.test(verifier),
  "production verifier output must derive the controlled sitemap count instead of hardcoding eight",
);

const workflow = await readFile(new URL("../.github/workflows/production-seo-hygiene-command.yml", import.meta.url), "utf8");
assert.ok(workflow.includes("github.event.issue.number == 346"), "SEO hygiene command must stay scoped to the SEO 11 master issue");
assert.ok(workflow.includes("github.event.comment.body == '/verify-production-seo'"), "SEO hygiene command trigger must remain explicit");
assert.ok(workflow.includes("node scripts/check-production-seo-hygiene.mjs"), "workflow must use the bounded SEO hygiene wrapper");
assert.ok(workflow.includes("no real lead") === false, "workflow should not imply that a lead is created");

console.log(`Production SEO hygiene contract passed: ${sitemapPageUrls.length} unique canonical page URLs across ${childSitemapFiles.length} child sitemaps.`);
