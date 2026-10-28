const REPO_OWNER = "officeus-create";
const REPO_NAME = "Hermes";
const MAX_PAGES = 3;
const PAGE_SIZE = 100;

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
    const direct = new RegExp("^[-*\\s]*\\*\\*" + escaped + "\\*\\*\\s*[:|]\\s*(.+)$", "im").exec(text);
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
    ci_state: "UNKNOWN",
    review_state: pull.draft === true ? "DRAFT" : "UNKNOWN",
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
  return {
    source: "github",
    source_state: truncated ? "CONNECTED_PARTIAL" : token ? "CONNECTED_AUTHENTICATED" : "CONNECTED_PUBLIC",
    checked_at: new Date().toISOString(),
    repository: REPO_OWNER + "/" + REPO_NAME,
    authenticated: Boolean(token),
    rate_limit_remaining: remaining,
    pulls,
    truncated,
  };
}
