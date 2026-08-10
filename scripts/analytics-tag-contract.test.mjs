import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layoutPath = path.join(root, "src/layouts/BaseLayout.astro");
const layout = fs.readFileSync(layoutPath, "utf8");

const measurementId = "G-RY26321PVW";
const loaderPattern = new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${measurementId}`, "g");
const configPattern = new RegExp(`gtag\\(['\"]config['\"],\\s*['\"]${measurementId}['\"]\\)`, "g");
const dataLayerInitPattern = /window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\]/g;
const gtmContainerPattern = /GTM-[A-Z0-9]+/g;

assert.equal((layout.match(loaderPattern) ?? []).length, 1, "Exactly one GA4 loader must be installed in BaseLayout.");
assert.equal((layout.match(configPattern) ?? []).length, 1, "Exactly one GA4 config call must be installed in BaseLayout.");
assert.equal((layout.match(dataLayerInitPattern) ?? []).length, 1, "Exactly one global dataLayer initialization must exist in BaseLayout.");
assert.equal((layout.match(gtmContainerPattern) ?? []).length, 0, "Do not add a parallel GTM container before #206 production verification approves it.");

const sourceFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(astro|ts|js|mjs)$/i.test(entry.name)) sourceFiles.push(absolute);
  }
};
walk(path.join(root, "src"));

let loaderCount = 0;
let configCount = 0;
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  loaderCount += (content.match(loaderPattern) ?? []).length;
  configCount += (content.match(configPattern) ?? []).length;
}

assert.equal(loaderCount, 1, "The source tree must contain only one GA4 loader installation.");
assert.equal(configCount, 1, "The source tree must contain only one GA4 config initialization.");

console.log("Analytics tag contract passed: single GA4 installation, no parallel GTM container.");
