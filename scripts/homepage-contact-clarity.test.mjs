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
  assert.match(html, /href="tel:\+12623023626"/, `${relativePath} must expose the approved click-to-call route`);
  assert.ok(html.includes("U.S. Logistics Sales"), `${relativePath} must label the footer logistics department clearly`);
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
  "The global footer phone must remain scoped to logistics routes even though the homepage already has a contextual logistics call action",
);

console.log("Homepage SEO title and logistics-scoped footer click-to-call contract passed.");
