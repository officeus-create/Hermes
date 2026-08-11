import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(new URL("../.github/workflows/indexnow-seo-command.yml", import.meta.url), "utf8");
for (const required of [
  "github.event.issue.number == 346",
  "github.event.comment.body == '/submit-indexnow-all'",
  "INDEXNOW_USE_SITEMAPS: \"1\"",
  "INDEXNOW_DRY_RUN: \"1\"",
  "node scripts/indexnow-submit.mjs",
  "status=\"$status\"",
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
  'if (unique.length > 10000)',
  'INDEXNOW_USE_SITEMAPS',
  'response.status !== 200 && response.status !== 202',
]) {
  assert.ok(submitter.includes(required), `IndexNow submitter must preserve safety guard ${required}`);
}

console.log("IndexNow owner command contract passed.");
