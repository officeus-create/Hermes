import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registry = await readFile(new URL("../src/data/academy-country-registry.ts", import.meta.url), "utf8");
const pipeline = await readFile(new URL("../src/data/academy-localization-pipeline.ts", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap-academy.xml", import.meta.url), "utf8");

assert.match(registry, /academyCountryRegistry\.length !== 110/, "country registry must fail closed unless exactly 110 markets exist");
for (const country of ["Vietnam", "Philippines", "Tajikistan", "Morocco", "Moldova", "Romania"]) {
  assert.match(registry, new RegExp(`\\b${country.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`), `${country} must exist in the Academy country registry`);
}
assert.match(registry, /localizationState: sample \? "launch_ready" : "planned"/, "only reviewed localized samples may become launch-ready");
assert.match(registry, /indexability: sample \? "public_localized" : "registry_only"/, "unlaunched countries must remain registry-only");
for (const stage of ["Approved source", "Privacy & rights", "Current-fact review", "Localization", "Native-language QA", "Publication approval"]) {
  assert.ok(pipeline.includes(stage), `localization pipeline must preserve ${stage}`);
}
for (const gate of ["sourceApproved", "sanitized", "currentFactsReviewed", "translated", "nativeQa", "publicationApproved"]) {
  assert.ok(pipeline.includes(`g.${gate}`), `publishable gate must require ${gate}`);
}
const locs = [...sitemap.matchAll(/<loc>https:\/\/hermeslogisticsus\.com\/academy\/countries\/([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(locs.length, 12, "Academy sitemap must expose exactly six localized country owners plus six English alternatives");
for (const slug of ["vietnam", "philippines", "tajikistan", "morocco", "moldova", "romania"]) {
  assert.ok(locs.includes(`${slug}/`), `${slug} localized owner missing from sitemap`);
  assert.ok(locs.includes(`${slug}/en/`), `${slug} English alternative missing from sitemap`);
}
console.log("Academy localization pipeline contract PASS: 110 registry markets, 6 localized launches, 12 sitemap owners, human publication gate.");
