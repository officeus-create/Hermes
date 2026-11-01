const REPO_OWNER = "officeus-create";
const REPO_NAME = "Hermes";
const MAX_PAGES = 3;
const PAGE_SIZE = 100;
const MAX_ENRICHED_PULLS = 12;
const ENRICHMENT_BATCH_SIZE = 4;
const MIN_RATE_LIMIT_FOR_ENRICHMENT = 30;

const clean = (value, max = 1000) => String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
const safeGithubUrl = (value, number) => {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && url.hostname === "github.com" &&
      url.pathname === "/" + REPO_OWNER + "/" + REPO_NAME + "/pull/" + Number(number)
      ? url.href
      : null;
  } catch {
    return null;
  }
};

function lineField(body, labels) {
  const text = clean(body, 65000);
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
    const direct = new RegExp("^[-*\\s]*\\*\\*" + escaped + "(?::\\*\\*|\\*\\*\\s*:)\\s*(.+)$", "im").exec(text);
    if (direct?.[1]) return clean(direct[1].replace(/^\|\s*/, ""), 500);
    const table = new RegExp("^\\|\\s*" + escaped + "\\s*\\|\\s*(.+?)\\s*\\|\\s*$", "im").exec(text);
    if (table?.[1]) return clean(table[1], 500);
  }
  return null;
}

export function parseAgentWorkPassport(body) {
  const agent = lineField(body, ["Agent / environment", "Executing agent", "Agent"]);
  const contributor = lineField(body, ["Contributor", "Contributor (actual implementer)"]);
  const chat = lineField(body, ["Chat / session", "Chat / thread", "Session"]);
  const work_id = lineField(body, ["Work ID", "Work item", "Work-Item"]);
  const role = lineField(body, ["Role / department", "Role"]);
  const scope = lineField(body, ["Scope", "Action & scope"]);
  const owner_gate = lineField(body, ["Owner approval required", "Owner gate"]);
  const next_owner = lineField(body, ["Next owner & action", "Next owner / action"]);
  const raw = [agent, contributor].filter(Boolean).join(" · ");
  let agent_family = "UNKNOWN";
  if (/claude/i.test(raw)) agent_family = "CLAUDE";
  else if (/chatgpt/i.test(raw)) agent_family = "CHATGPT";
  else if (/codex/i.test(raw)) agent_family = "CODEX";
  else if (/viktor|hermes ai/i.test(raw)) agent_family = "VIKTOR";
  return { agent, contributor, agent_family, chat, work_id, role, scope, owner_gate, next_owner };
}

export function normalizeGithubPull(pull = {}) {
  const number = Number(pull.number);
  const head = pull.head && typeof pull.head === "object" ? pull.head : {};
  const base = pull.base && typeof pull.base === "object" ? pull.base : {};
  return {
    number: Number.isInteger(number) && number > 0 ? number : null,
    title: clean(pull.title, 500),
    state: clean(pull.state, 40) || "UNKNOWN",
    draft: pull.draft === true,
    url: safeGithubUrl(pull.html_url, number),
    author: clean(pull.user?.login, 160) || null,
    head_ref: clean(head.ref, 240) || null,
    head_sha: /^[a-f0-9]{40}$/i.test(String(head.sha || "")) ? String(head.sha).toLowerCase() : null,
    base_ref: clean(base.ref, 240) || null,
    updated_at: clean(pull.updated_at, 80) || null,
    created_at: clean(pull.created_at, 80) || null,
    passport: parseAgentWorkPassport(pull.body),
    requested_reviewers: Array.isArray(pull.requested_reviewers)
      ? pull.requested_reviewers.map((reviewer) => clean(reviewer?.login, 160)).filter(Boolean).slice(0, 20)
      : [],
    ci_state: "UNKNOWN",
    check_count: null,
    review_state: pull.draft === true ? "DRAFT" : "UNKNOWN",
    review_count: null,
    independent_review_state: pull.draft === true ? "NOT_APPLICABLE_DRAFT" : "UNKNOWN",
    approving_reviewers: [],
    changes_requesting_reviewers: [],
    enrichment_state: "NOT_ENRICHED",
  };
}

export function observedGithubCheckState(checkRuns) {
  if (!Array.isArray(checkRuns)) return "UNKNOWN";
  if (!checkRuns.length) return "NO_CHECKS_OBSERVED";
  if (checkRuns.some((run) => clean(run?.status, 40).toLowerCase() !== "completed")) return "CHECKS_RUNNING";
  const conclusions = checkRuns.map((run) => clean(run?.conclusion, 60).toLowerCase());
  const failing = new Set(["failure", "cancelled", "timed_out", "action_required", "startup_failure"]);
  if (conclusions.some((conclusion) => failing.has(conclusion))) return "CHECKS_FAILED_OR_CANCELLED";
  if (conclusions.every((conclusion) => conclusion === "success")) return "OBSERVED_CHECKS_ALL_SUCCESS";
  return "OBSERVED_CHECKS_COMPLETED_MIXED";
}

export function projectGithubReviews(reviews, author, draft = false) {
  const rows = Array.isArray(reviews) ? reviews : [];
  if (draft) {
    return {
      review_state: "DRAFT",
      review_count: rows.length,
      independent_review_state: "NOT_APPLICABLE_DRAFT",
      approving_reviewers: [],
      changes_requesting_reviewers: [],
    };
  }
  const normalized = rows.map((review, index) => ({
    login: clean(review?.user?.login, 160),
    state: clean(review?.state, 60).toUpperCase(),
    submitted_at: clean(review?.submitted_at, 80),
    id: Number(review?.id) || index,
  })).filter((review) => review.login && review.state);
  normalized.sort((left, right) => {
    const lt = Date.parse(left.submitted_at || "") || 0;
    const rt = Date.parse(right.submitted_at || "") || 0;
    return lt - rt || left.id - right.id;
  });
  const latest = new Map();
  for (const review of normalized) latest.set(review.login.toLowerCase(), review);
  const effective = [...latest.values()].filter((review) => !["DISMISSED", "PENDING"].includes(review.state));
  const changes = effective.filter((review) => review.state === "CHANGES_REQUESTED").map((review) => review.login);
  const approvals = effective.filter((review) => review.state === "APPROVED").map((review) => review.login);
  const comments = effective.filter((review) => review.state === "COMMENTED");
  const authorLogin = clean(author, 160).toLowerCase();
  const independentChanges = changes.filter((login) => login.toLowerCase() !== authorLogin);
  const independentApprovals = approvals.filter((login) => login.toLowerCase() !== authorLogin);
  const reviewState = changes.length
    ? "CHANGES_REQUESTED"
    : approvals.length
      ? "APPROVED_OBSERVED"
      : comments.length
        ? "COMMENTED_ONLY"
        : "NO_REVIEW_SUBMISSION";
  const independentReviewState = independentChanges.length
    ? "CHANGES_REQUESTED_BY_DIFFERENT_LOGIN"
    : independentApprovals.length
      ? "APPROVED_BY_DIFFERENT_LOGIN"
      : "PENDING";
  return {
    review_state: reviewState,
    review_count: normalized.length,
    independent_review_state: independentReviewState,
    approving_reviewers: approvals.slice(0, 20),
    changes_requesting_reviewers: changes.slice(0, 20),
  };
}

async function readGithubJson(url, headers, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(url, { method: "GET", headers });
  } catch {
    return { ok: false, status: null, payload: null, remaining: null, error: "transport_failed" };
  }
  const limit = response.headers?.get?.("x-ratelimit-remaining");
  const remaining = limit != null && Number.isFinite(Number(limit)) ? Number(limit) : null;
  let payload = null;
  try { payload = await response.json(); } catch {}
  return {
    ok: response.ok,
    status: response.status,
    payload,
    remaining,
    error: response.ok ? null : "provider_error",
  };
}

async function enrichGithubPull(pull, headers, fetchImpl) {
  if (!pull?.number || !pull?.head_sha) {
    return { pull: { ...pull, enrichment_state: "IDENTITY_INCOMPLETE" }, remaining: [] };
  }
  const checkUrl = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/commits/" + pull.head_sha + "/check-runs?per_page=100";
  const checkResult = await readGithubJson(checkUrl, headers, fetchImpl);
  let reviewResult = null;
  if (!pull.draft) {
    const reviewUrl = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/pulls/" + pull.number + "/reviews?per_page=100";
    reviewResult = await readGithubJson(reviewUrl, headers, fetchImpl);
  }
  const checkRuns = checkResult.ok && Array.isArray(checkResult.payload?.check_runs) ? checkResult.payload.check_runs : null;
  const reviewRows = pull.draft
    ? []
    : reviewResult?.ok && Array.isArray(reviewResult.payload) ? reviewResult.payload : null;
  const reviewProjection = projectGithubReviews(reviewRows, pull.author, pull.draft);
  const errors = [];
  if (!checkResult.ok || checkRuns === null) errors.push("CHECKS_UNAVAILABLE");
  if (!pull.draft && (!reviewResult?.ok || reviewRows === null)) errors.push("REVIEWS_UNAVAILABLE");
  return {
    pull: {
      ...pull,
      ci_state: checkRuns === null ? "UNKNOWN" : observedGithubCheckState(checkRuns),
      check_count: checkRuns === null ? null : checkRuns.length,
      ...reviewProjection,
      enrichment_state: errors.length ? "PARTIAL_OR_FAILED" : "ENRICHED",
      enrichment_errors: errors,
    },
    remaining: [checkResult.remaining, reviewResult?.remaining].filter((value) => Number.isFinite(value)),
  };
}

function sourceState(status, authenticated) {
  if (status === 401) return "AUTH_FAILED";
  if (status === 403) return authenticated ? "AUTH_OR_RATE_LIMIT_FAILED" : "PUBLIC_RATE_LIMIT_OR_PRIVATE";
  if (status === 404) return authenticated ? "REPOSITORY_NOT_FOUND" : "PRIVATE_OR_NOT_FOUND";
  if (status >= 500) return "PROVIDER_UNAVAILABLE";
  return "PROVIDER_ERROR";
}

export async function readGithubDevelopments(env = {}, fetchImpl = fetch) {
  const token = clean(env.HERMES_GITHUB_READ_TOKEN || env.GITHUB_READ_TOKEN, 1000);
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
    "User-Agent": "Hermes-Business-Command-Center",
    ...(token ? { Authorization: /^Bearer\s+/i.test(token) ? token : "Bearer " + token } : {}),
  };
  const pulls = [];
  let truncated = false;
  let remaining = null;
  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const url = new URL("https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/pulls");
      url.searchParams.set("state", "open");
      url.searchParams.set("sort", "updated");
      url.searchParams.set("direction", "desc");
      url.searchParams.set("per_page", String(PAGE_SIZE));
      url.searchParams.set("page", String(page));
      const response = await fetchImpl(url.href, { method: "GET", headers });
      const limit = response.headers?.get?.("x-ratelimit-remaining");
      if (limit != null && Number.isFinite(Number(limit))) remaining = Number(limit);
      if (!response.ok) {
        return {
          source: "github",
          source_state: sourceState(response.status, Boolean(token)),
          checked_at: new Date().toISOString(),
          repository: REPO_OWNER + "/" + REPO_NAME,
          authenticated: Boolean(token),
          rate_limit_remaining: remaining,
          pulls: [],
          truncated: false,
          http_status: response.status,
        };
      }
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : [];
      pulls.push(...rows.map(normalizeGithubPull).filter((pull) => pull.number && pull.title));
      if (rows.length < PAGE_SIZE) break;
      if (page === MAX_PAGES) truncated = true;
    }
  } catch {
    return {
      source: "github",
      source_state: "PROVIDER_UNAVAILABLE",
      checked_at: new Date().toISOString(),
      repository: REPO_OWNER + "/" + REPO_NAME,
      authenticated: Boolean(token),
      rate_limit_remaining: remaining,
      pulls: [],
      truncated: false,
    };
  }
  let projectedPulls = pulls;
  let enrichmentState = token ? "NOT_RUN" : "AUTH_REQUIRED";
  let enrichedPullCount = 0;
  if (token) {
    if (remaining !== null && remaining <= MIN_RATE_LIMIT_FOR_ENRICHMENT) {
      enrichmentState = "RATE_LIMIT_GUARD";
      projectedPulls = pulls.map((pull) => ({ ...pull, enrichment_state: "RATE_LIMIT_GUARD" }));
    } else {
      const limit = Math.min(pulls.length, MAX_ENRICHED_PULLS);
      const enriched = [];
      let stoppedForRateLimit = false;
      for (let start = 0; start < limit; start += ENRICHMENT_BATCH_SIZE) {
        if (remaining !== null && remaining <= MIN_RATE_LIMIT_FOR_ENRICHMENT) {
          stoppedForRateLimit = true;
          break;
        }
        const batch = pulls.slice(start, Math.min(limit, start + ENRICHMENT_BATCH_SIZE));
        const results = await Promise.all(batch.map((pull) => enrichGithubPull(pull, headers, fetchImpl)));
        for (const result of results) {
          enriched.push(result.pull);
          enrichedPullCount += 1;
          for (const value of result.remaining) remaining = remaining === null ? value : Math.min(remaining, value);
        }
      }
      projectedPulls = [
        ...enriched,
        ...pulls.slice(enriched.length).map((pull) => ({
          ...pull,
          enrichment_state: stoppedForRateLimit ? "RATE_LIMIT_GUARD" : "NOT_ENRICHED_LIMIT",
        })),
      ];
      const failures = enriched.filter((pull) => pull.enrichment_state !== "ENRICHED").length;
      enrichmentState = stoppedForRateLimit
        ? "PARTIAL_RATE_LIMIT_GUARD"
        : failures
          ? "PARTIAL_PROVIDER_ERRORS"
          : "ENRICHED";
    }
  } else {
    projectedPulls = pulls.map((pull) => ({ ...pull, enrichment_state: "AUTH_REQUIRED" }));
  }
  return {
    source: "github",
    source_state: truncated ? "CONNECTED_PARTIAL" : token ? "CONNECTED_AUTHENTICATED" : "CONNECTED_PUBLIC",
    checked_at: new Date().toISOString(),
    repository: REPO_OWNER + "/" + REPO_NAME,
    authenticated: Boolean(token),
    rate_limit_remaining: remaining,
    enrichment_state: enrichmentState,
    enriched_pull_count: enrichedPullCount,
    enrichment_limit: MAX_ENRICHED_PULLS,
    pulls: projectedPulls,
    truncated,
  };
}
