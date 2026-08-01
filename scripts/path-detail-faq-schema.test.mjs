import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist", "paths");
const slugs = ["logistics", "marketing", "academy", "technology"];

const decodeHtml = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

for (const slug of slugs) {
  const html = await readFile(join(dist, slug, "index.html"), "utf8");
  const publicHtml = html.replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "");
  const visibleText = decodeHtml(
    publicHtml
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

  const schemas = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]))
    .flatMap((value) => Array.isArray(value) ? value : [value]);
  const faqSchemas = schemas.filter((value) => value?.["@type"] === "FAQPage");

  assert.equal(faqSchemas.length, 1, `/paths/${slug}/ must expose exactly one FAQPage schema`);
  assert.ok(faqSchemas[0].mainEntity?.length >= 3, `/paths/${slug}/ FAQPage schema is incomplete`);
  assert.ok(schemas.some((value) => value?.["@type"] === "Service"), `/paths/${slug}/ Service schema is missing`);
  assert.ok(schemas.some((value) => value?.["@type"] === "BreadcrumbList"), `/paths/${slug}/ BreadcrumbList schema is missing`);

  for (const item of faqSchemas[0].mainEntity) {
    assert.equal(item?.["@type"], "Question", `/paths/${slug}/ FAQ entity must be a Question`);
    assert.equal(item?.acceptedAnswer?.["@type"], "Answer", `/paths/${slug}/ FAQ answer type is invalid`);
    assert.ok(visibleText.includes(item.name), `/paths/${slug}/ FAQ question is not visible: ${item.name}`);
    assert.ok(visibleText.includes(item.acceptedAnswer.text), `/paths/${slug}/ FAQ answer is not visible: ${item.name}`);
  }
}

console.log("Path detail FAQ schema checks passed: four routes with visible questions and matching Service/BreadcrumbList/FAQPage JSON-LD.");
