import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const workflow = await readFile(new URL("../.github/workflows/indexnow-seo-command.yml", import.meta.url), "utf8");
for (const required of [
  "github.event.issue.number == 346",
  "github.event.comment.body == '/submit-indexnow-all'",
  "INDEXNOW_USE_SITEMAPS: \"1\"",
  "INDEXNOW_DRY_RUN: \"1\"",
  "node scripts/indexnow-submit.mjs",
  "echo \"status=$status\" >> \"$GITHUB_OUTPUT\"",
  "IndexNow acceptance does not guarantee crawling, indexing, ranking, traffic, or leads",
]) {
  assert.ok(workflow.includes(required), `IndexNow owner command must preserve ${required}`);
}
assert.equal(workflow.includes("schedule:"), false, "IndexNow all-URL release submission must not become a recurring spam schedule");
assert.equal(workflow.includes("pull_request:"), false, "IndexNow release submission must not run automatically for pull requests");

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
  assert.ok(submitter.includes(required), `IndexNow submitter must preserve safety guard ${required}`);
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
  assert.equal(result.status, 0, `canonical HTML page must be accepted: ${validUrl}\n${result.stderr}`);
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
  assert.notEqual(result.status, 0, `non-HTML URL must fail closed: ${invalidUrl}`);
  assert.match(result.stderr, /canonical HTML page URLs/, `rejection must explain page-only contract: ${invalidUrl}`);
}

console.log("IndexNow owner command contract passed.");
