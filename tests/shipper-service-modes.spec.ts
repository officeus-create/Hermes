import { expect, test } from "@playwright/test";

const route = "/logistics/shipper-dealer/";

test("shipper and dealer page distinguishes three service modes without guarantees", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Shipper or dealer | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/shipper-dealer/",
  );
  await expect(page.getByRole("heading", { name: "One request, repeat capacity, or managed coordination?" })).toBeVisible();

  const modes = page.locator("[data-shipper-service-mode]");
  await expect(modes).toHaveCount(3);
  await expect(modes.nth(0).getByRole("heading", { name: "One-time transportation request" })).toBeVisible();
  await expect(modes.nth(1).getByRole("heading", { name: "Repeat capacity review" })).toBeVisible();
  await expect(modes.nth(2).getByRole("heading", { name: "Managed coordination" })).toBeVisible();

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).toContain("a prior move does not guarantee future availability or terms");
  expect(publicCopy).toContain("approved in writing before ongoing work begins");
  expect(publicCopy).toContain("No mode guarantees carrier capacity, price, pickup or delivery timing, equipment, acceptance, repeat availability, service level, or another commercial outcome");
  expect(publicCopy).toContain("What is the difference between a one-time move, repeat capacity, and managed coordination?");
  expect(publicCopy).toContain("Can a one-time request become a repeat or managed program?");

  await expect(page.getByRole("link", { name: "Prepare transport request" }).first()).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=shipper#transport-intake",
  );
  await expect(page.getByRole("link", { name: "Post a load in the Load Board demo" })).toHaveAttribute(
    "href",
    "/load-board/?role=shipper#post-load",
  );
});

test("shipper service-mode questions are included in FAQ schema", async ({ page }) => {
  await page.goto(route);

  const faqText = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => script.textContent ?? "").join("\n"),
  );

  expect(faqText).toContain("What is the difference between a one-time move, repeat capacity, and managed coordination?");
  expect(faqText).toContain("Does choosing a service mode guarantee capacity, price, timing, or carrier assignment?");
});
