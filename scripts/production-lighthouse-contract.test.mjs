import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const summarizer = "scripts/summarize-production-lighthouse.mjs";
const syntax = spawnSync(process.execPath, ["--check", summarizer], { cwd: root, encoding: "utf8" });
assert.equal(syntax.status, 0, `${summarizer} must pass node --check: ${syntax.stderr || syntax.stdout}`);

const workflow = await readFile(new URL("../.github/workflows/production-lighthouse-command.yml", import.meta.url), "utf8");
const baselineWorkflow = await readFile(new URL("../.github/workflows/production-lighthouse-baseline.yml", import.meta.url), "utf8");
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

assert.ok(baselineWorkflow.includes("max-parallel: 1"), "production baseline must serialize Chrome launches on the shared GitHub runner");
assert.ok(baselineWorkflow.includes("for attempt in 1 2"), "production baseline must retry one transient Chrome launch failure");
assert.ok(baselineWorkflow.includes('workflow_run:'), 'baseline must follow the completed deployment instead of racing its push');
assert.ok(baselineWorkflow.includes('github.event.workflow_run.conclusion == \'success\''));
assert.ok(baselineWorkflow.includes('node scripts/verify-lighthouse-release.mjs'));
assert.equal(/^  push:/m.test(baselineWorkflow), false, 'a push must not measure the previous deployment');

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

const retiredProductionRouters = [
  ["../.github/workflows/main-production-verifier-command.yml", "220", "/verify-main-production"],
  ["../.github/workflows/production-domain-verifier-command.yml", "220", "/verify-production-domain"],
  ["../.github/workflows/home-connect-hotfix-production-verifier-command.yml", "220", "/verify-home-connect-hotfix"],
  ["../.github/workflows/hermes-connect-russian-production-verifier-command.yml", "220", "/verify-connect-ru"],
  ["../.github/workflows/connect-production-verifier-command.yml", "232", "/verify-connect-production"],
];
for (const [path, issue, command] of retiredProductionRouters) {
  const retiredWorkflow = await readFile(new URL(path, import.meta.url), "utf8");
  assert.ok(retiredWorkflow.includes("workflow_dispatch:"), `${path} must remain manually dispatchable`);
  assert.ok(retiredWorkflow.includes("GITHUB_STEP_SUMMARY"), `${path} must preserve sanitized Actions evidence`);
  for (const retired of ["issue_comment:", "issues: write", `github.event.issue.number == ${issue}`, `github.event.comment.body == '${command}'`, `gh issue comment ${issue}`]) {
    assert.equal(retiredWorkflow.includes(retired), false, `${path} must not restore closed issue routing: ${retired}`);
  }
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
