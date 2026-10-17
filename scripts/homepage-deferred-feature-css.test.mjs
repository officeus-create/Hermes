import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const html = await readFile(join(root, "dist", "index.html"), "utf8");
const brandCss = await readFile(join(root, "src", "styles", "hermes-brand-system.css"), "utf8");
const homepageSource = await readFile(join(root, "src", "pages", "index.astro"), "utf8");
const masterSource = await readFile(join(root, "src", "components", "HomeMasterScene.astro"), "utf8");
const footerSource = await readFile(join(root, "src", "components", "SiteFooter.astro"), "utf8");
const consentSource = await readFile(join(root, "src", "components", "TrackingConsent.astro"), "utf8");
const mediaProvenance = JSON.parse(await readFile(join(root, "docs", "compliance", "media-provenance.json"), "utf8"));
const repairWorkspaceSource = await readFile(join(root, "src", "pages", "services", "hermes-connect", "repair-shops", "dashboard.astro"), "utf8");
const websiteShowroomSource = await readFile(join(root, "src", "components", "WebsiteDevelopmentShowroom.astro"), "utf8");
const socialStudioSource = await readFile(join(root, "src", "components", "BusinessSocialConnectionsWorkspace.astro"), "utf8");
const academyScreenFlowSource = await readFile(join(root, "src", "components", "AcademyScreenFlow.astro"), "utf8");
const academyHubSource = await readFile(join(root, "src", "pages", "services", "hermes-connect", "academy", "index.astro"), "utf8");
const head = html.split("</head>")[0] ?? html;

// Home remains an entrance, not a catalogue. Heavy showroom/technology feature CSS must not
// be loaded or deferred on the landing page when those sections are not rendered.
assert.equal(html.includes("data-product-feature-styles"), false, "focused homepage must not retain the old product-showroom deferred CSS template");
assert.equal(html.includes("data-home-technology-styles"), false, "focused homepage must not retain the old technology-preview deferred CSS template");
assert.equal(html.includes("data-product-feature-section"), false, "focused homepage must not render the old product showroom");
assert.equal(html.includes("data-home-technology-section"), false, "focused homepage must not render the old technology preview");
assert.equal(/\/_astro\/(?:load|product)\.[^"']+\.css/i.test(head), false, "load/product CSS must not block the focused homepage");
assert.equal(/\/_astro\/technology\.[^"']+\.css/i.test(head), false, "technology feature CSS must not block the focused homepage");

// Approved: one Hermes system, four direct operating directions.
assert.ok(homepageSource.includes('import HomeMasterScene from "../components/HomeMasterScene.astro"'), "homepage must use the Approved master scene");
assert.ok(homepageSource.includes("<HomeMasterScene />"), "homepage must render the Approved master scene");
assert.equal(homepageSource.includes("HomeFourRooms"), false, "homepage must not retain the superseded four-room entrance");
assert.equal(homepageSource.includes("HomeRoleRouter"), false, "homepage must not restore a competing role router");
assert.equal(homepageSource.includes("WebsiteProofBand"), false, "homepage must not restore the product showroom");
assert.equal(homepageSource.includes("HomeTechnologyPreview"), false, "homepage must not restore the technology chooser");

assert.ok(masterSource.includes('class="home-master-stage"'), "Approved entrance must expose one connected system stage");
assert.ok(masterSource.includes("publicPaths.map"), "all four public Hermes directions must come from the canonical path registry");
assert.ok(masterSource.includes("logistics:") && masterSource.includes("marketing:") && masterSource.includes("academy:") && masterSource.includes("technology:"), "four directions must retain distinct operating intents");
for (const signal of [
  "Car hauling · dealers · shippers · carriers",
  "Website · SEO/GEO · customer acquisition",
  "CRM · automation · custom software",
  "Logistics · marketing · IT/AI · sales · operations",
]) {
  assert.ok(masterSource.includes(signal), `homepage master scene must preserve commercial intent signal: ${signal}`);
}

for (const token of ["var(--hermes-logistics)", "var(--hermes-marketing)", "var(--hermes-technology)", "var(--hermes-academy)"]) {
  assert.ok(masterSource.includes(token), `homepage directions must consume canonical semantic token ${token}`);
}
for (const duplicateHex of ["#1E88FF", "#00C853", "#FF7A00", "#7C5CFF"]) {
  assert.equal(masterSource.includes(duplicateHex), false, `homepage must not locally own canonical direction color ${duplicateHex}`);
}

assert.ok(
  homepageSource.includes("U.S. car hauling, carrier, dealer and shipper logistics plus website development, SEO/GEO, CRM automation"),
  "homepage metadata must preserve the three priority revenue intent families",
);
assert.ok(masterSource.includes("prefers-reduced-motion"), "master-scene motion must respect reduced-motion preferences");
assert.ok(masterSource.includes(":focus-visible"), "master-scene navigation must preserve keyboard focus treatment");
assert.ok(masterSource.includes("car-hauler-768.webp 768w"), "mobile LCP image must expose a right-sized 768px candidate");
assert.equal(masterSource.includes('data-home-motion="truck"'), false, "Logistics must not restore a duplicate standalone mini-truck motion layer");
assert.equal(masterSource.includes('/images/home-20261001/truck.webp'), false, "Home runtime must not load the retired standalone mini-truck asset");
assert.equal(masterSource.includes("home-moving-truck"), false, "Logistics must remain one coherent primary scene without a second tiny truck overlay");
assert.equal(masterSource.includes("home-moving-leaves"), false, "Marketing must not restore unrelated decorative leaves");
assert.equal(masterSource.includes("home-story-board"), false, "Marketing must not restore competing mock-card decoration");
assert.ok(masterSource.includes("data-home-marketing-journey"), "Marketing must carry the selected self-contained attention-to-inquiry scene");
assert.ok(masterSource.includes("data-home-marketing-human"), "Marketing must retain a real human/content-creation story anchor behind the causal UI flow");
assert.ok(masterSource.includes("/images/home-20261001/marketing-512.avif"), "Marketing human anchor must use the existing responsive approved AVIF asset");
assert.ok(masterSource.includes("/images/home-20261001/marketing-512.webp"), "Marketing human anchor must keep a WebP fallback");
const marketingHumanAsset = mediaProvenance.assets.find((asset) => asset.path === "public/images/home-20261001/marketing-512.webp");
assert.ok(marketingHumanAsset, "Marketing human anchor must remain registered in media provenance");
assert.equal(marketingHumanAsset.provenanceStatus, "SOURCE_AND_RIGHTS_VERIFIED", "Marketing human anchor reuse requires verified source/rights");
assert.equal(marketingHumanAsset.publicationDecision, "CURRENT_USE_ALLOWED", "Marketing human anchor reuse requires current publication approval");
for (const stage of ["01 / CONTENT", "02 / DISCOVERY", "03 / WEBSITE", "04 / INQUIRY"]) {
  assert.ok(masterSource.includes(stage), `Marketing living scene must preserve causal stage: ${stage}`);
}
assert.ok(masterSource.includes("data-journey-motion"), "Marketing animation must expose a pausable motion state");
assert.ok(masterSource.includes("prefers-reduced-motion: reduce"), "Marketing motion must provide a static reduced-motion fallback");
assert.equal(masterSource.includes("LIVE PILOT"), false, "Home Technology must not use a release-status slogan in place of a real product surface");
assert.equal(masterSource.includes("<strong>BUILDING</strong>"), false, "Home Technology must not imply a generic build state without product evidence");
for (const [sourceToken, homeToken] of [
  ["Shop Owner Workspace", "SHOP OWNER WORKSPACE"],
  ["Services", "Services"],
  ["Booking inbox", "Booking inbox"],
  ["Catalog inquiries", "Catalog inquiries"],
]) {
  assert.ok(repairWorkspaceSource.includes(sourceToken), `Repair Shop product source must own Technology token: ${sourceToken}`);
  assert.ok(masterSource.includes(homeToken), `Home Technology must reuse real Repair Shop UI token: ${homeToken}`);
}
for (const token of ["Semantic HTML", "Responsive", "Canonical", "Schema", "Production readback"]) {
  assert.ok(websiteShowroomSource.includes(token), `Website showroom source must own Technology token: ${token}`);
}
for (const token of ["Social Studio", "Instagram", "Facebook", "Threads", "provider authorization", "provider readback"]) {
  assert.ok(socialStudioSource.includes(token), `Social Studio source must own Technology token: ${token}`);
}
for (const route of ["/services/hermes-connect/repair-shops/dashboard/", "/services/website-development/", "/services/hermes-connect/repair-shops/social/"]) {
  assert.ok(masterSource.includes(`data-tech-source="${route}"`), `Home Technology must retain source boundary: ${route}`);
}
for (const token of ["Practice before consequence", "Human feedback", "Retry", "Human progression gate"]) {
  assert.ok(academyScreenFlowSource.includes(token), `Academy learning source must own Home progression token: ${token}`);
}
for (const token of ["evidence submission", "reviewer feedback/correction", "human progression decision"]) {
  assert.ok(academyHubSource.includes(token), `Academy Hub must preserve human-reviewed boundary: ${token}`);
}
assert.ok(masterSource.includes('data-academy-source="/services/hermes-connect/academy/"'), "Home Academy must declare its current product source");
for (const token of ["TASK + PRACTICE", "Practice before consequence", "HUMAN FEEDBACK", "RETRY", "PROGRESSION", "Human decision", "not automatic"]) {
  assert.ok(masterSource.includes(token), `Home Academy must expose reviewed-progression token: ${token}`);
}
assert.equal(masterSource.includes("home-academy-book"), false, "Home Academy must not restore the book as the central interface");
const academyHumanAsset = mediaProvenance.assets.find((asset) => asset.path === "public/images/home-20261001/academy-512.webp");
assert.ok(academyHumanAsset, "Academy human anchor must remain registered in media provenance");
assert.equal(academyHumanAsset.provenanceStatus, "SOURCE_AND_RIGHTS_VERIFIED", "Academy human anchor reuse requires verified source/rights");
assert.equal(academyHumanAsset.publicationDecision, "CURRENT_USE_ALLOWED", "Academy human anchor reuse requires current publication approval");
for (const token of ["SHOP OWNER WORKSPACE", "Booking inbox", "Catalog inquiries", "SEMANTIC BUILD", "Responsive", "Canonical", "Schema", "OWNER AUTHORIZATION", "provider readback", "RELEASE EVIDENCE", "390 / 1440", "deploy ≠ live until readback"]) {
  assert.ok(masterSource.includes(token), `Home Technology must expose real-product proof token: ${token}`);
}
assert.equal(masterSource.includes('loading={path.id === "marketing" ? "eager" : "lazy"}'), false, "only the true LCP image should be eager on mobile");
assert.equal(masterSource.includes("void preloadScene(next)"), false, "homepage must not download the next logistics scene before it is displayed");
assert.equal(masterSource.trim().includes("applyScene();\n    update();"), false, "initial logistics artwork must not be decoded twice before rotation starts");

for (const href of ["/paths/logistics/", "/paths/marketing/", "/paths/academy/", "/paths/technology/"]) {
  assert.ok(html.includes(`href="${href}"`), `homepage must link directly to ${href}`);
}

// Canonical Hermes brand tokens remain available to Home and all direction pages.
assert.ok(brandCss.includes("--hermes-pearl: #f7f6f3"), "master brand system must retain canonical Pearl");
assert.ok(brandCss.includes("--hermes-obsidian: #0b0d12"), "master brand system must retain canonical Obsidian");
assert.ok(brandCss.includes("--hermes-violet: #7c5cff"), "master brand system must retain canonical Intelligence Violet");
assert.ok(brandCss.includes("--hermes-ocean: #5ac8fa"), "master brand system must retain canonical Ocean support color");

// Shared navigation/privacy infrastructure remains unchanged by the Approved entrance.
assert.ok(footerSource.includes('class="footer-primary-nav"'), "footer must preserve one canonical navigation DOM");
assert.equal(footerSource.includes('class="footer-mobile-groups"'), false, "footer must not duplicate navigation into a hidden mobile DOM");
assert.ok(/\.footer-primary-nav a\s*\{[\s\S]*?min-height:\s*44px/i.test(footerSource), "mobile footer links must retain at least 44px touch targets");
assert.ok(consentSource.includes("data-consent-accept"), "analytics allow action must remain present");
assert.ok(consentSource.includes("data-consent-decline"), "continue-without-analytics action must remain present");
assert.ok(consentSource.includes('href="/privacy/"'), "privacy policy link must remain present in consent UI");
assert.ok(consentSource.includes("analytics_storage: 'denied'"), "analytics storage must remain denied before explicit allow");
assert.ok(consentSource.includes("ad_personalization: 'denied'"), "advertising personalization must remain denied");

console.log("Approved Home Master Scene, shared Hermes brand, navigation, and privacy contract passed.");
