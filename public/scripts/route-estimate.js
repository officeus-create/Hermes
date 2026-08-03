const usRegionPattern = /(?:^|[,\s])(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|GU|VI|AS|MP)(?:$|[,\s\d])/i;

const cleanLocation = (value) => String(value ?? "")
  .replace(/[<>\u0000-\u001f\u007f]/g, "")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 240);

const looksLikeUsLocation = (value) => {
  const normalized = cleanLocation(value);
  return normalized.length >= 5
    && (usRegionPattern.test(normalized)
      || /\b\d{5}(?:-\d{4})?\b/.test(normalized)
      || /\b(?:USA|United States)\b/i.test(normalized));
};

document.querySelectorAll("[data-route-estimate-panel]").forEach((candidate) => {
  if (!(candidate instanceof HTMLElement)) return;
  const panel = candidate;
  const form = document.querySelector("[data-load-board-form]");
  const origin = form?.querySelector('input[name="pickup_location"]');
  const destination = form?.querySelector('input[name="delivery_location"]');
  const routeFieldRow = origin?.closest(".field-row");
  const button = panel.querySelector("[data-route-estimate-submit]");
  const status = panel.querySelector("[data-route-estimate-status]");
  const result = panel.querySelector("[data-route-estimate-result]");
  const miles = panel.querySelector("[data-route-estimate-miles]");
  const minutes = panel.querySelector("[data-route-estimate-minutes]");

  if (
    !(form instanceof HTMLFormElement)
    || !(origin instanceof HTMLInputElement)
    || !(destination instanceof HTMLInputElement)
    || !(routeFieldRow instanceof HTMLElement)
    || !(button instanceof HTMLButtonElement)
    || !(status instanceof HTMLElement)
    || !(result instanceof HTMLElement)
    || !(miles instanceof HTMLElement)
    || !(minutes instanceof HTMLElement)
  ) return;

  routeFieldRow.insertAdjacentElement("afterend", panel);
  panel.hidden = false;

  const reset = () => {
    result.hidden = true;
    status.textContent = "Route fields changed. Press Estimate route to check the updated route.";
  };
  origin.addEventListener("input", reset);
  destination.addEventListener("input", reset);

  button.addEventListener("click", async () => {
    const originValue = cleanLocation(origin.value);
    const destinationValue = cleanLocation(destination.value);
    result.hidden = true;

    if (!looksLikeUsLocation(originValue) || !looksLikeUsLocation(destinationValue)) {
      status.textContent = "Enter both locations as a U.S. city and state, ZIP code, or full U.S. address.";
      return;
    }
    if (originValue.toLowerCase() === destinationValue.toLowerCase()) {
      status.textContent = "Pickup and delivery locations must be different.";
      return;
    }
    if (panel.dataset.routeEstimateMode !== "live") {
      status.textContent = "Route estimates are not connected yet. Continue with the load preview or contact Logistics Sales for route review.";
      return;
    }

    let endpointUrl;
    try {
      endpointUrl = new URL(panel.dataset.routeEstimateEndpoint || "/api/route-estimate", window.location.origin);
      const localDevelopment = ["localhost", "127.0.0.1"].includes(endpointUrl.hostname);
      if (endpointUrl.origin !== window.location.origin || (endpointUrl.protocol !== "https:" && !localDevelopment)) {
        throw new Error("invalid_endpoint");
      }
    } catch {
      status.textContent = "Route estimates are unavailable. Continue with the load preview or contact Logistics Sales.";
      return;
    }

    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    status.textContent = "Calculating a general driving estimate…";
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          origin: { address: originValue },
          destination: { address: destinationValue },
        }),
        signal: controller.signal,
      });
      const payload = await response.json();
      const distanceMiles = payload?.distance_miles;
      const durationMinutes = payload?.duration_minutes;
      if (
        !response.ok
        || payload?.success !== true
        || typeof distanceMiles !== "number"
        || !Number.isFinite(distanceMiles)
        || typeof durationMinutes !== "number"
        || !Number.isFinite(durationMinutes)
      ) {
        if (response.status === 400 || response.status === 422) {
          status.textContent = "A route could not be estimated from those locations. Check both addresses and try again.";
        } else if (response.status === 429) {
          status.textContent = "The route-estimate limit was reached. Continue with the load preview or contact Logistics Sales.";
        } else {
          status.textContent = "Route estimates are temporarily unavailable. Continue with the load preview or contact Logistics Sales.";
        }
        return;
      }
      miles.textContent = distanceMiles.toLocaleString("en-US", { maximumFractionDigits: 1 });
      minutes.textContent = Math.ceil(durationMinutes).toLocaleString("en-US");
      result.hidden = false;
      status.textContent = "General route estimate ready. Review it as planning context only.";
    } catch {
      status.textContent = "Route estimates are temporarily unavailable. Your load details were not sent; continue with the local preview or contact Logistics Sales.";
    } finally {
      window.clearTimeout(timeout);
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
});
