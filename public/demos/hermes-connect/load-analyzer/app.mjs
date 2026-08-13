import { calculateTripEconomics } from "./trip-economics.mjs";

const root = document.querySelector("[data-load-analyzer]");
const form = root?.querySelector("[data-load-analyzer-form]");
const errorBox = root?.querySelector("[data-load-analyzer-error]");
const recommendation = root?.querySelector("[data-load-recommendation]");
const recommendationReason = root?.querySelector("[data-load-recommendation-reason]");
const comparison = root?.querySelector("[data-load-comparison]");
const comparisonCopy = root?.querySelector("[data-load-comparison-copy]");
const saveBaselineButton = root?.querySelector("[data-save-baseline]");
const handoffLinks = root?.querySelectorAll("[data-load-analyzer-handoff]") ?? [];

let started = false;
let currentResult = null;
let baselineResult = null;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function pushPublicEvent(event) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_group: "hermes_connect_load_analyzer",
    page_path: window.location.pathname,
    module_id: "load_analyzer",
  });
}

function read(name) {
  const input = form?.elements.namedItem(name);
  return input instanceof HTMLInputElement ? input.value : "";
}

function inputPayload() {
  return {
    loadedMiles: read("loadedMiles"),
    deadheadMiles: read("deadheadMiles"),
    grossPay: read("grossPay"),
    fuelPrice: read("fuelPrice"),
    mpg: read("mpg"),
    reservePerMile: read("reservePerMile"),
    fixedCosts: read("fixedCosts"),
    servicePercent: read("servicePercent"),
    paymentFeePercent: read("paymentFeePercent"),
    targetNet: read("targetNet"),
  };
}

function setOutput(name, value) {
  root?.querySelector(`[data-load-output="${name}"]`)?.replaceChildren(value);
}

function showError(message = "") {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function formatResult(result) {
  setOutput("grossLoadedRpm", `${money.format(result.grossLoadedRpm)}/mi`);
  setOutput("allMileRpm", `${money.format(result.allMileRpm)}/mi`);
  setOutput("estimatedNet", money.format(result.estimatedNet));
  setOutput("totalMiles", `${number.format(result.totalMiles)} mi`);
  setOutput("deadheadPercent", `${number.format(result.deadheadPercent)}%`);
  setOutput("fuelCost", money.format(result.fuelCost));
  setOutput("reserveCost", money.format(result.reserveCost));
  setOutput("serviceFee", money.format(result.serviceFee));
  setOutput("paymentFee", money.format(result.paymentFee));
  setOutput("operatingCost", money.format(result.operatingCost));
  setOutput("breakEvenGross", money.format(result.breakEvenGross));
  setOutput("breakEvenAllMileRpm", `${money.format(result.breakEvenAllMileRpm)}/mi`);
  setOutput("sensitivity", result.sensitivity);

  if (recommendation) {
    recommendation.textContent = result.recommendation;
    recommendation.dataset.state = result.recommendation.toLowerCase();
  }
  if (recommendationReason) recommendationReason.textContent = result.recommendationReason;
}

function renderComparison() {
  if (!comparison || !comparisonCopy || !baselineResult || !currentResult) {
    if (comparison) comparison.hidden = true;
    return;
  }

  const netDelta = currentResult.estimatedNet - baselineResult.estimatedNet;
  const rpmDelta = currentResult.allMileRpm - baselineResult.allMileRpm;
  const deadheadDelta = currentResult.deadheadPercent - baselineResult.deadheadPercent;
  const direction = netDelta > 0 ? "higher" : netDelta < 0 ? "lower" : "the same";

  comparisonCopy.textContent = [
    `Current estimated net is ${money.format(Math.abs(netDelta))} ${direction} than the saved baseline.`,
    `All-mile RPM delta: ${rpmDelta >= 0 ? "+" : ""}${money.format(rpmDelta)}/mi.`,
    `Deadhead share delta: ${deadheadDelta >= 0 ? "+" : ""}${number.format(deadheadDelta)} percentage points.`,
  ].join(" ");
  comparison.hidden = false;
}

function calculate({ track = false } = {}) {
  try {
    const result = calculateTripEconomics(inputPayload());
    currentResult = result;
    showError();
    formatResult(result);
    renderComparison();
    if (track) pushPublicEvent("load_analyzer_complete");
    return result;
  } catch {
    currentResult = null;
    showError("Check the inputs. Loaded miles, gross pay, and MPG must be above zero; costs cannot be negative; percentage fees must stay below 100% combined.");
    return null;
  }
}

form?.addEventListener("input", () => {
  if (!started) {
    started = true;
    pushPublicEvent("load_analyzer_start");
  }
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate({ track: true });
});

saveBaselineButton?.addEventListener("click", () => {
  const result = currentResult ?? calculate();
  if (!result) return;
  baselineResult = { ...result };
  renderComparison();
  saveBaselineButton.textContent = "Baseline saved — change inputs to compare";
  pushPublicEvent("load_analyzer_compare");
});

for (const link of handoffLinks) {
  link.addEventListener("click", () => pushPublicEvent("load_analyzer_handoff"));
}

calculate();
