import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("src/pages/company-information.astro", "utf8");
assert.match(page, /title="Hermes Logistics LLC \| Company Information \| Hermes"/);
assert.match(page, /description="Company information for Hermes Logistics LLC on hermeslogisticsus\.com/);
assert.match(page, /Hermes Logistics LLC is the U\.S\. logistics business identified on this website/);
assert.match(page, /should not be inferred to be the same organization as an unrelated company/);
console.log("Company Information branded SERP owner contract passed.");
