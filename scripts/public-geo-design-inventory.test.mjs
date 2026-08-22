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

const LEGACY_PALETTE_PATTERNS = [
  ["legacy_navy_token", /var\(--color-navy-[^)]+\)/i],
  ["legacy_blue_token", /var\(--color-blue-[^)]+\)/i],
  ["legacy_teal_token", /var\(--color-teal-[^)]+\)/i],
  ["legacy_gold_token", /var\(--color-gold-[^)]+\)/i],
  ["legacy_surface_hex", /#(?:071038|f8faff|f5f7fb|d6dce8)\b/i],
];

const BRAND_REVIEW_PATTERNS = [
  ["business_academy_label", /\bBusiness Academy\b/i],
  ["hermes_it_development_label", /\bHermes IT Development\b/i],
  ["progressopro_label", /\bProgressoPro\b/i],
];

const STALE_TRUTH_PATTERNS = [
  ["connect_prototype_work_started", /Hermes Connect\s*[·-]\s*Prototype work started/i],
  ["connect_nothing_live", /No public Hermes Connect app, account, booking, payment, calendar, or integration is live yet/i],
];

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

function collectSignals(sourceText, patterns) {
  return patterns.filter(([, pattern]) => pattern.test(sourceText)).map(([label]) => label);
}

function sourceSignals(sourceText) {
  return {
    legacyPalette: collectSignals(sourceText, LEGACY_PALETTE_PATTERNS),
    brandHierarchyReview: collectSignals(sourceText, BRAND_REVIEW_PATTERNS),
    staleTruth: collectSignals(sourceText, STALE_TRUTH_PATTERNS),
  };
}

function actionFor(ownership, family, signals) {
  if (ownership === "connect_owner_excluded") return "do_not_modify_record_dependency_only";
  if (ownership === "demo_lab_excluded") return "verify_noindex_and_no_production_asset_dependency";
  if (family === "transactional_public_boundary") return "audit_truth_design_and_indexability_without_changing_transaction_logic";
  if (signals.staleTruth.length) return "fix_stale_truth_before_rendered_review";
  if (signals.legacyPalette.length) return "converge_legacy_palette_then_rendered_review";
  if (signals.brandHierarchyReview.length) return "verify_brand_hierarchy_then_rendered_review";
  return "audit_geo_truth_design_mobile_accessibility_and_duplicates";
}

export async function buildPublicGeoDesignInventory() {
  const pageFiles = (await walk(pagesRoot)).filter((file) => file.endsWith(".astro"));
  const rows = await Promise.all(pageFiles.map(async (absolute) => {
    const source = normalizeSource(absolute);
    const family = familyFor(source);
    const ownership = ownershipFor(source, family);
    const text = await readFile(absolute, "utf8");
    const signals = sourceSignals(text);
    return {
      source: `src/pages/${source}`,
      route: routePatternFromSource(source),
      family,
      purpose: family,
      ownership,
      indexability: indexabilityFor(source, family, ownership),
      designGeneration: source === "index.astro"
        ? "approved_home_baseline_audit_only"
        : signals.legacyPalette.length
          ? "legacy_palette_signal_detected"
          : "current_or_neutral_source_review",
      brandGeneration: signals.brandHierarchyReview.length
        ? "brand_hierarchy_review_required"
        : "hermes_master_brand_required",
      headerGeneration: "shared_header_or_family_review",
      footerGeneration: "shared_footer_or_family_review",
      palette: signals.legacyPalette.length ? signals.legacyPalette : ["no_legacy_palette_signal"],
      mobileState: "desktop_and_390px_required",
      geoStatus: ownership !== "public_geo_design"
        ? "not_owned_here"
        : signals.staleTruth.length
          ? "stale_truth_blocker"
          : "source_screened_rendered_review_required",
      duplicateCandidate: duplicateCandidateFor(source),
      reviewSignals: signals,
      action: actionFor(ownership, family, signals),
    };
  }));

  return rows.sort((a, b) => a.route.localeCompare(b.route) || a.source.localeCompare(b.source));
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

const publicOwned = inventory.filter((row) => row.ownership === "public_geo_design");
const signalCounts = publicOwned.reduce((acc, row) => {
  if (row.reviewSignals.legacyPalette.length) acc.legacyPaletteRoutes += 1;
  if (row.reviewSignals.brandHierarchyReview.length) acc.brandHierarchyReviewRoutes += 1;
  if (row.reviewSignals.staleTruth.length) acc.staleTruthRoutes += 1;
  return acc;
}, { legacyPaletteRoutes: 0, brandHierarchyReviewRoutes: 0, staleTruthRoutes: 0 });

const familySignals = [...new Set(publicOwned.map((row) => row.family))]
  .sort()
  .map((family) => {
    const rows = publicOwned.filter((row) => row.family === family);
    return {
      family,
      routes: rows.length,
      legacyPaletteRoutes: rows.filter((row) => row.reviewSignals.legacyPalette.length).length,
      brandHierarchyReviewRoutes: rows.filter((row) => row.reviewSignals.brandHierarchyReview.length).length,
      staleTruthRoutes: rows.filter((row) => row.reviewSignals.staleTruth.length).length,
    };
  });

console.log("Public GEO/design inventory contract passed.");
console.log(JSON.stringify({ totalRouteSources: inventory.length, ownershipCounts: counts, publicSignalCounts: signalCounts, familySignals }, null, 2));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(inventory, null, 2));
}
