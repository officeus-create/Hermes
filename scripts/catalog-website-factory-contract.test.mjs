import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const entity = await readFile(new URL("../src/data/catalog-business-concepts.ts", import.meta.url), "utf8");
const renderer = await readFile(new URL("../src/components/CatalogWebsiteConcept.astro", import.meta.url), "utf8");
const helper = await readFile(new URL("../src/lib/catalog-website-factory.ts", import.meta.url), "utf8");

for (const token of ["published_unclaimed","public_indexable","semanticCore","factLabels","Google Maps","TikTok"]) {
  assert.ok(entity.includes(token), "Catalog entity missing " + token);
}
for (const token of ["Verified/public facts","Hermes proposed concept","Owner confirmation required","BUSINESS TRUTH · VERIFIED","HERMES OPPORTUNITY · PROPOSED"]) {
  assert.ok(renderer.includes(token), "Catalog renderer missing " + token);
}
for (const token of ["catalogConceptReadiness","catalogLeadAttribution","business_id","hermes_catalog","CATALOG_LIFECYCLE","own_domain_live"]) {
  assert.ok(helper.includes(token), "Website Factory helper missing " + token);
}
console.log("Catalog Website Factory batch-1 contract passed.");
