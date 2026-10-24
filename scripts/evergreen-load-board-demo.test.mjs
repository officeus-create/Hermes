import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const htmlPath = path.resolve("dist/load-board/index.html");
const html = await fs.readFile(htmlPath, "utf8");

for (const label of [
  "8 AM–2 PM",
  "Flexible pickup",
  "Appointment required",
  "2-day pickup window",
]) {
  assert.ok(html.includes(label), `Built Load Board HTML is missing evergreen label: ${label}`);
}

assert.equal((html.match(/<dt>Status<\/dt><dd>PREVIEW · NOT LIVE<\/dd>/g) ?? []).length, 4);
assert.match(html, /External public source · verify availability/);
assert.match(html, /Open source & verify/);
assert.match(html, /Atlantic Logistics/);
assert.match(html, /FreightFinder public search/);
const discoveryStart = html.indexOf('id="public-discovery"');
const discoveryEnd = html.indexOf('id="available-loads"', discoveryStart);
assert.ok(discoveryStart >= 0 && discoveryEnd > discoveryStart, "Public discovery section must render before preview inventory");
const discoveryHtml = html.slice(discoveryStart, discoveryEnd);
assert.equal((discoveryHtml.match(/data-public-discovery-load/g) ?? []).length, 10);
assert.doesNotMatch(discoveryHtml, /tel:|mailto:/i, "Public discovery must not expose broker contact links");
assert.doesNotMatch(html, /Jul\s+2[2-6]/i);
assert.doesNotMatch(html, /\b\d+\s*(?:min|hr)s?\s+ago\b/i);

console.log("Evergreen Load Board build-output checks passed: crawler-visible HTML contains no stale or live-looking preview timing.");
