import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/pages/news/google-measurement-tools-september-2026/index.astro", "utf8");
assert.match(page, /robots="noindex,nofollow"/, "News preview must remain non-indexable before owner release review.");
assert.match(page, /"@type": "NewsArticle"/, "News preview must expose NewsArticle structured data.");
assert.match(page, /datePublished: "2026-09-10"/, "Source publication date must remain explicit.");
assert.match(page, /blog\.google\/products\/ads-commerce\/data-strength-updates/, "Official Google source must remain cited.");
assert.match(page, /href=\{marketingHref\}/, "News brief must route to the existing Marketing intake owner.");
assert.match(page, /href=\{academyHref\}/, "News brief must offer the related Academy learning route.");
assert.match(page, /event: "content_cta_click"/, "Privacy-safe CTA measurement must remain explicit.");
for (const forbidden of ["email:", "phone:", "budget:", "message:"]) {
  assert.ok(!page.includes(forbidden), `Article analytics must not include ${forbidden}`);
}
console.log("News publishing preview contract passed.");
