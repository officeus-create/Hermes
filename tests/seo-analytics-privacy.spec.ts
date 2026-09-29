import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

const isGoogleAnalyticsRequest = (url: string) => {
  const hostname = new URL(url).hostname;
  return (
    hostname === "googletagmanager.com" ||
    hostname.endsWith(".googletagmanager.com") ||
    hostname === "google-analytics.com" ||
    hostname.endsWith(".google-analytics.com")
  );
};

test("SEO intake keeps submitted detail out of analytics payloads", async ({ page }) => {
  const sensitiveSentinel = "SENSITIVE_SENTINEL_93817";
  const querySentinel = "RAW_QUERY_SENTINEL_93817";
  const analyticsTraffic: string[] = [];

  page.on("request", (request) => {
    if (!isGoogleAnalyticsRequest(request.url())) return;
    analyticsTraffic.push(`${request.url()}\n${request.postData() ?? ""}`);
  });

  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });

  await page.goto(`/paths/marketing/?service=seo&private=${querySentinel}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Allow analytics" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hermes-analytics-consent"))).toBe("granted");

  const problem = page.locator('[name="seo_current_problem"]');
  await expect(problem).toBeVisible();
  await problem.fill(`Indexing review notes ${sensitiveSentinel} must remain private.`);

  await expect.poll(async () => {
    return page.evaluate(() =>
      (window.dataLayer ?? []).some((entry: any) => entry && typeof entry === "object" && entry.event === "seo_intake_start"),
    );
  }).toBe(true);

  const seoStartEvents = await page.evaluate(() =>
    (window.dataLayer ?? []).filter(
      (entry: any) => entry && typeof entry === "object" && entry.event === "seo_intake_start",
    ),
  );

  expect(seoStartEvents).toHaveLength(1);
  const seoStartEvent = seoStartEvents[0];
  expect(seoStartEvent).toMatchObject({
    event: "seo_intake_start",
    intake_type: "seo_service",
    page_group: "marketing_contact",
    service_group: "seo_services",
    page_path: "/paths/marketing/",
  });

  const requiredKeys = new Set(["event", "intake_type", "page_group", "service_group", "page_path"]);
  const unexpectedKeys = Object.keys(seoStartEvent).filter(
    (key) => !requiredKeys.has(key) && !key.startsWith("gtm."),
  );
  expect(unexpectedKeys).toEqual([]);

  const serializedDataLayer = await page.evaluate(() => JSON.stringify(window.dataLayer ?? []));
  expect(serializedDataLayer).not.toContain(querySentinel);
  expect(serializedDataLayer).not.toContain(sensitiveSentinel);

  await page.waitForTimeout(500);
  expect(analyticsTraffic.join("\n")).not.toContain(sensitiveSentinel);
});


test("public GA4 config strips referrer query and current query", async ({ page, baseURL }) => {
  const referrerSentinel = "PRIVATE_REFERRER_SENTINEL_71821";
  const querySentinel = "PRIVATE_QUERY_SENTINEL_71821";
  if (!baseURL) throw new Error("preview base URL required");

  // Exercise the production-host guard against the branch preview bytes without
  // loading Google or submitting any live request.
  await page.route("https://hermeslogisticsus.com/**", async (route) => {
    const requested = new URL(route.request().url());
    const preview = new URL(requested.pathname + requested.search, baseURL);
    const response = await page.request.get(preview.toString());
    await route.fulfill({ response });
  });
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
  await page.addInitScript(({ referrer }) => {
    sessionStorage.setItem("hermes-intro-seen", "true");
    Object.defineProperty(document, "referrer", { configurable: true, get: () => referrer });
  }, { referrer: `https://hermeslogisticsus.com/?private=${referrerSentinel}` });
  await page.goto(`https://hermeslogisticsus.com/?private=${referrerSentinel}`, { waitUntil: "domcontentloaded" });
  await page.goto(`https://hermeslogisticsus.com/paths/logistics/?private=${querySentinel}&_hermes_ga4_smoke=1`, { waitUntil: "domcontentloaded", referer: `https://hermeslogisticsus.com/?private=${referrerSentinel}` });
  await page.getByRole("button", { name: "Allow analytics" }).click();
  const config = await page.evaluate(() => {
    const call = (window.dataLayer ?? []).find((entry: any) => entry?.[0] === "config" && entry?.[1] === "G-RY26321PVW") as any;
    return call?.[2];
  });
  expect(config).toMatchObject({
    page_location: "https://hermeslogisticsus.com/paths/logistics/",
    page_referrer: "https://hermeslogisticsus.com/",
    campaign_source: "hermes_synthetic",
    campaign_medium: "qa",
    campaign_name: "production_smoke",
  });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.analyticsTraffic)).toBe("synthetic");
  expect(JSON.stringify(config)).not.toContain(querySentinel);
  expect(JSON.stringify(config)).not.toContain(referrerSentinel);

  // London attribution remains private. Even legacy success wording must not
  // transform a provider handoff into a lead event with user-controlled UTMs.
  await page.goto("https://hermeslogisticsus.com/academy/apply/?utm_source=london&utm_campaign=london-academy&_hermes_ga4_smoke=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator('input[name="hermes_attribution_utm_source"]')).toHaveValue("london");
  await page.evaluate(() => {
    const status = document.querySelector("[data-contact-form] [data-form-status]");
    if (status) status.textContent = "sent successfully";
  });
  const prematureLondonEvents = await page.evaluate(() =>
    (window.dataLayer ?? []).filter((entry: any) =>
      entry?.event === "london_lead_submitted" || entry?.event === "london_academy_application_submitted",
    ).length,
  );
  expect(prematureLondonEvents).toBe(0);
});
