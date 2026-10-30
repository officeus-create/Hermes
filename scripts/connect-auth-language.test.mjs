import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Connect sign-in pages must stay complete in English, Russian and Ukrainian (owner directive 2026-10-28).
const root = "../src/pages/services/hermes-connect/";
const read = (path) => readFileSync(new URL(root + path, import.meta.url), "utf8");
const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join();

// Pages with an inline `uk:` / `ru:` / `en:` object literal (keys written as name:"...").
for (const path of ["access/index.astro", "academy/auth/index.astro", "academy/business/auth/index.astro"]) {
  const source = read(path);
  const block = (lang, next) => source.match(new RegExp(`\\n\\s+${lang}: \\{([\\s\\S]*?)\\n\\s+\\}${next}`))?.[1] ?? "";
  const keys = (body) => [...body.matchAll(/(?:^|[\s,{])(\w+):"/g)].map((m) => m[1]).sort();
  const en = keys(block("en", ""));
  assert.ok(en.length > 15, `${path}: English dictionary must be found`);
  for (const lang of ["ru", "uk"]) {
    const body = block(lang, ",");
    assert.ok(body, `${path}: ${lang} dictionary must exist`);
    const have = new Set(keys(body));
    const missing = en.filter((key) => !have.has(key));
    // Ukrainian predates this check; Russian must be complete.
    if (lang === "ru") assert.deepEqual(missing, [], `${path}: ru is missing keys`);
  }
  assert.match(source, /=== "ru"/, `${path}: must select Russian`);
}

// The access page explains where registration is and keeps the header Sign in useful.
const access = read("access/index.astro");
assert.match(access, /id="new-business"/);
assert.match(access, /data-i18n="noAccountLink"/);
assert.match(access, /closest\?\.\("\[data-hermes-sign-in\]"\)/);
for (const key of ["noAccount", "noAccountLink"]) assert.equal((access.match(new RegExp(`${key}:"`, "g")) ?? []).length, 3, `${key} must exist in uk, ru and en`);

// Home Services access carries its own dictionary: ru and uk must match each other and every hook.
const hs = read("home-services/access/index.astro");
const dict = JSON.parse(hs.match(/const DICT = (\{.*?\});\n\s+const EN_MSG/s)[1]);
const enMsg = JSON.parse(hs.match(/const EN_MSG = (\{.*?\});\n/s)[1]);
assert.deepEqual(Object.keys(dict.ru).sort(), Object.keys(dict.uk).sort(), "home-services: ru and uk keys must match");
for (const lang of ["ru", "uk"]) {
  for (const [key, value] of Object.entries(dict[lang])) {
    assert.ok(value.trim(), `home-services ${lang}.${key} must not be empty`);
    if (enMsg[key]) assert.equal(placeholders(value), placeholders(enMsg[key]), `home-services ${lang}.${key} placeholders`);
  }
}
const hooks = new Set([...hs.matchAll(/data-i18n="(\w+)"/g)].map((m) => m[1]));
assert.ok(hooks.size > 25, "home-services: i18n hooks must be present");
for (const key of hooks) assert.ok(dict.ru[key], `home-services: hook ${key} must resolve in ru and uk`);
for (const key of new Set([...hs.matchAll(/\bT\("(\w+)"/g)].map((m) => m[1]))) assert.ok(dict.ru[key] && enMsg[key], `home-services: message ${key} must be translated`);
assert.match(hs, /\/api\/auth\/register/);
// The shared Google button follows the page language for its divider, status and error copy.
const google = readFileSync(new URL("../src/components/HermesGoogleSignIn.astro", import.meta.url), "utf8");
const errorKeys = (lang) => {
  const block = google.match(new RegExp(`\\n    ${lang}: \\{[\\s\\S]*?errors: \\{([\\s\\S]*?)\\n      \\},`))?.[1] ?? "";
  return [...block.matchAll(/(\w+): "/g)].map((m) => m[1]).sort();
};
assert.ok(errorKeys("en").length >= 5, "google: English error copy must be found");
for (const lang of ["ru", "uk"]) assert.deepEqual(errorKeys(lang), errorKeys("en"), `google: ${lang} must translate every error code`);
assert.match(google, /divider: "или продолжите по email"/);
assert.match(google, /divider: "або продовжте через email"/);
console.log("connect-auth-language: access, academy, academy business and home services complete in RU; home services UK complete.");
