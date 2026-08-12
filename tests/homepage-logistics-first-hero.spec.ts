import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("homepage leads with direct vehicle transport and dispatch actions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Move vehicles with less uncertainty." })).toBeVisible();
  await expect(page.getByText("U.S. vehicle logistics · Dispatch · Dealer transport")).toBeVisible();
  await expect(
    page.getByText(
      "Dispatch support, dealer transport, and coordinated vehicle logistics for carriers, fleets, auction buyers, and shippers across the United States.",
    ),
  ).toBeVisible();

  const transport = page.getByRole("link", { name: "Request vehicle transport" });
  const dispatch = page.getByRole("link", { name: "Get dispatch support" });

  await expect(transport).toHaveAttribute("href", "/logistics/request-vehicle-transport/");
  await expect(transport).toHaveAttribute("data-home-hero-cta", "transport_request");
  await expect(dispatch).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");
  await expect(dispatch).toHaveAttribute("data-home-hero-cta", "dispatch_support");

  await expect(page.locator(".hero-scroll-cue")).toHaveAttribute("href", "#paths");
  await expect(page.locator(".hero-scroll-cue")).toHaveAttribute("aria-label", "Explore all Hermes directions");
});
