import { expect, test } from "@playwright/test";

const childRoutes = [
  ["/opportunities/careers/", "Careers & Open Roles at Hermes"],
  ["/opportunities/owner-operators/", "Owner-Operator Opportunities with Hermes"],
  ["/opportunities/agency-partners/", "Agency Partnerships with Hermes"],
  ["/opportunities/referral-partners/", "Referral & Introducer Partnerships"],
  ["/opportunities/white-label-partners/", "White-Label & Delivery Partnerships"],
  ["/opportunities/strategic-partnerships/", "Corporate & Strategic Partnerships"],
  ["/opportunities/expansion-investment/", "Expansion & Investment Conversations"],
] as const;

test.describe("Work With Hermes opportunities ecosystem", () => {
  test("hub routes each relationship through a crawlable intent owner", async ({ page }) => {
    await page.goto("/opportunities/");

    await expect(page.getByRole("heading", { level: 1, name: "Work With Hermes" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore careers" })).toHaveAttribute("href", "/opportunities/careers/");
    await expect(page.getByRole("link", { name: "Explore Owner-Operator opportunities" })).toHaveAttribute("href", "/opportunities/owner-operators/");
    await expect(page.getByRole("link", { name: "Explore agency partnerships" })).toHaveAttribute("href", "/opportunities/agency-partners/");
    await expect(page.getByRole("link", { name: "Explore referral partnerships" })).toHaveAttribute("href", "/opportunities/referral-partners/");
    await expect(page.getByRole("link", { name: "Explore white-label delivery" })).toHaveAttribute("href", "/opportunities/white-label-partners/");
    await expect(page.getByRole("link", { name: "Explore strategic partnerships" })).toHaveAttribute("href", "/opportunities/strategic-partnerships/");
    await expect(page.getByRole("link", { name: "Explore expansion & investment" })).toHaveAttribute("href", "/opportunities/expansion-investment/");
    await expect(page.getByRole("link", { name: "Explore agency launch" })).toHaveAttribute("href", "/logistics/agency/");

    const desktopOpportunities = page.locator(".desktop-nav").getByRole("link", { name: "Opportunities" });
    await expect(desktopOpportunities).toHaveAttribute("href", "/opportunities/");
    await expect(desktopOpportunities).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".site-footer").getByRole("link", { name: "Opportunities" })).toHaveAttribute("href", "/opportunities/");

    await expect(page.getByRole("link", { name: "+1 (414) 269-7377" })).toHaveAttribute("href", "tel:+14142697377");
    await expect(page.getByRole("link", { name: "officeus@hermeslogisticsus.com" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "partnership@hermeslogisticsus.com" }).first()).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("careers@hermeslogisticsus.com");
    expect(bodyText).not.toContain("+1 (682) 777-5337");
  });

  for (const [route, h1] of childRoutes) {
    test(`${route} is a substantive, bounded public relationship owner`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Start with fit. Define responsibilities before commitment." })).toBeVisible();
      await expect(page.getByRole("heading", { name: "A public page starts a conversation. It does not manufacture a deal." })).toBeVisible();
      await expect(page.getByRole("link", { name: "Work With Hermes" })).toHaveAttribute("href", "/opportunities/");
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toContain("careers@hermeslogisticsus.com");
      expect(bodyText).not.toContain("+1 (682) 777-5337");
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(hasOverflow).toBe(false);
    });
  }

  test("four primary directions expose a contextual Work With Hermes rail", async ({ page }) => {
    for (const route of ["/paths/logistics/", "/paths/marketing/", "/paths/technology/", "/paths/academy/"]) {
      await page.goto(route);
      const rail = page.locator(".opportunities-rail");
      await expect(rail).toBeVisible();
      await expect(rail.getByRole("link", { name: "See all opportunities" })).toHaveAttribute("href", "/opportunities/");
    }
  });

  test("owner-operator path carries the public Wisconsin recruiting phone while generic careers does not", async ({ page }) => {
    await page.goto("/opportunities/owner-operators/");
    await expect(page.getByRole("link", { name: "+1 (414) 269-7377" })).toHaveAttribute("href", "tel:+14142697377");

    await page.goto("/opportunities/careers/");
    await expect(page.getByText("+1 (414) 269-7377")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "officeus@hermeslogisticsus.com" })).toBeVisible();
  });
});
