import assert from "node:assert/strict";
import { evaluatePullRequestReadiness } from "./hae-pr-readiness-check.mjs";

assert.deepEqual(
  evaluatePullRequestReadiness({
    draft:false,
    behind_by:0,
    author:"officeus-create",
    reviews:[{user:{login:"qa-reviewer"},state:"APPROVED"}],
  }).blockers,
  []
);

const behind = evaluatePullRequestReadiness({
  draft:false,
  behind_by:2,
  author:"officeus-create",
  reviews:[{user:{login:"qa-reviewer"},state:"APPROVED"}],
});
assert.ok(behind.blockers.includes("PR_BEHIND_BASE"));

const missing = evaluatePullRequestReadiness({
  draft:false,
  behind_by:0,
  author:"officeus-create",
  reviews:[],
});
assert.ok(missing.blockers.includes("INDEPENDENT_APPROVAL_MISSING"));

const selfApproval = evaluatePullRequestReadiness({
  draft:false,
  behind_by:0,
  author:"officeus-create",
  reviews:[{user:{login:"officeus-create"},state:"APPROVED"}],
});
assert.ok(selfApproval.blockers.includes("INDEPENDENT_APPROVAL_MISSING"));

const superseded = evaluatePullRequestReadiness({
  draft:false,
  behind_by:0,
  author:"officeus-create",
  reviews:[
    {user:{login:"qa-reviewer"},state:"APPROVED"},
    {user:{login:"qa-reviewer"},state:"CHANGES_REQUESTED"},
  ],
});
assert.ok(superseded.blockers.includes("INDEPENDENT_APPROVAL_MISSING"));

console.log("HAE PR readiness guard PASS");
