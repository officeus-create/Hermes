import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const htmlPath = path.resolve("dist/load-board/index.html");
const html = await fs.readFile(htmlPath, "utf8");

for (const label of [
  "Demo day +1 · 8 AM–2 PM",
  "Demo day +2",
  "Demo day +3 · appointment",
  "Demo day +4–5",
]) {
  assert.ok(html.includes(label), `Built Load Board HTML is missing evergreen label: ${label}`);
}

assert.equal((html.match(/<dt>Status<\/dt><dd>Illustrative demo<\/dd>/g) ?? []).length, 4);
assert.doesNotMatch(html, /Jul\s+2[2-6]/i);
assert.doesNotMatch(html, /\b\d+\s*(?:min|hr)s?\s+ago\b/i);

console.log("Evergreen Load Board build-output checks passed: crawler-visible HTML contains no stale or live-looking demo timing.");
