import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const [robots, dispatchPage, reviewDraft, headers] = await Promise.all([
  readFile(join(root, "dist", "robots.txt"), "utf8"),
  readFile(join(root, "dist", "logistics", "car-hauling-dispatch", "index.html"), "utf8"),
  readFile(join(root, "dist", "contracts", "Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.html"), "utf8"),
  readFile(join(root, "dist", "_headers"), "utf8"),
]);

const attr = (html, name) => html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']+)["']`, "i"))?.[1] ?? "";
const title = (html) => html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "";

assert.equal(
  robots.includes("# BEGIN Cloudflare Managed content"),
  false,
  "the origin robots.txt must not copy Cloudflare's edge-managed block",
);
assert.equal(robots.includes("Content-Signal:"), false, "the origin robots.txt must not duplicate edge-managed Content-Signal directives");
assert.match(robots, /^User-agent: \*$/m);
assert.match(robots, /^Allow: \/$/m);
assert.match(robots, /^Sitemap: https:\/\/hermeslogisticsus\.com\/sitemapindex\.xml$/m);

const dispatchDescription = attr(dispatchPage, "description");
assert.ok(dispatchDescription.length >= 25 && dispatchDescription.length <= 160, `dispatch description must be 25-160 characters, got ${dispatchDescription.length}`);
assert.match(dispatchDescription, /Car hauling dispatch support for U\.S\. owner-operators and small fleets/);

const draftDescription = attr(reviewDraft, "description");
assert.ok(draftDescription.length >= 25 && draftDescription.length <= 160, `draft description must be 25-160 characters, got ${draftDescription.length}`);
assert.ok(title(reviewDraft).length <= 70, "review draft title must be no longer than 70 characters");
assert.match(attr(reviewDraft, "robots"), /noindex/i);
assert.match(headers, /\/contracts\/\*\s+X-Robots-Tag: noindex, nofollow, noarchive/s);

console.log("Bing Webmaster hygiene contract passed.");
