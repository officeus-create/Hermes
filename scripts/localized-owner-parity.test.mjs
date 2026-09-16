import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  academyLogisticsOwnerRoutes,
  directionOwnerRoutes,
} from "../src/data/localized-direction-owners.ts";

const origin = "https://hermeslogisticsus.com";
const locales = ["en", "uk", "ru", "es", "it", "fr"];
const directions = ["logistics", "marketing", "academy", "technology"];
const distPath = (route) => join("dist", route.replace(/^\//, ""), "index.html");
const readRoute = (route) => readFileSync(distPath(route), "utf8");
const count = (text, needle) => text.split(needle).length - 1;
const allSitemaps = readdirSync("public")
  .filter((name) => /^sitemap.*\.xml$/.test(name))
  .map((name) => ({ name, text: readFileSync(join("public", name), "utf8") }));

for (const direction of directions) {
  const routes = Object.fromEntries(locales.map((locale) => [locale, directionOwnerRoutes[locale][direction]]));
  for (const locale of locales) {
    const route = routes[locale];
    const html = readRoute(route);
    assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${origin}${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), `${route} must self-canonicalize`);
    for (const alternateLocale of locales) {
      assert.ok(html.includes(`hreflang="${alternateLocale}"`) && html.includes(`href="${origin}${routes[alternateLocale]}"`), `${route} must expose ${alternateLocale} alternate`);
    }
    assert.ok(html.includes(`hreflang="x-default"`) && html.includes(`href="${origin}${routes.en}"`), `${route} must expose x-default`);
    assert.ok(/<h1[^>]*>/.test(html), `${route} must render an H1`);
    assert.equal(count(readFileSync("public/sitemap.xml", "utf8"), `<loc>${origin}${route}</loc>`), 1, `${route} must appear once in sitemap.xml`);
    for (const sitemap of allSitemaps.filter((item) => item.name !== "sitemap.xml")) {
      assert.equal(count(sitemap.text, `<loc>${origin}${route}</loc>`), 0, `${route} must not be duplicated in ${sitemap.name}`);
    }
  }
}

for (const locale of locales.filter((item) => item !== "en")) {
  const localeRoot = locale === "uk" ? "/ua/" : `/${locale}/`;
  const html = readRoute(localeRoot);
  for (const direction of directions) {
    assert.ok(html.includes(`href="${directionOwnerRoutes[locale][direction]}"`), `${localeRoot} must link to localized ${direction} owner`);
  }
}

const academySitemap = readFileSync("public/sitemap-academy.xml", "utf8");
for (const locale of locales) {
  const route = academyLogisticsOwnerRoutes[locale];
  const html = readRoute(route);
  assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${origin}${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), `${route} must self-canonicalize`);
  for (const alternateLocale of locales) {
    const alternateRoute = academyLogisticsOwnerRoutes[alternateLocale];
    assert.ok(html.includes(`hreflang="${alternateLocale}"`) && html.includes(`href="${origin}${alternateRoute}"`), `${route} must expose ${alternateLocale} course alternate`);
  }
  assert.equal(count(academySitemap, `<loc>${origin}${route}</loc>`), 1, `${route} must appear once in sitemap-academy.xml`);
  for (const sitemap of allSitemaps.filter((item) => item.name !== "sitemap-academy.xml")) {
    assert.equal(count(sitemap.text, `<loc>${origin}${route}</loc>`), 0, `${route} must not be duplicated in ${sitemap.name}`);
  }
}

const ruAcademy = readRoute("/ru/academy/");
assert.ok(ruAcademy.includes('href="/ru/academy/us-logistics-operations/"'), "Russian Academy owner must link to the Russian U.S. Logistics course owner");
const ruCourse = readRoute("/ru/academy/us-logistics-operations/");
assert.ok(ruCourse.includes("Курсы логистики США"), "Russian course owner must state the natural Russian logistics-course intent");
assert.ok(ruCourse.includes("Hermes"), "Russian course owner must identify Hermes");

console.log("localized owner parity: 24 direction owners + 6 Academy Logistics course owners verified");
