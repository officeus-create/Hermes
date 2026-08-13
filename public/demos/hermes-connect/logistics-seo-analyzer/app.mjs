import { analyzeLogisticsSeo } from "./analyzer.mjs";

const root = document.querySelector("[data-logistics-seo-analyzer]");
const form = root?.querySelector("[data-logistics-seo-form]");
const errorBox = root?.querySelector("[data-logistics-seo-error]");
const findingsBody = root?.querySelector("[data-findings-body]");
const actionLinks = document.querySelectorAll("[data-logistics-seo-handoff]");
let started = false;

function pushEvent(event) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_group: "hermes_connect_logistics_seo_analyzer",
    page_path: window.location.pathname,
    module_id: "logistics_seo_analyzer",
  });
}

function read(name) {
  const field = form?.elements.namedItem(name);
  return field instanceof HTMLSelectElement ? field.value : "";
}

function setText(name, value) {
  root?.querySelector(`[data-seo-output="${name}"]`)?.replaceChildren(String(value));
}

function showError(message = "") {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function renderRoadmap(name, items) {
  const list = root?.querySelector(`[data-roadmap="${name}"]`);
  if (!list) return;
  list.replaceChildren();
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  }
}

function renderFindings(findings) {
  if (!findingsBody) return;
  findingsBody.replaceChildren();
  for (const finding of findings) {
    const tr = document.createElement("tr");
    const cells = [
      ["Priority", finding.priority],
      ["Dimension", finding.dimension],
      ["Observed condition", finding.condition],
      ["Why it matters", finding.why],
      ["Next action", finding.action],
      ["Evidence", finding.evidence],
      ["Validation", finding.validation],
    ];
    for (const [label, value] of cells) {
      const td = document.createElement("td");
      td.dataset.label = label;
      td.textContent = value;
      if (label === "Priority") td.dataset.priority = value.toLowerCase();
      tr.append(td);
    }
    findingsBody.append(tr);
  }
}

function analyze({ track = false } = {}) {
  try {
    const result = analyzeLogisticsSeo({
      businessType: read("businessType"),
      searchConsole: read("searchConsole"),
      analyticsReceipt: read("analyticsReceipt"),
      moneyPageOwnership: read("moneyPageOwnership"),
      canonicalIndexability: read("canonicalIndexability"),
      internalLinks: read("internalLinks"),
      primaryCta: read("primaryCta"),
      deliverySemantics: read("deliverySemantics"),
      mobilePerformance: read("mobilePerformance"),
      proofState: read("proofState"),
      entityConsistency: read("entityConsistency"),
      locationUniqueness: read("locationUniqueness"),
      baseline: read("baseline"),
    });
    showError();
    setText("score", `${result.summary.score}/100`);
    setText("blockers", result.summary.blockers);
    setText("measurement", result.summary.measurementGaps);
    setText("holds", result.summary.holds);
    setText("findingCount", result.summary.findingCount);
    renderFindings(result.findings);
    renderRoadmap("30", result.roadmap.days30);
    renderRoadmap("90", result.roadmap.days90);
    renderRoadmap("180", result.roadmap.days180);
    renderRoadmap("365", result.roadmap.days365);
    if (track) pushEvent("logistics_seo_analyzer_complete");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Check the selected audit facts.");
  }
}

form?.addEventListener("change", () => {
  if (!started) {
    started = true;
    pushEvent("logistics_seo_analyzer_start");
  }
});
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze({ track: true });
});
for (const link of actionLinks) link.addEventListener("click", () => pushEvent("logistics_seo_analyzer_handoff"));

analyze();
