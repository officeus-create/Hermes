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
  "U.S. logistics · sales · marketing · operations",
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
assert.ok(masterSource.includes("leaves-160.webp 160w"), "decorative leaves must expose a right-sized mobile candidate");
assert.ok(masterSource.includes("leaves-256.webp 256w"), "decorative leaves must expose an intermediate high-density candidate");
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
