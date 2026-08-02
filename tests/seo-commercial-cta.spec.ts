import { expect, test } from "@playwright/test";

const seoIntakeHref = "/paths/marketing/?service=seo#contact";

test("SEO service routes qualified visitors into the structured marketing intake", async ({ page }) => {
  await page.goto("/services/seo/");

  const heroPrimary = page.locator(".digital-service-actions").getByRole("link", {
    name: "Start an SEO review request",
  });
  await expect(heroPrimary).toHaveAttribute("href", seoIntakeHref);

  const supportingCta = page.getByRole("link", { name: "Prepare the SEO request" });
  await expect(supportingCta).toHaveAttribute("href", seoIntakeHref);
  await expect(page.getByText(/does not automatically send or store the answers/i)).toBeVisible();
  await expect(page.locator('select[name="path"]')).toHaveValue("ProgressoPro");
});

test("website development keeps its separate project brief CTA", async ({ page }) => {
  await page.goto("/services/website-development/");
  await expect(page.locator(".digital-service-actions").getByRole("link", { name: "Start a website project brief" })).toHaveAttribute(
    "href",
    "/paths/technology/?project=website_development#project-brief",
  );
  await expect(page.locator("[data-seo-service-cta]")).toHaveCount(0);
});
