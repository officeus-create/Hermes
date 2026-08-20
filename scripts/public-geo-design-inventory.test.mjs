import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const pagesRoot = path.join(repoRoot, "src", "pages");
const componentsRoot = path.join(repoRoot, "src", "components");
const productionConnectMark = path.join(repoRoot, "public", "images", "hermes-connect-mark.svg");

const TRUST_FILES = new Set([
  "about.astro",
  "accessibility.astro",
  "asset-licensing.astro",
  "company-information.astro",
  "contacts.astro",
  "data-security.astro",
  "editorial-policy.astro",
  "legal-compliance.astro",
  "payments-cancellations.astro",
  "privacy-choices.astro",
  "privacy.astro",
  "regional-privacy.astro",
  "terms.astro",
]);

const CONNECT_PREFIX = "services/hermes-connect/";
const DEMO_PREFIX = "demos/";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

function normalizeSource(absolute) {
  return path.relative(pagesRoot, absolute).split(path.sep).join("/");
}

function routePatternFromSource(source) {
  if (source === "index.astro") return "/";
  const withoutExtension = source.replace(/\.astro$/, "");
  if (withoutExtension.endsWith("/index")) return `/${withoutExtension.slice(0, -6)}/`;
  return `/${withoutExtension}/`;
}

function familyFor(source) {
  if (source.startsWith(CONNECT_PREFIX)) return "hermes_connect_product";
  if (source.startsWith(DEMO_PREFIX)) return "demo_lab";
  if (source === "404.astro") return "system";
  if (source === "index.astro") return "home";
  if (source.startsWith("paths/")) return "four_directions";
  if (source.startsWith("logistics/resources/")) return "logistics_resources";
  if (source.startsWith("logistics/")) return "logistics";
  if (source === "load-board.astro" || source.startsWith("carrier/")) return "logistics_entry";
  if (source.startsWith("resources/")) return "shared_resources";
  if (source.startsWith("case/")) return "cases";
  if (source.startsWith("careers/")) return "careers";
  if (source.startsWith("academy/")) return "academy_public";
  if (source.startsWith("ua/academy/")) return "academy_public_localized";
  if (source.startsWith("services/")) return "digital_services";
  if (source.startsWith("business-growth/")) return "marketing_public";
  if (source.startsWith("ru/business-growth/") || source.startsWith("ua/business-growth/")) return "marketing_public_localized";
  if (/^(ua|ru|es|it|fr)\//.test(source)) return "localized_overview";
  if (source.startsWith("contracts/") || source.startsWith("sign/")) return "transactional_public_boundary";
  if (TRUST_FILES.has(source)) return "trust_legal_company";
  if (source === "download.astro") return "public_product_boundary";
  return "public_other";
}

function ownershipFor(source, family) {
  if (source.startsWith(CONNECT_PREFIX)) return "connect_owner_excluded";
  if (source.startsWith(DEMO_PREFIX)) return "demo_lab_excluded";
  if (family === "transactional_public_boundary") return "public_transactional_review";
  return "public_geo_design";
}

function indexabilityFor(source, family, ownership) {
  if (ownership === "connect_owner_excluded") return "connect_owner_controls";
  if (ownership === "demo_lab_excluded" || family === "system") return "noindex_expected";
  if (family === "transactional_public_boundary") return "review_before_geo";
  return "verify_against_sitemap_and_page_meta";
}

function duplicateCandidateFor(source) {
  if (source.includes("[")) return "dynamic_route_overlap_review";
  if (source.startsWith("logistics/") && /-wi-vehicle-transport\.astro$/.test(source)) return "local_family_similarity_review";
  return "none_known";
}

function actionFor(ownership, family) {
  if (ownership === "connect_owner_excluded") return "do_not_modify_record_dependency_only";
  if (ownership === "demo_lab_excluded") return "verify_noindex_and_no_production_asset_dependency";
  if (family === "transactional_public_boundary") return "audit_truth_design_and_indexability_without_changing_transaction_logic";
  return "audit_geo_truth_design_mobile_accessibility_and_duplicates";
}

export async function buildPublicGeoDesignInventory() {
  const pageFiles = (await walk(pagesRoot)).filter((file) => file.endsWith(".astro"));
  return pageFiles
    .map((absolute) => {
      const source = normalizeSource(absolute);
      const family = familyFor(source);
      const ownership = ownershipFor(source, family);
      return {
        source: `src/pages/${source}`,
        route: routePatternFromSource(source),
        family,
        purpose: family,
        ownership,
        indexability: indexabilityFor(source, family, ownership),
        designGeneration: source === "index.astro" ? "approved_home_baseline_audit_only" : "current_main_family_review",
        brandGeneration: "hermes_master_brand_required",
        headerGeneration: "shared_header_or_family_review",
        footerGeneration: "shared_footer_or_family_review",
        palette: "inspect_rendered_surface",
        mobileState: "desktop_and_390px_required",
        geoStatus: ownership === "public_geo_design" ? "audit_required" : "not_owned_here",
        duplicateCandidate: duplicateCandidateFor(source),
        action: actionFor(ownership, family),
      };
    })
    .sort((a, b) => a.route.localeCompare(b.route) || a.source.localeCompare(b.source));
}

async function findDemoAssetDependencies() {
  const roots = [pagesRoot, componentsRoot];
  const sourceFiles = [];
  for (const root of roots) {
    sourceFiles.push(...(await walk(root)));
  }

  const assetPattern = /(?:src\s*=|background(?:-image)?\s*:|url\(|=\s*)[^\n]{0,120}["']\/demos\/[^"')\s]+\.(?:svg|png|jpe?g|webp|avif|gif)/gi;
  const findings = [];
  for (const file of sourceFiles.filter((item) => /\.(?:astro|ts|js|css)$/.test(item))) {
    const relative = path.relative(repoRoot, file).split(path.sep).join("/");
    const source = await readFile(file, "utf8");
    if (assetPattern.test(source)) findings.push(relative);
    assetPattern.lastIndex = 0;
  }
  return [...new Set(findings)].sort();
}

const inventory = await buildPublicGeoDesignInventory();

assert.ok(inventory.length > 0, "Public GEO/design inventory must discover Astro routes.");
assert.equal(
  inventory.filter((row) => row.family === "hermes_connect_product" && row.ownership !== "connect_owner_excluded").length,
  0,
  "Hermes Connect routes must never enter the public GEO/design owned set.",
);
assert.equal(
  inventory.filter((row) => row.family === "demo_lab" && row.ownership !== "demo_lab_excluded").length,
  0,
  "Demo/lab routes must remain excluded from canonical public ownership.",
);
assert.equal(
  inventory.filter((row) => row.ownership === "public_geo_design" && row.source.includes("/services/hermes-connect/")).length,
  0,
  "Public GEO/design ownership must not reach into Hermes Connect product routes.",
);

await access(productionConnectMark);
const demoAssetDependencies = await findDemoAssetDependencies();
assert.deepEqual(
  demoAssetDependencies,
  [],
  `Production source must not load visual assets from /demos/. Move the asset to /public/images or another production namespace. Found: ${demoAssetDependencies.join(", ")}`,
);

const counts = inventory.reduce((acc, row) => {
  acc[row.ownership] = (acc[row.ownership] || 0) + 1;
  return acc;
}, {});

console.log("Public GEO/design inventory contract passed.");
console.log(JSON.stringify({ totalRouteSources: inventory.length, ownershipCounts: counts }, null, 2));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(inventory, null, 2));
}
