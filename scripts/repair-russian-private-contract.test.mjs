import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [layout, header, runtime, nav, dashboard, availability, customers, appointments] = await Promise.all([
  read("src/layouts/BaseLayout.astro"),
  read("src/components/SiteHeader.astro"),
  read("src/components/HermesConnectDomReady.astro"),
  read("src/components/RepairShopOwnerNavEnhancer.astro"),
  read("src/pages/services/hermes-connect/repair-shops/dashboard.astro"),
  read("src/pages/services/hermes-connect/repair-shops/availability.astro"),
  read("src/pages/services/hermes-connect/repair-shops/customers.astro"),
  read("src/pages/services/hermes-connect/repair-shops/appointments.astro"),
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

test("canonical private Repair destinations are owned by the shared locale-preserving CRM navigation", () => {
  for (const route of ["dashboard", "appointments", "customers", "availability"]) {
    assert.match(nav, new RegExp(`/services/hermes-connect/repair-shops/\\$\\{route\\}|${route}`), `shared CRM nav must own ${route}`);
  }
  assert.match(nav, /repairShopRoot.*appointments/s);
  assert.match(nav, /repairShopRoot.*customers/s);
  assert.match(nav, /repairShopRoot.*availability/s);
  assert.match(customers, /\/services\/hermes-connect\/repair-shops\/appointments\//);
  assert.match(appointments, /\/services\/hermes-connect\/repair-shops\/customers\//);
  assert.match(availability, /\/services\/hermes-connect\/repair-shops\/dashboard\//);
});

test("private route UI remains noindex while localization changes presentation only", () => {
  for (const source of [dashboard, availability, customers, appointments]) assert.match(source, /robots="noindex,nofollow"/);
  assert.doesNotMatch(runtime, /fetch\("\/api\/repair-shop\//, "localization runtime must not create a second Repair data path");
});
