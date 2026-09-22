import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readBuiltPage = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const logisticsPages = [
  "dist/paths/logistics/index.html",
  "dist/logistics/car-hauling-dispatch/index.html",
  "dist/load-board/index.html",
];

for (const relativePath of logisticsPages) {
  const html = await readBuiltPage(relativePath);
  assert.doesNotMatch(html, /href="tel:/, `${relativePath} must not publish a phone route until a dedicated Logistics number is approved`);
  assert.match(html, /href="mailto:officeus@hermeslogisticsus\.com"/, `${relativePath} must expose the approved Logistics email route`);
}

const departmentEmailOnlyPages = [
  "dist/paths/marketing/index.html",
  "dist/paths/academy/index.html",
  "dist/paths/technology/index.html",
];

for (const relativePath of departmentEmailOnlyPages) {
  const html = await readBuiltPage(relativePath);
  assert.doesNotMatch(html, /href="tel:/, `${relativePath} must remain email-only outside the logistics context`);
}

const homepage = await readBuiltPage("dist/index.html");
assert.ok(
  homepage.includes("<title>Hermes | U.S. Logistics, Marketing, Academy &amp; AI Systems</title>"),
  "Homepage title must identify U.S. Logistics and AI Systems",
);
assert.ok(homepage.includes("officeus@hermeslogisticsus.com"), "Existing office email must remain available");
assert.ok(
  !homepage.includes("U.S. Logistics Sales · +1 (262) 302-3626"),
  "The retired phone must not appear in the global footer",
);

const about = await readBuiltPage("dist/about/index.html");
assert.ok(about.includes("officeus@hermeslogisticsus.com"), "About page must keep the approved public email route");
assert.ok(
  !about.includes("+1 (262) 302-3626"),
  "The retired Logistics phone must not appear on the About page",
);

console.log("Homepage title and email/form-only Logistics contact contract passed.");
