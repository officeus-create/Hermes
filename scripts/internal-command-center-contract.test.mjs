import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,"..");
const read=(path)=>readFileSync(resolve(root,path),"utf8");
const page=read("src/pages/services/hermes-connect/internal/command-center/index.astro");
const helper=read("functions/api/_lib/internal-command-center.mjs");
const collection=read("functions/api/internal-command-center/work-items.ts");
const item=read("functions/api/internal-command-center/work-items/[id].ts");
const access=read("functions/api/internal-command-center/access.ts");
const nav=read("src/components/HermesConnectInternalAiNav.astro");

assert.match(page,/robots="noindex,nofollow,noarchive"/,"owner command center must stay private/noindex");
assert.match(page,/HermesConnectExperience/,"must reuse the canonical Hermes Connect shell");
assert.match(page,/HermesConnectInternalAiNav/,"must reuse the existing owner AI navigation");
assert.match(page,/\/api\/internal-ai\/status/,"must read the existing runner state instead of inventing a second agent runtime");
assert.match(page,/\/api\/internal-ai\/tasks/,"must read the existing AI queue");
assert.match(page,/\/api\/internal-command-center\/work-items/,"must use the bounded owner backlog");
assert.match(page,/SpeechRecognition.*webkitSpeechRecognition/s,"voice capture must use browser speech recognition with keyboard/OS fallback");
assert.match(page,/Dictation added.*Review before saving/s,"dictation must require review before persistence");
assert.doesNotMatch(page,/localStorage|sessionStorage/,"owner work must not use browser storage as system of record");
assert.doesNotMatch(page,/setInterval\([^,]+,\s*[0-9]{1,4}\)/,"page must not create a high-frequency pseudo-scheduler");
assert.match(page,/Cloudflare \+ D1/,"cloud persistence boundary must be visible to the owner");
assert.match(page,/Mac runner/,"Mac runner state must remain separate from cloud CRM state");

assert.match(helper,/hermes_owner_work_items/,"work items need a durable D1 table");
assert.match(helper,/organization_scope TEXT NOT NULL CHECK \(organization_scope = 'hermes_internal'\)/,"owner backlog must remain internal-tenant scoped");
assert.match(helper,/workstream IN \('marketing','logistics','sales','technology','academy','finance','operations'\)/,"workstream vocabulary must stay bounded");
assert.match(helper,/linked_task_id/,"work items must link to the existing AI task queue");
assert.match(helper,/reconcileWorkItems/,"work item state must reconcile linked task outcomes");
assert.match(helper,/Reuse current Hermes architecture.*do not create a second CRM/s,"dispatched prompts must preserve single-system ownership");
assert.match(helper,/external communications.*owner approval flow/i,"dispatched prompts must preserve consequential approval gates");

for(const source of [collection,item,access]){
  assert.match(source,/requireInternalOwner/,"every command-center API must require HERMES_INTERNAL_OWNER");
  assert.match(source,/Cache-Control.*no-store/,"private APIs must not be cached");
}
assert.match(collection,/csrf_origin_mismatch/,"work-item creation must reject cross-origin mutation");
assert.match(collection,/status,'planned'|status.*planned/s,"captured work must enter backlog rather than auto-run");
assert.doesNotMatch(collection,/INSERT\s+INTO\s+hermes_internal_ai_tasks/i,"capture endpoint must not silently dispatch AI work");

assert.match(item,/active_task_exists/,"dispatch must preserve the existing one-active-task invariant");
assert.match(item,/WHERE NOT EXISTS \([\s\S]*status IN \(\'queued\',\'running\',\'needs_approval\'\)/,"dispatch insert must atomically enforce the one-active-task invariant");
assert.match(item,/INSERT INTO hermes_internal_ai_tasks/,"dispatch must reuse the canonical internal AI queue");
assert.match(item,/agent_role,prompt,status/,"dispatch must preserve existing AI task shape");
assert.match(item,/workItemPrompt/,"dispatch must add bounded direction/context rather than another queue");
assert.match(item,/cancel_linked_ai_task_first/,"work-item cancellation must not orphan a running AI task");
assert.match(item,/status IN \('planned','ready','blocked'\) AND \(linked_task_id IS NULL OR linked_task_id=\?\)/,"work-item linkage must be optimistic so a terminal linked task can be replaced without overwriting a concurrent owner action");
assert.match(item,/work_item_linkage_unresolved/,"retry must fail closed when a prior linked task is not a known failed/cancelled terminal task");
assert.match(item,/DELETE FROM hermes_internal_ai_tasks[\s\S]*status='queued'[\s\S]*runner_id IS NULL/,"failed CRM linkage must compensate only the newly queued unclaimed AI task");
assert.match(item,/work_item_dispatch_link_conflict/,"linkage race must return an explicit fail-closed conflict");

assert.doesNotMatch(item,/remote shell|child_process|exec\(/i,"command-center API must not add remote execution");

assert.match(access,/SELECT id,email,name,role FROM specialists WHERE lower\(email\)=\?/,"access grant must target an existing Hermes account");
assert.match(access,/cannot_revoke_current_owner/,"access flow must prevent self-lockout");
assert.match(access,/cannot_remove_last_owner/,"access flow must preserve at least one active internal owner");
assert.match(access,/hermes_internal_owner_access_audit/,"access changes must be auditable");
assert.doesNotMatch(access,/volkogon|officeus@|HERMES_OWNER_EMAIL/i,"private people/emails must not be hardcoded as authorization policy");
assert.match(nav,/internal\/command-center/,"existing owner navigation must expose the unified command center only behind its current server gate");

await import("./internal-command-center-ai-architecture.test.mjs");
await import("./internal-command-center-runtime.test.mjs");
await import("./internal-command-center-state.test.mjs");
console.log("Hermes Business Command Center contract: PASS");
