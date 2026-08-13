import { analyzeSearchRadarRows, parseSearchRadarCsv } from "./radar.mjs";

const root = document.querySelector("[data-search-radar]");
const form = root?.querySelector("[data-search-radar-form]");
const textarea = root?.querySelector("[data-search-radar-input]");
const errorBox = root?.querySelector("[data-search-radar-error]");
const results = root?.querySelector("[data-search-radar-results]");
const tbody = root?.querySelector("[data-search-radar-body]");
const summary = root?.querySelector("[data-search-radar-summary]");
const sampleButton = root?.querySelector("[data-search-radar-sample]");
const actionLinks = document.querySelectorAll("[data-search-radar-action]");

const sampleCsv = `query,page,clicks,impressions,ctr,position,date_range,country_bucket,device_bucket
seo for logistics companies,/services/seo-for-logistics-companies/,0,47,0%,64.83,example,USA,desktop
car hauler load board,/load-board/,0,15,0%,21.4,example,USA,desktop
appleton vehicle transport,/logistics/appleton-wi-vehicle-transport/,0,30,0%,18.2,example,USA,mobile
appleton warehousing services,/logistics/appleton-wi-vehicle-transport/,0,9,0%,38.0,example,USA,desktop`;

let started = false;

function pushPublicEvent(event) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_group: "hermes_connect_search_radar",
    page_path: window.location.pathname,
    module_id: "search_opportunity_radar",
  });
}

function showError(message = "") {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function escapeText(value) {
  return String(value ?? "");
}

function classLabel(classes) {
  return [classes.primaryClass, ...classes.secondaryClasses].join(" · ");
}

function renderRows(analyzed) {
  if (!tbody || !results || !summary) return;
  tbody.replaceChildren();

  const counts = new Map();
  for (const row of analyzed) {
    counts.set(row.analysis.primaryClass, (counts.get(row.analysis.primaryClass) ?? 0) + 1);

    const tr = document.createElement("tr");
    const cells = [
      { label: "Score", value: row.analysis.score },
      { label: "Query", value: row.query },
      { label: "Observed page", value: row.page },
      { label: "Expected owner", value: row.analysis.expectedOwner ?? "No approved owner" },
      { label: "Metrics", value: `${row.impressions} imp · ${row.clicks} clicks · ${(row.ctr * 100).toFixed(2)}% CTR · pos ${row.position.toFixed(2)}` },
      { label: "Decision", value: classLabel(row.analysis) },
      { label: "Why", value: row.analysis.reason },
      { label: "Next action", value: row.analysis.nextAction },
    ];

    for (const cell of cells) {
      const td = document.createElement("td");
      td.dataset.label = cell.label;
      td.textContent = escapeText(cell.value);
      if (cell.label === "Decision") td.dataset.decision = row.analysis.primaryClass.toLowerCase();
      tr.append(td);
    }
    tbody.append(tr);
  }

  const summaryParts = [
    `${analyzed.length} row${analyzed.length === 1 ? "" : "s"} classified`,
    ...[...counts.entries()].sort().map(([key, value]) => `${key}: ${value}`),
  ];
  summary.textContent = summaryParts.join(" · ");
  results.hidden = false;
}

function analyze() {
  try {
    const rows = parseSearchRadarCsv(textarea?.value ?? "");
    const analyzed = analyzeSearchRadarRows(rows);
    showError();
    renderRows(analyzed);
    pushPublicEvent("search_radar_import_complete");
    pushPublicEvent("search_radar_classification_view");
  } catch (error) {
    if (results) results.hidden = true;
    showError(error instanceof Error ? error.message : "Unable to analyze this sanitized CSV.");
  }
}

textarea?.addEventListener("input", () => {
  if (started) return;
  started = true;
  pushPublicEvent("search_radar_start");
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze();
});

sampleButton?.addEventListener("click", () => {
  if (!textarea) return;
  textarea.value = sampleCsv;
  if (!started) {
    started = true;
    pushPublicEvent("search_radar_start");
  }
  analyze();
});

for (const link of actionLinks) {
  link.addEventListener("click", () => pushPublicEvent("search_radar_action_selected"));
}
