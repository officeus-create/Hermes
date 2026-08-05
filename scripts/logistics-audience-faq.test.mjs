import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist", "logistics");
const pages = [
  ["shipper-dealer", "Is a carrier match guaranteed after I submit a request?", 8],
  ["broker", "Do you guarantee capacity for every opportunity?", 3],
  ["carrier", "Do I have to accept every load Hermes presents?", 3],
  ["agency", "Does applying guarantee an agency will open?", 3],
  ["careers", "Does submitting an application guarantee an interview or a job?", 3],
];

const decodeHtml = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

for (const [slug, expectedQuestion, expectedCount] of pages) {
  const html = await readFile(join(dist, slug, "index.html"), "utf8");
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${slug} must keep exactly one H1`);
  assert.ok(html.includes('aria-label="Breadcrumb"'), `${slug} visible breadcrumb is missing`);
  assert.ok(html.includes('"@type":"BreadcrumbList"'), `${slug} BreadcrumbList schema is missing`);
  assert.ok(html.includes('"@type":"FAQPage"'), `${slug} FAQPage schema is missing`);

  const faqSection = html.match(/<section\b[^>]*class="[^"]*logistics-audience-faq[^"]*"[^>]*>[\s\S]*?<\/section>/i)?.[0] ?? "";
  assert.ok(faqSection, `${slug} visible FAQ section is missing`);
  assert.equal((faqSection.match(/<details\b/gi) ?? []).length, expectedCount, `${slug} must render ${expectedCount} FAQ items`);

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
  assert.equal(schemaMatch?.mainEntity?.length, expectedCount, `${slug} FAQ schema must contain ${expectedCount} questions`);
  for (const item of schemaMatch.mainEntity) {
    assert.ok(visibleFaqText.includes(item.name), `${slug} schema question is not visible: ${item.name}`);
    assert.ok(visibleFaqText.includes(item.acceptedAnswer.text), `${slug} schema answer is not visible: ${item.name}`);
  }

  if (slug === "shipper-dealer") {
    for (const text of [
      "Carrier review",
      "What does the carrier review check?",
      "Does carrier review mean the move is already booked?",
      "identity and available operating-authority information",
      "does not guarantee future availability, performance, safety, delivery timing, or an insurance outcome",
      "What is the difference between a one-time move, repeat capacity, and managed coordination?",
      "Can a one-time request become a repeat or managed program?",
      "Does choosing a service mode guarantee capacity, price, timing, or carrier assignment?",
      "responsibilities, authority boundaries, fee, ownership, and escalation rules are approved in writing",
    ]) {
      assert.ok(decodeHtml(html).includes(text), `shipper-dealer is missing service or carrier-review clarity: ${text}`);
    }
  }
}

console.log("Logistics audience FAQ checks passed: five routes, visible FAQs, matching schema, preserved breadcrumbs, and shipper carrier-review/service-mode clarity.");
