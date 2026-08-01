import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist", "logistics");
const pages = [
  ["shipper-dealer", "Is a carrier match guaranteed once I post a load?"],
  ["broker", "Do you guarantee capacity for every load I post?"],
  ["carrier", "Do I have to accept every load Hermes sends?"],
  ["agency", "Does applying guarantee an agency will open?"],
  ["careers", "Does submitting an application guarantee an interview or a job?"],
];

const decodeHtml = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

for (const [slug, expectedQuestion] of pages) {
  const html = await readFile(join(dist, slug, "index.html"), "utf8");
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${slug} must keep exactly one H1`);
  assert.ok(html.includes('aria-label="Breadcrumb"'), `${slug} visible breadcrumb is missing`);
  assert.ok(html.includes('"@type":"BreadcrumbList"'), `${slug} BreadcrumbList schema is missing`);
  assert.ok(html.includes('"@type":"FAQPage"'), `${slug} FAQPage schema is missing`);

  const faqSection = html.match(/<section\b[^>]*class="[^"]*logistics-audience-faq[^"]*"[^>]*>[\s\S]*?<\/section>/i)?.[0] ?? "";
  assert.ok(faqSection, `${slug} visible FAQ section is missing`);
  assert.equal((faqSection.match(/<details\b/gi) ?? []).length, 3, `${slug} must render three FAQ items`);

  const visibleFaqText = decodeHtml(
    faqSection
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  assert.ok(visibleFaqText.includes(expectedQuestion), `${slug} is missing its audience-specific FAQ question`);

  const schemaMatch = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]))
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .find((value) => value?.["@type"] === "FAQPage");
  assert.equal(schemaMatch?.mainEntity?.length, 3, `${slug} FAQ schema must contain three questions`);
  for (const item of schemaMatch.mainEntity) {
    assert.ok(visibleFaqText.includes(item.name), `${slug} schema question is not visible: ${item.name}`);
    assert.ok(visibleFaqText.includes(item.acceptedAnswer.text), `${slug} schema answer is not visible: ${item.name}`);
  }
}

console.log("Logistics audience FAQ checks passed: five routes, visible FAQs, matching schema, and preserved breadcrumbs.");
