import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const verifierFiles = [
  "scripts/check-production-custom-domain.mjs",
  "scripts/check-production-seo-hygiene.mjs",
];

const canonicalSocialImage = new URL("../public/images/hermes-ecosystem-hero.jpg", import.meta.url);
const retiredSocialImage = new URL("../public/images/hermes-social-share-2026.jpg", import.meta.url);
const [layout, homepage] = await Promise.all([
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8"),
  access(canonicalSocialImage),
]);

await assert.rejects(access(retiredSocialImage), undefined, "The redundant social-share JPEG must stay removed.");
assert.ok(layout.includes('image = "/images/hermes-ecosystem-hero.jpg"'), "BaseLayout must use the canonical hero image for social previews.");
assert.ok(homepage.includes("https://hermeslogisticsus.com/images/hermes-ecosystem-hero.jpg"), "Homepage schema must use the canonical hero image.");
assert.ok(!layout.includes("hermes-social-share-2026.jpg"), "BaseLayout must not revive the retired social-share duplicate.");
assert.ok(!homepage.includes("hermes-social-share-2026.jpg"), "Homepage schema must not revive the retired social-share duplicate.");

for (const file of verifierFiles) {
  const check = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(check.status, 0, `${file} must pass node --check: ${check.stderr || check.stdout}`);
}

const verifier = await readFile(new URL("./check-production-custom-domain.mjs", import.meta.url), "utf8");
for (const required of [
  '"/sitemapindex.xml"',
  '"/llms.txt"',
  '"/business-growth/"',
  '"/logistics/auction-vehicle-pickup/"',
  '"/logistics/appleton-wi-vehicle-transport/"',
  '"/services/website-development/"',
  '"/academy/us-logistics-operations/"',
  '"/__hermes-seo-healthcheck-nonexistent__/"',
  "finalUrlMatches",
  "exactControlledChildren",
  "hasMarkdownLinks",
  "isReal404",
]) {
  assert.ok(verifier.includes(required), `production verifier must preserve ${required}`);
}

const workflow = await readFile(new URL("../.github/workflows/production-seo-hygiene-command.yml", import.meta.url), "utf8");
assert.ok(workflow.includes("github.event.issue.number == 346"), "SEO hygiene command must stay scoped to the SEO 11 master issue");
assert.ok(workflow.includes("github.event.comment.body == '/verify-production-seo'"), "SEO hygiene command trigger must remain explicit");
assert.ok(workflow.includes("node scripts/check-production-seo-hygiene.mjs"), "workflow must use the bounded SEO hygiene wrapper");
assert.ok(workflow.includes("no real lead") === false, "workflow should not imply that a lead is created");

console.log("Production SEO hygiene contract passed.");
