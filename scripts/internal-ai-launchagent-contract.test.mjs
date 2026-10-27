import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,"..");
const read=(p)=>readFileSync(resolve(root,p),"utf8");
const wrapper=read("scripts/ai/hermes-internal-ai-launch-wrapper.sh");
const installer=read("scripts/ai/install-hermes-internal-ai-launchagent.sh");
const workflow=read(".github/workflows/codex-hermes-router.yml");

assert.match(wrapper,/set -euo pipefail/);
assert.match(wrapper,/security find-generic-password[^\n]+-w/,"wrapper must retrieve the scoped token from macOS Keychain at runtime");
assert.match(wrapper,/KEYCHAIN_SERVICE=.*com\.hermes\.internal-ai\.runner-token/);
assert.match(wrapper,/KEYCHAIN_ACCOUNT=.*hermes-internal-ai-runner/);
assert.match(wrapper,/unset HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN/,"one-time owner bootstrap secret must not survive into the runner");
assert.match(wrapper,/codex-hermes-doctor/);
assert.match(wrapper,/--internal-ai/);
assert.match(wrapper,/u\.hostname != "hermeslogisticsus\.com"/,"wrapper must reject any non-canonical API host before token use");
assert.match(installer,/u\.hostname == "hermeslogisticsus\.com"/,"installer must reject arbitrary HTTPS origins");
assert.match(wrapper,/if ! "\$DOCTOR" --internal-ai; then[\s\S]*No task was claimed/,"failed doctor must block before runner execution");
assert.match(wrapper,/exec \/usr\/bin\/python3 "\$RUNNER"/,"wrapper must exec only the existing Internal AI runner");
assert.doesNotMatch(wrapper,/launchctl|StartCalendarInterval|cron|crontab/,"wrapper must not become a second scheduler");
assert.doesNotMatch(wrapper,/curl .*token|echo .*TOKEN|printf .*TOKEN/,"wrapper must not print or transport the runner token outside the existing API client");

assert.match(installer,/LABEL="com\.hermes\.internal-ai\.runner"/);
assert.match(installer,/RunAtLoad.*True/);
assert.match(installer,/KeepAlive.*SuccessfulExit.*False/);
assert.match(installer,/ThrottleInterval.*60/);
assert.match(installer,/ProgramArguments.*\/bin\/bash/);
assert.match(installer,/HERMES_INTERNAL_AI_CODEX_BIN/,"installer must pin the discovered Codex binary path for sparse launchd PATH");
assert.match(installer,/security find-generic-password/,"install must fail closed if Keychain token is absent");
assert.doesNotMatch(installer,/add-generic-password/,"installer must never create or mutate credential material");
assert.doesNotMatch(installer,/HERMES_INTERNAL_AI_RUNNER_TOKEN["']?\s*:/,"plist generator must not embed the scoped token");
assert.match(installer,/--uninstall/);
assert.match(installer,/KEYCHAIN_ITEM=UNCHANGED/,"rollback must not silently delete credential material");
assert.doesNotMatch(installer,/com\.hermes\.viktor/,"new runner recovery must not hijack the existing Viktor lab LaunchAgents");
assert.doesNotMatch(installer,/volkogon|officeus@|gmail\.com/i,"autostart policy must not hardcode a private person/account");

for(const path of ["scripts/ai/hermes-internal-ai-launch-wrapper.sh","scripts/ai/install-hermes-internal-ai-launchagent.sh","scripts/internal-ai-launchagent-contract.test.mjs"]){
  assert(workflow.includes(path),`${path} must trigger the existing Codex Hermes router workflow`);
}
assert.match(workflow,/Validate macOS Internal AI login recovery contract/);
console.log("Hermes Internal AI macOS login recovery contract: PASS");
