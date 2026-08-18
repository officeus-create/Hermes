import { expect, test } from "@playwright/test";

const approvedAnalyticsHosts = new Set([
  "https://www.google-analytics.com",
  "https://google-analytics.com",
  "https://www.googletagmanager.com",
  "https://www.google.com",
]);

function isApprovedAnalyticsRequest(url: string) {
  try {
    const parsed = new URL(url);
    return approvedAnalyticsHosts.has(parsed.origin);
  } catch {
    return false;
  }
}

test("Logistics room keeps the validated preview contact workflow", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && !isApprovedAnalyticsRequest(request.url())) posts.push(request.url());
  });

  await page.goto("/paths/logistics/#contact");
  await page.locator('input[name="name"]').fill("Test User");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Logistics");
  await page.locator('input[name="phone"]').fill("+1 (312) 555-0182");
  await page.locator('textarea[name="message"]').fill("I would like to discuss a logistics workflow.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-form-status]")).toContainText("Your information was not sent or stored");
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();
  await expect(page.locator("[data-handoff-summary]")).toContainText("Direction: Hermes Logistics");
  await expect(page.locator("[data-handoff-route-link]")).toHaveAttribute("href", "tel:+12623023626");
  expect(posts).toEqual([]);
});

test("Technology room keeps the sanitized clipboard handoff", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/paths/technology/#contact");

  await page.locator('input[name="name"]').fill("Clipboard User");
  await page.locator('input[name="email"]').fill("copy@example.com");
  await page.locator('select[name="path"]').selectOption("IT Development");
  await page.locator('textarea[name="tech_system_or_workflow_needed"]').fill("A CRM workflow for client follow-up.");
  await page.locator('textarea[name="tech_integrations_needed"]').fill("<script>alert(1)</script> Zapier + webhooks.");
  await page.locator('textarea[name="message"]').fill("I need a CRM workflow for client follow-up.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();
  await page.locator("[data-copy-request]").click();

  const clipboardText = await page.evaluate(async () => navigator.clipboard.readText());
  expect(clipboardText).toContain("Direction: IT Development");
  expect(clipboardText).toContain("A CRM workflow for client follow-up.");
  expect(clipboardText).not.toMatch(/<script/i);
});

test("Academy room keeps recoverable manual-copy guidance", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
  });

  await page.goto("/paths/academy/#contact");
  await page.locator('input[name="name"]').fill("Manual Copy User");
  await page.locator('input[name="email"]').fill("manual@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Business Academy");
  await page.locator('textarea[name="message"]').fill("I want to explore the logistics program.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();
  await page.locator("[data-copy-request]").click();

  await expect(page.locator("[data-copy-status]")).toContainText("Copy did not work");
  await expect(page.locator("[data-handoff-summary]")).toContainText("Direction: Hermes Business Academy");
});

test("direction-specific contact still clears a stale preview when the direction changes", async ({ page }) => {
  await page.goto("/paths/logistics/#contact");
  await page.locator('input[name="name"]').fill("Stale Handoff User");
  await page.locator('input[name="email"]').fill("stale@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Logistics");
  await page.locator('input[name="phone"]').fill("+1 (312) 555-0182");
  await page.locator('textarea[name="message"]').fill("I would like to discuss carrier onboarding.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();

  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await expect(page.locator("[data-contact-handoff]")).toBeHidden();
});
