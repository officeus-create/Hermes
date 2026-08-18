import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const html = await readFile(join(root, "dist", "index.html"), "utf8");
const brandCss = await readFile(join(root, "src", "styles", "hermes-brand-system.css"), "utf8");
const homepageSource = await readFile(join(root, "src", "pages", "index.astro"), "utf8");
const roomsSource = await readFile(join(root, "src", "components", "HomeFourRooms.astro"), "utf8");
const footerSource = await readFile(join(root, "src", "components", "SiteFooter.astro"), "utf8");
const consentSource = await readFile(join(root, "src", "components", "TrackingConsent.astro"), "utf8");
const head = html.split("</head>")[0] ?? html;

// Home is now an entrance, not a catalogue. Heavy showroom/technology feature CSS must not
// be loaded or deferred on the landing page when those sections are not rendered.
assert.equal(html.includes("data-product-feature-styles"), false, "focused homepage must not retain the old product-showroom deferred CSS template");
assert.equal(html.includes("data-home-technology-styles"), false, "focused homepage must not retain the old technology-preview deferred CSS template");
assert.equal(html.includes("data-product-feature-section"), false, "focused homepage must not render the old product showroom");
assert.equal(html.includes("data-home-technology-section"), false, "focused homepage must not render the old technology preview");
assert.equal(/\/_astro\/(?:load|product)\.[^"']+\.css/i.test(head), false, "load/product CSS must not block the focused homepage");
assert.equal(/\/_astro\/technology\.[^"']+\.css/i.test(head), false, "technology feature CSS must not block the focused homepage");

// One Hermes, four worlds.
assert.ok(homepageSource.includes('import HomeFourRooms from "../components/HomeFourRooms.astro"'), "homepage must use the four-room entrance");
assert.ok(homepageSource.includes("<HomeFourRooms />"), "homepage must render the four-room entrance");
assert.equal(homepageSource.includes("HomeRoleRouter"), false, "homepage must not restore a competing role router");
assert.equal(homepageSource.includes("WebsiteProofBand"), false, "homepage must not restore the product showroom");
assert.equal(homepageSource.includes("HomeTechnologyPreview"), false, "homepage must not restore the technology chooser");
assert.ok(roomsSource.includes('class="home-rooms-grid"'), "four-room entrance must expose one direction grid");
assert.ok(roomsSource.includes("publicPaths.map"), "all four public Hermes directions must come from the canonical path registry");
assert.ok(roomsSource.includes("logistics:") && roomsSource.includes("marketing:") && roomsSource.includes("academy:") && roomsSource.includes("technology:"), "four directions must retain distinct visual characters");
assert.ok(roomsSource.includes("prefers-reduced-motion"), "room motion must respect reduced-motion preferences");
assert.ok(roomsSource.includes(":focus-visible"), "room navigation must preserve keyboard focus treatment");

for (const href of ["/paths/logistics/", "/paths/marketing/", "/paths/academy/", "/paths/technology/"]) {
  assert.ok(html.includes(`href=\"${href}\"`), `homepage must link directly to ${href}`);
}

// Canonical Hermes brand tokens remain available to every room and internal direction page.
assert.ok(brandCss.includes("--hermes-pearl: #f7f6f3"), "master brand system must retain canonical Pearl");
assert.ok(brandCss.includes("--hermes-obsidian: #0b0d12"), "master brand system must retain canonical Obsidian");
assert.ok(brandCss.includes("--hermes-violet: #7c5cff"), "master brand system must retain canonical Intelligence Violet");
assert.ok(brandCss.includes("--hermes-ocean: #5ac8fa"), "master brand system must retain canonical Ocean support color");

// Shared navigation/privacy infrastructure remains unchanged by the visual recovery.
assert.ok(footerSource.includes('class="footer-primary-nav"'), "footer must preserve one canonical navigation DOM");
assert.equal(footerSource.includes('class="footer-mobile-groups"'), false, "footer must not duplicate navigation into a hidden mobile DOM");
assert.ok(/\.footer-primary-nav a\s*\{[\s\S]*?min-height:\s*44px/i.test(footerSource), "mobile footer links must retain at least 44px touch targets");
assert.ok(consentSource.includes('data-consent-accept'), "analytics allow action must remain present");
assert.ok(consentSource.includes('data-consent-decline'), "continue-without-analytics action must remain present");
assert.ok(consentSource.includes('href="/privacy/"'), "privacy policy link must remain present in consent UI");
assert.ok(consentSource.includes("analytics_storage: 'denied'"), "analytics storage must remain denied before explicit allow");
assert.ok(consentSource.includes("ad_personalization: 'denied'"), "advertising personalization must remain denied");

console.log("Focused four-room homepage, shared Hermes brand, navigation, and privacy contract passed.");
