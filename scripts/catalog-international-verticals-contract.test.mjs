import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read=(path)=>readFileSync(path,"utf8");

const registry=read("src/data/catalog-business-concepts.ts");
for (const marker of [
  'id: "catalog-ua-mangal-i-kazan"',
  'vertical: "restaurant"',
  'id: "catalog-ua-trimmo-ii"',
  'vertical: "barber_shop"',
  'id: "catalog-ua-tsvit-vyshni"',
  'vertical: "flower_shop"',
  'catalogPriority: "secondary"',
]) assert.ok(registry.includes(marker), `missing registry contract: ${marker}`);

const main=read("src/pages/businesses/index.astro");
assert.ok(main.includes('const usBusinesses = repairShopDirectory.filter((business) => business.country === "US")'),"main Catalog must explicitly keep U.S. profiles primary");
assert.ok(main.includes('href="/businesses/international/"'),"main Catalog must link the secondary international directory");
assert.ok(main.includes('{usBusinesses.map((business) => ('),"main Catalog business grid must render U.S. businesses, not the mixed registry");

const publicProfiles=[
  "src/pages/businesses/ukraine/chaiky/mangal-i-kazan.astro",
  "src/pages/businesses/ukraine/chaiky/trimmo-ii.astro",
  "src/pages/businesses/ukraine/irpin/tsvit-vyshni.astro",
];
for(const path of publicProfiles){
  assert.ok(existsSync(path),`missing public Catalog profile: ${path}`);
  const source=read(path);
  assert.ok(source.includes("CatalogWebsiteConcept"),`public profile must reuse Catalog Website Concept: ${path}`);
  assert.ok(!source.includes('robots="noindex'),`public Catalog profile must remain indexable: ${path}`);
}

const previews=[
  "src/pages/services/hermes-connect/demos/mangal-i-kazan.astro",
  "src/pages/services/hermes-connect/demos/trimmo-ii.astro",
  "src/pages/services/hermes-connect/demos/tsvit-vyshni.astro",
];
for(const path of previews){
  assert.ok(existsSync(path),`missing Hermes Connect vertical preview: ${path}`);
  const source=read(path);
  assert.ok(source.includes('robots="noindex,nofollow"'),`private/pre-claim CRM preview must stay noindex: ${path}`);
  assert.ok(source.includes("HermesConnectVerticalPreview"),`CRM preview must reuse the shared vertical renderer: ${path}`);
}

const sitemap=read("public/sitemap-business-directory.xml");
for(const route of [
  "/businesses/international/",
  "/businesses/ukraine/chaiky/mangal-i-kazan/",
  "/businesses/ukraine/chaiky/trimmo-ii/",
  "/businesses/ukraine/irpin/tsvit-vyshni/",
]) assert.ok(sitemap.includes(route),`sitemap missing route: ${route}`);

console.log("catalog international verticals contract: ok");
