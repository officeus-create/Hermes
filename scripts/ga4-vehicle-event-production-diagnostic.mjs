import { chromium } from "@playwright/test";

const targetUrl = "https://hermeslogisticsus.com/logistics/request-vehicle-transport/?role=dealer&request=auction_pickup#transport-intake";
const expectedMeasurementId = "G-RY26321PVW";
const expectedEvent = "vehicle_transport_intake_start";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const googleRequests = [];
const failedGoogleRequests = [];
const nonAnalyticsWrites = [];
const platformTelemetryWrites = [];

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

const isPlatformTelemetryRequest = (urlString) => {
  const url = new URL(urlString);
  return url.hostname === "hermeslogisticsus.com" && url.pathname === "/cdn-cgi/rum";
};

page.on("request", (request) => {
  if (isGoogleAnalyticsRequest(request.url())) {
    googleRequests.push(sanitizeGoogleRequest(request));
    return;
  }
  if (isPlatformTelemetryRequest(request.url())) {
    platformTelemetryWrites.push({ method: request.method(), path: new URL(request.url()).pathname });
    return;
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) {
    nonAnalyticsWrites.push({ method: request.method(), url: request.url() });
  }
});

page.on("requestfailed", (request) => {
  if (!isGoogleAnalyticsRequest(request.url())) return;
  failedGoogleRequests.push({
    ...sanitizeGoogleRequest(request),
    failure: request.failure()?.errorText || "unknown",
  });
});

try {
  const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (!response || response.status() !== 200) {
    throw new Error(`Target route returned ${response?.status() ?? "no response"}; expected 200.`);
  }

  const consentButton = page.getByRole("button", { name: "Allow analytics" });
  await consentButton.waitFor({ state: "visible", timeout: 15_000 });
  await consentButton.click();

  await page.waitForFunction(
    () => Boolean(document.querySelector('script[data-hermes-ga4]')),
    undefined,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(2_000);

  const contactField = page.locator('[data-transport-form] input[name="contact_name"]');
  await contactField.waitFor({ state: "visible", timeout: 15_000 });
  await contactField.click();
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
    platform_telemetry_writes: platformTelemetryWrites,
    non_analytics_writes: nonAnalyticsWrites,
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
  if (nonAnalyticsWrites.length !== 0) {
    throw new Error(`Vehicle diagnostic caused ${nonAnalyticsWrites.length} product write request(s); expected 0.`);
  }
  if (matchingMeasurement.length !== 1) {
    throw new Error(
      `${expectedEvent} GA4 network receipt count was ${matchingMeasurement.length}; expected exactly 1.`,
    );
  }
} finally {
  await browser.close();
}
