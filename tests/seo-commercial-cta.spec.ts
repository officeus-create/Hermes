import { expect, test } from "@playwright/test";

const seoFunnels = [
  {
    path: "/services/seo/",
    hero: "Start an SEO review request",
    supporting: "Prepare the SEO request",
    href: "/paths/marketing/?service=seo#contact",
  },
  {
    path: "/services/local-seo/",
    hero: "Start a local SEO review",
    supporting: "Prepare the local SEO request",
    href: "/paths/marketing/?service=local_seo#contact",
  },
  {
    path: "/services/seo-for-logistics-companies/",
    hero: "Start a logistics SEO review",
    supporting: "Prepare the logistics SEO request",
    href: "/paths/marketing/?service=logistics_seo#contact",
  },
  {
    path: "/services/seo-for-independent-auto-dealers/",
    hero: "Start an auto dealer SEO review",
    supporting: "Prepare the dealer SEO request",
    href: "/paths/marketing/?service=auto_dealer_seo#contact",
  },
] as const;

for (const funnel of seoFunnels) {
  test(`${funnel.path} routes qualified visitors into the structured marketing intake`, async ({ page }) => {
    await page.goto(funnel.path);
    await expect(page.locator(".digital-service-actions").getByRole("link", { name: funnel.hero })).toHaveAttribute(
      "href",
      funnel.href,
    );
    await expect(page.getByRole("link", { name: funnel.supporting })).toHaveAttribute("href", funnel.href);
    await expect(page.getByText(/automatically (?:send|sent|sending).*stor/i)).toBeVisible();
    await expect(page.locator('select[name="path"]')).toHaveValue("ProgressoPro");
    await expect(page.locator("[data-website-project-cta]")).toHaveCount(0);
  });
}

test("website development keeps its separate project brief CTA", async ({ page }) => {
  await page.goto("/services/website-development/");
  await expect(page.locator(".digital-service-actions").getByRole("link", { name: "Start a website project brief" })).toHaveAttribute(
    "href",
    "/paths/technology/?project=website_development#project-brief",
  );
  await expect(page.locator("[data-seo-service-cta]")).toHaveCount(0);
});
