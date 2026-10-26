import { expect, test } from "@playwright/test";

test.describe("Work With Hermes opportunities hub", () => {
  test("routes each relationship without inventing recruiting contact details", async ({ page, isMobile }) => {
    await page.goto("/opportunities/");

    await expect(page.getByRole("heading", { level: 1, name: "Work With Hermes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Careers & Open Roles" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Owner-Operator Opportunities" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agency Partners" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open a Hermes Agency" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Referral Partners" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "White-Label & Delivery Partners" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Corporate & Strategic Partnerships" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Expansion, Investment & Strategic Conversations" })).toBeVisible();

    await expect(page.getByRole("link", { name: "Explore careers" })).toHaveAttribute("href", "/logistics/careers/");
    await expect(page.getByRole("link", { name: "Apply for Wisconsin Owner-Operator recruiting" })).toHaveAttribute("href", "/careers/wisconsin-owner-operators/");
    await expect(page.getByRole("link", { name: "Review agency-partner path" })).toHaveAttribute("href", "/paths/logistics/agency-partners/");
    await expect(page.getByRole("link", { name: "Explore agency launch" })).toHaveAttribute("href", "/logistics/agency/");
    await expect(page.getByRole("link", { name: "Contact Hermes" }).first()).toHaveAttribute("href", "/contacts/");

    // Opportunities remains a first-class public route even when the quiet
    // corporate header groups it with the other secondary Products links.
    if (isMobile) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      const products = page.locator("#mobile-menu .mobile-products-menu");
      await products.locator("summary").click();
      const opportunities = products.getByRole("link", { name: "Opportunities" });
      await expect(opportunities).toBeVisible();
      await expect(opportunities).toHaveAttribute("href", "/opportunities/");
      await expect(opportunities).toHaveAttribute("aria-current", "page");
      await expect(opportunities).toHaveAttribute("data-product", "opportunities");
    } else {
      const products = page.locator(".desktop-nav .desktop-products-menu");
      await products.locator("summary").click();
      const opportunities = products.getByRole("link", { name: "Opportunities" });
      await expect(opportunities).toBeVisible();
      await expect(opportunities).toHaveAttribute("href", "/opportunities/");
      await expect(opportunities).toHaveAttribute("aria-current", "page");
      await expect(opportunities).toHaveAttribute("data-product", "opportunities");
    }

    await expect(page.locator(".opportunities-current").getByRole("link", { name: "officeus@hermeslogisticsus.com" })).toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com?subject=Wisconsin%20Owner-Operator%20Application");
    await expect(page.locator(".opportunities-current").getByRole("link", { name: "+1 (414) 269-7377 — Call Yuri" })).toHaveAttribute("href", "tel:+14142697377");
    await expect(page.locator(".opportunities-current")).toContainText("Monday–Friday after 2:15 PM CT");
    await expect(page.locator(".opportunities-current")).toContainText("Saturday–Sunday 10:00 AM–9:00 PM CT");
    await expect(page.getByRole("link", { name: "officeus@hermeslogisticsus.com" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "partnership@hermeslogisticsus.com" }).first()).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toContain("Hermes owner-confirmed continuous Wisconsin owner-operator recruitment on October 19, 2026.");
    expect(bodyText).toContain("their own commercial truck and trailer");
    expect(bodyText).not.toContain("Current recruiting priority · Wisconsin");
    expect(bodyText).not.toContain("Power Only may be considered");
    expect(bodyText).not.toContain("Hermes is currently recruiting responsible Wisconsin Owner-Operators through a verified public vacancy.");
    expect(bodyText).not.toContain("current recruiting opportunities");
    expect(bodyText).not.toContain("careers@hermeslogisticsus.com");
    expect(bodyText).not.toContain("+1 (682) 777-5337");
  });

  test("does not overflow horizontally on the current viewport", async ({ page }) => {
    await page.goto("/opportunities/");
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(hasOverflow).toBe(false);
  });
});
