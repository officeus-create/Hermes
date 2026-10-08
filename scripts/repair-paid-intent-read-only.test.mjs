import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const workflow = fs.readFileSync(new URL("../.github/workflows/repair-paid-intent-production-smoke.yml", import.meta.url), "utf8");
assert.match(workflow, /workflow_run:[\s\S]*Deploy approved main to Cloudflare Pages v2/);
assert.match(workflow, /workflow_dispatch:\s*\n\s*schedule:/, "Default manual run has no send opt-in or hidden inputs");
assert.match(workflow, /cron: "17 10 \* \* \*"/);
assert.match(workflow, /permissions:\n  contents: read\n\n/, "Read-only smoke retains only contents:read");
assert.doesNotMatch(workflow, /^\s+[a-z-]+:\s*write\s*$/m, "No write permission may remain");
assert.doesNotMatch(workflow, /\b(?:POST|PUT|PATCH|DELETE)\b|--(?:data|upload)|\/api\/logistics-lead|first_send|scope\.outputs\.full|paid-intent-smoke-scope|gh issue comment/i);
assert.doesNotMatch(workflow, /\b(?:fetch|wget|gh api|npm|npx)\b|GH_TOKEN|Authorization:|Idempotency-Key|REQUEST_ID/);
assert.deepEqual([...workflow.matchAll(/uses:\s*(\S+)/g)].map(match => match[1]), ["actions/checkout@v4"], "No delegated send action may bypass the shell contract");
assert.match(workflow, /production request submission: NOT_RUN/);
assert.match(workflow, /receiver: UNKNOWN \(NOT_RUN\)/);
assert.match(workflow, /delivery \/ human receipt: UNKNOWN \(NOT_RUN\)/);
assert.match(workflow, /production duplicate submission: NOT_RUN/);
assert.match(workflow, /qualification: UNKNOWN \(NOT_RUN\)/);
assert.match(workflow, /revenue: UNKNOWN \(NOT_RUN\)/);

// Execute the actual workflow shell blocks with curl/sleep replaced by offline stubs.
// No HTTP server, network request, provider, identity or real mailbox is used.
const blocks = [];
let step = "";
const lines = workflow.split("\n");
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(/^      - name: (.+)$/);
  if (match) step = match[1];
  if (lines[i] !== "        run: |") continue;
  const script = [];
  while (++i < lines.length && (lines[i].startsWith("          ") || lines[i] === "")) {
    script.push(lines[i].startsWith("          ") ? lines[i].slice(10) : "");
  }
  i--;
  blocks.push({ name: step, script: script.join("\n") });
}
assert.deepEqual(blocks.map(block => block.name), [
  "Verify current paid-plan production truth",
  "Report GET-only paid-plan availability",
  "Enforce GET-only paid-plan availability",
]);
assert.match(blocks[0].script, /curl --request GET/);
for (const block of blocks) assert.equal(spawnSync("bash", ["-n"], { input: block.script }).status, 0, block.name);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "paid-intent-offline-"));
try {
  fs.writeFileSync(path.join(temp, "curl"), `#!${process.execPath}\n` + String.raw`
const fs = require("node:fs");
const args = process.argv.slice(2);
if (args[args.indexOf("--request") + 1] !== "GET" || args.some(arg => /^--(?:data|upload)/.test(arg))) process.exit(97);
const url = new URL(args.at(-1));
if (url.origin !== "https://hermeslogisticsus.com" || url.pathname !== "/services/hermes-connect/repair-shops/plan/") process.exit(98);
fs.appendFileSync(process.env.OFFLINE_TRACE, JSON.stringify({method:"GET", path:url.pathname}) + "\n");
if (process.env.OFFLINE_CASE === "http_failure") process.exit(22);
process.stdout.write(process.env.OFFLINE_CASE === "outdated" ? "old page" : "Founding Shop Plan $99/month per repair shop location Start free. Pay only after your shop is configured. No card is charged during setup.");
`, { mode: 0o755 });
  fs.writeFileSync(path.join(temp, "sleep"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  let cases = 0;
  for (const event of ["workflow_run", "schedule", "workflow_dispatch"]) {
    for (const mode of ["current", "outdated", "http_failure"]) {
      const trace = path.join(temp, "trace");
      const summary = path.join(temp, "summary");
      fs.writeFileSync(trace, "");
      fs.writeFileSync(summary, "");
      const env = {
        PATH: `${temp}:${path.dirname(process.execPath)}:/usr/bin:/bin`,
        GITHUB_EVENT_NAME: event, GITHUB_RUN_ID: "offline", GITHUB_RUN_ATTEMPT: "1",
        GITHUB_OUTPUT: path.join(temp, "output"), GITHUB_STEP_SUMMARY: summary,
        GITHUB_SERVER_URL: "https://github.invalid", GITHUB_REPOSITORY: "fixture/repo",
        TESTED_SHA: "offline-fixture", OFFLINE_TRACE: trace, OFFLINE_CASE: mode,
      };
      const run = (script, extra = {}) => spawnSync("bash", ["-c", script], { env: {...env, ...extra}, encoding: "utf8", timeout: 15000 });
      const truth = run(blocks[0].script);
      assert.equal(truth.status, {current: 0, outdated: 1, http_failure: 22}[mode], `${event}/${mode}: ${truth.stderr}`);
      const outcome = mode === "current" ? "success" : "failure";
      assert.equal(run(blocks[1].script, {TRUTH_OUTCOME: outcome}).status, 0);
      assert.equal(run(blocks[2].script, {TRUTH_OUTCOME: outcome}).status, mode === "current" ? 0 : 1);
      const calls = fs.readFileSync(trace, "utf8").trim().split("\n").map(line => JSON.parse(line));
      assert.equal(calls.length, mode === "outdated" ? 18 : 1);
      assert.ok(calls.every(call => call.method === "GET" && call.path === "/services/hermes-connect/repair-shops/plan/"));
      const report = fs.readFileSync(summary, "utf8");
      for (const marker of ["receiver: UNKNOWN (NOT_RUN)", "delivery / human receipt: UNKNOWN (NOT_RUN)", "production request submission: NOT_RUN", "production duplicate submission: NOT_RUN", "qualification: UNKNOWN (NOT_RUN)", "revenue: UNKNOWN (NOT_RUN)"]) assert.ok(report.includes(marker), marker);
      assert.doesNotMatch(report, /accepted one|receiver evidence only|suppressed its duplicate/);
      cases++;
    }
  }
  const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(packageJson.scripts.pretest, /contact-delivery-dedupe\.test\.mjs/, "Existing offline/mock idempotency regression remains in full CI");
  console.log(`Repair paid-intent GET-only contract PASS: ${cases} offline event/outcome cases; receiver/delivery NOT_RUN/UNKNOWN, no production POST`);
} finally {
  fs.rmSync(temp, {recursive: true, force: true});
}
