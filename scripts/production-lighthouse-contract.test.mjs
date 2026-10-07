import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const summarizer = "scripts/summarize-production-lighthouse.mjs";
const syntax = spawnSync(process.execPath, ["--check", summarizer], { cwd: root, encoding: "utf8" });
assert.equal(syntax.status, 0, `${summarizer} must pass node --check: ${syntax.stderr || syntax.stdout}`);

const workflow = await readFile(new URL("../.github/workflows/production-lighthouse-command.yml", import.meta.url), "utf8");
for (const required of [
  "workflow_dispatch:",
  "group: production-lighthouse-manual",
  "cancel-in-progress: false",
  "lighthouse@13.4.1",
  "mobile-${run}.json",
  "desktop-${run}.json",
  "agentic.json",
  "--only-categories=agentic-browsing",
  "node scripts/summarize-production-lighthouse.mjs",
  "GITHUB_STEP_SUMMARY",
]) {
  assert.ok(workflow.includes(required), `production Lighthouse workflow must preserve ${required}`);
}
assert.equal(
  workflow.includes("group: production-lighthouse-command\n  cancel-in-progress: true"),
  false,
  "Unrelated issue comments must not be able to cancel an active Lighthouse measurement",
);

for (const retired of ["issue_comment:", "issues: write", "github.event.issue.number == 354", "gh issue comment 354"]) {
  assert.equal(workflow.includes(retired), false, `closed #354 routing must stay retired: ${retired}`);
}

const calculatorWorkflow = await readFile(new URL("../.github/workflows/carrier-calculator-lighthouse-command.yml", import.meta.url), "utf8");
for (const required of ["workflow_dispatch:", "carrier-calculator-lighthouse-manual", "GITHUB_STEP_SUMMARY"]) {
  assert.ok(calculatorWorkflow.includes(required), `carrier calculator workflow must preserve ${required}`);
}
for (const retired of ["issue_comment:", "issues: write", "github.event.issue.number == 380", "gh issue comment 380"]) {
  assert.equal(calculatorWorkflow.includes(retired), false, `closed #380 routing must stay retired: ${retired}`);
}

const jobWorkflow = await readFile(new URL("../.github/workflows/production-job-posting-command.yml", import.meta.url), "utf8");
for (const required of ["workflow_dispatch:", "GITHUB_STEP_SUMMARY", "check-production-job-posting.mjs"]) {
  assert.ok(jobWorkflow.includes(required), `production JobPosting workflow must preserve ${required}`);
}
for (const retired of ["issue_comment:", "issues: write", "github.event.issue.number == 381", "gh issue comment 381"]) {
  assert.equal(jobWorkflow.includes(retired), false, `closed #381 routing must stay retired: ${retired}`);
}

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
  "largest-contentful-paint-element",
  "lcp-breakdown-insight",
  "lcp-lazy-loaded",
  "prioritize-lcp-image",
  "uses-responsive-images",
  "uses-optimized-images",
  "representative LCP diagnostic",
  "Mobile LCP diagnostic",
]) {
  assert.ok(source.includes(required), `Lighthouse summarizer must preserve ${required}`);
}

console.log("Production Lighthouse command contract passed.");
