import { chromium } from "@playwright/test";

const targetUrl = "https://hermeslogisticsus.com/paths/logistics/carrier-car-hauling/";
const expectedMeasurementId = "G-RY26321PVW";
const expectedEvent = "contact_route_clicked";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const googleRequests = [];
const failedGoogleRequests = [];

const sanitizeGoogleRequest = (request) => {
  const url = new URL(request.url());
  const body = request.postData() || "";
  const query = new URLSearchParams(url.search);
  const form = new URLSearchParams(body);
  return {
    host: url.hostname,
    path: url.pathname,
    method: request.method(),
    event: query.get("en") || form.get("en") || "",
    measurement_id: query.get("tid") || form.get("tid") || "",
  };
};

const isGoogleAnalyticsRequest = (urlString) => {
  const { hostname } = new URL(urlString);
  return (
    hostname === "www.googletagmanager.com" ||
    hostname === "www.google-analytics.com" ||
    hostname.endsWith(".google-analytics.com")
  );
};

page.on("request", (request) => {
  if (!isGoogleAnalyticsRequest(request.url())) return;
  googleRequests.push(sanitizeGoogleRequest(request));
});

page.on("requestfailed", (request) => {
  if (!isGoogleAnalyticsRequest(request.url())) return;
  failedGoogleRequests.push({
    ...sanitizeGoogleRequest(request),
    failure: request.failure()?.errorText || "unknown",
  });
});

try {
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });

  const consentButton = page.getByRole("button", { name: "Allow analytics" });
  await consentButton.waitFor({ state: "visible", timeout: 15_000 });
  await consentButton.click();

  await page.waitForFunction(
    () => Boolean(document.querySelector('script[data-hermes-ga4]')),
    undefined,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(2_000);

  const primaryLink = page.locator("[data-recommendation-primary]").first();
  await primaryLink.waitFor({ state: "visible", timeout: 15_000 });
  await primaryLink.evaluate((link) => {
    link.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
      },
      { capture: true, once: true },
    );
  });
  await primaryLink.click();
  await page.waitForTimeout(5_000);

  const runtimeEvidence = await page.evaluate((eventName) => {
    const entries = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const custom = entries.find((entry) => entry && typeof entry === "object" && entry.event === eventName);
    const googleRuntimeEntries = entries.filter(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        (entry.event === "gtm.dom" || entry.event === "gtm.load"),
    );
    return {
      custom_event_seen: Boolean(custom),
      custom_event_unique_id:
        custom && typeof custom === "object" ? custom["gtm.uniqueEventId"] ?? null : null,
      google_runtime_events: googleRuntimeEntries.map((entry) => entry.event),
      ga_script_present: Boolean(document.querySelector('script[data-hermes-ga4]')),
      consent: window.localStorage.getItem("hermes-analytics-consent"),
    };
  }, expectedEvent);

  const transportEvidence = googleRequests.filter(
    (entry) => entry.host.endsWith("google-analytics.com") && entry.path.includes("collect"),
  );
  const eventCollects = transportEvidence.filter((entry) => entry.event === expectedEvent);
  const matchingMeasurement = eventCollects.filter(
    (entry) => !entry.measurement_id || entry.measurement_id === expectedMeasurementId,
  );

  const report = {
    target: new URL(targetUrl).pathname,
    expected_event: expectedEvent,
    runtime: runtimeEvidence,
    google_script_requests: googleRequests.filter((entry) => entry.host === "www.googletagmanager.com"),
    analytics_collect_events: transportEvidence,
    failed_google_requests: failedGoogleRequests,
    result:
      runtimeEvidence.custom_event_seen && matchingMeasurement.length === 1
        ? "NETWORK_RECEIPT_EXACT_ONCE"
        : runtimeEvidence.custom_event_seen && matchingMeasurement.length > 1
          ? "NETWORK_RECEIPT_DUPLICATED"
          : runtimeEvidence.custom_event_seen
            ? "RUNTIME_PROCESSED_NETWORK_RECEIPT_NOT_OBSERVED"
            : "CUSTOM_EVENT_NOT_OBSERVED",
  };

  console.log(JSON.stringify(report, null, 2));

  if (!runtimeEvidence.ga_script_present) {
    throw new Error("Google tag script was not attached after explicit analytics consent.");
  }
  if (runtimeEvidence.consent !== "granted") {
    throw new Error(`Analytics consent state was ${runtimeEvidence.consent}; expected granted.`);
  }
  if (!runtimeEvidence.custom_event_seen) {
    throw new Error(`${expectedEvent} was not observed in the production dataLayer.`);
  }
  if (matchingMeasurement.length !== 1) {
    throw new Error(
      `${expectedEvent} GA4 network receipt count was ${matchingMeasurement.length}; expected exactly 1.`,
    );
  }
} finally {
  await browser.close();
}
