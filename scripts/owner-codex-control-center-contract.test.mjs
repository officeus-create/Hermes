import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const page = read("src/pages/services/hermes-connect/owner/index.astro");
const helper = read("functions/api/_lib/owner-codex.mjs");
const tasks = read("functions/api/owner-codex/tasks.ts");
const claim = read("functions/api/owner-codex/runner/claim.ts");
const runner = read("scripts/ai/hermes-owner-codex-runner.py");

assert.match(page, /robots="noindex,nofollow"/, "owner control center must stay noindex");
assert.match(page, /Repair Shops/, "owner hub must link Repair Shops");
assert.match(page, /Academy/, "owner hub must link Academy");
assert.match(page, /Hermes Codex/, "owner hub must expose the routed Codex tab");
assert.match(page, /Custom text is passed as Codex task input, never as a shell command/, "UI must state the command boundary");

assert.match(helper, /HERMES_OWNER_SPECIALIST_ID/, "owner authorization must support an explicit owner identity binding");
assert.match(helper, /HERMES_OWNER_EMAIL/, "owner authorization may support an explicit owner email binding");
assert.match(helper, /HERMES_CODEX_RUNNER_TOKEN/, "runner API must require a scoped credential");
assert.match(helper, /owner_access_required/, "non-owner sessions must fail closed");
assert.match(helper, /\[REDACTED/, "execution output must be sanitized before persistence");

assert.match(tasks, /active_task_exists/, "task creation must preserve one-active-task ownership");
assert.match(tasks, /status IN \('queued', 'running'\)/, "task queue must reject concurrent active tasks");
assert.match(claim, /status = 'queued'/, "runner may claim only queued work");
assert.match(claim, /runner_id = 'mac-owner-runner'/, "claimed work must record the bounded runner identity");

assert.match(runner, /subprocess\.Popen\(/, "local runner must invoke Hermes Codex through an argument array");
assert.doesNotMatch(runner, /shell\s*=\s*True/, "local runner must never enable shell interpolation");
assert.match(runner, /command = \[str\(CODEX_HERMES\), "exec", prompt\]/, "custom prompt must remain a process argument");
assert.doesNotMatch(runner, /socket\.|listen\(|HTTPServer|Flask|FastAPI/, "local runner must not open an inbound server");
assert.match(runner, /API_BASE\.startswith\("https:\/\/"\)/, "runner must require HTTPS for the outbound task API");
assert.match(runner, /os\.killpg\(process\.pid/, "cancellation must target only the owned process group");

console.log("Hermes Owner Codex control center contract: PASS");
