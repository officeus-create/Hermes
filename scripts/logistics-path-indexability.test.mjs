import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sitemap = await readFile(path.join(root, "public/sitemap.xml"), "utf8");
const lowEvidenceEquipmentRoutes = [
  "/paths/logistics/carriers/car-hauling/",
  "/paths/logistics/carriers/hotshot/",
  "/paths/logistics/carriers/box-truck/",
  "/paths/logistics/carriers/cargo-van/",
  "/paths/logistics/carriers/power-only/",
  "/paths/logistics/carriers/dry-van/",
  "/paths/logistics/carriers/reefer/",
  "/paths/logistics/carriers/flatbed/",
  "/paths/logistics/carriers/step-deck/",
];

for (const route of lowEvidenceEquipmentRoutes) {
  const htmlPath = path.join(root, "dist", route.replace(/^\//, ""), "index.html");
  const html = await readFile(htmlPath, "utf8");
  assert.match(html, /<meta name="robots" content="noindex,follow">/, `${route} must remain noindex,follow until distinct search evidence exists`);
  assert(!sitemap.includes(`https://hermeslogisticsus.com${route}`), `${route} must not remain in the sitemap while noindex`);
}

const protectedIndexableRoutes = [
  "/paths/logistics/carriers/owner-operators/",
  "/paths/logistics/carriers/fleet-owners/",
  "/paths/logistics/carriers/new-authority/",
  "/paths/logistics/carriers/direct-freight-development/",
  "/paths/logistics/brokers/carrier-capacity/",
  "/paths/logistics/customers/vehicle-transport/",
  "/paths/logistics/find-your-path/",
];

for (const route of protectedIndexableRoutes) {
  const htmlPath = path.join(root, "dist", route.replace(/^\//, ""), "index.html");
  const html = await readFile(htmlPath, "utf8");
  assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i, `${route} must remain indexable`);
  assert(sitemap.includes(`https://hermeslogisticsus.com${route}`), `${route} must remain in the sitemap`);
}

console.log("Logistics path indexability contract passed: low-evidence equipment variants are noindex,follow and excluded from sitemap.");
