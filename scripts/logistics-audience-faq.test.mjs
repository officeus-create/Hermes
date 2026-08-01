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

for (const [slug, expectedQuestion] of pages) {
  const html = await readFile(join(dist, slug, "index.html"), "utf8");
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${slug} must keep exactly one H1`);
  assert.ok(html.includes('aria-label="Breadcrumb"'), `${slug} visible breadcrumb is missing`);
  assert.ok(html.includes('"@type":"BreadcrumbList"'), `${slug} BreadcrumbList schema is missing`);
  assert.ok(html.includes('"@type":"FAQPage"'), `${slug} FAQPage schema is missing`);
  assert.equal((html.match(/<details>/g) ?? []).length, 3, `${slug} must render three FAQ items`);
  assert.ok(html.includes(expectedQuestion), `${slug} is missing its audience-specific FAQ question`);

  const schemaMatch = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]))
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .find((value) => value?.["@type"] === "FAQPage");
  assert.equal(schemaMatch?.mainEntity?.length, 3, `${slug} FAQ schema must contain three questions`);
  for (const item of schemaMatch.mainEntity) {
    assert.ok(html.includes(item.name), `${slug} schema question is not visible: ${item.name}`);
    assert.ok(html.includes(item.acceptedAnswer.text), `${slug} schema answer is not visible: ${item.name}`);
  }
}

console.log("Logistics audience FAQ checks passed: five routes, visible FAQs, matching schema, and preserved breadcrumbs.");
