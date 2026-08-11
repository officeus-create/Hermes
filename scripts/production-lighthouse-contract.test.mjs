import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const summarizer = "scripts/summarize-production-lighthouse.mjs";
const syntax = spawnSync(process.execPath, ["--check", summarizer], { cwd: root, encoding: "utf8" });
assert.equal(syntax.status, 0, `${summarizer} must pass node --check: ${syntax.stderr || syntax.stdout}`);

const workflow = await readFile(new URL("../.github/workflows/production-lighthouse-command.yml", import.meta.url), "utf8");
for (const required of [
  "github.event.issue.number == 354",
  "github.event.comment.body == '/measure-production-lighthouse'",
  "group: production-lighthouse-command-${{ github.event.comment.id }}",
  "cancel-in-progress: false",
  "lighthouse@13.4.1",
  "mobile-${run}.json",
  "desktop-${run}.json",
  "agentic.json",
  "--only-categories=agentic-browsing",
  "node scripts/summarize-production-lighthouse.mjs",
  "gh issue comment 354",
]) {
  assert.ok(workflow.includes(required), `production Lighthouse workflow must preserve ${required}`);
}
assert.equal(
  workflow.includes("group: production-lighthouse-command\n  cancel-in-progress: true"),
  false,
  "Unrelated issue comments must not be able to cancel an active Lighthouse measurement",
);

const source = await readFile(new URL("./summarize-production-lighthouse.mjs", import.meta.url), "utf8");
for (const required of [
  "median",
  "largest-contentful-paint",
  "first-contentful-paint",
  "total-blocking-time",
  "cumulative-layout-shift",
  "speed-index",
  "CrUX field",
  'categories?.["agentic-browsing"]',
  "Agentic Browsing all applicable audits pass",
  "failedAudits",
]) {
  assert.ok(source.includes(required), `Lighthouse summarizer must preserve ${required}`);
}

console.log("Production Lighthouse command contract passed.");
