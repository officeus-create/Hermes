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
    await expect(page.getByRole("link", { name: "View Wisconsin Owner-Operator opportunity" })).toHaveAttribute("href", "/careers/wisconsin-owner-operators/");
    await expect(page.getByRole("link", { name: "Review agency-partner path" })).toHaveAttribute("href", "/paths/logistics/agency-partners/");
    await expect(page.getByRole("link", { name: "Explore agency launch" })).toHaveAttribute("href", "/logistics/agency/");
    await expect(page.getByRole("link", { name: "Contact Hermes" }).first()).toHaveAttribute("href", "/contacts/");

    if (isMobile) {
      const menuButton = page.getByRole("button", { name: "Open navigation" });
      await menuButton.click();
      const mobileOpportunities = page.locator("#mobile-menu").getByRole("link", { name: "Opportunities" });
      await expect(mobileOpportunities).toBeVisible();
      await expect(mobileOpportunities).toHaveAttribute("href", "/opportunities/");
      await expect(mobileOpportunities).toHaveAttribute("aria-current", "page");
      await expect(mobileOpportunities).toHaveAttribute("data-nav-tone", "opportunities");
    } else {
      const desktopOpportunities = page.locator(".desktop-nav").getByRole("link", { name: "Opportunities" });
      await expect(desktopOpportunities).toHaveAttribute("href", "/opportunities/");
      await expect(desktopOpportunities).toHaveAttribute("aria-current", "page");
      await expect(desktopOpportunities).toHaveAttribute("data-nav-tone", "opportunities");
    }

    await expect(page.getByRole("link", { name: "+1 (414) 269-7377" })).toHaveAttribute("href", "tel:+14142697377");
    await expect(page.getByRole("link", { name: "officeus@hermeslogisticsus.com" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "partnership@hermeslogisticsus.com" }).first()).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("careers@hermeslogisticsus.com");
    expect(bodyText).not.toContain("+1 (682) 777-5337");
  });

  test("does not overflow horizontally on the current viewport", async ({ page }) => {
    await page.goto("/opportunities/");
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(hasOverflow).toBe(false);
  });
});
