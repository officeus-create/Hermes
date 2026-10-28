const DEFAULT_CLICKUP_LIST_ID = "901526433657";
const MAX_PAGES = 5;
const PAGE_SIZE = 100;

const clean = (value, max = 500) => String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
const numberOrNull = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const safeTaskUrl = (value) => {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && url.hostname === "app.clickup.com" && /^\/t\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
      ? url.href
      : null;
  } catch {
    return null;
  }
};

export function clickupAuthorization(value) {
  const token = clean(value, 500);
  if (!token) return null;
  if (/^Bearer\s+/i.test(token)) return token;
  return token.startsWith("pk_") ? token : `Bearer ${token}`;
}

export function normalizeClickUpTask(task = {}) {
  const status = typeof task.status === "object" && task.status ? task.status.status : task.status;
  const priority = typeof task.priority === "object" && task.priority ? task.priority.priority : task.priority;
  const assignees = Array.isArray(task.assignees)
    ? task.assignees.slice(0, 20).map((entry) => ({
        id: clean(entry?.id, 80) || null,
        username: clean(entry?.username || entry?.name, 160) || null,
      })).filter((entry) => entry.id || entry.username)
    : [];
  const list = task.list && typeof task.list === "object" ? task.list : {};
  return {
    id: clean(task.id, 120),
    custom_id: clean(task.custom_id, 120) || null,
    name: clean(task.name, 500),
    status: clean(status, 120) || "UNKNOWN",
    priority: clean(priority, 80) || null,
    assignees,
    due_date: numberOrNull(task.due_date),
    date_updated: numberOrNull(task.date_updated),
    date_closed: numberOrNull(task.date_closed),
    url: safeTaskUrl(task.url),
    list_id: clean(list.id, 120) || null,
    list_name: clean(list.name, 240) || null,
  };
}

function sourceStateForStatus(status) {
  if (status === 401 || status === 403) return "AUTH_FAILED";
  if (status === 429) return "RATE_LIMITED";
  return status >= 500 ? "PROVIDER_UNAVAILABLE" : "PROVIDER_ERROR";
}

export async function readClickUpHumanTasks(env = {}, fetchImpl = fetch) {
  const authorization = clickupAuthorization(env.CLICKUP_API_TOKEN);
  const listId = clean(env.HERMES_CLICKUP_COMPLETION_LIST_ID || DEFAULT_CLICKUP_LIST_ID, 120);
  if (!authorization) {
    return {
      source: "clickup",
      source_state: "NOT_CONFIGURED",
      checked_at: new Date().toISOString(),
      list_id: listId,
      tasks: [],
      truncated: false,
    };
  }
  if (!/^\d+$/.test(listId)) {
    return {
      source: "clickup",
      source_state: "INVALID_LIST_CONFIG",
      checked_at: new Date().toISOString(),
      list_id: null,
      tasks: [],
      truncated: false,
    };
  }

  const collected = [];
  let truncated = false;
  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const url = new URL(`https://api.clickup.com/api/v2/list/${listId}/task`);
      url.searchParams.set("include_closed", "false");
      url.searchParams.set("subtasks", "true");
      url.searchParams.set("order_by", "updated");
      url.searchParams.set("reverse", "false");
      url.searchParams.set("page", String(page));
      const response = await fetchImpl(url.href, {
        method: "GET",
        headers: {
          Authorization: authorization,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        return {
          source: "clickup",
          source_state: sourceStateForStatus(response.status),
          checked_at: new Date().toISOString(),
          list_id: listId,
          tasks: [],
          truncated: false,
          http_status: response.status,
        };
      }
      const payload = await response.json();
      const rows = Array.isArray(payload?.tasks) ? payload.tasks : [];
      collected.push(...rows.map(normalizeClickUpTask).filter((task) => task.id && task.name));
      if (rows.length < PAGE_SIZE) break;
      if (page === MAX_PAGES - 1) truncated = true;
    }
  } catch {
    return {
      source: "clickup",
      source_state: "PROVIDER_UNAVAILABLE",
      checked_at: new Date().toISOString(),
      list_id: listId,
      tasks: [],
      truncated: false,
    };
  }

  return {
    source: "clickup",
    source_state: truncated ? "CONNECTED_PARTIAL" : "CONNECTED",
    checked_at: new Date().toISOString(),
    list_id: listId,
    tasks: collected,
    truncated,
  };
}
