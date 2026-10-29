import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("../.github/workflows/issue-comment-command-router.yml", import.meta.url), "utf8");
const release = readFileSync(new URL("../.github/workflows/automation-engine-release.yml", import.meta.url), "utf8");
const baseline = readFileSync(new URL("../.github/workflows/hae-migration-baseline-candidate.yml", import.meta.url), "utf8");

assert.match(router,/issue_comment:\s*\n\s+types: \[created\]/);
assert.doesNotMatch(release,/issue_comment:/,"HAE release must no longer wake directly for every issue comment");
assert.doesNotMatch(baseline,/issue_comment:/,"Baseline candidate must no longer wake directly for every issue comment");
assert.match(release,/workflow_call:/);
assert.match(release,/workflow_dispatch:/);
assert.match(baseline,/workflow_call:/);
assert.match(baseline,/workflow_dispatch:/);
assert.doesNotMatch(release,/github\.event_name == \'workflow_call\'/,"reusable workflow must not assume called github.event_name semantics");
assert.doesNotMatch(baseline,/github\.event_name == \'workflow_call\'/,"baseline reusable workflow must route from explicit bounded inputs");

assert.match(router,/github\.actor == 'officeus-create'/);
assert.match(router,/!github\.event\.issue\.pull_request/);
assert.match(router,/github\.event\.issue\.number == 1018/);
assert.match(router,/github\.event\.issue\.number == 2033/);
for (const command of [
  "HAE_VERIFY ",
  "HAE_PROVISION_DRY_RUN ",
  "HAE_RUNTIME_READONLY_PROOF ",
  "HAE_SCHEMA_SNAPSHOT ",
  "HAE_T4_DLQ_CANARY ",
  "HAE_T4_READBACK ",
  "HAE_CI_READBACK ",
  "HAE_BASELINE_CANDIDATE ",
]) {
  assert.ok(router.includes(command), "router must preserve explicit command: " + command.trim());
}

assert.match(router,/uses: \.\/\.github\/workflows\/automation-engine-release\.yml/);
assert.match(router,/uses: \.\/\.github\/workflows\/hae-migration-baseline-candidate\.yml/);
assert.match(router,/command_body: \$\{\{ github\.event\.comment\.body \}\}/);
assert.match(router,/caller_actor: \$\{\{ github\.actor \}\}/);
assert.doesNotMatch(router,/\brun:\s*\|/,"lightweight router must not execute shell commands");
assert.doesNotMatch(router,/CLOUDFLARE|D1_API|QUEUE|wrangler|curl\s/i,"router must not own provider/runtime credentials or side effects");

assert.match(release,/inputs\.caller_actor == 'officeus-create'/);
assert.match(release,/inputs\.comment_is_pr == false/);
assert.match(release,/inputs\.issue_number == 1018/);
assert.match(release,/inputs\.issue_number == 2033/);
assert.match(release,/startsWith\(inputs\.command_body, 'HAE_SCHEMA_SNAPSHOT '\)/);
assert.match(release,/startsWith\(inputs\.command_body, 'HAE_T4_DLQ_CANARY '\)/);
assert.match(release,/startsWith\(inputs\.command_body, 'HAE_T4_READBACK '\)/);
assert.match(baseline,/inputs\.caller_actor == 'officeus-create'/);
assert.match(baseline,/inputs\.comment_is_pr == false/);
assert.match(baseline,/inputs\.issue_number == 2033/);
assert.match(baseline,/startsWith\(inputs\.command_body, 'HAE_BASELINE_CANDIDATE '\)/);

const route = ({actor="officeus-create", issue=2033, isPr=false, body=""}={}) => {
  if (actor !== "officeus-create" || isPr) return [];
  const jobs = [];
  if (
    (issue === 1018 && ["HAE_VERIFY ","HAE_PROVISION_DRY_RUN ","HAE_RUNTIME_READONLY_PROOF "].some(x=>body.startsWith(x))) ||
    (issue === 2033 && ["HAE_SCHEMA_SNAPSHOT ","HAE_T4_DLQ_CANARY ","HAE_T4_READBACK ","HAE_CI_READBACK "].some(x=>body.startsWith(x)))
  ) jobs.push("hae-release");
  if (issue === 2033 && body.startsWith("HAE_BASELINE_CANDIDATE ")) jobs.push("hae-baseline-candidate");
  return jobs;
};

assert.deepEqual(route({body:"ordinary design comment"}),[]);
assert.deepEqual(route({actor:"someone-else",body:"HAE_SCHEMA_SNAPSHOT "+"a".repeat(40)}),[]);
assert.deepEqual(route({issue:1018,body:"HAE_SCHEMA_SNAPSHOT "+"a".repeat(40)}),[]);
assert.deepEqual(route({issue:2033,isPr:true,body:"HAE_T4_READBACK "+"a".repeat(40)+" dlq:"+"b".repeat(32)}),[]);
assert.deepEqual(route({issue:1018,body:"HAE_VERIFY "+"a".repeat(40)}),["hae-release"]);
assert.deepEqual(route({issue:2033,body:"HAE_BASELINE_CANDIDATE "+"a".repeat(40)+" 1 2"}),["hae-baseline-candidate"]);
assert.deepEqual(route({issue:2033,body:"HAE_T4_READBACK "+"a".repeat(40)+" dlq:"+"b".repeat(32)}),["hae-release"]);
assert.deepEqual(route({issue:2033,body:"HAE_CI_READBACK "+"a".repeat(40)+" 40421315430 2"}),["hae-release"]);

assert.match(baseline,/\.github\/workflows\/automation-engine-release\.yml/);
assert.match(baseline,/\.github\/workflows\/issue-comment-command-router\.yml/);
assert.doesNotMatch(release,/echo\s+"[^"\n]*`\$[A-Z_]+`"/,
  "summary values must not be executed through shell command-substitution backticks");

console.log("HAE issue-comment router slice PASS", JSON.stringify({
  migrated_direct_subscribers:2,
  unrelated_comment_jobs:0,
  manual_dispatch_preserved:true,
  provider_side_effects_in_router:0,
}));
