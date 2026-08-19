import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
let completed = 0;

const task = (name, fn) => {
  try {
    fn();
    completed += 1;
  } catch (error) {
    error.message = `SEO 100-task batch failed at task ${completed + 1}: ${name}\n${error.message}`;
    throw error;
  }
};

const routeFile = (route) => route === "/"
  ? join(dist, "index.html")
  : join(dist, route.replace(/^\//, "").replace(/\/$/, ""), "index.html");

const htmlByRoute = new Map();
for (const route of [
  "/",
  "/paths/logistics/",
  "/paths/marketing/",
  "/paths/academy/",
  "/paths/technology/",
  "/services/seo/",
  "/services/local-seo/",
  "/services/seo-for-logistics-companies/",
  "/services/seo-for-independent-auto-dealers/",
  "/services/website-development/",
  "/services/hermes-connect/",
  "/services/hermes-connect/repair-shops/",
  "/logistics/car-hauling-dispatch/",
  "/logistics/dealer-vehicle-transportation/",
  "/logistics/auction-vehicle-pickup/",
  "/logistics/request-vehicle-transport/",
  "/logistics/resources/",
  "/academy/us-logistics-operations/",
  "/academy/marketing/",
  "/ua/academy/us-logistics-operations/",
]) {
  htmlByRoute.set(route, await readFile(routeFile(route), "utf8"));
}

const visibleText = (html) => html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();

// Tasks 1-80: four durable crawl/content invariants for twenty commercial/public owners.
for (const [route, html] of htmlByRoute) {
  task(`${route} generated output exists`, () => assert.ok(html.length > 200, `${route} output is unexpectedly small`));
  task(`${route} has a non-empty title`, () => assert.match(html, /<title>\s*[^<]{3,}\s*<\/title>/i));
  task(`${route} has one canonical`, () => {
    const canonicals = [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
    assert.equal(canonicals.length, 1, `${route} must expose exactly one canonical link`);
  });
  task(`${route} has a visible H1`, () => assert.match(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/i));
}

const home = htmlByRoute.get("/");
const logistics = htmlByRoute.get("/paths/logistics/");
const marketing = htmlByRoute.get("/paths/marketing/");
const academy = htmlByRoute.get("/paths/academy/");
const technology = htmlByRoute.get("/paths/technology/");
const repair = htmlByRoute.get("/services/hermes-connect/repair-shops/");
const logisticsProgram = visibleText(htmlByRoute.get("/academy/us-logistics-operations/"));
const marketingProgram = visibleText(htmlByRoute.get("/academy/marketing/"));
const uaLogisticsHtml = htmlByRoute.get("/ua/academy/us-logistics-operations/");
const uaLogisticsProgram = visibleText(uaLogisticsHtml);

// Tasks 81-100: business ownership, localization, eligibility and publication-boundary checks.
task("homepage links to Logistics direction", () => assert.ok(home.includes('href="/paths/logistics/"')));
task("homepage links to Marketing direction", () => assert.ok(home.includes('href="/paths/marketing/"')));
task("homepage links to Academy direction", () => assert.ok(home.includes('href="/paths/academy/"')));
task("homepage links to Technology direction", () => assert.ok(home.includes('href="/paths/technology/"')));
task("Logistics owner links to car-hauling commercial owner", () => assert.ok(logistics.includes('/logistics/car-hauling-dispatch/')));
task("Marketing owner links to SEO service owner", () => assert.ok(marketing.includes('/services/seo/')));
task("Academy owner exposes U.S. Logistics Operations", () => assert.ok(academy.includes('U.S. Logistics Operations')));
task("Academy owner exposes Marketing", () => assert.ok(academy.includes('Marketing')));
task("Technology owner links to Hermes Connect", () => assert.ok(technology.includes('/services/hermes-connect/')));
task("Repair Shops owner keeps Founding Shop Plan price", () => assert.ok(visibleText(repair).includes('$99')));
task("Ukrainian Academy route declares html lang uk", () => assert.match(uaLogisticsHtml, /<html\b[^>]*lang=["']uk["']/i));
task("Ukrainian Academy route exposes English hreflang", () => assert.match(uaLogisticsHtml, /hreflang=["']en["']/i));
task("Ukrainian Academy route exposes Ukrainian hreflang", () => assert.match(uaLogisticsHtml, /hreflang=["']uk["']/i));
task("Ukrainian Academy route exposes x-default hreflang", () => assert.match(uaLogisticsHtml, /hreflang=["']x-default["']/i));
task("English Logistics program keeps B2+ requirement", () => assert.ok(logisticsProgram.includes('B2 level or higher')));
task("Ukrainian Logistics program keeps B2+ requirement", () => assert.ok(uaLogisticsProgram.includes('B2 або вище')));
task("Marketing program keeps Russian or Ukrainian workflow requirement", () => assert.ok(marketingProgram.includes('Russian or Ukrainian')));
task("Marketing program keeps local-market language advantage", () => assert.ok(marketingProgram.includes('Italian') && marketingProgram.includes('Spanish') && marketingProgram.includes('French') && marketingProgram.includes('German')));
task("Academy programs keep sanctions/compliance disclosure", () => assert.ok(/sanctions/i.test(logisticsProgram) && /sanctions/i.test(marketingProgram) && /санкц/i.test(uaLogisticsProgram)));
task("Academy eligibility remains nationality-neutral", () => assert.ok(logisticsProgram.includes('Nationality alone is not an automatic exclusion criterion') && uaLogisticsProgram.includes('громадянство не є автоматичною причиною відмови')));

assert.equal(completed, 100, `Expected exactly 100 SEO batch tasks, completed ${completed}`);
console.log(`SEO 100-task batch passed: ${completed}/100 production invariants verified.`);
