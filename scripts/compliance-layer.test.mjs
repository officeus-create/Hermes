import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

const privacy = await read("dist/privacy/index.html");
assert.match(privacy, /Privacy Policy &amp; Notice at Collection/);
assert.match(privacy, /Notice at Collection: categories and purposes/);
assert.match(privacy, /Retention and data minimization/);
assert.match(privacy, /Privacy rights and choices/);
assert.match(privacy, /California notice/);
assert.match(privacy, /International visitors/);

const choices = await read("dist/privacy-choices/index.html");
assert.match(choices, /Privacy Choices &amp; Requests/);
assert.match(choices, /Start a privacy request/);
assert.match(choices, /access, correction, or deletion/i);
assert.match(choices, /Opt-out requests/);

const company = await read("dist/company-information/index.html");
assert.match(company, /Company Information/);
assert.match(company, /Hermes Logistics LLC/);
assert.match(company, /Other Hermes directions/);
assert.match(company, /Before payment or signing/);

const homepage = await read("dist/index.html");
assert.match(homepage, /href="\/privacy-choices\/"/);
assert.match(homepage, /href="\/company-information\/"/);
assert.match(homepage, /href="\/privacy\/"/);
assert.match(homepage, /href="\/terms\/"/);

console.log("Compliance layer checks passed: privacy disclosures, choices, company identity, and footer discovery are present.");
