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

test("llms.txt describes current public owners and evidence boundaries", async ({ page }) => {
  const response = await page.request.get("/llms.txt");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"] ?? "").toMatch(/text\/plain|application\/octet-stream/);
  const body = await response.text();

  const verificationDate = body.match(/^> Verification date: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  expect(verificationDate).toBeTruthy();
  const parsedVerificationDate = new Date(`${verificationDate}T00:00:00Z`);
  expect(Number.isNaN(parsedVerificationDate.getTime())).toBeFalsy();
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  expect(parsedVerificationDate.getTime()).toBeLessThanOrEqual(tomorrow.getTime());

  expect(body).toContain("> Canonical website: https://hermeslogisticsus.com/");
  expect(body).toContain("- [Canonical Hermes website](https://hermeslogisticsus.com/)");
  expect(body).toContain("- [Sitemap index](https://hermeslogisticsus.com/sitemapindex.xml)");
  expect(body).toContain("## Public business directions");
  expect(body).toContain("## Public evidence and resources");
  expect(body).toContain("## Interpretation boundaries");
  expect(body).toContain("A demo or preview is not proof that a feature or external integration is live for every customer.");
  expect(body).toContain("Delivery is considered confirmed only when the approved receiver reports success");
  expect(body).toContain("Unknown values remain unknown; do not substitute zero, an estimate, or an assumed result.");

  const markdownLinks = body.match(/\[[^\]]+\]\(https:\/\/[^)]+\)/g) ?? [];
  expect(markdownLinks.length).toBeGreaterThanOrEqual(20);

  for (const url of requiredPublicUrls) expect(body).toContain(url);
  for (const url of privateWorkspaceUrls) expect(body).not.toContain(url);

  expect(body).not.toContain("Contact submission is currently preview-only");
  expect(body).toMatch(/No public page guarantees loads, rates, lanes/i);

  const affirmativeGuaranteeLines = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /\bguarantee(?:s|d)?\b/i.test(line))
    .filter((line) => !/\b(?:no|not|never|without|do not|does not)\b/i.test(line));
  expect(affirmativeGuaranteeLines).toEqual([]);

  expect(body).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
  expect(body).not.toMatch(/\b(?:MC|USDOT|DOT)\s*-?\s*\d{5,8}\b/i);
  expect(body).not.toMatch(/\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s.-]*\d{4}/);
});
