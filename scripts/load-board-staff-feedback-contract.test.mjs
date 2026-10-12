import assert from "node:assert/strict";import {readFileSync} from "node:fs";import {execFileSync} from "node:child_process";
const api=readFileSync(new URL("../functions/api/load-board/staff-feedback.ts",import.meta.url),"utf8");
const page=readFileSync(new URL("../src/pages/services/hermes-connect/load-board/dispatcher/index.astro",import.meta.url),"utf8");
assert.match(api,/isApprovedDispatcher/);assert.match(api,/author_specialist_id/);assert.match(api,/workspaceSameOrigin/);
assert.match(api,/externalMessageSent:false/);assert.match(page,/load-board-staff-feedback-form/);
assert.match(page,/dispatch-feedback\.js/);
execFileSync(process.execPath,["--check",new URL("../public/scripts/workspaces/dispatch-feedback.js",import.meta.url).pathname]);
console.log("dispatch_staff_feedback_contract PASS");