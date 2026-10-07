import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, product] = await Promise.all([
  readFile(new URL("../src/pages/services/hermes-connect/access/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/index.astro", import.meta.url), "utf8"),
]);

test("Hermes Connect access routes one account into vertical-specific CRM", () => {
  assert.match(page, /Один вхід\. CRM — під ваш тип бізнесу\./);
  assert.match(page, /\/services\/hermes-connect\/repair-shops\/auth\/\?mode=register/);
  assert.match(page, /\/services\/hermes-connect\/academy\/business\/auth\/\?mode=register/);
  assert.match(page, /\/services\/hermes-connect\/academy\/auth\/\?mode=register/);
  assert.match(page, /accountDestination/);
  assert.match(page, /owned_businesses/);
  assert.match(page, /owned\.length === 1/);
  assert.match(page, /String\(owned\[0\]\.href\)/);
});

test("Access page defaults to English and retains explicit Ukrainian content", () => {
  assert.match(page, /htmlLang="en"/);
  assert.match(page, /locale="en"/);
  assert.match(page, /<SiteHeader\b/);
  assert.doesNotMatch(page, /<button[^>]*data-lang=/);
  assert.match(page, /hermes-connect-language/);
  assert.match(page, /window\.location\.assign/);
  assert.match(page, /url\.searchParams\.set\("lang", lang\)/);
});

test("Access page does not pretend unreleased verticals are registrable", () => {
  assert.match(page, /Beauty & Wellness/);
  assert.match(page, /Professional Services/);
  assert.match(page, /Готується/);
  assert.doesNotMatch(page, /href="[^"]*(beauty|professional)[^"]*"[^>]*data-route/);
});

test("Catalog publication remains separate from account registration", () => {
  assert.match(page, /не публікує бізнес у Catalog автоматично/);
  assert.match(page, /окремий opt-in/);
  assert.match(page, /Приватні CRM-дані не стають публічними/);
});


test("Hermes Connect product entry routes through the business-aware access page", () => {
  assert.match(product, /href="\/services\/hermes-connect\/access\/\?lang=uk"/);
  assert.match(product, /Choose business \/ Sign in/);
  assert.match(product, /href="\/services\/hermes-connect\/academy\/\?lang=uk"/);
});


test("clean access source renders English before runtime translation", () => {
  const markup = page.split("<script>")[0];
  assert.doesNotMatch(markup, /[\u0400-\u04ff]/);
  assert.match(markup, /Repair Shop is the current live pilot/);
  assert.match(markup, /does not confirm activation or customer results/);
  assert.match(markup, /robots="noindex,nofollow"/);
});
