import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const en = readFileSync(new URL("../src/pages/investors/index.astro", import.meta.url), "utf8");
const ru = readFileSync(new URL("../src/pages/ru/investors/index.astro", import.meta.url), "utf8");
for (const [locale, source] of [["en", en], ["ru", ru]]) {
  assert.match(source, /robots="noindex,nofollow"/, locale + ": prevent indexing before release review");
  assert.match(source, /<main id="main-content"/, locale + ": main landmark");
  assert.match(source, /href="\/investors\/"/, locale + ": English language switch");
  assert.match(source, /href="\/ru\/investors\/"/, locale + ": Russian language switch");
  assert.match(source, /officeus@hermeslogisticsus\.com/, locale + ": verified contact destination");
  assert.doesNotMatch(source, /type="password"|<form|\$[0-9,]+\s*(?:ROI|return)/i, locale + ": no fake login or returns");
}
assert.match(ru, /htmlLang="ru"/);
assert.match(en, /not an offer to sell securities/i);
assert.match(ru, /не являются предложением ценных бумаг/i);
console.log("Investor Relations EN/RU static contract: PASS");
