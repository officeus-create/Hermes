import { chromium } from "@playwright/test";

const targetOrigin = (process.env.SEO_SUPPORTING_TARGET_ORIGIN || "https://hermeslogisticsus.com").replace(/\/$/, "");
const expectedMeasurementId = "G-RY26321PVW";
const expectedServiceGroup = "logistics_seo";
const expectedEvents = ["commercial_cta_click", "seo_intake_start"];

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
    service_group: query.get("ep.service_group") || form.get("ep.service_group") || "",
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

const isPlatformTelemetryRequest = (urlString) => new URL(urlString).pathname === "/cdn-cgi/rum";

page.on("request", (request) => {
  if (isGoogleAnalyticsRequest(request.url())) {
    googleRequests.push(sanitizeGoogleRequest(request));
    return;
  }
  if (isPlatformTelemetryRequest(request.url())) {
    const url = new URL(request.url());
    platformTelemetryWrites.push({ method: request.method(), host: url.hostname, path: url.pathname });
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

const waitForGa = async () => {
  await page.waitForFunction(
    () => Boolean(document.querySelector('script[data-hermes-ga4]')),
    undefined,
    { timeout: 15_000 },
  );
  await page.waitForFunction(
    () => performance.getEntriesByType("resource").some((entry) => entry.name.includes("googletagmanager.com/gtag/js")),
    undefined,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(500);
};

const runtimeEvent = async (eventName) =>
  page.evaluate((name) => {
    const entries = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const matches = entries.filter(
      (entry) => entry && typeof entry === "object" && entry.event === name,
    );
    return matches.map((entry) => ({
      event: entry.event,
      service_group: entry.service_group || "",
      page_group: entry.page_group || "",
      page_path: entry.page_path || "",
      destination_path: entry.destination_path || "",
    }));
  }, eventName);

try {
  const ownerUrl = `${targetOrigin}/services/seo-for-logistics-companies/`;
  const ownerResponse = await page.goto(ownerUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (!ownerResponse || ownerResponse.status() !== 200) {
    throw new Error(`Logistics SEO owner returned ${ownerResponse?.status() ?? "no response"}; expected 200.`);
  }

  const consentButton = page.getByRole("button", { name: "Allow analytics" });
  await consentButton.waitFor({ state: "visible", timeout: 15_000 });
  await consentButton.click();
  await waitForGa();

  await page.evaluate(() => {
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("a[data-seo-service-cta]")) event.preventDefault();
      },
      true,
    );
  });

  const ownerCta = page.locator(".digital-service-actions [data-seo-service-cta]").first();
  await ownerCta.waitFor({ state: "visible", timeout: 15_000 });
  await ownerCta.click();
  await page.waitForTimeout(4_000);

  const ctaRuntime = await runtimeEvent("commercial_cta_click");

  const intakeUrl = `${targetOrigin}/paths/marketing/?service=logistics_seo#contact`;
  const intakeResponse = await page.goto(intakeUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (!intakeResponse || intakeResponse.status() !== 200) {
    throw new Error(`Logistics SEO intake returned ${intakeResponse?.status() ?? "no response"}; expected 200.`);
  }
  await waitForGa();

  const marketField = page.locator('[data-contact-form] input[name="seo_primary_market"]');
  const problemField = page.locator('[data-contact-form] textarea[name="seo_current_problem"]');
  await marketField.waitFor({ state: "visible", timeout: 15_000 });
  await marketField.click();
  await problemField.click();
  await page.waitForTimeout(4_000);

  const intakeRuntime = await runtimeEvent("seo_intake_start");
  const consent = await page.evaluate(() => localStorage.getItem("hermes-analytics-consent"));

  const transportEvidence = googleRequests.filter(
    (entry) => entry.host.endsWith("google-analytics.com") && entry.path.includes("collect"),
  );

  const eventEvidence = Object.fromEntries(
    expectedEvents.map((eventName) => {
      const matching = transportEvidence.filter(
        (entry) =>
          entry.event === eventName &&
          (!entry.measurement_id || entry.measurement_id === expectedMeasurementId) &&
          (!entry.service_group || entry.service_group === expectedServiceGroup),
      );
      return [eventName, matching];
    }),
  );

  const report = {
    target_origin: targetOrigin,
    expected_measurement_id: expectedMeasurementId,
    expected_service_group: expectedServiceGroup,
    runtime: {
      commercial_cta_click: ctaRuntime,
      seo_intake_start: intakeRuntime,
      consent,
    },
    analytics_collect_events: transportEvidence,
    failed_google_requests: failedGoogleRequests,
    platform_telemetry_writes: platformTelemetryWrites,
    non_analytics_writes: nonAnalyticsWrites,
    result: Object.fromEntries(
      expectedEvents.map((eventName) => [
        eventName,
        eventEvidence[eventName].length === 1 ? "NETWORK_RECEIPT_EXACT_ONCE" : `NETWORK_RECEIPT_COUNT_${eventEvidence[eventName].length}`,
      ]),
    ),
  };

  console.log(JSON.stringify(report, null, 2));

  if (consent !== "granted") {
    throw new Error(`Analytics consent state was ${consent}; expected granted.`);
  }
  if (ctaRuntime.length !== 1 || ctaRuntime[0]?.service_group !== expectedServiceGroup) {
    throw new Error(`commercial_cta_click runtime count/service group mismatch: ${JSON.stringify(ctaRuntime)}`);
  }
  if (intakeRuntime.length !== 1 || intakeRuntime[0]?.service_group !== expectedServiceGroup) {
    throw new Error(`seo_intake_start runtime count/service group mismatch: ${JSON.stringify(intakeRuntime)}`);
  }
  if (nonAnalyticsWrites.length !== 0) {
    throw new Error(`Supporting SEO diagnostic caused ${nonAnalyticsWrites.length} product write request(s); expected 0.`);
  }
  for (const eventName of expectedEvents) {
    if (eventEvidence[eventName].length !== 1) {
      throw new Error(`${eventName} GA4 network receipt count was ${eventEvidence[eventName].length}; expected exactly 1.`);
    }
  }
} finally {
  await browser.close();
}
