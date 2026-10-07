import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import "./logistics-path-indexability.test.mjs";
import "./sitemap-lastmod-contract.test.mjs";

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
const staticChildSitemapFiles = [
  "sitemap.xml",
  "sitemap-local.xml",
  "sitemap-services.xml",
  "sitemap-digital-services.xml",
  "sitemap-academy.xml",
  "sitemap-cases.xml",
  "sitemap-trust.xml",
  "sitemap-london.xml",
  "sitemap-business-directory.xml",
  "sitemap-insights.xml",
];
const indexedChildSitemapFiles = [
  ...staticChildSitemapFiles,
  "sitemap-connect-catalog.xml",
];
// Controlled non-insights inventory includes the established public owners plus a bounded
// language-owner parity layer for the six canonical site languages. The 2026-09-16 delta adds
// 18 missing top-level direction owners (the existing EN + IT Marketing/Technology owners remain)
// plus four missing localized U.S. Logistics Operations course owners. This is intent/language
// ownership, not Padova/city templates and not authorization for a broader GEO or page factory.
// Existing car-hauler GEO pages remain owned by sitemap-services.xml and are not duplicated here.
// The bounded carrier-lifecycle pilot adds exactly one distinct early-intent resource that routes
// employment searches away from B2B carrier intake while preserving existing commercial owners.
// The Repair Shop Catalog sitemap is runtime-generated from owner opt-in records and is therefore
// verified as an indexed child, not counted as a build-time static page inventory.
// The Legacy Toyota dealer pilot adds exactly three static Catalog discovery owners:
// Texas state, Dallas city, and the unclaimed dealership profile. Its private CRM workspace
// stays noindex and is intentionally absent from every sitemap.
// The September 24 verified repair prospect wave adds 17 static owners. Two additional
// source-bounded profiles add five owners: Alabama, Brookwood, East Dundee and both profiles.\n// The Chayka Store pilot adds three intentional Ukraine Catalog owners: country, locality and business concept.
// September 28 adds Little Rock, Guy and Cedarville locality pages plus three unclaimed Arkansas profiles.
// September 29 adds three bounded secondary international discovery profiles plus the Irpin locality hub.
// October 1 added a Marketing Growth Audit example, but Search Recovery now keeps that strategy/example route noindex and out of the Catalog sitemap.
// October 3 adds one verified Wisconsin owner-operator vacancy owner linked from the existing careers hub.
// October 5 adds one bounded Work With Hermes relationship hub that routes existing career, carrier, agency, and partnership owners.
// October 5 added KNB locality + profile; Search Recovery keeps the business profile indexable while single-profile locality collections are noindex.\n// 2026-10-06 Search Recovery also removes 14 secondary Load Board provider/non-P0 equipment owners, 25 thin Catalog/example owners, and 7 unreleased Hermes Connect reference-capability owners from static sitemaps.
const nonInsightsExpectedPageUrlCount = 255;
const carrierGeoRoot = `https://${sitemapHost}/logistics/car-hauler-loads/`;
const carrierLifecycleGuide = `https://${sitemapHost}/logistics/resources/car-hauler-jobs-owner-operator-guide/`;
const expectedCarrierGeoCityCount = 25;
const extractLocs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
const insightSitemap = await readFile(new URL("../public/sitemap-insights.xml", import.meta.url), "utf8");
const expectedCurrentPageUrlCount = nonInsightsExpectedPageUrlCount + extractLocs(insightSitemap).length;

const sitemapIndex = await readFile(new URL("../public/sitemapindex.xml", import.meta.url), "utf8");
const sitemapIndexLocs = extractLocs(sitemapIndex);
const expectedChildUrls = indexedChildSitemapFiles.map((file) => `https://${sitemapHost}/${file}`);
assert.deepEqual(
  new Set(sitemapIndexLocs),
  new Set(expectedChildUrls),
  `sitemapindex.xml must reference exactly ${indexedChildSitemapFiles.length} controlled child sitemaps`,
);
assert.equal(sitemapIndexLocs.length, expectedChildUrls.length, "sitemapindex.xml must not duplicate child sitemap references");

const sitemapPageUrls = [];
for (const file of staticChildSitemapFiles) {
  const xml = await readFile(new URL(`../public/${file}`, import.meta.url), "utf8");
  const locs = extractLocs(xml);
  assert.ok(locs.length > 0, `${file} must contain at least one page URL`);
  sitemapPageUrls.push(...locs);
}

assert.equal(
  sitemapPageUrls.length,
  expectedCurrentPageUrlCount,
  `controlled static sitemap inventory changed from ${expectedCurrentPageUrlCount}; reconcile the intentional delta before merging`,
);
assert.equal(new Set(sitemapPageUrls).size, sitemapPageUrls.length, "controlled static child sitemaps must not contain duplicate page URLs");
assert.ok(sitemapPageUrls.includes(carrierLifecycleGuide), "bounded carrier-lifecycle guide must remain discoverable in the controlled sitemap inventory");

const primarySitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const businessDirectorySitemap = await readFile(new URL("../public/sitemap-business-directory.xml", import.meta.url), "utf8");
const digitalServicesSitemap = await readFile(new URL("../public/sitemap-digital-services.xml", import.meta.url), "utf8");
assert.ok(digitalServicesSitemap.includes("/services/hermes-connect/support/"), "Hermes Connect Support/Trust owner must remain discoverable in the digital-services sitemap");
for (const capability of ["ai-command-center","business-automation","load-analyzer","proposal-builder","rate-negotiator","roi-calculator","unified-inbox"]) {
  assert.ok(!digitalServicesSitemap.includes(`/services/hermes-connect/${capability}/`), `unreleased capability leaked into sitemap: ${capability}`);
}
const capabilityComponent = await readFile(new URL("../src/components/HermesConnectCapabilityPage.astro", import.meta.url), "utf8");
assert.match(capabilityComponent, /robots="noindex,follow"/);
assert.doesNotMatch(primarySitemap, /\/load-board\/providers\//, "provider-integration support pages must not compete as sitemap search owners");
for (const slug of ["dry-van","reefer","flatbed","step-deck","hotshot","power-only","box-truck"]) {
  assert.ok(!primarySitemap.includes(`/load-board/equipment/${slug}/`), `non-P0 Load Board equipment page must stay outside the sitemap: ${slug}`);
}
assert.ok(primarySitemap.includes("/load-board/equipment/car-hauler/"), "P0 Car Hauler equipment owner must remain in the sitemap");
assert.ok(!businessDirectorySitemap.includes("/businesses/marketing-growth-audit-example/"), "strategy/example route must not be a Catalog sitemap owner");
const allowedCatalogCollections = new Set([
  "/businesses/",
  "/businesses/arkansas/",
  "/businesses/illinois/",
  "/businesses/california/",
  "/businesses/ukraine/",
  "/businesses/ukraine/chaiky/",
]);
for (const value of extractLocs(businessDirectorySitemap)) {
  const pathname = new URL(value).pathname;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "businesses" && parts.length <= 3) {
    assert.ok(allowedCatalogCollections.has(pathname), `thin Catalog collection leaked into sitemap: ${pathname}`);
  }
}
const stateCatalogSource = await readFile(new URL("../src/pages/businesses/[state]/index.astro", import.meta.url), "utf8");
const cityCatalogSource = await readFile(new URL("../src/pages/businesses/[state]/[city]/index.astro", import.meta.url), "utf8");
const catalogAuditExample = await readFile(new URL("../src/pages/businesses/marketing-growth-audit-example/index.astro", import.meta.url), "utf8");
assert.match(stateCatalogSource, /collectionCount >= 2 \? undefined : "noindex,follow"/);
assert.match(cityCatalogSource, /collectionCount >= 2 \? undefined : "noindex,follow"/);
assert.match(catalogAuditExample, /robots="noindex,follow"/);

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
  assert.equal(check.status, 0, `${file} must pass node --check: ${check.stderr || check.stdout}`);
}

const verifier = await readFile(new URL("./check-production-custom-domain.mjs", import.meta.url), "utf8");
for (const required of [
  '"/sitemapindex.xml"',
  '"/sitemap-london.xml"',
  '"/sitemap-business-directory.xml"',
  '"/sitemap-insights.xml"',
  '"/sitemap-connect-catalog.xml"',
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
assert.ok(workflow.includes("workflow_dispatch:"), "SEO hygiene verifier must remain explicitly manually dispatchable");
assert.equal(workflow.includes("issue_comment:"), false, "SEO hygiene verifier must not depend on an issue-comment router");
assert.equal(workflow.includes("github.event.issue.number"), false, "SEO hygiene verifier must not bind execution to a closed issue");
assert.equal(workflow.includes("gh issue comment"), false, "SEO hygiene verifier must not publish into a closed issue");
assert.equal(workflow.includes("issues: write"), false, "SEO hygiene verifier no longer needs issue-write permission");
assert.ok(workflow.includes("node scripts/check-production-seo-hygiene.mjs"), "workflow must use the bounded SEO hygiene wrapper");
assert.ok(workflow.includes("GITHUB_STEP_SUMMARY"), "SEO hygiene verifier must keep sanitized Actions-summary evidence");
assert.ok(workflow.includes("no real lead") === false, "workflow should not imply that a lead is created");

console.log(`Production SEO hygiene contract passed: ${sitemapPageUrls.length} unique canonical static page URLs across ${staticChildSitemapFiles.length} static child sitemaps; ${indexedChildSitemapFiles.length} controlled children in sitemapindex.xml.`);
