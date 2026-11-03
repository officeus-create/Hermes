import fs from "node:fs";

function clean(value, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function evaluatePullRequestReadiness(input = {}) {
  const draft = input.draft === true;
  const behindBy = Number.isInteger(input.behind_by) && input.behind_by >= 0 ? input.behind_by : null;
  const author = clean(input.author, 120);
  const headSha = clean(input.head_sha, 40).toLowerCase();
  const reviews = Array.isArray(input.reviews) ? input.reviews : [];

  if (behindBy === null || !author || !/^[a-f0-9]{40}$/.test(headSha)) throw new Error("pr_readiness_input_invalid");

  const latestByReviewer = new Map();
  for (const review of reviews) {
    const reviewer = clean(review?.user?.login, 120);
    const state = clean(review?.state, 40).toUpperCase();
    const commitId = clean(review?.commit_id, 40).toLowerCase();
    if (!reviewer || reviewer === author) continue;
    latestByReviewer.set(reviewer, { state, commit_id: commitId });
  }

  const approvers = [...latestByReviewer.entries()]
    .filter(([, review]) => review.state === "APPROVED" && review.commit_id === headSha)
    .map(([reviewer]) => reviewer)
    .sort();

  const blockers = [];
  if (draft) blockers.push("PR_DRAFT");
  if (behindBy > 0) blockers.push("PR_BEHIND_BASE");
  if (!draft && approvers.length === 0) blockers.push("INDEPENDENT_APPROVAL_MISSING");

  return {
    status: blockers.length ? "HOLD" : "READY",
    draft,
    behind_by: behindBy,
    head_sha: headSha,
    independent_approvers: approvers,
    blockers,
  };
}

if (process.argv[1] && process.argv[1].endsWith("hae-pr-readiness-check.mjs")) {
  const prPath = process.env.HAE_PR_JSON_PATH;
  const comparePath = process.env.HAE_COMPARE_JSON_PATH;
  const reviewsPath = process.env.HAE_REVIEWS_JSON_PATH;
  if (!prPath || !comparePath || !reviewsPath) throw new Error("pr_readiness_evidence_paths_required");
  const pr = JSON.parse(fs.readFileSync(prPath, "utf8"));
  const compare = JSON.parse(fs.readFileSync(comparePath, "utf8"));
  const reviews = JSON.parse(fs.readFileSync(reviewsPath, "utf8"));
  const result = evaluatePullRequestReadiness({
    draft: pr.draft === true,
    behind_by: Number(compare.behind_by),
    author: pr?.user?.login,
    head_sha: pr?.head?.sha,
    reviews,
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "READY" && !result.blockers.includes("PR_DRAFT")) process.exit(1);
}
