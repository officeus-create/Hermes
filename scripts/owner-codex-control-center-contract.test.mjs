import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const page = read("src/pages/services/hermes-connect/owner/index.astro");
const helper = read("functions/api/_lib/owner-codex.mjs");
const tasks = read("functions/api/owner-codex/tasks.ts");
const claim = read("functions/api/owner-codex/runner/claim.ts");
const runnerTask = read("functions/api/owner-codex/runner/task.ts");
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
assert.match(tasks, /csrf_origin_mismatch/, "mutable browser task creation must reject cross-origin requests");
assert.match(claim, /status = 'queued'/, "runner may claim only queued work");
assert.match(claim, /runner_id = 'mac-owner-runner'/, "claimed work must record the bounded runner identity");
assert.match(claim, /running_task_requires_reconciliation/, "runner restart must fail closed instead of duplicating a running task");
assert.match(claim, /cancelled_after_runner_restart/, "owner-cancelled orphan work must have a bounded reconciliation path");
assert.match(runnerTask, /UPDATE owner_codex_runner_state SET last_seen_at/, "running tasks must refresh the bounded runtime heartbeat");

assert.match(runner, /subprocess\.Popen\(/, "local runner must invoke Hermes Codex through an argument array");
assert.doesNotMatch(runner, /shell\s*=\s*True/, "local runner must never enable shell interpolation");
assert.match(runner, /command = \[str\(CODEX_HERMES\), "exec", prompt\]/, "custom prompt must remain a process argument");
assert.doesNotMatch(runner, /socket\.|listen\(|HTTPServer|Flask|FastAPI/, "local runner must not open an inbound server");
assert.match(runner, /API_BASE\.startswith\("https:\/\/"\)/, "runner must require HTTPS for the outbound task API");
assert.match(runner, /os\.killpg\(process\.pid/, "cancellation must target only the owned process group");
assert.match(runner, /terminate_owned_process\(process\)/, "unexpected runner shutdown must clean up its owned child process");
assert.match(runner, /current_pr_url\(\) or None/, "runner should attach current PR evidence when the local GitHub CLI can resolve it");
assert.match(runner, /\[-MAX_SUMMARY_CHARS:\]/, "runner must bound retained local output memory");
assert.match(runner, /branch != "main"/, "remote execution must start from canonical main");
assert.match(runner, /--untracked-files=no/, "repo preflight must preserve unrelated untracked local state");
assert.match(runner, /clean tracked working tree/, "remote execution must fail closed on tracked local changes");
assert.match(runner, /restore_main_if_safe\(\)/, "runner must restore canonical main only when task work is safely committed or absent");

console.log("Hermes Owner Codex control center contract: PASS");
