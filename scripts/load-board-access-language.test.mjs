import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Load Board access is the carrier/dealer/shipper registration page: English, Russian and Ukrainian
// must stay complete (owner directive 2026-10-28), and no visible string may be left untranslated.
const source = readFileSync(new URL("../src/pages/services/hermes-connect/load-board/access/index.astro", import.meta.url), "utf8");
const dictSource = source.match(/const DICT = (\{.*?\});\n\s+const pickLang/s)?.[1];
assert.ok(dictSource, "page must embed its language dictionary");
const DICT = JSON.parse(dictSource);

assert.deepEqual(Object.keys(DICT).sort(), ["en", "ru", "uk"]);
const enKeys = Object.keys(DICT.en).sort();
for (const lang of ["ru", "uk"]) {
  assert.deepEqual(Object.keys(DICT[lang]).sort(), enKeys, `${lang} must define exactly the English keys`);
  for (const key of enKeys) {
    assert.ok(DICT[lang][key].trim().length > 0, `${lang}.${key} must not be empty`);
    const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join();
    assert.equal(placeholders(DICT[lang][key]), placeholders(DICT.en[key]), `${lang}.${key} must keep the same {placeholders}`);
  }
  // A translation identical to English means a string was forgotten (allowed: brand/format tokens).
  const allowedSame = new Set(["email", "authority", "f4", "f1s_", "kicker_"]);
  for (const key of enKeys) {
    if (DICT[lang][key] === DICT.en[key] && !allowedSame.has(key)) {
      assert.fail(`${lang}.${key} is still English: ${DICT.en[key]}`);
    }
  }
}

// Every data-i18n hook in the markup must resolve; every markup key is used by some node or by the script.
const hooks = [...source.matchAll(/data-i18n(?:-aria)?="(\w+)"/g)].map((match) => match[1]);
assert.ok(hooks.length > 50, "the page must carry its i18n hooks");
for (const key of new Set(hooks)) assert.ok(DICT.en[key], `markup hook ${key} must exist in the dictionary`);
const scriptKeys = [...source.matchAll(/\bT\('(\w+)'\s*[,)]/g)].map((match) => match[1]);
for (const key of new Set(scriptKeys)) assert.ok(DICT.en[key], `script key ${key} must exist in the dictionary`);
for (const key of ["e_existing_account_signin_required", "e_provider_identity_conflict"]) assert.ok(DICT.ru[key] && DICT.uk[key], `${key} must be translated`);

// Google button and the Google script follow the page language, not the browser.
assert.match(source, /gsi\/client\?hl=\$\{lang\}/);
assert.match(source, /locale: lang/);
// No raw API error code is shown for a wrong password.
assert.match(source, /error\.status === 401 \? T\('badLogin'\)/);
console.log(`load-board-access-language: ${enKeys.length} keys, EN/RU/UK complete, ${new Set(hooks).size} markup hooks resolve.`);
