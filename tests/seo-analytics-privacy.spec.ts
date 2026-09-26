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
  const ga4Config = await page.evaluate(() => {
    const configCall = (window.dataLayer ?? []).find((entry: any) => entry?.[0] === "config" && entry?.[1] === "G-RY26321PVW") as any;
    return configCall?.[2];
  });
  expect(ga4Config).toMatchObject({
    page_location: new URL(page.url()).origin + "/paths/marketing/",
    page_referrer: "",
  });
  expect(serializedDataLayer).not.toContain(querySentinel);
  expect(serializedDataLayer).not.toContain(sensitiveSentinel);

  await page.waitForTimeout(500);
  expect(analyticsTraffic.join("\n")).not.toContain(sensitiveSentinel);
});


test("public GA4 config strips referrer query and current query", async ({ page }) => {
  const referrerSentinel = "PRIVATE_REFERRER_SENTINEL_71821";
  const querySentinel = "PRIVATE_QUERY_SENTINEL_71821";
  await page.goto(`/?private=${referrerSentinel}`, { waitUntil: "domcontentloaded" });
  await page.goto(`/paths/logistics/?private=${querySentinel}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Allow analytics" }).click();
  const config = await page.evaluate(() => {
    const call = (window.dataLayer ?? []).find((entry: any) => entry?.[0] === "config" && entry?.[1] === "G-RY26321PVW") as any;
    return call?.[2];
  });
  expect(config).toMatchObject({
    page_location: new URL(page.url()).origin + "/paths/logistics/",
    page_referrer: new URL(page.url()).origin + "/",
  });
  expect(JSON.stringify(config)).not.toContain(querySentinel);
  expect(JSON.stringify(config)).not.toContain(referrerSentinel);
});
