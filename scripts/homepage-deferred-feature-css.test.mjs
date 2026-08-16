import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const html = await readFile(join(root, "dist", "index.html"), "utf8");
const performanceCss = await readFile(join(root, "src", "styles", "homepage-performance.css"), "utf8");
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

console.log("Homepage deferred feature CSS contract passed.");
