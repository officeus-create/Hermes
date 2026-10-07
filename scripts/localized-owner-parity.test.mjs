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
const visibleText = (html) => html
  .replace(/<head\b[\s\S]*?<\/head>/gi, " ")
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z0-9#]+;/gi, " ")
  .replace(/\s+/g, " ")
  .toLowerCase();
const forbiddenVisibleJargon = {
  uk: [" owner ", "handoff", "follow-up", "baseline", "cohort", "eligibility", "connected-workspace", " review ", " progression ", " intake ", " advertising ", " website ", " release ", " production ", " demo "],
  ru: [" owner ", "handoff", "follow-up", "baseline", "cohort", "eligibility", "connected-workspace", " review ", " progression ", " intake ", " advertising ", " website ", " release ", " production ", " demo "],
  es: [" owner ", "handoff", "baseline", "connected-workspace", "eligibility", " intake ", " release ", " advertising ", " website "],
  it: [" owner ", "handoff", "eligibility", " production ", " review ", " progression "],
  fr: [" owner ", "handoff", "baseline", "connected-workspace", "eligibility", " intake ", " release ", " advertising ", " review "],
};
const forbiddenMetaJargon = {
  uk: ["owner-operators", "dispatch", "social media", "lead journey", "crm handoff"],
  ru: ["owner-operators", "dispatch", "social media", "lead journey", "crm handoff"],
  es: ["carriers", "owner-operators", "dispatch", "social media", "lead journey", "crm handoff"],
  it: ["carrier", "owner-operator", "dispatch", "advertising"],
  fr: ["owner-operators", "dispatch", "social media", "lead journey", "crm handoff", "analytics"],
};
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
    if (locale !== "en") {
      const visible = ` ${visibleText(html)} `;
      for (const jargon of forbiddenVisibleJargon[locale] ?? []) {
        assert.ok(!visible.includes(jargon), `${route} must not leak stale English jargon into visible localized copy: ${jargon.trim()}`);
      }
      const metaDescription = (html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
        ?? html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i)?.[1]
        ?? "").toLowerCase();
      for (const jargon of forbiddenMetaJargon[locale] ?? []) {
        assert.ok(!metaDescription.includes(jargon), `${route} meta description must stay language-pure: ${jargon}`);
      }
    }
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

const uaAcademy = readRoute("/ua/academy/");
assert.ok(uaAcademy.includes('href="/ua/academy/apply/"'), "Ukrainian Academy owner must link directly to the localized application owner");

const ruAcademy = readRoute("/ru/academy/");
assert.ok(ruAcademy.includes('href="/ru/academy/us-logistics-operations/"'), "Russian Academy owner must link to the Russian U.S. Logistics course owner");
const ruCourse = readRoute("/ru/academy/us-logistics-operations/");
assert.ok(ruCourse.includes("Курсы логистики США"), "Russian course owner must state the natural Russian logistics-course intent");
assert.ok(ruCourse.includes("Hermes"), "Russian course owner must identify Hermes");

console.log("localized owner parity: 24 direction owners + 6 Academy Logistics course owners verified");
