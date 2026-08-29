import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const sitemapFiles = (await readdir(publicDir)).filter((name) => /^sitemap.*\.xml$/i.test(name));
const sitemapBodies = await Promise.all(
  sitemapFiles.map(async (name) => ({
    name,
    body: await readFile(path.join(publicDir, name), "utf8"),
  })),
);
const primarySitemap = sitemapBodies.find(({ name }) => name === "sitemap.xml")?.body ?? "";

function assertAbsentFromAllSitemaps(route) {
  const absoluteUrl = `https://hermeslogisticsus.com${route}`;
  for (const { name, body } of sitemapBodies) {
    assert(!body.includes(absoluteUrl), `${route} must not appear in ${name} while noindex`);
  }
}

const lowEvidenceEquipmentRoutes = [
  "/paths/logistics/carriers/car-hauling/",
  "/paths/logistics/carriers/hotshot/",
  "/paths/logistics/carriers/box-truck/",
  "/paths/logistics/carriers/cargo-van/",
  "/paths/logistics/carriers/power-only/",
  "/paths/logistics/carriers/dry-van/",
  "/paths/logistics/carriers/reefer/",
  "/paths/logistics/carriers/flatbed/",
  "/paths/logistics/carriers/step-deck/",
];

for (const route of lowEvidenceEquipmentRoutes) {
  const htmlPath = path.join(root, "dist", route.replace(/^\//, ""), "index.html");
  const html = await readFile(htmlPath, "utf8");
  assert.match(html, /<meta name="robots" content="noindex,follow">/, `${route} must remain noindex,follow until distinct search evidence exists`);
  assertAbsentFromAllSitemaps(route);
}

const intentionalNoindexWorkspaces = [
  { route: "/logistics/request-vehicle-transport/", robots: /<meta name="robots" content="noindex,follow">/ },
  { route: "/logistics/start-car-hauling-dispatch/", robots: /<meta name="robots" content="noindex,follow">/ },
  { route: "/logistics/carrier-onboarding/", robots: /<meta name="robots" content="noindex,nofollow">/ },
  { route: "/logistics/carrier-offer/", robots: /<meta name="robots" content="noindex,nofollow">/ },
  { route: "/logistics/carrier-agreement/", robots: /<meta name="robots" content="noindex,nofollow">/ },
  { route: "/contracts/carrier-agreement-v3/", robots: /<meta name="robots" content="noindex,nofollow">/ },
  { route: "/carrier/", robots: /<meta name="robots" content="noindex,nofollow">/ },
  { route: "/sign/", robots: /<meta name="robots" content="noindex,nofollow">/ },
  { route: "/demos/crm-validation/", robots: /<meta name="robots" content="noindex,nofollow">/ },
  { route: "/demos/website-audit/", robots: /<meta name="robots" content="noindex,nofollow">/ },
];

for (const { route, robots } of intentionalNoindexWorkspaces) {
  const htmlPath = path.join(root, "dist", route.replace(/^\//, ""), "index.html");
  const html = await readFile(htmlPath, "utf8");
  assert.match(html, robots, `${route} must preserve its intentional noindex directive`);
  assertAbsentFromAllSitemaps(route);
}

const attorneyReviewHtmlRoute = "/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.html";
const attorneyReviewExtensionlessRoute = "/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW";
const attorneyReviewHtml = await readFile(
  path.join(root, "dist", attorneyReviewHtmlRoute.replace(/^\//, "")),
  "utf8",
);
assert.match(
  attorneyReviewHtml,
  /<meta name="robots" content="noindex,nofollow,noarchive"\s*\/?>/,
  "Attorney-review carrier agreement HTML must remain noindex,nofollow,noarchive",
);
assertAbsentFromAllSitemaps(attorneyReviewHtmlRoute);
assertAbsentFromAllSitemaps(attorneyReviewExtensionlessRoute);

const protectedIndexableRoutes = [
  "/paths/logistics/carriers/owner-operators/",
  "/paths/logistics/carriers/fleet-owners/",
  "/paths/logistics/carriers/new-authority/",
  "/paths/logistics/carriers/direct-freight-development/",
  "/paths/logistics/brokers/carrier-capacity/",
  "/paths/logistics/customers/vehicle-transport/",
  "/paths/logistics/find-your-path/",
];

for (const route of protectedIndexableRoutes) {
  const htmlPath = path.join(root, "dist", route.replace(/^\//, ""), "index.html");
  const html = await readFile(htmlPath, "utf8");
  assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i, `${route} must remain indexable`);
  assert(primarySitemap.includes(`https://hermeslogisticsus.com${route}`), `${route} must remain in the primary sitemap`);
}

console.log("Logistics path indexability contract passed: low-evidence variants and intentional private/conversion workspaces stay noindex and out of every sitemap while protected owners remain indexable.");
