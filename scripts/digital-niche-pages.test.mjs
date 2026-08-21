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
    title: "Logistics & Trucking SEO Services | Hermes",
    description: "Logistics SEO for trucking and freight companies: technical audits, query ownership, service architecture, internal links, and a scoped review request.",
    h1: "Logistics SEO for Trucking, Transportation and Freight Companies",
    forbidden: [
      "Proven Growth System",
      "Get Your Free Audit Scope",
    ],
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
    title: "Auto Dealer SEO Services | Used & Independent Dealerships | Hermes",
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
const metaDescription = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)]
  .map((match) => match[0])
  .find((tag) => /\bname=["']description["']/i.test(tag))
  ?.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? "";
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
  if (page.description) assert.equal(decode(metaDescription(html)), page.description, `${page.route} description mismatch`);
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
  for (const forbidden of page.forbidden ?? []) assert.ok(!html.includes(forbidden), `${page.route} still contains ${forbidden}`);
  const schemaTypes = parseSchema(html).map((entity) => entity?.["@type"]);
  for (const requiredType of ["Service", "BreadcrumbList", "FAQPage"]) assert.ok(schemaTypes.includes(requiredType), `${page.route} missing ${requiredType}`);
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
assert.deepEqual(digitalNicheResearch.map((record) => record.id).sort(), ["beauty_and_salon", "education_and_training", "home_services", "professional_services"]);
for (const record of digitalNicheResearch) {
  assert.ok(record.researchQuestions.length >= 4);
  assert.ok(record.requiredEvidence.length >= 5);
  assert.ok(record.prohibitedAssumptions.length >= 4);
  const evaluation = evaluateDigitalNicheResearch(record);
  assert.equal(evaluation.status, "blocked_missing_evidence");
  assert.ok(evaluation.blockers.includes("dated research provenance is required"));
  assert.ok(evaluation.blockers.includes("measurable niche demand is required"));
  assert.ok(evaluation.blockers.includes("service response capacity must be confirmed"));
  assert.ok(evaluation.blockers.includes("proof and claims review is required"));
  assert.ok(evaluation.blockers.includes("unique niche or local content plan is required"));
}

const researchReady = evaluateDigitalNicheResearch({
  ...digitalNicheResearch[0], sourceIds: ["fixture-niche-source-001"], reviewedAt: "2026-07-31", measurableDemand: true, serviceResponseCapacityConfirmed: true, proofReviewed: true, uniqueContentPlan: true,
});
assert.equal(researchReady.status, "eligible_for_editorial_review");
assert.deepEqual(researchReady.blockers, []);
assert.notEqual(researchReady.status, "published");

console.log("digital niche checks passed: logistics/dealer SEO pages, intent-aligned SEO proof, five CTA variants, four separate research queues, evidence gates, sitemap, schema, and preview contact.");
