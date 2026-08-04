import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/";

test("Hermes Connect adapts the product preview to different business categories", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Hermes Connect · Early Access");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("[data-audience-id]")).toHaveCount(9);
  await expect(page.locator("body")).toHaveAttribute("data-audience", "beauty-wellness");
  await expect(page.locator("[data-preview-business]")).toHaveText("Aura Beauty Studio");

  await page.getByRole("button", { name: /Logistics & operations/i }).click();
  await expect(page.locator("body")).toHaveAttribute("data-audience", "logistics-operations");
  await expect(page.locator("[data-preview-business]")).toHaveText("Hermes Operations Desk");
  await expect(page.locator("[data-preview-request]")).toContainText("Prepare an operating request");
  await expect(page.locator('select[name="category"]')).toHaveValue("logistics-operations");
});

test("Hermes Connect prepares a transparent early-access email application", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const parsed = new URL(request.url());
    if (!parsed.hostname.includes("127.0.0.1") && !parsed.hostname.includes("localhost") && !parsed.hostname.includes("google")) {
      externalRequests.push(request.url());
    }
  });

  await page.goto(route);
  await page.getByLabel("Your name *").fill("Alex Morgan");
  await page.getByLabel("Work email *").fill("alex@example.com");
  await page.getByLabel("Business or project name").fill("Morgan Fitness");
  await page.getByLabel("Your category *").selectOption("fitness-coaching");
  await page.getByLabel("Preferred access *").selectOption("Web and mobile");
  await page.getByLabel("Team size *").selectOption("2–5 people");
  await page.getByLabel("What should Hermes Connect help you do first? *").fill("Let clients choose training formats and request an available session without long message threads.");
  await page.getByLabel(/I agree that Hermes may use these details/).check();
  await page.getByRole("button", { name: "Prepare download application" }).click();

  await expect(page.locator("[data-application-form]")).toBeHidden();
  await expect(page.locator("[data-application-result]")).toBeVisible();
  const emailLink = page.locator("[data-email-application]");
  await expect(emailLink).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus\.com\?/);
  await expect(emailLink).toHaveAttribute("href", /Hermes%20Connect%20early%20access/);
  await expect(emailLink).toHaveAttribute("href", /Fitness%20%26%20coaching/);
  expect(externalRequests).toEqual([]);
});

test("Hermes Connect layout remains within the mobile viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile project only");
  await page.goto(route);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.getByRole("link", { name: /Apply to download/i })).toBeVisible();
});
