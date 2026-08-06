import { expect, test } from "@playwright/test";

test("short carrier link is private, phone-friendly, and routes to the packet", async ({ page }) => {
  await page.goto("/carrier/");

  await expect(page).toHaveTitle("Carrier Partnership | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("main[data-carrier-short-url]")).toHaveAttribute(
    "data-carrier-short-url",
    "https://hermeslogisticsus.com/carrier/",
  );
  await expect(page.getByRole("heading", { name: "Keep control of your operation. Add a team around it." })).toBeVisible();

  await expect(page.getByRole("link", { name: /Start the carrier packet/i }).first()).toHaveAttribute(
    "href",
    "/logistics/carrier-onboarding/",
  );
  await expect(page.getByRole("link", { name: "Review plans and support" })).toHaveAttribute(
    "href",
    "/logistics/carrier-offer/",
  );
  await expect(page.getByRole("link", { name: "Review the agreement draft" })).toHaveAttribute(
    "href",
    "/logistics/carrier-agreement/",
  );
  await expect(page.getByRole("link", { name: /Call Logistics Sales/i }).first()).toHaveAttribute(
    "href",
    "tel:+12623023626",
  );

  await expect(page.getByText("You approve every load", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Freight payments go to your company", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("No passwords collected here", { exact: true })).toBeVisible();
  await expect(page.getByText(/Final legal execution activates only/i)).toBeVisible();

  await expect(page.locator("[data-carrier-share]")).toBeVisible();
  await expect(page.locator("[data-carrier-copy]")).toBeVisible();
  await expect(page.locator("[data-carrier-sms]")).toHaveAttribute(
    "href",
    /sms:.*body=.*hermeslogisticsus\.com%2Fcarrier%2F/i,
  );

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).not.toMatch(/limited time|expires today|only \d+ spots|guaranteed income|guaranteed loads/i);
  await expect(page.locator('input[type="password"], input[name*="password" i], input[name*="pin" i]')).toHaveCount(0);
});

test("short signing link is private, phone-friendly, and offers three calm next steps", async ({ page }) => {
  await page.goto("/sign/");

  await expect(page).toHaveTitle("Carrier Agreement and Signature | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("main[data-sign-short-url]")).toHaveAttribute(
    "data-sign-short-url",
    "https://hermeslogisticsus.com/sign/",
  );
  await expect(page.getByRole("heading", { name: "Everything is clear before you sign." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Continue to carrier packet/i }).first()).toHaveAttribute(
    "href",
    "/logistics/carrier-onboarding/",
  );
  await expect(page.getByRole("link", { name: "Review the agreement first" })).toHaveAttribute(
    "href",
    "/logistics/carrier-agreement/",
  );
  await expect(page.getByRole("link", { name: "Ask a question" })).toHaveAttribute("href", "tel:+12623023626");
  await expect(page.locator("[data-sign-copy]")).toBeVisible();
  await expect(page.locator("[data-sign-sms]")).toHaveAttribute(
    "href",
    /sms:.*body=.*hermeslogisticsus\.com%2Fsign%2F/i,
  );
  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).not.toMatch(/limited time|expires today|only \d+ spots|guaranteed income|guaranteed loads/i);
});

test("offer routes through the signing review while agreement continues to onboarding", async ({ page }) => {
  const cases = [
    {
      route: "/logistics/carrier-offer/",
      href: "/sign/",
      label: "Review the signing path",
    },
    {
      route: "/logistics/carrier-agreement/",
      href: "/logistics/carrier-onboarding/",
      label: "Continue to carrier packet",
    },
  ];

  for (const item of cases) {
    await page.goto(item.route);
    const journey = page.locator("[data-carrier-contract-journey]");
    await expect(journey).toBeVisible();
    await expect(journey.locator("[data-commercial-primary-cta]")).toContainText(item.label);
    await expect(journey.locator("[data-commercial-primary-cta]")).toHaveAttribute("href", item.href);
    await expect(journey.getByRole("link", { name: "Call U.S. Logistics Sales" })).toHaveAttribute(
      "href",
      "tel:+12623023626",
    );
    await expect(journey.locator("[data-carrier-journey-sms]")).toHaveAttribute(
      "href",
      /sms:.*body=.*hermeslogisticsus\.com%2Fsign%2F/i,
    );
  }
});

test("carrier audience keeps dispatch review primary and exposes the signing path", async ({ page }) => {
  await page.goto("/logistics/carrier/");

  await expect(page.getByRole("link", { name: "Start dispatch review" }).first()).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );

  const journey = page.locator("[data-carrier-contract-journey]");
  await expect(journey).toBeVisible();
  await expect(journey.locator("[data-commercial-primary-cta]")).toContainText("Review the signing path");
  await expect(journey.locator("[data-commercial-primary-cta]")).toHaveAttribute("href", "/sign/");
  await expect(journey.getByRole("link", { name: "Call U.S. Logistics Sales" })).toHaveAttribute(
    "href",
    "tel:+12623023626",
  );
});

test("the public logistics hub exposes the memorable carrier proposal path", async ({ page }) => {
  await page.goto("/paths/logistics/");
  await expect(page.getByRole("link", { name: /Carrier plans, packet, and agreement/i })).toHaveAttribute(
    "href",
    "/carrier/",
  );
  await expect(page.getByRole("link", { name: /Carrier proposal and packet/i })).toHaveAttribute(
    "href",
    "/carrier/",
  );
});
