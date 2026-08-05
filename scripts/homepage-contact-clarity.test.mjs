import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pages = [
  ["en", "dist/index.html", "U.S. Logistics Sales"],
  ["uk", "dist/ua/index.html", "Продажі логістики США"],
  ["ru", "dist/ru/index.html", "Отдел продаж логистики США"],
  ["es", "dist/es/index.html", "Ventas de logística en EE. UU."],
  ["it", "dist/it/index.html", "Vendite logistica USA"],
  ["fr", "dist/fr/index.html", "Ventes logistiques aux États-Unis"],
];

for (const [locale, relativePath, phoneLabel] of pages) {
  const html = await readFile(path.join(root, relativePath), "utf8");
  assert.match(html, /href="tel:\+12623023626"/, `${locale} footer must expose the approved click-to-call route`);
  assert.ok(html.includes(phoneLabel), `${locale} footer must label the logistics department clearly`);
}

const homepage = await readFile(path.join(root, "dist/index.html"), "utf8");
assert.ok(
  homepage.includes("<title>Hermes | U.S. Logistics, Marketing, Academy &amp; AI Systems</title>"),
  "Homepage title must identify U.S. Logistics and AI Systems",
);
assert.ok(homepage.includes("officeus@hermeslogisticsus.com"), "Existing office email must remain available");

console.log("Homepage SEO title and global click-to-call contract passed.");
