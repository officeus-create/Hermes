import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { planApprovalReset, verifyPublicationBlocked } from "./insights-pr-approval-gate.mjs";

const workflow = await readFile(new URL("../.github/workflows/insights-content-pr.yml", import.meta.url), "utf8");

assert.match(
  workflow,
  /gh pr create --draft --base main --head "\$GITHUB_REF_NAME"/,
  "Insights automation must open a draft PR so validated content is not publication-ready without a human action",
);
assert.match(
  workflow,
  /authorized human must review the exact PR head, mark the draft ready, and merge it through GitHub/,
  "the draft must state the exact-head human approval receipt required for publication",
);
const mergeCommands = workflow.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("gh pr merge "));
assert.deepEqual(mergeCommands, ['gh pr merge "$PR_NUMBER" --disable-auto'], "the only merge command must disable queued auto-merge");
assert.doesNotMatch(workflow, /--auto(?:\s|$)/, "Insights automation must never queue auto-merge");
assert.match(workflow, /gh pr ready "\$PR_NUMBER" --undo/, "an existing ready PR must return to draft after a head update");
assert.match(workflow, /--mode verify/, "the final exact-head draft and auto-merge state must be verified");

const oldHead = "1".repeat(40);
const replacementHead = "2".repeat(40);
const inheritedReadyState = {
  number: 1784,
  headRefOid: replacementHead,
  isDraft: false,
  autoMergeRequest: { enabledAt: "2026-10-08T15:00:00Z", enabledBy: { login: "human-reviewer" }, commitHeadline: oldHead },
};
assert.deepEqual(planApprovalReset(inheritedReadyState, replacementHead), {
  expectedHead: replacementHead,
  disableAutoMerge: true,
  convertToDraft: true,
});
assert.throws(
  () => planApprovalReset({ ...inheritedReadyState, headRefOid: oldHead }, replacementHead),
  /head changed/,
  "a race to another PR head must fail closed",
);
assert.deepEqual(
  verifyPublicationBlocked({ ...inheritedReadyState, isDraft: true, autoMergeRequest: null }, replacementHead),
  { expectedHead: replacementHead, receiptRequirement: `authorized_human_ready_action_after:${replacementHead}` },
  "the replacement head must require a new human-ready action after inherited approval is cleared",
);

console.log("Insights human approval contract passed: every head is draft-only, inherited auto-merge is cleared, and a new exact-head receipt is required.");
