import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const html = await readFile(join(root, "dist", "index.html"), "utf8");
const head = html.split("</head>")[0] ?? html;
const performanceCss = await readFile(join(root, "src/styles/homepage-performance.css"), "utf8");

assert.ok(html.includes("data-product-feature-styles"), "homepage must retain the inert deferred product-style template");
assert.ok(html.includes("data-product-feature-section"), "homepage must identify the below-fold product section for near-viewport loading");
assert.ok(html.includes("IntersectionObserver"), "homepage must load deferred product styles before the section reaches the viewport");
assert.ok(html.includes("1600px 0px"), "homepage deferred CSS should keep a generous prefetch margin");
assert.ok(html.includes("<noscript>"), "homepage must retain a no-JavaScript stylesheet fallback");
assert.equal(/\/_astro\/(?:load|product)\.[^"']+\.css/i.test(head), false, "load/product feature CSS must not remain render-blocking in the homepage head");

assert.ok(
  performanceCss.includes('.site-intro-rail[data-active="true"] {\n  flex-grow: .82;\n  transform: translateY(0);'),
  "passive SiteIntro direction changes must not resize or vertically translate the active rail",
);
assert.equal(
  performanceCss.includes("transition: flex-grow"),
  false,
  "homepage performance overrides must not animate SiteIntro flex-grow on the passive 5.2s cycle",
);

console.log("Homepage deferred feature CSS and stable SiteIntro geometry contract passed.");
