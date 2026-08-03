import { expect, test } from "@playwright/test";

const websiteFunnels = [
  {
    path: "/services/website-development/",
    hero: "Start a website project brief",
    supporting: "Prepare the website brief",
    href: "/paths/technology/?project=website_development#project-brief",
  },
  {
    path: "/services/website-redesign/",
    hero: "Start a website redesign brief",
    supporting: "Prepare the redesign brief",
    href: "/paths/technology/?project=website_redesign#project-brief",
  },
] as const;

for (const funnel of websiteFunnels) {
  test(`${funnel.path} routes qualified visitors into the structured project brief`, async ({ page }) => {
    await page.goto(funnel.path);
    await expect(page.locator(".digital-service-actions").getByRole("link", { name: funnel.hero })).toHaveAttribute(
      "href",
      funnel.href,
    );
    await expect(page.getByRole("link", { name: funnel.supporting })).toHaveAttribute("href", funnel.href);
    await expect(page.getByText(/automatically (?:send|sent|sending).*stor/i)).toBeVisible();
    await expect(page.locator("[data-seo-service-cta]")).toHaveCount(0);
  });
}
