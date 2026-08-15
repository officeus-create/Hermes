import { expect, test } from "@playwright/test";

test("detailed carrier page remains private and routes to the minimized packet", async ({ page }) => {
  await page.goto("/carrier/");

  await expect(page).toHaveTitle("Carrier Support & Agreement | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { name: "Keep control. Add a dispatch team." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Review and sign/i }).first()).toHaveAttribute("href", /\/logistics\/carrier-onboarding\//);
  await expect(page.getByRole("link", { name: "See what Hermes handles" })).toHaveAttribute("href", /\/logistics\/carrier-offer\//);
  await expect(page.getByRole("link", { name: /Call Logistics Sales/i }).first()).toHaveAttribute("href", "tel:+12623023626");
  await expect(page.getByText("You approve every load", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Non-exclusive · no minimum volume", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Freight funds go to your company or factor", { exact: true }).first()).toBeVisible();
  await expect(page.locator("[data-carrier-share]")).toBeVisible();
  await expect(page.locator("[data-carrier-copy]")).toBeVisible();
  await expect(page.locator("[data-carrier-sms]")).toBeVisible();

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).not.toMatch(/limited time|expires today|only \d+ spots|guaranteed income|guaranteed loads/i);
  await expect(page.locator('input[type="password"], input[name*="password" i], input[name*="pin" i]')).toHaveCount(0);
});

test("clean SMS signing route gives three safe next actions", async ({ page }) => {
  await page.goto("/sign/");

  await expect(page).toHaveTitle("Carrier Agreement and Signature | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("main[data-sign-short-url]")).toHaveAttribute("data-sign-short-url", "https://hermeslogisticsus.com/sign/");
  await expect(page.getByRole("heading", { name: "Everything is clear before you sign." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Continue to carrier packet/i }).first()).toHaveAttribute("href", "/logistics/carrier-onboarding/");
  await expect(page.getByRole("link", { name: "Review the agreement first" })).toHaveAttribute("href", "/logistics/carrier-agreement/");
  await expect(page.getByRole("link", { name: "Ask a question" })).toHaveAttribute("href", "tel:+12623023626");
  await expect(page.getByText("Non-exclusive support", { exact: true })).toBeVisible();
  await expect(page.getByText("You approve every load", { exact: true })).toBeVisible();
  await expect(page.getByText("Freight payments stay with your company", { exact: true })).toBeVisible();
  await expect(page.locator("[data-sign-copy]")).toBeVisible();
  await expect(page.locator("[data-sign-sms]")).toHaveAttribute("href", /sms:.*body=.*hermeslogisticsus\.com%2Fsign%2F/i);

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).not.toMatch(/limited time|expires today|only \d+ spots|guaranteed income|guaranteed loads/i);
  expect(page.url()).not.toMatch(/[?&](?:rate|plan|rep|offer|carrier|mc|usdot)=/i);
  await expect(page.locator('input[type="password"], input[name*="password" i], input[name*="pin" i]')).toHaveCount(0);
});

test("offer routes through signing review while agreement continues to onboarding", async ({ page }) => {
  const cases = [
    { route: "/logistics/carrier-offer/", label: "Review and continue", href: "/sign/" },
    { route: "/logistics/carrier-agreement/", label: "Confirm terms and continue", href: "/logistics/carrier-onboarding/" },
  ];

  for (const item of cases) {
    await page.goto(item.route);
    const journey = page.locator("[data-carrier-contract-journey]");
    await expect(journey).toBeVisible();
    await expect(journey.locator("[data-commercial-primary-cta]")).toContainText(item.label);
    await expect(journey.locator("[data-commercial-primary-cta]")).toHaveAttribute("href", item.href);
    await expect(journey.getByRole("link", { name: "Call U.S. Logistics Sales" })).toHaveAttribute("href", "tel:+12623023626");
    await expect(journey.locator("[data-carrier-journey-sms]")).toHaveAttribute("href", /sms:.*body=.*hermeslogisticsus\.com%2Fsign%2F/i);
  }
});

test("carrier audience keeps dispatch review primary and exposes the proposal path", async ({ page }) => {
  await page.goto("/logistics/carrier/");
  await expect(page.getByRole("link", { name: "Start dispatch review" }).first()).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");
  const journey = page.locator("[data-carrier-contract-journey]");
  await expect(journey).toBeVisible();
  await expect(journey.locator("[data-commercial-primary-cta]")).toContainText("Review plans and carrier packet");
  await expect(journey.locator("[data-commercial-primary-cta]")).toHaveAttribute("href", "/carrier/");
  await expect(journey.getByRole("link", { name: "Call U.S. Logistics Sales" })).toHaveAttribute("href", "tel:+12623023626");
});

test("the public logistics hub exposes the memorable carrier proposal path", async ({ page }) => {
  await page.goto("/paths/logistics/");
  await expect(page.getByRole("link", { name: /Carrier plans, packet, and agreement/i })).toHaveAttribute("href", "/carrier/");
  await expect(page.getByRole("link", { name: /Carrier proposal and packet/i })).toHaveAttribute("href", "/carrier/");
});
