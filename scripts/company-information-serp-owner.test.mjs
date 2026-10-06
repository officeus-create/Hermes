import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("src/pages/company-information.astro", "utf8");
assert.match(page, /title="Hermes Logistics LLC Wisconsin \| Company Information"/);
assert.match(page, /description="Official company information for Wisconsin HERMES LOGISTICS, LLC, DFI entity H062724/);
assert.match(page, /h1="Hermes Logistics LLC — Company Information"/);
assert.match(page, /Wisconsin DFI legal entity name is Hermes Logistics, LLC/);
assert.match(page, /should not be inferred to be the same organization as an unrelated company/);
assert.match(page, /800 John Quincy Adams Rd/);
assert.match(page, /This website does not publish that address for Wisconsin HERMES LOGISTICS, LLC entity H062724/);
assert.match(page, /disambiguatingDescription/);
assert.match(page, /"@type": "FAQPage"/);
console.log("Company Information branded SERP/entity-disambiguation contract passed.");
