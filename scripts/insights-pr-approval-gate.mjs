#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shaPattern = /^[0-9a-f]{40}$/;

function validateState(state, expectedHead) {
  assert.match(expectedHead, shaPattern, "expected Insights head must be a full commit SHA");
  assert.ok(state && typeof state === "object", "Insights PR state is required");
  assert.equal(state.headRefOid, expectedHead, "Insights PR head changed while resetting publication approval");
  assert.equal(typeof state.isDraft, "boolean", "Insights PR draft state is required");
  assert.ok("autoMergeRequest" in state, "Insights PR auto-merge state is required");
}

export function planApprovalReset(state, expectedHead) {
  validateState(state, expectedHead);
  return {
    expectedHead,
    disableAutoMerge: state.autoMergeRequest !== null,
    convertToDraft: state.isDraft !== true,
  };
}

export function verifyPublicationBlocked(state, expectedHead) {
  validateState(state, expectedHead);
  assert.equal(state.autoMergeRequest, null, "queued Insights auto-merge must be disabled for the new head");
  assert.equal(state.isDraft, true, "Insights PR must be draft after every generated head update");
  return {
    expectedHead,
    receiptRequirement: `authorized_human_ready_action_after:${expectedHead}`,
  };
}

const arg = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const mode = arg("--mode");
  const stateFile = arg("--state-file");
  const expectedHead = arg("--expected-head");
  assert.ok(mode === "plan" || mode === "verify", "mode must be plan or verify");
  assert.ok(stateFile && expectedHead, "state file and expected head are required");
  const state = JSON.parse(await readFile(stateFile, "utf8"));
  const result = mode === "plan"
    ? planApprovalReset(state, expectedHead)
    : verifyPublicationBlocked(state, expectedHead);
  console.log(JSON.stringify(result));
}
