import { analyzeMultiCarPlan } from "./planner.mjs";

const root = document.querySelector("[data-multi-car-planner]");
const form = root?.querySelector("[data-multi-car-form]");
const errorBox = root?.querySelector("[data-multi-car-error]");
const readinessList = root?.querySelector("[data-readiness-list]");
const handoffLinks = document.querySelectorAll("[data-multi-car-handoff]");
let started = false;

function pushPublicEvent(event) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_group: "hermes_connect_multi_car_planner",
    page_path: window.location.pathname,
    module_id: "multi_car_transport_planner",
  });
}

function read(name) {
  const field = form?.elements.namedItem(name);
  return field instanceof HTMLInputElement || field instanceof HTMLSelectElement ? field.value : "";
}

function setText(name, value) {
  root?.querySelector(`[data-multi-car-output="${name}"]`)?.replaceChildren(String(value));
}

function showError(message = "") {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function render(result) {
  setText("tier", result.coordinationTier.replaceAll("_", " "));
  setText("vehicles", result.vehicleCount);
  setText("inoperable", result.inoperableCount);
  setText("locations", `${result.pickupLocations} pickup · ${result.deliveryLocations} delivery`);
  setText("equipment", result.equipmentPreference === "review" ? "Review options" : result.equipmentPreference);
  setText("timing", result.timing);
  setText("movement", result.movementType === "repeat" ? "Repeat movement" : "One-time movement");
  setText("arrangement", result.arrangementNote);
  setText("timingNote", result.timingNote);

  if (readinessList) {
    readinessList.replaceChildren();
    for (const item of result.readiness) {
      const li = document.createElement("li");
      li.textContent = item;
      readinessList.append(li);
    }
  }
}

function analyze({ track = false } = {}) {
  try {
    const result = analyzeMultiCarPlan({
      vehicleCount: read("vehicleCount"),
      inoperableCount: read("inoperableCount"),
      pickupLocations: read("pickupLocations"),
      deliveryLocations: read("deliveryLocations"),
      timing: read("timing"),
      equipmentPreference: read("equipmentPreference"),
      facilityAccess: read("facilityAccess"),
      movementType: read("movementType"),
      businessType: read("businessType"),
    });
    showError();
    render(result);
    if (track) pushPublicEvent("multi_car_planner_complete");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Check the planning inputs.");
  }
}

form?.addEventListener("input", () => {
  if (!started) {
    started = true;
    pushPublicEvent("multi_car_planner_start");
  }
});
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze({ track: true });
});
for (const link of handoffLinks) link.addEventListener("click", () => pushPublicEvent("multi_car_planner_handoff"));

analyze();
