import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../dist/demos/lane-intelligence/index.html", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive"/);
assert.match(html, /Lane Intelligence — synthetic read-only preview/);
assert.match(html, /No real operations are connected/);
assert.match(html, /No hidden AI score/);
assert.match(html, /Verification never becomes publication automatically/);
assert.match(html, /Published — explicit approval required/);
assert.match(html, /SYN-LI-001/);
assert.match(html, /SYN-LI-002/);
assert.match(html, /SYN-LI-003/);
assert.equal((html.match(/class="lane-card"/g) ?? []).length, 3);
assert.equal(/<form\b/i.test(html), false, "The read-only preview must not contain a form");
assert.equal(/OFFICE 374/i.test(html), false, "The demo must not name the private example sheet");
assert.equal(sitemap.includes("/demos/lane-intelligence/"), false, "Noindex prototype must stay out of the sitemap");

console.log("Lane Intelligence synthetic preview checks passed.");
