import { expect, test } from "@playwright/test";

const projectBriefHref = "/paths/technology/?project=website_development#project-brief";

test("website development routes qualified visitors into the structured project brief", async ({ page }) => {
  await page.goto("/services/website-development/");

  const heroPrimary = page.locator(".digital-service-actions").getByRole("link", {
    name: "Start a website project brief",
  });
  await expect(heroPrimary).toHaveAttribute("href", projectBriefHref);

  const supportingCta = page.getByRole("link", { name: "Prepare the website brief" });
  await expect(supportingCta).toHaveAttribute("href", projectBriefHref);
  await expect(page.getByText(/does not automatically send or store the answers/i)).toBeVisible();
});

test("other digital services retain their existing contact CTA", async ({ page }) => {
  await page.goto("/services/local-seo/");
  await expect(page.locator(".digital-service-actions").getByRole("link", { name: "Discuss this service" })).toHaveAttribute(
    "href",
    "#contact",
  );
  await expect(page.locator("[data-website-project-cta]")) .toHaveCount(0);
  await expect(page.locator("[data-seo-service-cta]")) .toHaveCount(0);
});
