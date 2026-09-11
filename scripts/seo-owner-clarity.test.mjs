import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const niche = await readFile(new URL("../src/data/digital-niche-service-pages.ts", import.meta.url), "utf8");
const general = await readFile(new URL("../src/data/digital-service-pages.ts", import.meta.url), "utf8");

assert.match(niche, /title: "SEO for Logistics Companies \| Trucking SEO \| Hermes"/);
assert.match(niche, /description: "SEO for logistics companies, trucking and transportation teams:/);
assert.match(general, /Logistics, trucking and transportation SEO intent belongs to \/services\/seo-for-logistics-companies\//);
assert.doesNotMatch(general, /title: "Logistics[^\n]+SEO/);

console.log("SEO owner clarity contract passed.");
