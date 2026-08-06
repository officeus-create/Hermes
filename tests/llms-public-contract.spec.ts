import { expect, test } from "@playwright/test";

const requiredPublicUrls = [
  "https://hermeslogisticsus.com/paths/logistics/",
  "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
  "https://hermeslogisticsus.com/logistics/dealer-vehicle-transportation/",
  "https://hermeslogisticsus.com/logistics/resources/",
  "https://hermeslogisticsus.com/services/seo/",
  "https://hermeslogisticsus.com/paths/technology/",
  "https://hermeslogisticsus.com/services/hermes-connect/",
];

const privateWorkspaceUrls = [
  "https://hermeslogisticsus.com/carrier/",
  "https://hermeslogisticsus.com/logistics/carrier-offer/",
  "https://hermeslogisticsus.com/logistics/carrier-agreement/",
  "https://hermeslogisticsus.com/logistics/carrier-onboarding/",
  "https://hermeslogisticsus.com/logistics/start-car-hauling-dispatch/",
  "https://hermeslogisticsus.com/logistics/request-vehicle-transport/",
];

test("llms.txt describes current public owners and transaction boundaries", async ({ page }) => {
  const response = await page.request.get("/llms.txt");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"] ?? "").toMatch(/text\/plain|application\/octet-stream/);
  const body = await response.text();

  expect(body).toContain("Last verified against the public repository: 2026-08-06");
  expect(body).toContain("## Public business directions");
  expect(body).toContain("## Public evidence");
  expect(body).toContain("## Public and private boundaries");
  expect(body).toContain("fictional/local demonstration");
  expect(body).toContain("signed review/onboarding PDF packet");
  expect(body).toContain("Final legal agreement execution is not represented as active");
  expect(body).toContain("Delivery is considered confirmed only when the approved receiver reports success");

  for (const url of requiredPublicUrls) expect(body).toContain(url);
  for (const url of privateWorkspaceUrls) expect(body).not.toContain(url);

  expect(body).not.toContain("Contact submission is currently preview-only");
  expect(body).not.toMatch(/guarantees? (?:loads|rates|lanes|mileage|traffic|rankings|revenue|profit|employment)/i);
  expect(body).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
  expect(body).not.toMatch(/\b(?:MC|USDOT|DOT)\s*-?\s*\d{5,8}\b/i);
  expect(body).not.toMatch(/\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s.-]*\d{4}/);
});
