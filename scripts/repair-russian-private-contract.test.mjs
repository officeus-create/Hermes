import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [layout, header, runtime, dashboard, availability, customers] = await Promise.all([
  read("src/layouts/BaseLayout.astro"),
  read("src/components/SiteHeader.astro"),
  read("src/components/HermesConnectDomReady.astro"),
  read("src/pages/services/hermes-connect/repair-shops/dashboard.astro"),
  read("src/pages/services/hermes-connect/repair-shops/availability.astro"),
  read("src/pages/services/hermes-connect/repair-shops/customers.astro"),
]);

test("Hermes Connect defaults clean entries to English while preserving explicit locale navigation", () => {
  assert.doesNotMatch(layout, /localStorage\.getItem\("hermes-connect-language"\)/);
  assert.doesNotMatch(layout, /window\.location\.replace\(`\$\{window\.location\.pathname\}/);
  assert.match(layout, /const active = requested && supported\.has\(requested\) \? requested : "en"/);
  assert.match(layout, /localStorage\.setItem\("hermes-connect-language", active\)/);
  assert.match(layout, /a\[href\^="\/services\/hermes-connect\/"\]:not\(\[lang\]\)/);
  assert.match(layout, /next\.searchParams\.set\("lang", active\)/);
});

test("Hermes Connect mobile language drawer is independently scrollable", () => {
  assert.match(header, /position:\s*fixed;/);
  assert.match(header, /max-height:\s*calc\(100dvh - 72px - env\(safe-area-inset-bottom\)\)/);
  assert.match(header, /overflow-y:\s*auto;/);
  assert.match(header, /-webkit-overflow-scrolling:\s*touch;/);
});

test("Repair private localization runtime is mounted once across Hermes Connect routes", () => {
  assert.match(header, /isHermesConnectRoute && <HermesConnectDomReady \/>/);
  assert.match(runtime, /const repairRoot = "\/services\/hermes-connect\/repair-shops"/);
  assert.match(runtime, /const withLocale = \(href\) =>/);
});

test("Russian Repair private copy covers dashboard, schedule, customers and dynamic states", () => {
  for (const phrase of [
    "Рабочее пространство владельца СТО",
    "Сохранить профиль СТО",
    "Управлять графиком",
    "Входящие записи",
    "Отправить приватный отзыв",
    "Сохранено",
    "Подтверждено",
    "В работе",
    "Завершено",
    "Отменено",
  ]) {
    assert.match(runtime, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing Russian private runtime phrase: ${phrase}`);
  }
});

test("canonical private Repair destinations remain inside the shared locale-preserving route family", () => {
  assert.match(dashboard, /\/services\/hermes-connect\/repair-shops\/customers\//);
  assert.match(dashboard, /\/services\/hermes-connect\/repair-shops\/availability\//);
  assert.match(availability, /\/services\/hermes-connect\/repair-shops\/dashboard\//);
  assert.match(customers, /\/services\/hermes-connect\/repair-shops\/dashboard\//);
});

test("private route UI remains noindex while localization changes presentation only", () => {
  for (const source of [dashboard, availability, customers]) assert.match(source, /robots="noindex,nofollow"/);
  assert.doesNotMatch(runtime, /fetch\("\/api\/repair-shop\//, "localization runtime must not create a second Repair data path");
});
