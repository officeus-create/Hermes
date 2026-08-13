import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  digitalGrowthCtaVariants,
  digitalNicheResearch,
  evaluateDigitalNicheResearch,
} from "../src/data/digital-market-operations.ts";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const pages = [
  {
    route: "/services/seo-for-logistics-companies/",
    file: "services/seo-for-logistics-companies/index.html",
    title: "Logistics SEO Agency for Trucking & Transportation Companies | Hermes",
    h1: "Logistics SEO for Trucking, Transportation and Freight Companies",
    required: [
      "Commercial query-to-page ownership",
      "Trucking, transportation and warehousing content architecture",
      "Audience and service architecture",
      "Trucking, dispatch and freight-broker query map",
      "Logistics website SEO audit",
      "Starting-scope decision",
      "Choose the first engagement",
      "Search-to-qualified-inquiry measurement",
      "Current load-board offers are private observations",
      "No universal package, price or implementation volume",
      "Is Hermes a logistics SEO agency for trucking and transportation companies?",
      "Do trucking SEO, transportation SEO and warehousing SEO need separate pages?",
      "Does Hermes provide SEO for trucking and dispatch companies?",
      "What is the smallest useful starting scope?",
      "Can the project begin with an audit only?",
      "Can shipment history be used for SEO pages?",
      "/logistics/car-hauling-dispatch/",
      "/logistics/dealer-vehicle-transportation/",
    ],
  },
  {
    route: "/services/seo-for-independent-auto-dealers/",
    file: "services/seo-for-independent-auto-dealers/index.html",
    title: "SEO for Independent & Used Car Dealers | Hermes",
    h1: "SEO for Independent and Used Car Dealers",
    required: [
      "Independent dealer search architecture",
      "Inventory-page SEO audit",
      "Local eligibility and market foundation",
      "Mobile search-to-inquiry path",
      "Inventory, pricing, availability, condition, financing",
      "What is included in a car dealership SEO audit?",
      "Can SEO work with a third-party dealer inventory feed?",
      "/logistics/dealer-vehicle-transportation/",
      "/logistics/resources/auction-vehicle-pickup-checklist/",
    ],
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
const parseSchema = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });

const sitemap = await readFile(join(dist, "sitemap-digital-services.xml"), "utf8");
const seoHub = await readFile(join(dist, "services/seo/index.html"), "utf8");

for (const page of pages) {
  const html = await readFile(join(dist, page.file), "utf8");
  assert.equal(tagText(html, "title"), page.title, `${page.route} title mismatch`);
  assert.equal(tagText(html, "h1"), page.h1, `${page.route} H1 mismatch`);
  assert.equal(canonical(html), `https://hermeslogisticsus.com${page.route}`, `${page.route} canonical mismatch`);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${page.route} must have one H1`);
  assert.ok(html.includes('data-contact-mode="preview"'), `${page.route} must remain preview-first`);
  assert.ok(html.includes('href="mailto:officeus@hermeslogisticsus.com"'), `${page.route} approved email fallback missing`);
  assert.ok(!html.includes('href="tel:'), `${page.route} must remain email-only`);
  assert.ok(/aria-label=["']Breadcrumb["']/i.test(html), `${page.route} breadcrumb missing`);
  assert.ok(html.includes('href="/case/appleton-vehicle-transport-seo/"'), `${page.route} must link the SEO case in the hero`);
  assert.ok(html.includes("View the SEO case"), `${page.route} must label the proof as an SEO case`);
  assert.ok(!html.includes('href="/case/it-development/">View the website case'), `${page.route} must not use the IT case as its hero proof`);
  for (const required of page.required) assert.ok(html.includes(required), `${page.route} missing ${required}`);
  const schemaTypes = parseSchema(html).map((entity) => entity?.["@type"]);
  for (const requiredType of ["Service", "BreadcrumbList", "FAQPage"]) {
    assert.ok(schemaTypes.includes(requiredType), `${page.route} missing ${requiredType}`);
  }
  assert.ok(sitemap.includes(`<loc>https://hermeslogisticsus.com${page.route}</loc>`), `${page.route} missing from sitemap`);
  assert.ok(seoHub.includes(`href="${page.route}"`), `${page.route} missing from national SEO hub`);
}

assert.equal(digitalGrowthCtaVariants.length, 5);
assert.equal(new Set(digitalGrowthCtaVariants.map((cta) => cta.id)).size, 5);
for (const cta of digitalGrowthCtaVariants) {
  assert.ok(cta.requiredInputs.length >= 5);
  assert.match(cta.disclosure, /manual project review/i);
  assert.match(cta.disclosure, /does not create a contract/i);
  assert.match(cta.disclosure, /guarantee completion time, rankings, traffic, inquiries, revenue, or ROI/i);
}

assert.equal(digitalNicheResearch.length, 4);
assert.deepEqual(
  digitalNicheResearch.map((record) => record.id).sort(),
  ["beauty_and_salon", "education_and_training", "home_services", "professional_services"],
);

for (const record of digitalNicheResearch) {
  const evaluation = evaluateDigitalNicheResearch(record);
  assert.equal(evaluation.readyForSeoPage, false, `${record.id} must remain blocked`);
  assert.ok(evaluation.reasons.length > 0, `${record.id} must explain the hold`);
  assert.equal(record.searchEvidence.status, "RESEARCH_ONLY");
  assert.equal(record.source.url, "https://hermeslogisticsus.com/");
  assert.ok(record.source.retrievedAt.length >= 10);
  assert.equal(record.privacyReview.noPersonalData, true);
  assert.equal(record.privacyReview.noAutomaticPublication, true);
}

console.log("Digital niche service page checks passed: two evidence-backed niche services, unique metadata/schema, sitemap discovery, preview contact, email-only routing, and four research-only verticals held from publication.");
