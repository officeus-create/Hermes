import assert from "node:assert/strict";
import { evaluatePullRequestReadiness } from "./hae-pr-readiness-check.mjs";

assert.deepEqual(
  evaluatePullRequestReadiness({
    draft:false,
    behind_by:0,
    author:"officeus-create",
    head_sha:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    reviews:[{user:{login:"qa-reviewer"},state:"APPROVED",commit_id:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}],
  }).blockers,
  []
);

const behind = evaluatePullRequestReadiness({
  draft:false,
  behind_by:2,
  author:"officeus-create",
    head_sha:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reviews:[{user:{login:"qa-reviewer"},state:"APPROVED",commit_id:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}],
});
assert.ok(behind.blockers.includes("PR_BEHIND_BASE"));

const missing = evaluatePullRequestReadiness({
  draft:false,
  behind_by:0,
  author:"officeus-create",
    head_sha:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reviews:[],
});
assert.ok(missing.blockers.includes("INDEPENDENT_APPROVAL_MISSING"));

const selfApproval = evaluatePullRequestReadiness({
  draft:false,
  behind_by:0,
  author:"officeus-create",
    head_sha:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reviews:[{user:{login:"officeus-create"},state:"APPROVED",commit_id:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}],
});
assert.ok(selfApproval.blockers.includes("INDEPENDENT_APPROVAL_MISSING"));

const superseded = evaluatePullRequestReadiness({
  draft:false,
  behind_by:0,
  author:"officeus-create",
    head_sha:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reviews:[
    {user:{login:"qa-reviewer"},state:"APPROVED",commit_id:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},
    {user:{login:"qa-reviewer"},state:"CHANGES_REQUESTED",commit_id:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},
  ],
});
assert.ok(superseded.blockers.includes("INDEPENDENT_APPROVAL_MISSING"));

const staleApproval = evaluatePullRequestReadiness({
  draft:false,
  behind_by:0,
  author:"officeus-create",
  head_sha:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reviews:[{user:{login:"qa-reviewer"},state:"APPROVED",commit_id:"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}],
});
assert.ok(staleApproval.blockers.includes("INDEPENDENT_APPROVAL_MISSING"));
assert.equal(staleApproval.independent_approvers.length,0);

console.log("HAE PR readiness guard PASS");
