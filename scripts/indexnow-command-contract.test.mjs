import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const manualWorkflow = await readFile(new URL("../.github/workflows/indexnow-submit.yml", import.meta.url), "utf8");
const moneyWorkflow = await readFile(new URL("../.github/workflows/indexnow-money-pages.yml", import.meta.url), "utf8");
const retiredIssueCommentWorkflow = new URL("../.github/workflows/indexnow-seo-command.yml", import.meta.url);

assert.equal(
  existsSync(retiredIssueCommentWorkflow),
  false,
  "Closed issue #346 must not remain an executable IndexNow routing surface.",
);

for (const required of [
  "workflow_dispatch:",
  "urls:",
  "all_public_urls:",
  "default: false",
  "INDEXNOW_DRY_RUN: \"1\"",
  "inputs.urls",
  "inputs.all_public_urls",
  "node scripts/indexnow-submit.mjs",
]) {
  assert.ok(manualWorkflow.includes(required), "Manual IndexNow workflow must preserve " + required);
}
assert.equal(
  manualWorkflow.includes("issue_comment:"),
  false,
  "Manual IndexNow must not depend on a historical issue-comment router.",
);
assert.equal(
  manualWorkflow.includes("github.event.issue.number"),
  false,
  "Manual IndexNow must not bind execution to a closed issue number.",
);
assert.equal(
  manualWorkflow.includes("schedule:"),
  false,
  "All-URL IndexNow submission must never become a recurring spam schedule.",
);
assert.equal(
  manualWorkflow.includes("pull_request:"),
  false,
  "Manual IndexNow submission must not run automatically for pull requests.",
);

for (const required of [
  "git diff --name-only",
  "Collect changed canonical money URLs",
  "steps.changed.outputs.count != '0'",
  "steps.changed.outputs.urls",
  "https://hermeslogisticsus.com/load-board/",
  "https://hermeslogisticsus.com/load-board/equipment/car-hauler/",
  "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
  "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/",
]) {
  assert.ok(moneyWorkflow.includes(required), "Money-page IndexNow workflow must preserve changed-URL control: " + required);
}
assert.equal(
  moneyWorkflow.includes("workflow_dispatch:"),
  false,
  "Money-page IndexNow automation must stay push/change driven; manual submission already has a separate workflow.",
);
for (const retired of [
  "https://hermeslogisticsus.com/load-board/providers/ship-cars/",
  "https://hermeslogisticsus.com/load-board/equipment/dry-van/",
  "https://hermeslogisticsus.com/load-board/equipment/reefer/",
  "https://hermeslogisticsus.com/load-board/equipment/flatbed/",
  "https://hermeslogisticsus.com/load-board/equipment/step-deck/",
  "https://hermeslogisticsus.com/load-board/equipment/hotshot/",
  "https://hermeslogisticsus.com/load-board/equipment/power-only/",
  "https://hermeslogisticsus.com/load-board/equipment/box-truck/",
]) {
  assert.equal(moneyWorkflow.includes(retired), false, "IndexNow must not notify non-owner support surface: " + retired);
}
assert.ok(
  moneyWorkflow.includes("if grep -Eq '^src/pages/load-board\\.astro$'"),
  "Money-page workflow must isolate canonical Load Board root changes",
);
assert.ok(
  moneyWorkflow.includes("echo 'https://hermeslogisticsus.com/load-board/' >> /tmp/indexnow-urls.txt"),
  "Load Board root changes must submit the canonical root",
);

const moneyTrigger = moneyWorkflow.split("permissions:")[0];
for (const forbiddenTrigger of [
  "public/sitemap.xml",
  "public/8e3c1f6a9d4b72c5e0a8f31d67b2c94e.txt",
  "scripts/indexnow-submit.mjs",
  ".github/workflows/indexnow-money-pages.yml",
]) {
  assert.equal(
    moneyTrigger.includes(forbiddenTrigger),
    false,
    "IndexNow must not resubmit money pages merely because " + forbiddenTrigger + " changed",
  );
}

const submitter = await readFile(new URL("./indexnow-submit.mjs", import.meta.url), "utf8");
for (const required of [
  'if (url.hostname !== host)',
  'if (url.protocol !== "https:")',
  'if (url.hash)',
  'if (!isCanonicalHtmlPageUrl(url))',
  '"/robots.txt"',
  '"/BingSiteAuth.xml"',
  '"/llms.txt"',
  '"/llms-full.txt"',
  'if (unique.length > 10000)',
  'INDEXNOW_USE_SITEMAPS',
  'response.status !== 200 && response.status !== 202',
]) {
  assert.ok(submitter.includes(required), "IndexNow submitter must preserve safety guard " + required);
}

function dryRun(urls) {
  return spawnSync(process.execPath, ["scripts/indexnow-submit.mjs"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      INDEXNOW_DRY_RUN: "1",
      INDEXNOW_URLS: urls,
      INDEXNOW_USE_SITEMAPS: "0",
    },
  });
}

for (const validUrl of [
  "https://hermeslogisticsus.com/",
  "https://hermeslogisticsus.com/services/seo/",
  "https://hermeslogisticsus.com/example.html",
]) {
  const result = dryRun(validUrl);
  assert.equal(result.status, 0, "canonical HTML page must be accepted: " + validUrl + "\n" + result.stderr);
}

for (const invalidUrl of [
  "https://hermeslogisticsus.com/robots.txt",
  "https://hermeslogisticsus.com/sitemapindex.xml",
  "https://hermeslogisticsus.com/sitemap-london.xml",
  "https://hermeslogisticsus.com/guide.pdf",
  "https://hermeslogisticsus.com/app.apk",
  "https://hermeslogisticsus.com/fonts/hermes.woff2",
  "https://hermeslogisticsus.com/images/hero.webp",
  "https://hermeslogisticsus.com/scripts/app.js",
]) {
  const result = dryRun(invalidUrl);
  assert.notEqual(result.status, 0, "non-HTML URL must fail closed: " + invalidUrl);
  assert.match(result.stderr, /canonical HTML page URLs/, "rejection must explain page-only contract: " + invalidUrl);
}

console.log("IndexNow routing contract passed.");
