import {
  defaultRevenueDashboardFixture,
  parseRevenueDashboardJson,
  summarizeRevenueDashboard,
} from "./dashboard.mjs";

const root = document.querySelector("[data-revenue-dashboard]");
const form = root?.querySelector("[data-revenue-dashboard-form]");
const input = root?.querySelector("[data-revenue-dashboard-input]");
const errorBox = root?.querySelector("[data-revenue-dashboard-error]");
const sampleButton = root?.querySelector("[data-revenue-dashboard-sample]");
const results = root?.querySelector("[data-revenue-dashboard-results]");
const directionBody = root?.querySelector("[data-direction-body]");
const pendingList = root?.querySelector("[data-pending-list]");
const actionLinks = document.querySelectorAll("[data-revenue-dashboard-action]");

let started = false;

function pushPublicEvent(event) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_group: "hermes_connect_revenue_dashboard",
    page_path: window.location.pathname,
    module_id: "seo_lead_revenue_dashboard",
  });
}

function showError(message = "") {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function setText(name, value) {
  root?.querySelector(`[data-dashboard-output="${name}"]`)?.replaceChildren(String(value));
}

function money(value) {
  return value === null
    ? "DATA_PENDING"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function percent(value) {
  return value === null ? "DATA_PENDING" : `${(value * 100).toFixed(1)}%`;
}

function count(value) {
  return value === null ? "DATA_PENDING" : new Intl.NumberFormat("en-US").format(value);
}

function stageCell(stage) {
  const span = document.createElement("span");
  span.className = stage.value === null ? "stage-pending" : "stage-verified";
  span.textContent = stage.value === null ? "DATA_PENDING" : String(stage.value);
  const small = document.createElement("small");
  small.textContent = stage.evidenceClass;
  const wrapper = document.createElement("div");
  wrapper.className = "stage-value";
  wrapper.append(span, small);
  return wrapper;
}

function renderDirections(data) {
  if (!directionBody) return;
  directionBody.replaceChildren();
  for (const direction of data.directions) {
    const tr = document.createElement("tr");
    const labelCell = document.createElement("td");
    labelCell.dataset.label = "Direction";
    labelCell.textContent = direction.label;
    tr.append(labelCell);

    for (const stageName of ["delivered", "reviewed", "qualified", "opportunities", "won", "lost", "revenue"]) {
      const td = document.createElement("td");
      td.dataset.label = stageName === "revenue" ? "Revenue" : stageName;
      const stage = direction.stages[stageName];
      const wrapper = stageCell(stage);
      if (stageName === "revenue" && stage.value !== null) wrapper.querySelector("span").textContent = money(stage.value);
      td.append(wrapper);
      tr.append(td);
    }
    directionBody.append(tr);
  }
}

function renderPending(pending) {
  if (!pendingList) return;
  pendingList.replaceChildren();
  if (!pending.length) {
    const li = document.createElement("li");
    li.textContent = "All operating stages in this aggregate are populated with an accepted evidence class.";
    pendingList.append(li);
    return;
  }
  for (const key of pending.slice(0, 18)) {
    const li = document.createElement("li");
    li.textContent = key.replace(":", " → ");
    pendingList.append(li);
  }
  if (pending.length > 18) {
    const li = document.createElement("li");
    li.textContent = `+ ${pending.length - 18} additional pending stages`;
    pendingList.append(li);
  }
}

function render(data) {
  const summary = summarizeRevenueDashboard(data);
  const stageComplete = (stageName) => data.directions.every((direction) => direction.stages[stageName].value !== null);
  const totalOrPending = (stageName) => stageComplete(stageName) ? summary.totals[stageName] : null;

  const delivered = totalOrPending("delivered");
  const reviewed = totalOrPending("reviewed");
  const qualified = totalOrPending("qualified");
  const opportunities = totalOrPending("opportunities");
  const won = totalOrPending("won");
  const revenue = totalOrPending("revenue");

  const qualifiedRate = reviewed !== null && qualified !== null && reviewed > 0 ? qualified / reviewed : null;
  const opportunityRate = qualified !== null && opportunities !== null && qualified > 0 ? opportunities / qualified : null;
  const winRate = opportunities !== null && won !== null && opportunities > 0 ? won / opportunities : null;
  const revenuePerQualified = revenue !== null && qualified !== null && qualified > 0 ? revenue / qualified : null;
  const revenuePerOpportunity = revenue !== null && opportunities !== null && opportunities > 0 ? revenue / opportunities : null;

  setText("period", `${data.period.dateRange} · ${data.period.timezone}`);
  setText("attribution", data.period.attributionBasis);

  if (data.search.evidenceClass === "PLATFORM_VERIFIED") {
    setText("searchClicks", count(data.search.clicks));
    setText("searchImpressions", count(data.search.impressions));
    setText("searchCtr", percent(data.search.ctr));
    setText("searchPosition", data.search.averagePosition?.toFixed(2) ?? "DATA_PENDING");
    setText("searchEvidence", data.search.evidenceClass);
    setText("searchLabel", `${data.search.label} · ${data.search.dateRange}`);
  } else {
    for (const key of ["searchClicks", "searchImpressions", "searchCtr", "searchPosition"]) setText(key, "DATA_PENDING");
    setText("searchEvidence", data.search.evidenceClass);
    setText("searchLabel", data.search.label);
  }

  setText("delivered", count(delivered));
  setText("reviewed", count(reviewed));
  setText("qualified", count(qualified));
  setText("opportunities", count(opportunities));
  setText("won", count(won));
  setText("revenue", money(revenue));
  setText("qualifiedRate", percent(qualifiedRate));
  setText("opportunityRate", percent(opportunityRate));
  setText("winRate", percent(winRate));
  setText("revenuePerQualified", money(revenuePerQualified));
  setText("revenuePerOpportunity", money(revenuePerOpportunity));
  setText("evidenceCompleteness", `${Math.round(summary.evidenceCompleteness * 100)}%`);

  renderDirections(data);
  renderPending(summary.pending);
  if (results) results.hidden = false;
}

function analyze({ track = true } = {}) {
  try {
    const data = parseRevenueDashboardJson(input?.value ?? "");
    showError();
    render(data);
    if (track) pushPublicEvent("revenue_dashboard_import_complete");
  } catch (error) {
    if (results) results.hidden = true;
    showError(error instanceof Error ? error.message : "Unable to read this aggregate scorecard.");
  }
}

input?.addEventListener("input", () => {
  if (!started) {
    started = true;
    pushPublicEvent("revenue_dashboard_view");
  }
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze();
});

sampleButton?.addEventListener("click", () => {
  if (!input) return;
  input.value = JSON.stringify(defaultRevenueDashboardFixture, null, 2);
  if (!started) {
    started = true;
    pushPublicEvent("revenue_dashboard_view");
  }
  analyze();
});

for (const link of actionLinks) {
  link.addEventListener("click", () => pushPublicEvent("revenue_dashboard_action_selected"));
}

if (input) {
  input.value = JSON.stringify(defaultRevenueDashboardFixture, null, 2);
  render(parseRevenueDashboardJson(input.value));
}
