import { chromium } from "@playwright/test";

const targetUrl = "https://hermeslogisticsus.com/logistics/start-car-hauling-dispatch/";
const expectedMeasurementId = "G-RY26321PVW";
const expectedEvent = "carrier_intake_start";

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

  const companyField = page.locator('[data-vehicle-form] input[name="carrier_company_name"]');
  await companyField.waitFor({ state: "visible", timeout: 15_000 });
  await companyField.click();
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
    };
  }, expectedEvent);

  const transportEvidence = googleRequests.filter(
    (entry) => entry.host.endsWith("google-analytics.com") && entry.path.includes("collect"),
  );
  const carrierCollects = transportEvidence.filter((entry) => entry.event === expectedEvent);
  const matchingMeasurement = carrierCollects.filter(
    (entry) => !entry.measurement_id || entry.measurement_id === expectedMeasurementId,
  );

  const report = {
    target: new URL(targetUrl).pathname,
    expected_event: expectedEvent,
    runtime: runtimeEvidence,
    google_script_requests: googleRequests.filter((entry) => entry.host === "www.googletagmanager.com"),
    analytics_collect_events: transportEvidence.map((entry) => ({
      host: entry.host,
      path: entry.path,
      method: entry.method,
      event: entry.event,
      measurement_id: entry.measurement_id,
    })),
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
