import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const verifierFiles = [
  "scripts/check-production-custom-domain.mjs",
  "scripts/check-production-seo-hygiene.mjs",
];

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
