import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const routes = [
  {
    route: "/services/website-development/",
    file: "services/website-development/index.html",
    title: "Website Development Services for U.S. Businesses | Hermes",
    h1: "Custom Website Development for U.S. Businesses",
    reviewedAt: "August 2, 2026",
    proofHref: "/case/it-development/",
    proofLabel: "View the website case",
    required: [
      "Business discovery",
      "Information architecture",
      "Logistics and operational website architecture",
      "Integrations and phased systems",
      "Can Hermes build a website for a logistics, trucking, dispatch, or freight-broker company?",
      "What should a logistics company website include?",
      "Does website development guarantee search rankings or leads?",
      "/services/seo-for-logistics-companies/",
      "/logistics/car-hauling-dispatch/",
    ],
  },
  {
    route: "/services/website-redesign/",
    file: "services/website-redesign/index.html",
    title: "Website Redesign Services for U.S. Businesses | Hermes",
    h1: "Website Redesign Built Around Business Priorities",
    reviewedAt: "July 31, 2026",
    proofHref: "/case/it-development/",
    proofLabel: "View the website case",
    required: ["Current-site review", "Migration architecture", "Can existing pages and search visibility be preserved?"],
  },
  {
    route: "/services/seo/",
    file: "services/seo/index.html",
    title: "SEO Services for U.S. Businesses | Hermes",
    h1: "SEO Services Built on Technical Quality and Useful Content",
    reviewedAt: "July 31, 2026",
    proofHref: "/case/appleton-vehicle-transport-seo/",
    proofLabel: "View the SEO case",
    required: ["Technical SEO review", "Search-intent architecture", "Can Hermes guarantee first-page rankings?"],
  },
  {
    route: "/services/local-seo/",
    file: "services/local-seo/index.html",
    title: "Local SEO Services for U.S. Businesses | Hermes",
    h1: "Local SEO for Real U.S. Service Areas and Customer Needs",
    reviewedAt: "July 31, 2026",
    proofHref: "/case/appleton-vehicle-transport-seo/",
    proofLabel: "View the SEO case",
    required: ["Eligibility and service-area review", "Google Business Profile support", "Do you create pages for every nearby city?"],
  },
];

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();
const tagText = (html, tag) => decode(html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");
const canonical = (html) => [...html.matchAll(/<link\b[^>]*>/gi)]
  .map((match) => match[0])
  .find((tag) => /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag))
  ?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
const schemaTypes = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    const values = Array.isArray(parsed) ? parsed : [parsed];
    return values.map((value) => value?.["@type"]);
  });

const sitemap = await readFile(join(dist, "sitemap-digital-services.xml"), "utf8");
const robots = await readFile(join(dist, "robots.txt"), "utf8");
const home = await readFile(join(dist, "index.html"), "utf8");

for (const page of routes) {
  const html = await readFile(join(dist, page.file), "utf8");
  assert.equal(tagText(html, "title"), page.title, `${page.route} title mismatch`);
  assert.equal(tagText(html, "h1"), page.h1, `${page.route} H1 mismatch`);
  assert.equal(canonical(html), `https://hermeslogisticsus.com${page.route}`, `${page.route} canonical mismatch`);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${page.route} must have one H1`);
  assert.ok(/name=["']description["']/i.test(html), `${page.route} description missing`);
  assert.ok(/name=["']robots["'][^>]*content=["']index,follow,max-image-preview:large["']/i.test(html), `${page.route} must be indexable`);
  assert.ok(/aria-label=["']Breadcrumb["']/i.test(html), `${page.route} visible breadcrumb missing`);
  assert.ok(html.includes('data-contact-mode="preview"'), `${page.route} contact must default to preview`);
  assert.ok(html.includes('href="mailto:officeus@hermeslogisticsus.com"'), `${page.route} approved IT email fallback missing`);
  assert.ok(!html.includes('href="tel:'), `${page.route} IT service page must remain email-only`);
  assert.ok(!/<form\b[^>]*action=/i.test(html), `${page.route} contains an unreviewed form action`);
  assert.ok(html.includes(`Scope reviewed ${page.reviewedAt}`), `${page.route} review date missing`);
  assert.ok(html.includes(`href="${page.proofHref}"`), `${page.route} proof link must match page intent`);
  assert.ok(html.includes(page.proofLabel), `${page.route} proof label must match page intent`);
  for (const required of page.required) assert.ok(html.includes(required), `${page.route} missing ${required}`);
  const types = schemaTypes(html);
  for (const requiredType of ["Service", "BreadcrumbList", "FAQPage"]) {
    assert.ok(types.includes(requiredType), `${page.route} missing ${requiredType} schema`);
  }
  assert.ok(sitemap.includes(`<loc>https://hermeslogisticsus.com${page.route}</loc>`), `${page.route} missing from digital sitemap`);
}

assert.ok(robots.includes("Sitemap: https://hermeslogisticsus.com/sitemap-digital-services.xml"));
assert.ok(home.includes('href="/services/website-development/"'), "homepage footer must link website development");
assert.ok(home.includes('href="/services/seo/"'), "homepage footer must link SEO services");

const serialized = routes.map((page) => page.required.join(" ")).join(" ").toLowerCase();
for (const prohibited of ["guaranteed rankings", "guaranteed leads", "guaranteed revenue", "guaranteed roi"]) {
  assert.ok(!serialized.includes(prohibited));
}

console.log("digital service page checks passed: four national hubs, intent-aligned proof, metadata, schema, sitemap, crawl paths, preview contact, and email-only routing.");
