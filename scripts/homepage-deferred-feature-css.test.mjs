import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const html = await readFile(join(root, "dist", "index.html"), "utf8");
const performanceCss = await readFile(join(root, "src", "styles", "homepage-performance.css"), "utf8");
const brandCss = await readFile(join(root, "src", "styles", "hermes-brand-system.css"), "utf8");
const homeShellCss = await readFile(join(root, "src", "styles", "hermes-home-shell.css"), "utf8");
const homepageSource = await readFile(join(root, "src", "pages", "index.astro"), "utf8");
const heroSource = await readFile(join(root, "src", "components", "HeroEditorial.astro"), "utf8");
const footerSource = await readFile(join(root, "src", "components", "SiteFooter.astro"), "utf8");
const consentSource = await readFile(join(root, "src", "components", "TrackingConsent.astro"), "utf8");
const head = html.split("</head>")[0] ?? html;

assert.ok(html.includes("data-product-feature-styles"), "homepage must retain the inert deferred product-style template");
assert.ok(html.includes("data-product-feature-section"), "homepage must identify the below-fold product section for near-viewport loading");
assert.ok(html.includes("data-home-technology-styles"), "homepage must retain the inert deferred technology-style template");
assert.ok(html.includes("data-home-technology-section"), "homepage must identify the below-fold technology section for near-viewport loading");
assert.ok(html.includes("IntersectionObserver"), "homepage must load deferred feature styles before their sections reach the viewport");
assert.ok(html.includes("1600px 0px"), "homepage deferred CSS should keep a generous prefetch margin");
assert.ok(html.includes("<noscript>"), "homepage must retain a no-JavaScript stylesheet fallback");

assert.equal(/\/_astro\/(?:load|product)\.[^"']+\.css/i.test(head), false, "load/product feature CSS must not remain render-blocking in the homepage head");
assert.equal(/\/_astro\/technology\.[^"']+\.css/i.test(head), false, "technology feature CSS must not remain render-blocking in the homepage head");

const showcaseRule = performanceCss.match(/\.product-showcase\s*\{([\s\S]*?)\}/)?.[1] ?? "";
assert.ok(showcaseRule.includes("content-visibility: visible"), "homepage product showcase must remain paintable during full-page capture and fast scroll");
assert.equal(/content-visibility\s*:\s*auto/i.test(showcaseRule), false, "homepage product showcase must not restore offscreen auto-paint suppression");
assert.equal(/contain-intrinsic-size\s*:\s*auto\s+3200px/i.test(performanceCss), false, "homepage must not reserve the historical 3200px blank product-showcase placeholder");

// Hermes brand tokens have one canonical source. Homepage-specific performance CSS may consume
// semantic tokens but must not redefine a competing palette.
assert.ok(brandCss.includes("--hermes-pearl: #f7f6f3"), "master brand system must define canonical Pearl");
assert.ok(brandCss.includes("--hermes-obsidian: #0b0d12"), "master brand system must define canonical Obsidian");
assert.ok(brandCss.includes("--hermes-violet: #7c5cff"), "master brand system must define canonical Intelligence Violet");
assert.ok(brandCss.includes("--hermes-ocean: #5ac8fa"), "master brand system must define canonical Ocean support color");
assert.equal(/--hermes-pearl\s*:/.test(performanceCss), false, "homepage performance CSS must not redefine Pearl");
assert.equal(/--hermes-obsidian\s*:/.test(performanceCss), false, "homepage performance CSS must not redefine Obsidian");
assert.equal(/--hermes-(?:intelligence-)?violet\s*:/.test(performanceCss), false, "homepage performance CSS must not redefine Intelligence Violet");
assert.equal(/--hermes-(?:intelligence-)?blue\s*:|--hermes-ocean\s*:/.test(performanceCss), false, "homepage performance CSS must not redefine the intelligence support blue/ocean token");
assert.ok(performanceCss.includes("var(--hermes-pearl)"), "homepage must consume canonical Pearl from the master system");
assert.ok(performanceCss.includes("var(--hermes-obsidian)"), "homepage must consume canonical Obsidian from the master system");

// Homepage design convergence: one Pearl public shell, one intelligence object, one clear situation-first entry.
assert.ok(homepageSource.includes('class="hermes-home-page"'), "homepage must expose the canonical home-shell root");
assert.ok(homepageSource.includes('import "../styles/hermes-home-shell.css"'), "homepage must load the dedicated Pearl shell layer");
assert.ok(heroSource.includes('class="home-hero-stage"'), "homepage hero must use an editorial stage rather than only a full-screen background image");
assert.ok(heroSource.includes('class="home-intelligence-knot"'), "homepage hero must include one Hermes intelligence object");
assert.equal(heroSource.includes('class="home-hero-system-card"'), false, "homepage hero must not repeat the ecosystem message in a competing floating card");
assert.equal(heroSource.includes('class="hero-letter-i"'), false, "homepage headline must avoid decorative letter gimmicks that compete with the commercial message");
assert.ok(heroSource.includes('href="#start"'), "homepage hero must route the primary journey into the situation-first decision");
assert.ok(homeShellCss.includes("var(--hermes-pearl)"), "homepage shell must consume master Pearl");
assert.ok(homeShellCss.includes("var(--hermes-obsidian)"), "homepage shell must consume master Obsidian");
assert.ok(homeShellCss.includes("var(--hermes-intelligence-gradient)"), "homepage shell must consume the master Intelligence gradient only for the intelligence hierarchy");
assert.ok(homeShellCss.includes(".home-role-card") && homeShellCss.includes("var(--hermes-radius-card)"), "homepage job-to-be-done cards must use the master card geometry");
assert.ok(homeShellCss.includes(".path-pillar::before") && homeShellCss.includes("--pillar-signal"), "business-direction colors must be reduced to supporting signals instead of separate surface systems");
assert.ok(/\.hero \.button-primary[\s\S]*?background:\s*var\(--hermes-obsidian\)/.test(homeShellCss), "homepage primary hero action must be Obsidian, not the legacy magenta fill");
assert.equal(/\.hero \.button-primary[\s\S]*?background:\s*var\(--color-magenta-500\)/.test(homeShellCss), false, "homepage Pearl layer must not revive the legacy magenta primary action");
assert.ok(homeShellCss.includes("prefers-reduced-motion") && homeShellCss.includes("forced-colors"), "homepage branded motion must preserve accessibility fallbacks");

assert.ok(footerSource.includes('class="footer-primary-nav"'), "footer must preserve one canonical navigation DOM");
assert.equal(footerSource.includes('class="footer-mobile-groups"'), false, "footer must not duplicate navigation into a second hidden mobile DOM");
assert.ok(/\.footer-primary-nav\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/i.test(footerSource), "mobile footer navigation must compact into two columns");
assert.ok(/\.footer-primary-nav a\s*\{[\s\S]*?min-height:\s*44px/i.test(footerSource), "mobile footer links must retain at least 44px touch targets");
assert.ok(/\.footer-contacts a,[\s\S]*?\.footer-social a\s*\{[\s\S]*?min-height:\s*44px/i.test(footerSource), "mobile contact and social links must retain at least 44px touch targets");
assert.equal((footerSource.match(/\/logistics\/car-hauling-dispatch\//g) ?? []).length, 1, "footer source must not duplicate car-hauling navigation links across desktop/mobile DOMs");

assert.ok(consentSource.includes('data-consent-accept'), "analytics allow action must remain present");
assert.ok(consentSource.includes('data-consent-decline'), "continue-without-analytics action must remain present");
assert.ok(consentSource.includes('href="/privacy/"'), "privacy policy link must remain present in consent UI");
assert.ok(consentSource.includes('class="tracking-consent-copy"'), "consent copy must remain grouped separately from actions for compact layout");
assert.ok(consentSource.includes('if (root && main) main.before(root);'), "consent root must dock before main content instead of covering it on desktop");
assert.ok(/@media \(min-width: 701px\)[\s\S]*?\.tracking-consent-banner\s*\{[\s\S]*?position:\s*static/i.test(consentSource), "desktop consent must remain in normal document flow");
assert.ok(/@media \(min-width: 701px\)[\s\S]*?\.tracking-consent-banner\s*\{[\s\S]*?grid-template-columns:\s*minmax\(280px,\s*1fr\)\s+auto/i.test(consentSource), "desktop consent must remain a compact horizontal copy/actions bar");
assert.ok(/@media \(min-width: 701px\)[\s\S]*?\.tracking-consent-banner\s*\{[\s\S]*?width:\s*min\(960px,\s*100%\)/i.test(consentSource), "desktop consent must retain the bounded dock width");
assert.ok(/\.tracking-consent-actions \.button\s*\{[\s\S]*?min-height:\s*44px/i.test(consentSource), "consent actions must retain at least 44px touch targets");
assert.ok(consentSource.includes("analytics_storage: 'denied'"), "analytics storage must remain denied before explicit allow");
assert.ok(consentSource.includes("ad_personalization: 'denied'"), "advertising personalization must remain denied");

console.log("Homepage deferred feature, Pearl public shell, commercial hierarchy, and single-source Hermes brand-token contract passed.");
